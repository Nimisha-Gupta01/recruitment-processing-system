package com.recruitment.dto;

public class ReportDTOs {

    public static class SubmitReportRequest {
        public String reason;
        public String getReason() { return reason; }
    }

    public static class ReportSummary {
        public Integer reportId;
        public String reporterType;
        public Integer reporterId;
        public String reporterName;
        public String reason;
        public String createdAt;

        public ReportSummary(Integer reportId, String reporterType, Integer reporterId,
                             String reporterName, String reason, String createdAt) {
            this.reportId = reportId;
            this.reporterType = reporterType;
            this.reporterId = reporterId;
            this.reporterName = reporterName;
            this.reason = reason;
            this.createdAt = createdAt;
        }
    }
}
