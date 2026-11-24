package com.recruitment.service;

import com.recruitment.entity.Notification;
import com.recruitment.repository.NotificationRepository;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@recpro.com}")
    private String fromAddress;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void notify(String recipientEmail, String recipientType, String subject, String body, String eventType) {
        // Always save to DB first — in-app notification bell depends on this
        try {
            Notification n = new Notification(recipientEmail, recipientType, subject, body, eventType);
            notificationRepository.save(n);
            log.info("Notification saved — type={} to={} subject='{}'", eventType, recipientEmail, subject);
        } catch (Exception e) {
            log.error("Failed to save notification to={} type={}: {}", recipientEmail, eventType, e.getMessage());
        }

        // Attempt email — fail silently so it never breaks the main flow
        sendEmail(recipientEmail, subject, body);
    }

    private void sendEmail(String to, String subject, String body) {
        if (mailSender == null) {
            log.debug("JavaMailSender not configured — skipping email to {}", to);
            return;
        }
        // Skip placeholder addresses that signal unconfigured SMTP
        if (fromAddress.contains("your-email") || fromAddress.contains("example.com")) {
            log.debug("SMTP not configured (placeholder from address) — skipping email to {}", to);
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress, "RecPro Recruitment");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(buildHtml(subject, body), true);
            mailSender.send(message);
            log.info("Email sent to={} subject='{}'", to, subject);
        } catch (Exception e) {
            log.warn("Failed to send email to={} subject='{}': {}", to, subject, e.getMessage());
        }
    }

    private String buildHtml(String subject, String body) {
        return "<!DOCTYPE html>" +
            "<html><head><meta charset='UTF-8'>" +
            "<style>" +
            "body{margin:0;padding:0;background:#f4f6fb;font-family:Arial,sans-serif;}" +
            ".wrap{max-width:600px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);}" +
            ".header{background:#0f172a;padding:24px 32px;}" +
            ".header h1{margin:0;color:#60a5fa;font-size:22px;letter-spacing:1px;}" +
            ".header p{margin:4px 0 0;color:#94a3b8;font-size:13px;}" +
            ".body{padding:32px;}" +
            ".body h2{color:#0f172a;font-size:17px;margin-top:0;}" +
            ".body p{color:#374151;font-size:14px;line-height:1.7;}" +
            ".footer{background:#f8fafc;padding:16px 32px;text-align:center;color:#9ca3af;font-size:12px;border-top:1px solid #e9ecef;}" +
            "</style></head><body>" +
            "<div class='wrap'>" +
            "<div class='header'><h1>RecPro</h1><p>Online Recruitment System</p></div>" +
            "<div class='body'>" +
            "<h2>" + escapeHtml(subject) + "</h2>" +
            "<p>" + escapeHtml(body).replace("\n", "<br>") + "</p>" +
            "</div>" +
            "<div class='footer'>This is an automated message from RecPro. Please do not reply to this email.</div>" +
            "</div></body></html>";
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }

    public List<Notification> getNotifications(String email) {
        return notificationRepository.findByRecipientEmailOrderBySentAtDesc(email);
    }
}
