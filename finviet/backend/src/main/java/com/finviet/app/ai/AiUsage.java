package com.finviet.app.ai;

import com.finviet.app.common.BaseEntity;
import com.finviet.app.user.UserAccount;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "ai_usage", indexes = {
        @Index(name = "ix_ai_user_date", columnList = "user_id, occurred_on"),
        @Index(name = "ix_ai_date", columnList = "occurred_on")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiUsage extends BaseEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserAccount user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 24)
    private Kind kind;

    @Column(name = "model", length = 64)
    private String model;

    @Column(name = "prompt_tokens")
    private Integer promptTokens;

    @Column(name = "completion_tokens")
    private Integer completionTokens;

    @Column(name = "cost_usd", precision = 10, scale = 6)
    private java.math.BigDecimal costUsd;

    @Column(name = "occurred_on", nullable = false)
    private LocalDate occurredOn;

    @Column(name = "success", nullable = false)
    @Builder.Default
    private boolean success = true;

    public enum Kind { CATEGORIZE, WEEKLY_REPORT, CHAT, SCORE, OCR }
}
