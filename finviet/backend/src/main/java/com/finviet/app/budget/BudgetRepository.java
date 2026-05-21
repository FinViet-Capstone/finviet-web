package com.finviet.app.budget;

import com.finviet.app.category.Category;
import com.finviet.app.user.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, UUID> {
    List<Budget> findByUserAndPeriodYearAndPeriodMonth(UserAccount user, int year, int month);
    Optional<Budget> findByUserAndCategoryAndPeriodYearAndPeriodMonth(
            UserAccount user, Category category, int year, int month);
    Optional<Budget> findByIdAndUser(UUID id, UserAccount user);
}
