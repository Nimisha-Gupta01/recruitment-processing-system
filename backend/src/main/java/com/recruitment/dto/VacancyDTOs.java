package com.recruitment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class VacancyDTOs {

    public static class VacancyCreateRequest {
        @NotBlank
        private String designation;
        private String department;
        private String jobDescription;
        private String requiredQual;
        private BigDecimal requiredExpYrs;
        private BigDecimal salaryMin;
        private BigDecimal salaryMax;
        @NotNull
        private String employmentType;
        private Integer numOpenings;
        private String location;
        private String applicationDeadline;

        public String getDesignation() { return designation; }
        public void setDesignation(String designation) { this.designation = designation; }
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
        public String getJobDescription() { return jobDescription; }
        public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }
        public String getRequiredQual() { return requiredQual; }
        public void setRequiredQual(String requiredQual) { this.requiredQual = requiredQual; }
        public BigDecimal getRequiredExpYrs() { return requiredExpYrs; }
        public void setRequiredExpYrs(BigDecimal requiredExpYrs) { this.requiredExpYrs = requiredExpYrs; }
        public BigDecimal getSalaryMin() { return salaryMin; }
        public void setSalaryMin(BigDecimal salaryMin) { this.salaryMin = salaryMin; }
        public BigDecimal getSalaryMax() { return salaryMax; }
        public void setSalaryMax(BigDecimal salaryMax) { this.salaryMax = salaryMax; }
        public String getEmploymentType() { return employmentType; }
        public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }
        public Integer getNumOpenings() { return numOpenings; }
        public void setNumOpenings(Integer numOpenings) { this.numOpenings = numOpenings; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public String getApplicationDeadline() { return applicationDeadline; }
        public void setApplicationDeadline(String applicationDeadline) { this.applicationDeadline = applicationDeadline; }
    }

    public static class VacancyUpdateRequest {
        private String designation;
        private String department;
        private String jobDescription;
        private String requiredQual;
        private BigDecimal requiredExpYrs;
        private BigDecimal salaryMin;
        private BigDecimal salaryMax;
        private String employmentType;
        private Integer numOpenings;
        private String location;
        private String applicationDeadline;
        private String status;

        public String getDesignation() { return designation; }
        public void setDesignation(String designation) { this.designation = designation; }
        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }
        public String getJobDescription() { return jobDescription; }
        public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }
        public String getRequiredQual() { return requiredQual; }
        public void setRequiredQual(String requiredQual) { this.requiredQual = requiredQual; }
        public BigDecimal getRequiredExpYrs() { return requiredExpYrs; }
        public void setRequiredExpYrs(BigDecimal requiredExpYrs) { this.requiredExpYrs = requiredExpYrs; }
        public BigDecimal getSalaryMin() { return salaryMin; }
        public void setSalaryMin(BigDecimal salaryMin) { this.salaryMin = salaryMin; }
        public BigDecimal getSalaryMax() { return salaryMax; }
        public void setSalaryMax(BigDecimal salaryMax) { this.salaryMax = salaryMax; }
        public String getEmploymentType() { return employmentType; }
        public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }
        public Integer getNumOpenings() { return numOpenings; }
        public void setNumOpenings(Integer numOpenings) { this.numOpenings = numOpenings; }
        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }
        public String getApplicationDeadline() { return applicationDeadline; }
        public void setApplicationDeadline(String applicationDeadline) { this.applicationDeadline = applicationDeadline; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class VacancyResponse {
        private Integer vacancyId;
        private Integer employerId;
        private String orgName;
        private String designation;
        private String department;
        private String jobDescription;
        private String requiredQual;
        private BigDecimal requiredExpYrs;
        private BigDecimal salaryMin;
        private BigDecimal salaryMax;
        private String employmentType;
        private Integer numOpenings;
        private String location;
        private LocalDate applicationDeadline;
        private String status;
        private LocalDateTime postedAt;

        public VacancyResponse(com.recruitment.entity.Vacancy v) {
            this.vacancyId = v.getVacancyId();
            this.employerId = v.getEmployer().getEmployerId();
            this.orgName = v.getEmployer().getOrgName();
            this.designation = v.getDesignation();
            this.department = v.getDepartment();
            this.jobDescription = v.getJobDescription();
            this.requiredQual = v.getRequiredQual();
            this.requiredExpYrs = v.getRequiredExpYrs();
            this.salaryMin = v.getSalaryMin();
            this.salaryMax = v.getSalaryMax();
            this.employmentType = v.getEmploymentType() != null ? v.getEmploymentType().name() : null;
            this.numOpenings = v.getNumOpenings();
            this.location = v.getLocation();
            this.applicationDeadline = v.getApplicationDeadline();
            this.status = v.getStatus() != null ? v.getStatus().name() : null;
            this.postedAt = v.getPostedAt();
        }

        public Integer getVacancyId() { return vacancyId; }
        public Integer getEmployerId() { return employerId; }
        public String getOrgName() { return orgName; }
        public String getDesignation() { return designation; }
        public String getDepartment() { return department; }
        public String getJobDescription() { return jobDescription; }
        public String getRequiredQual() { return requiredQual; }
        public BigDecimal getRequiredExpYrs() { return requiredExpYrs; }
        public BigDecimal getSalaryMin() { return salaryMin; }
        public BigDecimal getSalaryMax() { return salaryMax; }
        public String getEmploymentType() { return employmentType; }
        public Integer getNumOpenings() { return numOpenings; }
        public String getLocation() { return location; }
        public LocalDate getApplicationDeadline() { return applicationDeadline; }
        public String getStatus() { return status; }
        public LocalDateTime getPostedAt() { return postedAt; }
    }
}
