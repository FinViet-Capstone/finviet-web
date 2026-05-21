package com.finviet.app.security;

import com.finviet.app.user.UserAccount;
import com.finviet.app.user.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                Claims claims = jwtService.parse(token);
                if (!"access".equals(claims.get("type"))) {
                    filterChain.doFilter(request, response);
                    return;
                }
                UUID userId = UUID.fromString(claims.getSubject());
                Optional<UserAccount> userOpt = userRepository.findById(userId);
                if (userOpt.isPresent() && userOpt.get().isActive()
                        && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserAccount user = userOpt.get();
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            user, null,
                            List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (JwtException | IllegalArgumentException ignored) {
                // Invalid token — fall through unauthenticated
            }
        }
        filterChain.doFilter(request, response);
    }
}
