package com.finviet.app.category;

import com.finviet.app.common.BaseEntity;
import com.finviet.app.user.UserAccount;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category extends BaseEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserAccount user;

    @Column(nullable = false, length = 64)
    private String code;

    @Column(name = "name_vi", nullable = false)
    private String nameVi;

    @Column(name = "name_en", nullable = false)
    private String nameEn;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Kind kind;

    @Column(length = 32)
    private String icon;

    @Column(length = 16)
    private String color;

    @Column(name = "is_system", nullable = false)
    @Builder.Default
    private boolean system = false;

    public enum Kind { EXPENSE, INCOME, TRANSFER }
}
