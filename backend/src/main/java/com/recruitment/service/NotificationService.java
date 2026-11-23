package com.recruitment.service;

import com.recruitment.entity.Notification;
import com.recruitment.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void notify(String recipientEmail, String recipientType, String subject, String body, String eventType) {
        try {
            Notification n = new Notification(recipientEmail, recipientType, subject, body, eventType);
            notificationRepository.save(n);
            log.info("Notification saved — type={} to={} subject='{}'", eventType, recipientEmail, subject);
        } catch (Exception e) {
            log.error("Failed to save notification to={} type={}: {}", recipientEmail, eventType, e.getMessage());
        }
    }

    public List<Notification> getNotifications(String email) {
        return notificationRepository.findByRecipientEmailOrderBySentAtDesc(email);
    }
}
