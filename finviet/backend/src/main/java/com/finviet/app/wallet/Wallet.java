package com.finviet.app.wallet;

import com.finviet.app.common.BaseEntity;
import com.finviet.app.user.UserAccount;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "wallets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wallet extends BaseEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private UserAccount user;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private WalletType type;

    @Column(nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO;

    @Column(length = 8)
    @Builder.Default
    private String currency = "VND";

    @Column(length = 32)
    private String icon;

    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private boolean isDefault = false;

    public enum WalletType { CASH, MOMO, ZALOPAY, BANK, OTHER }
}
