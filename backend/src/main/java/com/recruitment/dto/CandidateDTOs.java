package com.recruitment.dto;

import com.recruitment.entity.Candidate;
import com.recruitment.entity.CandidateLocationPref;
import com.recruitment.entity.CandidateRolePref;
import com.recruitment.entity.CandidateSkill;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class CandidateDTOs {

    public static class SkillRequest {
        private String skillName;
        private String proficiency;

        public String getSkillName() { return skillName; }
        public void setSkillName(String skillName) { this.skillName = skillName; }
        public String getProficiency() { return proficiency; }
        public void setProficiency(String proficiency) { this.proficiency = proficiency; }
    }

    public static class SkillResponse {
        private Integer skillId;
        private String skillName;
        private String proficiency;

        public SkillResponse(CandidateSkill s) {
            this.skillId = s.getSkillId();
            this.skillName = s.getSkillName();
            this.proficiency = s.getProficiency() != null ? s.getProficiency().name() : null;
        }

        public Integer getSkillId() { return skillId; }
        public String getSkillName() { return skillName; }
        public String getProficiency() { return proficiency; }
    }

    public static class ProfileUpdateRequest {
        private String fullName;
        private String phone;
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
        private List<SkillRequest> skills;
        private List<String> locationPrefs;
        private List<String> rolePrefs;

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
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
        public List<SkillRequest> getSkills() { return skills; }
        public void setSkills(List<SkillRequest> skills) { this.skills = skills; }
        public List<String> getLocationPrefs() { return locationPrefs; }
        public void setLocationPrefs(List<String> locationPrefs) { this.locationPrefs = locationPrefs; }
        public List<String> getRolePrefs() { return rolePrefs; }
        public void setRolePrefs(List<String> rolePrefs) { this.rolePrefs = rolePrefs; }
    }

    public static class ProfileResponse {
        private Integer candidateId;
        private String fullName;
        private String email;
        private String phone;
        private LocalDate dob;
        private String gender;
        private String address;
        private String degree;
        private String institution;
        private Integer yearOfPassing;
        private BigDecimal percentage;
        private BigDecimal totalExpYrs;
        private BigDecimal expectedSalMin;
        private BigDecimal expectedSalMax;
        private LocalDateTime createdAt;
        private List<SkillResponse> skills;
        private List<String> locationPrefs;
        private List<String> rolePrefs;

        public ProfileResponse(Candidate c) {
            this.candidateId = c.getCandidateId();
            this.fullName = c.getFullName();
            this.email = c.getEmail();
            this.phone = c.getPhone();
            this.dob = c.getDob();
            this.gender = c.getGender() != null ? c.getGender().name() : null;
            this.address = c.getAddress();
            this.degree = c.getDegree();
            this.institution = c.getInstitution();
            this.yearOfPassing = c.getYearOfPassing();
            this.percentage = c.getPercentage();
            this.totalExpYrs = c.getTotalExpYrs();
            this.expectedSalMin = c.getExpectedSalMin();
            this.expectedSalMax = c.getExpectedSalMax();
            this.createdAt = c.getCreatedAt();
            this.skills = c.getSkills() != null
                    ? c.getSkills().stream().map(SkillResponse::new).collect(Collectors.toList())
                    : List.of();
            this.locationPrefs = c.getLocationPrefs() != null
                    ? c.getLocationPrefs().stream().map(CandidateLocationPref::getLocation).collect(Collectors.toList())
                    : List.of();
            this.rolePrefs = c.getRolePrefs() != null
                    ? c.getRolePrefs().stream().map(CandidateRolePref::getPreferredRole).collect(Collectors.toList())
                    : List.of();
        }

        public Integer getCandidateId() { return candidateId; }
        public String getFullName() { return fullName; }
        public String getEmail() { return email; }
        public String getPhone() { return phone; }
        public LocalDate getDob() { return dob; }
        public String getGender() { return gender; }
        public String getAddress() { return address; }
        public String getDegree() { return degree; }
        public String getInstitution() { return institution; }
        public Integer getYearOfPassing() { return yearOfPassing; }
        public BigDecimal getPercentage() { return percentage; }
        public BigDecimal getTotalExpYrs() { return totalExpYrs; }
        public BigDecimal getExpectedSalMin() { return expectedSalMin; }
        public BigDecimal getExpectedSalMax() { return expectedSalMax; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public List<SkillResponse> getSkills() { return skills; }
        public List<String> getLocationPrefs() { return locationPrefs; }
        public List<String> getRolePrefs() { return rolePrefs; }
    }
}
