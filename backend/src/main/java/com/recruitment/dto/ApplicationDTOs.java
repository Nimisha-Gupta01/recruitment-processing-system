package com.recruitment.dto;

public class ApplicationDTOs {

    public static class ApplicationCreateRequest {
        private Integer vacancyId;
        private String coverNote;

        public Integer getVacancyId() { return vacancyId; }
        public void setVacancyId(Integer vacancyId) { this.vacancyId = vacancyId; }
        public String getCoverNote() { return coverNote; }
        public void setCoverNote(String coverNote) { this.coverNote = coverNote; }
    }

    public static class ApplicationResponse {
        private Integer applicationId;
        private Integer vacancyId;
        private String vacancyTitle;
        private String employerOrgName;
        private Integer candidateId;
        private String candidateName;
        private String appliedAt;
        private String status;
        private String coverNote;
        private String resumePath;
        private Integer aiScore;
        private String aiSummary;

        public Integer getApplicationId() { return applicationId; }
        public void setApplicationId(Integer applicationId) { this.applicationId = applicationId; }
        public Integer getVacancyId() { return vacancyId; }
        public void setVacancyId(Integer vacancyId) { this.vacancyId = vacancyId; }
        public String getVacancyTitle() { return vacancyTitle; }
        public void setVacancyTitle(String vacancyTitle) { this.vacancyTitle = vacancyTitle; }
        public String getEmployerOrgName() { return employerOrgName; }
        public void setEmployerOrgName(String employerOrgName) { this.employerOrgName = employerOrgName; }
        public Integer getCandidateId() { return candidateId; }
        public void setCandidateId(Integer candidateId) { this.candidateId = candidateId; }
        public String getCandidateName() { return candidateName; }
        public void setCandidateName(String candidateName) { this.candidateName = candidateName; }
        public String getAppliedAt() { return appliedAt; }
        public void setAppliedAt(String appliedAt) { this.appliedAt = appliedAt; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getCoverNote() { return coverNote; }
        public void setCoverNote(String coverNote) { this.coverNote = coverNote; }
        public String getResumePath() { return resumePath; }
        public void setResumePath(String resumePath) { this.resumePath = resumePath; }
        public Integer getAiScore() { return aiScore; }
        public void setAiScore(Integer aiScore) { this.aiScore = aiScore; }
        public String getAiSummary() { return aiSummary; }
        public void setAiSummary(String aiSummary) { this.aiSummary = aiSummary; }
    }

    public static class ApplicationStatusUpdateRequest {
        private String status;

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class WithdrawRequest {
        private String reason;

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}
