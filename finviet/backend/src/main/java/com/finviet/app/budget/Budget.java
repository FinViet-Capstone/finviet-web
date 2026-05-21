package com.finviet.app.budget;

import com.finviet.app.category.Category;
import com.finviet.app.common.BaseEntity;
import com.finviet.app.user.UserAccount;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "budgets", uniqueConstraints = @UniqueConstraint(
        columnNames = {"user_id", "category_id", "period_year", "period_month"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Budget extends BaseEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private UserAccount user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "period_year", nullable = false)
    private int periodYear;

    @Column(name = "period_month", nullable = false)
    private int periodMonth;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(name = "alert_sent_80", nullable = false)
    @Builder.Default
    private boolean alertSent80 = false;

    @Column(name = "alert_sent_100", nullable = false)
    @Builder.Default
    private boolean alertSent100 = false;
}
