package com.recruitment.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class AuthDTOs {

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

        public String getOrgName() { return orgName; }
        public void setOrgName(String orgName) { this.orgName = orgName; }

        public Integer getEstablishedYr() { return establishedYr; }
        public void setEstablishedYr(Integer establishedYr) { this.establishedYr = establishedYr; }

        public Integer getNumEmployees() { return numEmployees; }
        public void setNumEmployees(Integer numEmployees) { this.numEmployees = numEmployees; }

        public BigDecimal getAnnualTurnover() { return annualTurnover; }
        public void setAnnualTurnover(BigDecimal annualTurnover) { this.annualTurnover = annualTurnover; }

        public String getContactName() { return contactName; }
        public void setContactName(String contactName) { this.contactName = contactName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public String getWebsite() { return website; }
        public void setWebsite(String website) { this.website = website; }
    }

    public static class CandidateRegisterRequest {
        @NotBlank
        private String fullName;
        @Email @NotBlank
        private String email;
        private String phone;
        @NotBlank @Size(min = 6)
        private String password;
        private String dob;
        private String gender;
        private String address;
        private String degree;
        private String institution;
        private Integer yearOfPassing;
        private BigDecimal percentage;
        private BigDecimal totalExpYrs;
        private BigDecimal expectedSalMin;
        private BigDecimal expectedSalMax;

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getDob() { return dob; }
        public void setDob(String dob) { this.dob = dob; }

        public String getGender() { return gender; }
        public void setGender(String gender) { this.gender = gender; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public String getDegree() { return degree; }
        public void setDegree(String degree) { this.degree = degree; }

        public String getInstitution() { return institution; }
        public void setInstitution(String institution) { this.institution = institution; }

        public Integer getYearOfPassing() { return yearOfPassing; }
        public void setYearOfPassing(Integer yearOfPassing) { this.yearOfPassing = yearOfPassing; }

        public BigDecimal getPercentage() { return percentage; }
        public void setPercentage(BigDecimal percentage) { this.percentage = percentage; }

        public BigDecimal getTotalExpYrs() { return totalExpYrs; }
        public void setTotalExpYrs(BigDecimal totalExpYrs) { this.totalExpYrs = totalExpYrs; }

        public BigDecimal getExpectedSalMin() { return expectedSalMin; }
        public void setExpectedSalMin(BigDecimal expectedSalMin) { this.expectedSalMin = expectedSalMin; }

        public BigDecimal getExpectedSalMax() { return expectedSalMax; }
        public void setExpectedSalMax(BigDecimal expectedSalMax) { this.expectedSalMax = expectedSalMax; }
    }

    public static class LoginRequest {
        @Email @NotBlank
        private String email;
        @NotBlank
        private String password;
        @NotBlank
        private String role;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

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

        public String getToken() { return token; }
        public String getRole() { return role; }
        public Integer getUserId() { return userId; }
        public String getName() { return name; }
    }
}
