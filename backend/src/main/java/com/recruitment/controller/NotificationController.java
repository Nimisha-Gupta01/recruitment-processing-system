package com.recruitment.controller;

import com.recruitment.entity.Notification;
import com.recruitment.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Notifications", description = "In-app notification centre")
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private static final Logger log = LoggerFactory.getLogger(NotificationController.class);
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Operation(summary = "Get notifications for the logged-in user")
    @GetMapping
    public List<Notification> getMyNotifications(@AuthenticationPrincipal String email) {
        log.info("Fetching notifications for: {}", email);
        return notificationService.getNotifications(email);
    }
}
