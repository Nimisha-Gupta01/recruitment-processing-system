package com.recruitment.dto;

public class InterviewDTOs {

    public static class InterviewCreateRequest {
        private Integer applicationId;
        private Integer roundNumber;
        private String interviewDatetime;
        private String mode;
        private String venue;
        private String interviewerName;

        public Integer getApplicationId() { return applicationId; }
        public void setApplicationId(Integer applicationId) { this.applicationId = applicationId; }
        public Integer getRoundNumber() { return roundNumber; }
        public void setRoundNumber(Integer roundNumber) { this.roundNumber = roundNumber; }
        public String getInterviewDatetime() { return interviewDatetime; }
        public void setInterviewDatetime(String interviewDatetime) { this.interviewDatetime = interviewDatetime; }
        public String getMode() { return mode; }
        public void setMode(String mode) { this.mode = mode; }
        public String getVenue() { return venue; }
        public void setVenue(String venue) { this.venue = venue; }
        public String getInterviewerName() { return interviewerName; }
        public void setInterviewerName(String interviewerName) { this.interviewerName = interviewerName; }
    }

    public static class InterviewResponse {
        private Integer interviewId;
        private Integer applicationId;
        private Integer roundNumber;
        private String interviewDatetime;
        private String mode;
        private String venue;
        private String interviewerName;
        private String outcome;
        private String remarks;
        private String createdAt;

        public Integer getInterviewId() { return interviewId; }
        public void setInterviewId(Integer interviewId) { this.interviewId = interviewId; }
        public Integer getApplicationId() { return applicationId; }
        public void setApplicationId(Integer applicationId) { this.applicationId = applicationId; }
        public Integer getRoundNumber() { return roundNumber; }
        public void setRoundNumber(Integer roundNumber) { this.roundNumber = roundNumber; }
        public String getInterviewDatetime() { return interviewDatetime; }
        public void setInterviewDatetime(String interviewDatetime) { this.interviewDatetime = interviewDatetime; }
        public String getMode() { return mode; }
        public void setMode(String mode) { this.mode = mode; }
        public String getVenue() { return venue; }
        public void setVenue(String venue) { this.venue = venue; }
        public String getInterviewerName() { return interviewerName; }
        public void setInterviewerName(String interviewerName) { this.interviewerName = interviewerName; }
        public String getOutcome() { return outcome; }
        public void setOutcome(String outcome) { this.outcome = outcome; }
        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
        public String getCreatedAt() { return createdAt; }
        public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    }

    public static class InterviewOutcomeRequest {
        private String outcome;
        private String remarks;

        public String getOutcome() { return outcome; }
        public void setOutcome(String outcome) { this.outcome = outcome; }
        public String getRemarks() { return remarks; }
        public void setRemarks(String remarks) { this.remarks = remarks; }
    }
}
