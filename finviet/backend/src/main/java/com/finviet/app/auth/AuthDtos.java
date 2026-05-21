package com.finviet.app.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

public class AuthDtos {

    @Data
    public static class RegisterRequest {
        @Email @NotBlank
        private String email;
        @NotBlank @Size(min = 6, max = 64)
        private String password;
        @NotBlank
        private String fullName;
        private BigDecimal monthlyIncome;
    }

    @Data
    public static class LoginRequest {
        @Email @NotBlank
        private String email;
        @NotBlank
        private String password;
    }

    @Data
    public static class GoogleLoginRequest {
        @NotBlank
        private String idToken;
    }

    @Data
    public static class RefreshRequest {
        @NotBlank
        private String refreshToken;
    }

    @Data
    public static class TokenResponse {
        private String accessToken;
        private String refreshToken;
        private String tokenType = "Bearer";
        private long expiresIn;
        private UserResponse user;
    }

    @Data
    public static class UserResponse {
        private String userId;
        private String email;
        private String fullName;
        private BigDecimal monthlyIncome;
        private String role;
        private String status;
    }

    @Data
    public static class AdminLoginResponse {
        private String accessToken;
        private String refreshToken;
        private String tokenType = "Bearer";
        private long expiresIn;
        private AdminInfo admin;
    }

    @Data
    public static class AdminInfo {
        private String adminId;
        private String adminName;
        private String email;
    }

    @Data
    public static class RegisterResponse {
        private String userId;
        private String fullName;
        private String email;
        private BigDecimal monthlyIncome;
        private String status;
    }
}
