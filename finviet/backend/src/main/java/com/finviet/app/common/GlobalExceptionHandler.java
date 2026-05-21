package com.finviet.app.common;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleBusiness(BusinessException ex, HttpServletRequest req) {
        Map<String, Object> details = new HashMap<>();
        details.put("path", req.getRequestURI());
        return ResponseEntity.status(ex.getStatus())
                .body(new ApiResponse<>(false, ex.getMessage(), details));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, Object>>> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            errors.put(fe.getField(), fe.getDefaultMessage());
        }
        Map<String, Object> details = new HashMap<>();
        details.put("path", req.getRequestURI());
        details.put("fieldErrors", errors);
        return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Invalid request payload", details));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleAuth(AuthenticationException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse<>(false, ex.getMessage() == null ? "Unauthorized" : ex.getMessage(), null));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleDenied(AccessDeniedException ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ApiResponse<>(false, ex.getMessage() == null ? "Forbidden" : ex.getMessage(), null));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneric(Exception ex, HttpServletRequest req) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, ex.getMessage() == null ? "Internal Error" : ex.getMessage(), null));
    }
}
