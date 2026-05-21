package com.finviet.app.auth;

import com.finviet.app.common.BusinessException;
import com.finviet.app.security.JwtService;
import com.finviet.app.user.UserAccount;
import com.finviet.app.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${app.jwt.access-token-ttl-minutes:60}")
    private long accessTtlMinutes;

    @Transactional
    public AuthDtos.RegisterResponse register(AuthDtos.RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new BusinessException("Email đã được đăng ký");
        }
        UserAccount u = UserAccount.builder()
                .email(req.getEmail())
                .fullName(req.getFullName())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .monthlyIncome(req.getMonthlyIncome())
                .role(UserAccount.Role.USER)
                .active(true)
                .build();
        u = userRepository.save(u);
        AuthDtos.RegisterResponse resp = new AuthDtos.RegisterResponse();
        resp.setUserId(u.getId().toString());
        resp.setEmail(u.getEmail());
        resp.setFullName(u.getFullName());
        resp.setMonthlyIncome(u.getMonthlyIncome());
        resp.setStatus(u.isActive() ? "Active" : "Inactive");
        return resp;
    }

    @Transactional(readOnly = true)
    public AuthDtos.TokenResponse login(AuthDtos.LoginRequest req) {
        UserAccount u = authenticate(req.getEmail(), req.getPassword());
        return tokens(u);
    }

    @Transactional(readOnly = true)
    public AuthDtos.AdminLoginResponse adminLogin(AuthDtos.LoginRequest req) {
        UserAccount u = authenticate(req.getEmail(), req.getPassword());
        if (u.getRole() != UserAccount.Role.ADMIN) {
            throw new BusinessException(403, "Tài khoản không có quyền truy cập trang quản trị");
        }
        AuthDtos.AdminLoginResponse resp = new AuthDtos.AdminLoginResponse();
        resp.setAccessToken(jwtService.generateAccessToken(u.getId(), u.getEmail(), u.getRole().name()));
        resp.setRefreshToken(jwtService.generateRefreshToken(u.getId()));
        resp.setExpiresIn(accessTtlMinutes * 60);
        AuthDtos.AdminInfo info = new AuthDtos.AdminInfo();
        info.setAdminId(u.getId().toString());
        info.setAdminName(u.getFullName());
        info.setEmail(u.getEmail());
        resp.setAdmin(info);
        return resp;
    }

    @Transactional(readOnly = true)
    public AuthDtos.TokenResponse refresh(AuthDtos.RefreshRequest req) {
        try {
            var claims = jwtService.parse(req.getRefreshToken());
            if (!"refresh".equals(claims.get("type"))) {
                throw new BusinessException(401, "Refresh token không hợp lệ");
            }
            UUID userId = UUID.fromString(claims.getSubject());
            UserAccount u = userRepository.findById(userId)
                    .orElseThrow(() -> new BusinessException(401, "Tài khoản không tồn tại"));
            if (!u.isActive()) throw new BusinessException(403, "Tài khoản đã bị vô hiệu hóa");
            return tokens(u);
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(401, "Refresh token không hợp lệ hoặc đã hết hạn");
        }
    }

    private UserAccount authenticate(String email, String password) {
        UserAccount u = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(401, "Email hoặc mật khẩu không đúng"));
        if (!u.isActive()) throw new BusinessException(403, "Tài khoản đã bị vô hiệu hóa");
        if (u.getPasswordHash() == null || !passwordEncoder.matches(password, u.getPasswordHash())) {
            throw new BusinessException(401, "Email hoặc mật khẩu không đúng");
        }
        return u;
    }

    private AuthDtos.TokenResponse tokens(UserAccount u) {
        AuthDtos.TokenResponse resp = new AuthDtos.TokenResponse();
        resp.setAccessToken(jwtService.generateAccessToken(u.getId(), u.getEmail(), u.getRole().name()));
        resp.setRefreshToken(jwtService.generateRefreshToken(u.getId()));
        resp.setExpiresIn(accessTtlMinutes * 60);

        AuthDtos.UserResponse ur = new AuthDtos.UserResponse();
        ur.setUserId(u.getId().toString());
        ur.setEmail(u.getEmail());
        ur.setFullName(u.getFullName());
        ur.setMonthlyIncome(u.getMonthlyIncome());
        ur.setRole(u.getRole().name());
        ur.setStatus(u.isActive() ? "Active" : "Inactive");
        resp.setUser(ur);
        return resp;
    }
}
