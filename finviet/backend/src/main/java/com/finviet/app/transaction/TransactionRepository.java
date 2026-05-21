package com.finviet.app.transaction;

import com.finviet.app.category.Category;
import com.finviet.app.user.UserAccount;
import com.finviet.app.wallet.Wallet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    Page<Transaction> findByUserOrderByOccurredOnDescCreatedAtDesc(UserAccount user, Pageable pageable);

    List<Transaction> findByUserAndOccurredOnBetweenOrderByOccurredOnDesc(
            UserAccount user, LocalDate from, LocalDate to);

    Optional<Transaction> findByIdAndUser(UUID id, UserAccount user);

    long countByUser(UserAccount user);

    long countByWallet(Wallet wallet);

    long countByUserAndUserOverriddenTrue(UserAccount user);

    @Query("SELECT t.category.id AS categoryId, COALESCE(SUM(t.amount),0) AS total " +
            "FROM Transaction t " +
            "WHERE t.user = :user AND t.type = com.finviet.app.transaction.Transaction$TxType.EXPENSE " +
            "AND t.occurredOn BETWEEN :from AND :to " +
            "GROUP BY t.category.id")
    List<CategoryTotal> sumExpenseByCategory(@Param("user") UserAccount user,
                                             @Param("from") LocalDate from,
                                             @Param("to") LocalDate to);

    @Query("SELECT COALESCE(SUM(t.amount),0) FROM Transaction t " +
            "WHERE t.user = :user AND t.type = com.finviet.app.transaction.Transaction$TxType.EXPENSE " +
            "AND t.category = :category AND t.occurredOn BETWEEN :from AND :to")
    BigDecimal sumExpenseByCategoryRange(@Param("user") UserAccount user,
                                          @Param("category") Category category,
                                          @Param("from") LocalDate from,
                                          @Param("to") LocalDate to);

    @Query("SELECT t.merchant AS merchant, COALESCE(SUM(t.amount),0) AS total, COUNT(t) AS cnt " +
            "FROM Transaction t " +
            "WHERE t.user = :user AND t.type = com.finviet.app.transaction.Transaction$TxType.EXPENSE " +
            "AND t.merchant IS NOT NULL AND t.occurredOn BETWEEN :from AND :to " +
            "GROUP BY t.merchant ORDER BY total DESC")
    List<MerchantTotal> topMerchants(@Param("user") UserAccount user,
                                     @Param("from") LocalDate from,
                                     @Param("to") LocalDate to,
                                     Pageable page);

    interface CategoryTotal {
        UUID getCategoryId();
        BigDecimal getTotal();
    }

    interface MerchantTotal {
        String getMerchant();
        BigDecimal getTotal();
        Long getCnt();
    }
}
