package com.recruitment.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.math.BigDecimal;

public class AuthDTOs {

    @Data
    public static class EmployerRegisterRequest {
        @NotBlank
        private String orgName;
        private Integer establishedYr;
        private Integer numEmployees;
        private BigDecimal annualTurnover;
        @NotBlank
        private String contactName;
        @Email @NotBlank
        private String email;
        private String phone;
        @NotBlank @Size(min = 6)
        private String password;
        private String address;
        private String website;
    }

    @Data
    public static class CandidateRegisterRequest {
        @NotBlank
        private String fullName;
        @Email @NotBlank
        private String email;
        private String phone;
        @NotBlank @Size(min = 6)
        private String password;
        private String dob;         // "YYYY-MM-DD"
        private String gender;      // Male / Female / Other
        private String address;
        private String degree;
        private String institution;
        private Integer yearOfPassing;
        private BigDecimal percentage;
        private BigDecimal totalExpYrs;
        private BigDecimal expectedSalMin;
        private BigDecimal expectedSalMax;
    }

    @Data
    public static class LoginRequest {
        @Email @NotBlank
        private String email;
        @NotBlank
        private String password;
        @NotBlank
        private String role;        // EMPLOYER or CANDIDATE
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String role;
        private Integer userId;
        private String name;

        public AuthResponse(String token, String role, Integer userId, String name) {
            this.token = token;
            this.role = role;
            this.userId = userId;
            this.name = name;
        }
    }
}
