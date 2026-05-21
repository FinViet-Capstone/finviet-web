package com.finviet.app.ai;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface AiUsageRepository extends JpaRepository<AiUsage, UUID> {

    long countByOccurredOn(LocalDate date);

    @Query("SELECT COALESCE(SUM(a.costUsd), 0) FROM AiUsage a WHERE a.occurredOn = :date")
    BigDecimal sumCostByDate(@Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(a.costUsd), 0) FROM AiUsage a " +
            "WHERE a.occurredOn BETWEEN :from AND :to")
    BigDecimal sumCostBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT COUNT(a) FROM AiUsage a WHERE a.occurredOn BETWEEN :from AND :to")
    long countBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT a.occurredOn AS date, COUNT(a) AS count " +
            "FROM AiUsage a WHERE a.occurredOn BETWEEN :from AND :to " +
            "GROUP BY a.occurredOn ORDER BY a.occurredOn")
    List<DailyCount> dailyCountBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);

    interface DailyCount {
        LocalDate getDate();
        Long getCount();
    }
}
