package com.finviet.app.chat;

import com.finviet.app.user.UserAccount;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    List<ChatMessage> findByUserOrderByCreatedAtDesc(UserAccount user, Pageable pageable);
    List<ChatMessage> findByUserOrderByCreatedAtAsc(UserAccount user);
    long countByUser(UserAccount user);
}
