package com.finviet.app.security;

import com.finviet.app.user.UserAccount;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class CurrentUser {
    private CurrentUser() {}

    public static UserAccount get() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserAccount user)) {
            throw new IllegalStateException("No authenticated user in context");
        }
        return user;
    }
}
