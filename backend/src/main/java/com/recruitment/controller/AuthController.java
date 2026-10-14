package com.recruitment.controller;

import com.recruitment.dto.AuthDTOs.*;
import com.recruitment.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register/employer")
    public ResponseEntity<AuthResponse> registerEmployer(@Valid @RequestBody EmployerRegisterRequest req) {
        return ResponseEntity.ok(authService.registerEmployer(req));
    }

    @PostMapping("/register/candidate")
    public ResponseEntity<AuthResponse> registerCandidate(@Valid @RequestBody CandidateRegisterRequest req) {
        return ResponseEntity.ok(authService.registerCandidate(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }
}
