package com.finviet.app.chat;

import com.finviet.app.common.BaseEntity;
import com.finviet.app.user.UserAccount;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "chat_messages", indexes = @Index(name = "ix_chat_user", columnList = "user_id, created_at"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage extends BaseEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private UserAccount user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Role role;

    @Column(nullable = false, length = 4000)
    private String content;

    @Column(name = "context_summary", length = 4000)
    private String contextSummary;

    public enum Role { USER, ASSISTANT, SYSTEM }
}
