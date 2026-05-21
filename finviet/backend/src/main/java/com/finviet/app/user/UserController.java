package com.finviet.app.user;

import com.finviet.app.security.CurrentUser;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest req) {
        UserAccount u = CurrentUser.get();
        if (req.getFullName() != null) u.setFullName(req.getFullName());
        if (req.getMonthlyIncome() != null) u.setMonthlyIncome(req.getMonthlyIncome());
        if (req.getFcmToken() != null) u.setFcmToken(req.getFcmToken());
        userRepository.save(u);
        return ResponseEntity.ok().build();
    }

    @Data
    public static class UpdateProfileRequest {
        private String fullName;
        private BigDecimal monthlyIncome;
        private String fcmToken;
    }
}
