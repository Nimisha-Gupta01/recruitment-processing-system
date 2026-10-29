package com.recruitment.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vacancies")
public class Vacancy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer vacancyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_id", nullable = false)
    private Employer employer;

    @Column(nullable = false, length = 100)
    private String designation;

    @Column(length = 100)
    private String department;

    @Column(columnDefinition = "TEXT")
    private String jobDescription;

    @Column(length = 150)
    private String requiredQual;

    private BigDecimal requiredExpYrs = BigDecimal.ZERO;

    private BigDecimal salaryMin;
    private BigDecimal salaryMax;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmploymentType employmentType;

    private Integer numOpenings = 1;

    @Column(length = 100)
    private String location;

    private LocalDate applicationDeadline;

    @Enumerated(EnumType.STRING)
    private VacancyStatus status = VacancyStatus.Open;

    @Column(updatable = false)
    private LocalDateTime postedAt = LocalDateTime.now();

    public enum EmploymentType { Permanent, Temporary, Contract }
    public enum VacancyStatus { Open, Closed, On_Hold }

    public Integer getVacancyId() { return vacancyId; }
    public void setVacancyId(Integer vacancyId) { this.vacancyId = vacancyId; }

    public Employer getEmployer() { return employer; }
    public void setEmployer(Employer employer) { this.employer = employer; }

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

    public EmploymentType getEmploymentType() { return employmentType; }
    public void setEmploymentType(EmploymentType employmentType) { this.employmentType = employmentType; }

    public Integer getNumOpenings() { return numOpenings; }
    public void setNumOpenings(Integer numOpenings) { this.numOpenings = numOpenings; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public LocalDate getApplicationDeadline() { return applicationDeadline; }
    public void setApplicationDeadline(LocalDate applicationDeadline) { this.applicationDeadline = applicationDeadline; }

    public VacancyStatus getStatus() { return status; }
    public void setStatus(VacancyStatus status) { this.status = status; }

    public LocalDateTime getPostedAt() { return postedAt; }
    public void setPostedAt(LocalDateTime postedAt) { this.postedAt = postedAt; }
}
