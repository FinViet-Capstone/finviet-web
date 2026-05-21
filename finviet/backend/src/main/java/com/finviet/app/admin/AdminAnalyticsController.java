package com.finviet.app.admin;

import com.finviet.app.ai.AiUsage;
import com.finviet.app.ai.AiUsageRepository;
import com.finviet.app.budget.BudgetRepository;
import com.finviet.app.common.ApiResponse;
import com.finviet.app.transaction.Transaction;
import com.finviet.app.transaction.TransactionRepository;
import com.finviet.app.user.UserRepository;
import com.finviet.app.wallet.WalletRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminAnalyticsController {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final AiUsageRepository aiUsageRepository;

    @PersistenceContext
    private EntityManager em;

    @GetMapping("/analytics/system")
    public ApiResponse<SystemAnalytics> systemAnalytics() {
        SystemAnalytics s = new SystemAnalytics();
        s.setTotalUsers(userRepository.count());
        s.setActiveUsers(userRepository.countByActiveTrue());
        s.setTotalWallets(walletRepository.count());
        s.setTotalTransactions(transactionRepository.count());
        s.setTotalBudgets(budgetRepository.count());

        LocalDate today = LocalDate.now();
        long dau = ((Number) em.createQuery(
                        "SELECT COUNT(DISTINCT t.user.id) FROM Transaction t WHERE t.occurredOn = :date")
                .setParameter("date", today).getSingleResult()).longValue();
        s.setDailyActiveUsers(dau);

        s.setAiCallsToday(aiUsageRepository.countByOccurredOn(today));
        BigDecimal todayCost = aiUsageRepository.sumCostByDate(today);
        s.setAiCostToday(todayCost == null ? 0.0 : todayCost.doubleValue());

        YearMonth ym = YearMonth.from(today);
        LocalDate from = ym.atDay(1);
        LocalDate to = ym.atEndOfMonth();
        s.setAiCallsMonth(aiUsageRepository.countBetween(from, to));
        BigDecimal monthCost = aiUsageRepository.sumCostBetween(from, to);
        s.setAiCostMonth(monthCost == null ? 0.0 : monthCost.doubleValue());
        return ApiResponse.ok(s);
    }

    @GetMapping("/analytics/dau")
    public ApiResponse<List<DailyMetric>> dailyActiveUsers(@RequestParam(defaultValue = "30") int days) {
        LocalDate to = LocalDate.now();
        LocalDate from = to.minusDays(Math.max(1, days) - 1L);
        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createQuery(
                        "SELECT t.occurredOn, COUNT(DISTINCT t.user.id) FROM Transaction t " +
                                "WHERE t.occurredOn BETWEEN :from AND :to " +
                                "GROUP BY t.occurredOn ORDER BY t.occurredOn")
                .setParameter("from", from).setParameter("to", to).getResultList();
        return ApiResponse.ok(fillDailyMetrics(from, to, rows));
    }

    @GetMapping("/analytics/transactions-daily")
    public ApiResponse<List<DailyMetric>> dailyTransactions(@RequestParam(defaultValue = "30") int days) {
        LocalDate to = LocalDate.now();
        LocalDate from = to.minusDays(Math.max(1, days) - 1L);
        @SuppressWarnings("unchecked")
        List<Object[]> rows = em.createQuery(
                        "SELECT t.occurredOn, COUNT(t) FROM Transaction t " +
                                "WHERE t.occurredOn BETWEEN :from AND :to " +
                                "GROUP BY t.occurredOn ORDER BY t.occurredOn")
                .setParameter("from", from).setParameter("to", to).getResultList();
        return ApiResponse.ok(fillDailyMetrics(from, to, rows));
    }

    @GetMapping("/analytics/ai-usage")
    public ApiResponse<AiUsageDay> aiUsageByDate(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate target = date == null ? LocalDate.now() : date;
        AiUsageDay out = new AiUsageDay();
        out.setDate(target.toString());
        out.setTotalApiCalls(aiUsageRepository.countByOccurredOn(target));
        out.setCategorizationCalls(countKindByDate(AiUsage.Kind.CATEGORIZE, target));
        out.setChatbotCalls(countKindByDate(AiUsage.Kind.CHAT, target));
        out.setReportGenerationCalls(countKindByDate(AiUsage.Kind.WEEKLY_REPORT, target));
        BigDecimal cost = aiUsageRepository.sumCostByDate(target);
        out.setEstimatedCostUsd(cost == null ? 0.0 : cost.doubleValue());
        return ApiResponse.ok(out);
    }

    @GetMapping("/analytics/ai-usage/series")
    public ApiResponse<List<DailyMetric>> aiUsageSeries(@RequestParam(defaultValue = "14") int days) {
        LocalDate to = LocalDate.now();
        LocalDate from = to.minusDays(Math.max(1, days) - 1L);
        List<AiUsageRepository.DailyCount> rows = aiUsageRepository.dailyCountBetween(from, to);
        Map<LocalDate, Long> byDay = new HashMap<>();
        for (var r : rows) byDay.put(r.getDate(), r.getCount());
        List<DailyMetric> result = new ArrayList<>();
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            DailyMetric m = new DailyMetric();
            m.setDate(d.toString());
            m.setCount(byDay.getOrDefault(d, 0L));
            result.add(m);
        }
        return ApiResponse.ok(result);
    }

    @GetMapping("/category-correction-logs")
    public ApiResponse<AdminUsersController.PagedResult<CategoryCorrection>> categoryCorrections(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize) {
        int pageIndex = Math.max(0, page - 1);
        @SuppressWarnings("unchecked")
        List<Transaction> all = em.createQuery(
                        "SELECT t FROM Transaction t WHERE t.userOverridden = true " +
                                "ORDER BY t.updatedAt DESC")
                .setFirstResult(pageIndex * pageSize)
                .setMaxResults(pageSize)
                .getResultList();
        long total = ((Number) em.createQuery(
                        "SELECT COUNT(t) FROM Transaction t WHERE t.userOverridden = true")
                .getSingleResult()).longValue();

        List<CategoryCorrection> items = all.stream().map(t -> {
            CategoryCorrection c = new CategoryCorrection();
            c.setLogId(t.getId().toString());
            c.setTransactionId(t.getId().toString());
            c.setUserId(t.getUser().getId().toString());
            c.setUserEmail(t.getUser().getEmail());
            c.setDescription(t.getDescription());
            c.setOriginalCategory("(unknown)");
            c.setCorrectedCategory(t.getCategory() == null ? "(uncategorized)" : t.getCategory().getNameVi());
            c.setCorrectedAt(t.getUpdatedAt() == null ? null : t.getUpdatedAt().toString());
            return c;
        }).toList();

        AdminUsersController.PagedResult<CategoryCorrection> body = new AdminUsersController.PagedResult<>();
        body.setItems(items);
        body.setPage(page);
        body.setPageSize(pageSize);
        body.setTotalItems(total);
        body.setTotalPages((int) Math.ceil((double) total / pageSize));
        return ApiResponse.ok(body);
    }

    private long countKindByDate(AiUsage.Kind kind, LocalDate date) {
        return ((Number) em.createQuery(
                        "SELECT COUNT(a) FROM AiUsage a WHERE a.kind = :kind AND a.occurredOn = :date")
                .setParameter("kind", kind).setParameter("date", date).getSingleResult()).longValue();
    }

    private List<DailyMetric> fillDailyMetrics(LocalDate from, LocalDate to, List<Object[]> rows) {
        Map<LocalDate, Long> byDay = new HashMap<>();
        for (Object[] row : rows) {
            byDay.put((LocalDate) row[0], ((Number) row[1]).longValue());
        }
        List<DailyMetric> result = new ArrayList<>();
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            DailyMetric m = new DailyMetric();
            m.setDate(d.toString());
            m.setCount(byDay.getOrDefault(d, 0L));
            result.add(m);
        }
        return result;
    }

    @Data
    public static class SystemAnalytics {
        private long totalUsers;
        private long activeUsers;
        private long dailyActiveUsers;
        private long totalTransactions;
        private long totalWallets;
        private long totalBudgets;
        private long aiCallsToday;
        private double aiCostToday;
        private long aiCallsMonth;
        private double aiCostMonth;
    }

    @Data
    public static class DailyMetric {
        private String date;
        private long count;
    }

    @Data
    public static class AiUsageDay {
        private String date;
        private long totalApiCalls;
        private long categorizationCalls;
        private long chatbotCalls;
        private long reportGenerationCalls;
        private double estimatedCostUsd;
    }

    @Data
    public static class CategoryCorrection {
        private String logId;
        private String transactionId;
        private String userId;
        private String userEmail;
        private String description;
        private String originalCategory;
        private String correctedCategory;
        private String correctedAt;
    }
}
