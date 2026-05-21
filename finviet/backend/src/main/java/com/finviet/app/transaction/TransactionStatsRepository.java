package com.finviet.app.transaction;

import com.finviet.app.user.UserAccount;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TransactionStatsRepository {
    interface DailyCount {
        LocalDate getDate();
        Long getCount();
    }

    interface DailyActiveUsers {
        LocalDate getDate();
        Long getCount();
    }
}
