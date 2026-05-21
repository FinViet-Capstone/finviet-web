package com.finviet.app.user;

import com.finviet.app.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAccount extends BaseEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String email;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "monthly_income")
    private BigDecimal monthlyIncome;

    @Column(name = "google_sub")
    private String googleSub;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.USER;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "fcm_token")
    private String fcmToken;

    public enum Role { USER, ADMIN }
}
