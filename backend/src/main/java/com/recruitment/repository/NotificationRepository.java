package com.recruitment.repository;

import com.recruitment.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByRecipientEmailOrderBySentAtDesc(String recipientEmail);
}
