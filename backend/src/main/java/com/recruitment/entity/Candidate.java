package com.recruitment.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
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

    // Academic
    @Column(length = 100)
    private String degree;

    @Column(length = 150)
    private String institution;

    private Integer yearOfPassing;
    private BigDecimal percentage;

    // Experience
    private BigDecimal totalExpYrs = BigDecimal.ZERO;

    // Salary preference
    private BigDecimal expectedSalMin;
    private BigDecimal expectedSalMax;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private Boolean isActive = true;

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CandidateSkill> skills;

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CandidateLocationPref> locationPrefs;

    @OneToMany(mappedBy = "candidate", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CandidateRolePref> rolePrefs;

    public enum Gender { Male, Female, Other }
}
