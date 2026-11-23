package com.recruitment.dto;

import java.math.BigDecimal;

public class AdminDTOs {

    public static class StatsResponse {
        public int totalCandidates;
        public int totalEmployers;
        public int totalVacancies;
        public int totalApplications;
        public int openVacancies;

        public StatsResponse(int totalCandidates, int totalEmployers, int totalVacancies,
                             int totalApplications, int openVacancies) {
            this.totalCandidates = totalCandidates;
            this.totalEmployers = totalEmployers;
            this.totalVacancies = totalVacancies;
            this.totalApplications = totalApplications;
            this.openVacancies = openVacancies;
        }
    }

    public static class CandidateSummary {
        public Integer id;
        public String name;
        public String email;
        public String role;
        public boolean active;
        public int reportCount;
        // full profile fields for view modal
        public String phone;
        public String dob;
        public String gender;
        public String address;
        public String degree;
        public String institution;
        public Integer yearOfPassing;
        public BigDecimal percentage;
        public BigDecimal totalExpYrs;
        public BigDecimal expectedSalMin;
        public BigDecimal expectedSalMax;
        public String createdAt;

        public CandidateSummary(Integer id, String name, String email, String role, boolean active,
                                int reportCount, String phone, String dob, String gender, String address,
                                String degree, String institution, Integer yearOfPassing,
                                BigDecimal percentage, BigDecimal totalExpYrs,
                                BigDecimal expectedSalMin, BigDecimal expectedSalMax, String createdAt) {
            this.id = id;
            this.name = name;
            this.email = email;
            this.role = role;
            this.active = active;
            this.reportCount = reportCount;
            this.phone = phone;
            this.dob = dob;
            this.gender = gender;
            this.address = address;
            this.degree = degree;
            this.institution = institution;
            this.yearOfPassing = yearOfPassing;
            this.percentage = percentage;
            this.totalExpYrs = totalExpYrs;
            this.expectedSalMin = expectedSalMin;
            this.expectedSalMax = expectedSalMax;
            this.createdAt = createdAt;
        }
    }

    public static class EmployerSummary {
        public Integer id;
        public String orgName;
        public String email;
        public boolean active;
        public int reportCount;
        // full profile fields for view modal
        public String contactName;
        public String phone;
        public String address;
        public String website;
        public Integer establishedYr;
        public Integer numEmployees;
        public BigDecimal annualTurnover;
        public String createdAt;

        public EmployerSummary(Integer id, String orgName, String email, boolean active,
                               int reportCount, String contactName, String phone, String address,
                               String website, Integer establishedYr, Integer numEmployees,
                               BigDecimal annualTurnover, String createdAt) {
            this.id = id;
            this.orgName = orgName;
            this.email = email;
            this.active = active;
            this.reportCount = reportCount;
            this.contactName = contactName;
            this.phone = phone;
            this.address = address;
            this.website = website;
            this.establishedYr = establishedYr;
            this.numEmployees = numEmployees;
            this.annualTurnover = annualTurnover;
            this.createdAt = createdAt;
        }
    }
}
