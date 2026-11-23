package com.recruitment.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer notificationId;

    private String recipientEmail;

    @Column(columnDefinition = "ENUM('Candidate','Employer')")
    private String recipientType;

    private String subject;

    @Column(columnDefinition = "TEXT")
    private String body;

    private String eventType;

    private LocalDateTime sentAt = LocalDateTime.now();

    @Column(columnDefinition = "ENUM('Sent','Failed')")
    private String status = "Sent";

    public Notification() {}

    public Notification(String recipientEmail, String recipientType, String subject, String body, String eventType) {
        this.recipientEmail = recipientEmail;
        this.recipientType = recipientType;
        this.subject = subject;
        this.body = body;
        this.eventType = eventType;
    }

    public Integer getNotificationId() { return notificationId; }
    public String getRecipientEmail() { return recipientEmail; }
    public void setRecipientEmail(String recipientEmail) { this.recipientEmail = recipientEmail; }
    public String getRecipientType() { return recipientType; }
    public void setRecipientType(String recipientType) { this.recipientType = recipientType; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    public LocalDateTime getSentAt() { return sentAt; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
