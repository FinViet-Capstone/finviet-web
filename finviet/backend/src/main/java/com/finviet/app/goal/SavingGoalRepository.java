package com.finviet.app.goal;

import com.finviet.app.user.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavingGoalRepository extends JpaRepository<SavingGoal, UUID> {
    List<SavingGoal> findByUserOrderByCreatedAtDesc(UserAccount user);
    Optional<SavingGoal> findByIdAndUser(UUID id, UserAccount user);
}
