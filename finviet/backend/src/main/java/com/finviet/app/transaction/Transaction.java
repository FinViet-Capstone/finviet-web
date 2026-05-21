package com.finviet.app.transaction;

import com.finviet.app.category.Category;
import com.finviet.app.common.BaseEntity;
import com.finviet.app.user.UserAccount;
import com.finviet.app.wallet.Wallet;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "transactions", indexes = {
        @Index(name = "ix_tx_user_date", columnList = "user_id, occurred_on"),
        @Index(name = "ix_tx_user_category", columnList = "user_id, category_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction extends BaseEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private UserAccount user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "wallet_id")
    private Wallet wallet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private TxType type;

    @Column(name = "occurred_on", nullable = false)
    private LocalDate occurredOn;

    @Column(length = 512)
    private String description;

    @Column(name = "merchant", length = 128)
    private String merchant;

    @Enumerated(EnumType.STRING)
    @Column(name = "source", nullable = false, length = 16)
    @Builder.Default
    private Source source = Source.MANUAL;

    @Column(name = "ai_categorized", nullable = false)
    @Builder.Default
    private boolean aiCategorized = false;

    @Column(name = "ai_confidence")
    private Double aiConfidence;

    @Column(name = "user_overridden", nullable = false)
    @Builder.Default
    private boolean userOverridden = false;

    @Column(name = "raw_text", length = 2000)
    private String rawText;

    public enum TxType { EXPENSE, INCOME, TRANSFER }

    public enum Source { MANUAL, CSV, SMS, AI }
}
