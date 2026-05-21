package com.finviet.app.wallet;

import com.finviet.app.common.BusinessException;
import com.finviet.app.security.CurrentUser;
import com.finviet.app.user.UserAccount;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/wallets")
@RequiredArgsConstructor
public class WalletController {

    private final WalletRepository walletRepository;

    @GetMapping
    public List<WalletDtos.Response> list() {
        UserAccount u = CurrentUser.get();
        return walletRepository.findByUserOrderByCreatedAtAsc(u).stream()
                .map(WalletDtos.Response::from)
                .toList();
    }

    @PostMapping
    @Transactional
    public WalletDtos.Response create(@Valid @RequestBody WalletDtos.CreateRequest req) {
        UserAccount u = CurrentUser.get();
        Wallet w = Wallet.builder()
                .user(u)
                .name(req.getName())
                .type(req.getType())
                .balance(req.getBalance())
                .icon(req.getIcon())
                .currency(req.getCurrency() == null ? "VND" : req.getCurrency())
                .isDefault(req.isDefault())
                .build();
        if (req.isDefault()) {
            walletRepository.findByUserOrderByCreatedAtAsc(u).forEach(other -> {
                if (other.isDefault()) { other.setDefault(false); walletRepository.save(other); }
            });
        }
        return WalletDtos.Response.from(walletRepository.save(w));
    }

    @PutMapping("/{id}")
    @Transactional
    public WalletDtos.Response update(@PathVariable UUID id, @RequestBody WalletDtos.UpdateRequest req) {
        UserAccount u = CurrentUser.get();
        Wallet w = walletRepository.findByIdAndUser(id, u)
                .orElseThrow(() -> new BusinessException(404, "Không tìm thấy ví"));
        if (req.getName() != null) w.setName(req.getName());
        if (req.getBalance() != null) w.setBalance(req.getBalance());
        if (req.getIcon() != null) w.setIcon(req.getIcon());
        if (req.getIsDefault() != null && req.getIsDefault()) {
            walletRepository.findByUserOrderByCreatedAtAsc(u).forEach(other -> {
                if (!other.getId().equals(id) && other.isDefault()) {
                    other.setDefault(false); walletRepository.save(other);
                }
            });
            w.setDefault(true);
        }
        return WalletDtos.Response.from(walletRepository.save(w));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        UserAccount u = CurrentUser.get();
        Wallet w = walletRepository.findByIdAndUser(id, u)
                .orElseThrow(() -> new BusinessException(404, "Không tìm thấy ví"));
        walletRepository.delete(w);
        return ResponseEntity.noContent().build();
    }
}
