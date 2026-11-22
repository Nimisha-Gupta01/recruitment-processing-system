package com.recruitment.dto;

import java.math.BigDecimal;
import java.util.List;

public class EmployerSearchDTOs {

    public static class CandidateSearchResponse {
        private Integer candidateId;
        private String fullName;
        private String email;
        private String phone;
        private String degree;
        private String institution;
        private BigDecimal percentage;
        private BigDecimal totalExpYrs;
        private BigDecimal expectedSalMin;
        private BigDecimal expectedSalMax;
        private List<String> skills;
        private List<String> locationPrefs;
        private List<String> rolePrefs;

        public Integer getCandidateId() { return candidateId; }
        public void setCandidateId(Integer candidateId) { this.candidateId = candidateId; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getDegree() { return degree; }
        public void setDegree(String degree) { this.degree = degree; }

        public String getInstitution() { return institution; }
        public void setInstitution(String institution) { this.institution = institution; }

        public BigDecimal getPercentage() { return percentage; }
        public void setPercentage(BigDecimal percentage) { this.percentage = percentage; }

        public BigDecimal getTotalExpYrs() { return totalExpYrs; }
        public void setTotalExpYrs(BigDecimal totalExpYrs) { this.totalExpYrs = totalExpYrs; }

        public BigDecimal getExpectedSalMin() { return expectedSalMin; }
        public void setExpectedSalMin(BigDecimal expectedSalMin) { this.expectedSalMin = expectedSalMin; }

        public BigDecimal getExpectedSalMax() { return expectedSalMax; }
        public void setExpectedSalMax(BigDecimal expectedSalMax) { this.expectedSalMax = expectedSalMax; }

        public List<String> getSkills() { return skills; }
        public void setSkills(List<String> skills) { this.skills = skills; }

        public List<String> getLocationPrefs() { return locationPrefs; }
        public void setLocationPrefs(List<String> locationPrefs) { this.locationPrefs = locationPrefs; }

        public List<String> getRolePrefs() { return rolePrefs; }
        public void setRolePrefs(List<String> rolePrefs) { this.rolePrefs = rolePrefs; }
    }
}
