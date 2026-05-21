package com.finviet.app.admin;

import com.finviet.app.common.ApiResponse;
import com.finviet.app.common.BusinessException;
import com.finviet.app.transaction.TransactionRepository;
import com.finviet.app.user.UserAccount;
import com.finviet.app.user.UserRepository;
import com.finviet.app.wallet.WalletRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUsersController {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ApiResponse<PagedResult<UserListItem>> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status) {

        int pageIndex = Math.max(0, page - 1);
        Pageable pageable = PageRequest.of(pageIndex, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<UserAccount> spec = (root, q, cb) -> cb.conjunction();
        if (keyword != null && !keyword.isBlank()) {
            String like = "%" + keyword.toLowerCase() + "%";
            spec = spec.and((root, q, cb) -> cb.or(
                    cb.like(cb.lower(root.get("email")), like),
                    cb.like(cb.lower(root.get("fullName")), like)
            ));
        }
        if ("active".equalsIgnoreCase(status) || "Active".equalsIgnoreCase(status)) {
            spec = spec.and((root, q, cb) -> cb.isTrue(root.get("active")));
        } else if ("inactive".equalsIgnoreCase(status) || "Inactive".equalsIgnoreCase(status)) {
            spec = spec.and((root, q, cb) -> cb.isFalse(root.get("active")));
        }

        Page<UserAccount> result = userRepository.findAll(spec, pageable);
        List<UserListItem> items = result.getContent().stream().map(this::toListItem).toList();

        PagedResult<UserListItem> body = new PagedResult<>();
        body.setItems(items);
        body.setPage(page);
        body.setPageSize(pageSize);
        body.setTotalItems(result.getTotalElements());
        body.setTotalPages(result.getTotalPages());
        return ApiResponse.ok(body);
    }

    @PutMapping("/{userId}/deactivate")
    public ApiResponse<Void> deactivate(@PathVariable("userId") UUID id) {
        UserAccount u = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "Không tìm thấy người dùng"));
        if (u.getRole() == UserAccount.Role.ADMIN) {
            throw new BusinessException("Không thể khoá tài khoản admin");
        }
        u.setActive(false);
        userRepository.save(u);
        return ApiResponse.ok("User deactivated successfully");
    }

    @PutMapping("/{userId}/activate")
    public ApiResponse<Void> activate(@PathVariable("userId") UUID id) {
        UserAccount u = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "Không tìm thấy người dùng"));
        u.setActive(true);
        userRepository.save(u);
        return ApiResponse.ok("User activated successfully");
    }

    @PostMapping("/{userId}/reset-password")
    public ApiResponse<Void> resetPassword(@PathVariable("userId") UUID id, @Valid @RequestBody ResetPasswordRequest req) {
        UserAccount u = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "Không tìm thấy người dùng"));
        u.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(u);
        return ApiResponse.ok("Password reset successfully");
    }

    @DeleteMapping("/{userId}")
    public ApiResponse<Void> delete(@PathVariable("userId") UUID id) {
        UserAccount u = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "Không tìm thấy người dùng"));
        if (u.getRole() == UserAccount.Role.ADMIN) {
            throw new BusinessException("Không thể xoá tài khoản admin");
        }
        userRepository.delete(u);
        return ApiResponse.ok("User deleted successfully");
    }

    private UserListItem toListItem(UserAccount u) {
        UserListItem item = new UserListItem();
        item.setUserId(u.getId().toString());
        item.setEmail(u.getEmail());
        item.setFullName(u.getFullName());
        item.setMonthlyIncome(u.getMonthlyIncome());
        item.setRole(u.getRole().name());
        item.setStatus(u.isActive() ? "Active" : "Inactive");
        item.setCreatedAt(u.getCreatedAt() == null ? null : u.getCreatedAt().toString());
        item.setTotalTransactions(transactionRepository.countByUser(u));
        item.setTotalWallets(walletRepository.countByUser(u));
        return item;
    }

    @Data
    public static class UserListItem {
        private String userId;
        private String email;
        private String fullName;
        private BigDecimal monthlyIncome;
        private String role;
        private String status;
        private String createdAt;
        private long totalTransactions;
        private long totalWallets;
    }

    @Data
    public static class ResetPasswordRequest {
        @NotBlank @Size(min = 6, max = 64)
        private String newPassword;
    }

    @Data
    public static class PagedResult<T> {
        private List<T> items;
        private int page;
        private int pageSize;
        private long totalItems;
        private int totalPages;
    }
}
