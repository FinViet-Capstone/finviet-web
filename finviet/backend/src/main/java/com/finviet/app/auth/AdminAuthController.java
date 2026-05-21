package com.finviet.app.auth;

import com.finviet.app.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<AuthDtos.AdminLoginResponse> login(@Valid @RequestBody AuthDtos.LoginRequest req) {
        return ApiResponse.ok("Admin logged in", authService.adminLogin(req));
    }
}
