package com.finviet.app.report;

import com.finviet.app.common.BaseEntity;
import com.finviet.app.user.UserAccount;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "weekly_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeeklyReport extends BaseEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private UserAccount user;

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    @Column(name = "total_expense", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalExpense;

    @Column(name = "total_income", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalIncome;

    @Column(name = "spending_score")
    private Integer spendingScore;

    @Column(name = "narrative", length = 4000)
    private String narrative;

    @Column(name = "score_commentary", length = 1000)
    private String scoreCommentary;
}
