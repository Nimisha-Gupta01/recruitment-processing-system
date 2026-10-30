package com.recruitment.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

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

    public Integer getEmployerId() { return employerId; }
    public void setEmployerId(Integer employerId) { this.employerId = employerId; }

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

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
