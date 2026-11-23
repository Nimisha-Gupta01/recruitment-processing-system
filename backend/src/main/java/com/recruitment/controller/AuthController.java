package com.recruitment.controller;

import com.recruitment.dto.AuthDTOs.*;
import com.recruitment.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final AuthService authService;

    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    private void setJwtCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("jwt", token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge((int) (expirationMs / 1000));
        // cookie.setSecure(true); // enable in production with HTTPS
        response.addCookie(cookie);
    }

    @PostMapping("/register/employer")
    public ResponseEntity<AuthResponse> registerEmployer(@Valid @RequestBody EmployerRegisterRequest req,
                                                          HttpServletResponse response) {
        log.info("Registering employer: {}", req.getEmail());
        AuthResponse auth = authService.registerEmployer(req);
        setJwtCookie(response, auth.getToken());
        return ResponseEntity.ok(auth.withoutToken());
    }

    @PostMapping("/register/candidate")
    public ResponseEntity<AuthResponse> registerCandidate(@Valid @RequestBody CandidateRegisterRequest req,
                                                           HttpServletResponse response) {
        log.info("Registering candidate: {}", req.getEmail());
        AuthResponse auth = authService.registerCandidate(req);
        setJwtCookie(response, auth.getToken());
        return ResponseEntity.ok(auth.withoutToken());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req,
                                               HttpServletResponse response) {
        log.info("Login attempt: {} as {}", req.getEmail(), req.getRole());
        AuthResponse auth = authService.login(req);
        setJwtCookie(response, auth.getToken());
        log.info("Login successful: {}", req.getEmail());
        return ResponseEntity.ok(auth.withoutToken());
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("jwt", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok(authService.getMe(email));
    }
}
