package com.recruitment.controller;

import com.recruitment.dto.AuthDTOs.*;
import com.recruitment.service.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register/employer")
    public ResponseEntity<AuthResponse> registerEmployer(@Valid @RequestBody EmployerRegisterRequest req) {
        log.info("Registering employer: {}", req.getEmail());
        return ResponseEntity.ok(authService.registerEmployer(req));
    }

    @PostMapping("/register/candidate")
    public ResponseEntity<AuthResponse> registerCandidate(@Valid @RequestBody CandidateRegisterRequest req) {
        log.info("Registering candidate: {}", req.getEmail());
        return ResponseEntity.ok(authService.registerCandidate(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        log.info("Login attempt: {} as {}", req.getEmail(), req.getRole());
        ResponseEntity<AuthResponse> res = ResponseEntity.ok(authService.login(req));
        log.info("Login successful: {}", req.getEmail());
        return res;
    }
}
