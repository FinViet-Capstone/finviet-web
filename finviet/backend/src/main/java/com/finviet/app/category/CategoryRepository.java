package com.finviet.app.category;

import com.finviet.app.user.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    List<Category> findBySystemTrueOrUser(UserAccount user);
    Optional<Category> findByCodeAndSystemTrue(String code);
    List<Category> findByUserOrSystemTrueOrderByNameViAsc(UserAccount user);
    Optional<Category> findByIdAndUser(UUID id, UserAccount user);
}
