package com.finviet.app.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

@Component
public class JwtService {

    private final SecretKey key;
    private final long accessTtlMinutes;
    private final long refreshTtlDays;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.access-token-ttl-minutes:60}") long accessTtlMinutes,
                      @Value("${app.jwt.refresh-token-ttl-days:30}") long refreshTtlDays) {
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("JWT secret must be at least 32 bytes");
        }
        this.key = Keys.hmacShaKeyFor(bytes);
        this.accessTtlMinutes = accessTtlMinutes;
        this.refreshTtlDays = refreshTtlDays;
    }

    public String generateAccessToken(UUID userId, String email, String role) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(userId.toString())
                .claims(Map.of("email", email, "role", role, "type", "access"))
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(accessTtlMinutes, ChronoUnit.MINUTES)))
                .signWith(key)
                .compact();
    }

    public String generateRefreshToken(UUID userId) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(userId.toString())
                .claims(Map.of("type", "refresh"))
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(refreshTtlDays, ChronoUnit.DAYS)))
                .signWith(key)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    public UUID extractUserId(String token) {
        return UUID.fromString(parse(token).getSubject());
    }
}
