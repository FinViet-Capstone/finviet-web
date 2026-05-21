package com.finviet.app.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<UserAccount, UUID>, JpaSpecificationExecutor<UserAccount> {
    Optional<UserAccount> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<UserAccount> findByGoogleSub(String googleSub);
    long countByActiveTrue();
}
