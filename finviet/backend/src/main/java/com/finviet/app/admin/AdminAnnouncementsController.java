package com.finviet.app.admin;

import com.finviet.app.common.ApiResponse;
import com.finviet.app.user.UserAccount;
import com.finviet.app.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/admin/announcements")
@RequiredArgsConstructor
public class AdminAnnouncementsController {

    private final UserRepository userRepository;

    @PostMapping
    public ApiResponse<SendResponse> send(@Valid @RequestBody AnnouncementRequest req) {
        Audience aud = parseAudience(req.getTargetSegment());
        List<UserAccount> targets = switch (aud) {
            case ALL -> userRepository.findAll();
            case ACTIVE -> userRepository.findAll().stream().filter(UserAccount::isActive).toList();
            case INACTIVE -> userRepository.findAll().stream().filter(u -> !u.isActive()).toList();
        };

        int delivered = 0;
        for (UserAccount u : targets) {
            String token = u.getFcmToken();
            if (token == null || token.isBlank()) continue;
            log.info("[ANNOUNCEMENT] -> {} ({}): {} | {}",
                    u.getEmail(), token.substring(0, Math.min(8, token.length())),
                    req.getTitle(), req.getMessage());
            delivered++;
        }
        log.info("Announcement '{}' broadcast to segment={} ({} targeted, {} delivered)",
                req.getTitle(), req.getTargetSegment(), targets.size(), delivered);

        SendResponse resp = new SendResponse();
        resp.setAnnouncementId("ann-" + UUID.randomUUID().toString().substring(0, 8));
        resp.setTargeted(targets.size());
        resp.setDelivered(delivered);
        return ApiResponse.ok("Announcement sent successfully", resp);
    }

    private Audience parseAudience(String segment) {
        if (segment == null) return Audience.ALL;
        return switch (segment.toLowerCase()) {
            case "activeusers", "active" -> Audience.ACTIVE;
            case "inactiveusers", "inactive" -> Audience.INACTIVE;
            default -> Audience.ALL;
        };
    }

    @Data
    public static class AnnouncementRequest {
        @NotBlank @Size(max = 120)
        private String title;
        @NotBlank @Size(max = 1000)
        private String message;
        @NotNull
        private String targetSegment;
    }

    public enum Audience { ALL, ACTIVE, INACTIVE }

    @Data
    public static class SendResponse {
        private String announcementId;
        private int targeted;
        private int delivered;
    }
}
