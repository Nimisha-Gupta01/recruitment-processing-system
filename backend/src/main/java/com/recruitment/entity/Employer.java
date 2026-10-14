package com.recruitment.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "employers")
public class Employer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer employerId;

    @Column(nullable = false, length = 150)
    private String orgName;

    private Integer establishedYr;
    private Integer numEmployees;
    private BigDecimal annualTurnover;

    @Column(nullable = false, length = 100)
    private String contactName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(length = 15)
    private String phone;

    @Column(nullable = false)
    private String passwordHash;

    private String address;

    @Column(length = 150)
    private String website;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private Boolean isActive = true;
}
