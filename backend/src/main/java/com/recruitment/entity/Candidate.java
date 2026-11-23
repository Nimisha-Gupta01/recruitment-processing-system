package com.recruitment.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "candidates")
public class Candidate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer candidateId;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(length = 15)
    private String phone;

    @Column(nullable = false)
    private String passwordHash;

    private LocalDate dob;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private String address;

    @Column(length = 100)
    private String degree;

    @Column(length = 150)
    private String institution;

    private Integer yearOfPassing;
    private BigDecimal percentage;

    private BigDecimal totalExpYrs = BigDecimal.ZERO;

    private BigDecimal expectedSalMin;
    private BigDecimal expectedSalMax;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private Boolean isActive = true;

    @Column(length = 20)
    private String role = "CANDIDATE";

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CandidateSkill> skills;

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CandidateLocationPref> locationPrefs;

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CandidateRolePref> rolePrefs;

    public enum Gender { Male, Female, Other }

    public Integer getCandidateId() { return candidateId; }
    public void setCandidateId(Integer candidateId) { this.candidateId = candidateId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate dob) { this.dob = dob; }

    public Gender getGender() { return gender; }
    public void setGender(Gender gender) { this.gender = gender; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public List<CandidateSkill> getSkills() { return skills; }
    public void setSkills(List<CandidateSkill> skills) { this.skills = skills; }

    public List<CandidateLocationPref> getLocationPrefs() { return locationPrefs; }
    public void setLocationPrefs(List<CandidateLocationPref> locationPrefs) { this.locationPrefs = locationPrefs; }

    public List<CandidateRolePref> getRolePrefs() { return rolePrefs; }
    public void setRolePrefs(List<CandidateRolePref> rolePrefs) { this.rolePrefs = rolePrefs; }
}
