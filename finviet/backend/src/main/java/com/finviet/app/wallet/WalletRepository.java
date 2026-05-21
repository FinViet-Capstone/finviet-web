package com.finviet.app.wallet;

import com.finviet.app.user.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WalletRepository extends JpaRepository<Wallet, UUID> {
    List<Wallet> findByUserOrderByCreatedAtAsc(UserAccount user);
    Optional<Wallet> findByIdAndUser(UUID id, UserAccount user);
    long countByUser(UserAccount user);
}
