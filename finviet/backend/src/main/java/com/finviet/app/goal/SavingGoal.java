package com.finviet.app.goal;

import com.finviet.app.common.BaseEntity;
import com.finviet.app.user.UserAccount;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "saving_goals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavingGoal extends BaseEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private UserAccount user;

    @Column(nullable = false)
    private String name;

    @Column(name = "target_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal targetAmount;

    @Column(name = "current_amount", nullable = false, precision = 18, scale = 2)
    @Builder.Default
    private BigDecimal currentAmount = BigDecimal.ZERO;

    @Column(name = "deadline")
    private LocalDate deadline;

    @Column(name = "icon", length = 32)
    private String icon;

    @Column(nullable = false)
    @Builder.Default
    private boolean achieved = false;
}
