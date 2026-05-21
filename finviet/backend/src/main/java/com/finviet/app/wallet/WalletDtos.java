package com.finviet.app.wallet;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

public class WalletDtos {

    @Data
    public static class CreateRequest {
        @NotBlank
        private String name;
        @NotNull
        private Wallet.WalletType type;
        @NotNull
        private BigDecimal balance;
        private String icon;
        private String currency;
        private boolean isDefault;
    }

    @Data
    public static class UpdateRequest {
        private String name;
        private BigDecimal balance;
        private String icon;
        private Boolean isDefault;
    }

    @Data
    public static class TransferRequest {
        @NotNull
        private UUID fromWalletId;
        @NotNull
        private UUID toWalletId;
        @NotNull
        private BigDecimal amount;
        private String description;
    }

    @Data
    public static class Response {
        private String id;
        private String name;
        private String type;
        private BigDecimal balance;
        private String icon;
        private String currency;
        private boolean isDefault;

        public static Response from(Wallet w) {
            Response r = new Response();
            r.id = w.getId().toString();
            r.name = w.getName();
            r.type = w.getType().name();
            r.balance = w.getBalance();
            r.icon = w.getIcon();
            r.currency = w.getCurrency();
            r.isDefault = w.isDefault();
            return r;
        }
    }
}
