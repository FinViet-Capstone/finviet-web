package com.finviet.app.auth;

import com.finviet.app.common.ApiResponse;
import com.finviet.app.security.CurrentUser;
import com.finviet.app.user.UserAccount;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ApiResponse<AuthDtos.RegisterResponse> register(@Valid @RequestBody AuthDtos.RegisterRequest req) {
        return ApiResponse.ok("Register successfully", authService.register(req));
    }

    @PostMapping("/login")
    public ApiResponse<AuthDtos.TokenResponse> login(@Valid @RequestBody AuthDtos.LoginRequest req) {
        return ApiResponse.ok("Login successfully", authService.login(req));
    }

    @PostMapping("/refresh-token")
    public ApiResponse<AuthDtos.TokenResponse> refresh(@Valid @RequestBody AuthDtos.RefreshRequest req) {
        return ApiResponse.ok(authService.refresh(req));
    }

    @GetMapping("/me")
    public ApiResponse<AuthDtos.UserResponse> me() {
        UserAccount u = CurrentUser.get();
        AuthDtos.UserResponse r = new AuthDtos.UserResponse();
        r.setUserId(u.getId().toString());
        r.setEmail(u.getEmail());
        r.setFullName(u.getFullName());
        r.setMonthlyIncome(u.getMonthlyIncome());
        r.setRole(u.getRole().name());
        r.setStatus(u.isActive() ? "Active" : "Inactive");
        return ApiResponse.ok(r);
    }
}
