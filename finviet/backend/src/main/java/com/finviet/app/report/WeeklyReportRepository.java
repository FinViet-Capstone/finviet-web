package com.finviet.app.report;

import com.finviet.app.user.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WeeklyReportRepository extends JpaRepository<WeeklyReport, UUID> {
    List<WeeklyReport> findByUserOrderByPeriodStartDesc(UserAccount user);
    Optional<WeeklyReport> findByUserAndPeriodStart(UserAccount user, LocalDate periodStart);
    Optional<WeeklyReport> findFirstByUserOrderByPeriodStartDesc(UserAccount user);
}
