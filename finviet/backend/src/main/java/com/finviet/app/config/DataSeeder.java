package com.finviet.app.config;

import com.finviet.app.ai.AiUsage;
import com.finviet.app.ai.AiUsageRepository;
import com.finviet.app.category.Category;
import com.finviet.app.category.CategoryRepository;
import com.finviet.app.transaction.Transaction;
import com.finviet.app.transaction.TransactionRepository;
import com.finviet.app.user.UserAccount;
import com.finviet.app.user.UserRepository;
import com.finviet.app.wallet.Wallet;
import com.finviet.app.wallet.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final AiUsageRepository aiUsageRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedSystemCategories();
        seedAdmin();
        seedDemoUser();
        seedDemoTransactions();
        seedAiUsage();
    }

    private void seedSystemCategories() {
        if (categoryRepository.count() > 0) return;
        List<Category> systemCats = List.of(
                cat("FOOD", "Ăn uống", "Food & Drink", "🍽", "#F59E0B", Category.Kind.EXPENSE),
                cat("TRANSPORT", "Đi lại", "Transport", "🚗", "#3B82F6", Category.Kind.EXPENSE),
                cat("ENTERTAINMENT", "Giải trí", "Entertainment", "🎮", "#A855F7", Category.Kind.EXPENSE),
                cat("EDUCATION", "Học tập", "Education", "📚", "#10B981", Category.Kind.EXPENSE),
                cat("HEALTH", "Sức khỏe", "Health", "🏥", "#EF4444", Category.Kind.EXPENSE),
                cat("SHOPPING", "Mua sắm", "Shopping", "🛍", "#EC4899", Category.Kind.EXPENSE),
                cat("BILLS", "Hóa đơn", "Bills & Utilities", "💡", "#6B7280", Category.Kind.EXPENSE),
                cat("HOUSING", "Nhà ở", "Housing", "🏠", "#0EA5E9", Category.Kind.EXPENSE),
                cat("GIFT", "Quà tặng", "Gifts", "🎁", "#F472B6", Category.Kind.EXPENSE),
                cat("SAVINGS", "Tiết kiệm", "Savings", "💰", "#22C55E", Category.Kind.EXPENSE),
                cat("OTHER_EXPENSE", "Khác", "Other", "📦", "#9CA3AF", Category.Kind.EXPENSE),
                cat("SALARY", "Lương", "Salary", "💵", "#16A34A", Category.Kind.INCOME),
                cat("ALLOWANCE", "Trợ cấp", "Allowance", "🎓", "#22D3EE", Category.Kind.INCOME),
                cat("BONUS", "Thưởng", "Bonus", "✨", "#FBBF24", Category.Kind.INCOME),
                cat("OTHER_INCOME", "Thu khác", "Other Income", "🪙", "#A3E635", Category.Kind.INCOME)
        );
        categoryRepository.saveAll(systemCats);
        log.info("Seeded {} system categories", systemCats.size());
    }

    private Category cat(String code, String vi, String en, String icon, String color, Category.Kind kind) {
        return Category.builder()
                .code(code).nameVi(vi).nameEn(en).icon(icon).color(color)
                .kind(kind).system(true).build();
    }

    private void seedAdmin() {
        String email = "admin@finviet.local";
        if (userRepository.findByEmail(email).isPresent()) return;
        UserAccount admin = UserAccount.builder()
                .email(email)
                .fullName("FinViet Admin")
                .passwordHash(passwordEncoder.encode("admin123"))
                .role(UserAccount.Role.ADMIN)
                .active(true)
                .build();
        userRepository.save(admin);
        log.info("Seeded admin user (email={}, password=admin123)", email);
    }

    private void seedDemoUser() {
        String email = "demo@finviet.local";
        if (userRepository.findByEmail(email).isPresent()) return;
        UserAccount user = UserAccount.builder()
                .email(email)
                .fullName("Nguyễn Văn Demo")
                .passwordHash(passwordEncoder.encode("demo1234"))
                .monthlyIncome(new BigDecimal("8000000"))
                .role(UserAccount.Role.USER)
                .active(true)
                .build();
        user = userRepository.save(user);

        walletRepository.save(Wallet.builder()
                .user(user).name("Tiền mặt").type(Wallet.WalletType.CASH)
                .balance(new BigDecimal("500000")).icon("💵").isDefault(true).build());
        walletRepository.save(Wallet.builder()
                .user(user).name("MoMo").type(Wallet.WalletType.MOMO)
                .balance(new BigDecimal("1200000")).icon("📱").build());
        walletRepository.save(Wallet.builder()
                .user(user).name("Vietcombank").type(Wallet.WalletType.BANK)
                .balance(new BigDecimal("4500000")).icon("🏦").build());

        log.info("Seeded demo user (email={}, password=demo1234) with 3 wallets", email);
    }

    private void seedDemoTransactions() {
        if (transactionRepository.count() > 0) return;
        UserAccount demo = userRepository.findByEmail("demo@finviet.local").orElse(null);
        if (demo == null) return;
        List<Wallet> wallets = walletRepository.findByUserOrderByCreatedAtAsc(demo);
        if (wallets.isEmpty()) return;

        List<Category> sysCats = categoryRepository.findAll().stream()
                .filter(Category::isSystem).toList();
        Category foodCat = sysCats.stream().filter(c -> "FOOD".equals(c.getCode())).findFirst().orElse(null);
        Category transportCat = sysCats.stream().filter(c -> "TRANSPORT".equals(c.getCode())).findFirst().orElse(null);
        Category entertainCat = sysCats.stream().filter(c -> "ENTERTAINMENT".equals(c.getCode())).findFirst().orElse(null);
        Category shoppingCat = sysCats.stream().filter(c -> "SHOPPING".equals(c.getCode())).findFirst().orElse(null);
        Category billsCat = sysCats.stream().filter(c -> "BILLS".equals(c.getCode())).findFirst().orElse(null);
        Category educationCat = sysCats.stream().filter(c -> "EDUCATION".equals(c.getCode())).findFirst().orElse(null);
        Category salaryCat = sysCats.stream().filter(c -> "SALARY".equals(c.getCode())).findFirst().orElse(null);

        Random rnd = new Random(42);
        List<Transaction> bulk = new ArrayList<>();
        LocalDate today = LocalDate.now();

        String[] foodMerchants = {"Highlands Coffee", "The Coffee House", "Phở Lý Quốc Sư", "Cơm tấm Ba Ghiền", "Bún chả Hương Liên", "Bánh mì Huỳnh Hoa", "GongCha", "Phúc Long"};
        String[] foodDescs = {"An sang Q2 voi bn", "Cafe sang", "Trua van phong", "An toi cung dong nghiep", "Tra sua chieu"};
        String[] transportMerchants = {"Grab", "Be", "Xanh SM", "Gojek"};
        String[] transportDescs = {"Grab 4.7km", "Be di hoc", "Grab di lam", "Xanh SM ve nha"};

        for (int dayOffset = 60; dayOffset >= 0; dayOffset--) {
            LocalDate date = today.minusDays(dayOffset);
            int txCount = 1 + rnd.nextInt(4);
            for (int i = 0; i < txCount; i++) {
                int pick = rnd.nextInt(10);
                Wallet wallet = wallets.get(rnd.nextInt(wallets.size()));
                Transaction t;
                if (pick < 5) {
                    String merchant = foodMerchants[rnd.nextInt(foodMerchants.length)];
                    String desc = foodDescs[rnd.nextInt(foodDescs.length)];
                    BigDecimal amount = bd(35000 + rnd.nextInt(150000));
                    t = makeTx(demo, wallet, foodCat, amount, Transaction.TxType.EXPENSE, date, desc, merchant);
                } else if (pick < 7) {
                    String merchant = transportMerchants[rnd.nextInt(transportMerchants.length)];
                    String desc = transportDescs[rnd.nextInt(transportDescs.length)];
                    BigDecimal amount = bd(15000 + rnd.nextInt(80000));
                    t = makeTx(demo, wallet, transportCat, amount, Transaction.TxType.EXPENSE, date, desc, merchant);
                } else if (pick < 8) {
                    BigDecimal amount = bd(50000 + rnd.nextInt(200000));
                    t = makeTx(demo, wallet, entertainCat, amount, Transaction.TxType.EXPENSE, date, "Nap Lien Quan 50k", "VTC Game");
                } else if (pick < 9) {
                    BigDecimal amount = bd(80000 + rnd.nextInt(500000));
                    t = makeTx(demo, wallet, shoppingCat, amount, Transaction.TxType.EXPENSE, date, "Mua sam Shopee", "Shopee");
                } else {
                    BigDecimal amount = bd(120000 + rnd.nextInt(300000));
                    t = makeTx(demo, wallet, billsCat, amount, Transaction.TxType.EXPENSE, date, "Tien dien thang", "EVN");
                }
                bulk.add(t);
            }

            // Salary on day 1 of month
            if (date.getDayOfMonth() == 1 && salaryCat != null) {
                Wallet bank = wallets.stream().filter(w -> w.getType() == Wallet.WalletType.BANK)
                        .findFirst().orElse(wallets.get(0));
                bulk.add(makeTx(demo, bank, salaryCat, bd(8_000_000),
                        Transaction.TxType.INCOME, date, "Luong thang " + date.getMonthValue(), "Cong ty ABC"));
            }

            // Tuition fee mid-semester
            if (date.getDayOfMonth() == 15 && rnd.nextInt(3) == 0 && educationCat != null) {
                Wallet bank = wallets.stream().filter(w -> w.getType() == Wallet.WalletType.BANK)
                        .findFirst().orElse(wallets.get(0));
                bulk.add(makeTx(demo, bank, educationCat, bd(2_500_000),
                        Transaction.TxType.EXPENSE, date, "Chuyen khoan hoc phi HK2", "FPT University"));
            }
        }

        transactionRepository.saveAll(bulk);
        log.info("Seeded {} demo transactions across 60 days", bulk.size());
    }

    private void seedAiUsage() {
        if (aiUsageRepository.count() > 0) return;
        UserAccount demo = userRepository.findByEmail("demo@finviet.local").orElse(null);
        if (demo == null) return;

        Random rnd = new Random(7);
        LocalDate today = LocalDate.now();
        List<AiUsage> bulk = new ArrayList<>();

        for (int dayOffset = 30; dayOffset >= 0; dayOffset--) {
            LocalDate date = today.minusDays(dayOffset);
            int categorizeCount = 5 + rnd.nextInt(20);
            for (int i = 0; i < categorizeCount; i++) {
                bulk.add(AiUsage.builder()
                        .user(demo)
                        .kind(AiUsage.Kind.CATEGORIZE)
                        .model("gpt-4o-mini")
                        .promptTokens(80 + rnd.nextInt(40))
                        .completionTokens(15 + rnd.nextInt(15))
                        .costUsd(bd6(0.00012 + rnd.nextDouble() * 0.00008))
                        .occurredOn(date)
                        .success(true)
                        .build());
            }
            if (date.getDayOfWeek().getValue() == 1) {
                bulk.add(AiUsage.builder()
                        .user(demo)
                        .kind(AiUsage.Kind.WEEKLY_REPORT)
                        .model("gpt-4o")
                        .promptTokens(1500 + rnd.nextInt(500))
                        .completionTokens(250 + rnd.nextInt(100))
                        .costUsd(bd6(0.012 + rnd.nextDouble() * 0.005))
                        .occurredOn(date)
                        .success(true)
                        .build());
            }
            int chatCount = rnd.nextInt(5);
            for (int i = 0; i < chatCount; i++) {
                bulk.add(AiUsage.builder()
                        .user(demo)
                        .kind(AiUsage.Kind.CHAT)
                        .model("gpt-4o")
                        .promptTokens(800 + rnd.nextInt(800))
                        .completionTokens(150 + rnd.nextInt(200))
                        .costUsd(bd6(0.005 + rnd.nextDouble() * 0.005))
                        .occurredOn(date)
                        .success(true)
                        .build());
            }
        }
        aiUsageRepository.saveAll(bulk);
        log.info("Seeded {} AI usage records over 30 days", bulk.size());
    }

    private Transaction makeTx(UserAccount u, Wallet w, Category c, BigDecimal amount,
                               Transaction.TxType type, LocalDate date, String desc, String merchant) {
        return Transaction.builder()
                .user(u).wallet(w).category(c).amount(amount).type(type)
                .occurredOn(date).description(desc).merchant(merchant)
                .source(Transaction.Source.MANUAL).aiCategorized(true)
                .aiConfidence(0.85 + Math.random() * 0.13)
                .build();
    }

    private BigDecimal bd(long v) {
        return BigDecimal.valueOf(v);
    }

    private BigDecimal bd6(double v) {
        return BigDecimal.valueOf(v).setScale(6, RoundingMode.HALF_UP);
    }
}
