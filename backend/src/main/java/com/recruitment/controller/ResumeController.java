package com.recruitment.controller;

import com.recruitment.dto.ApplicationDTOs.ApplicationResponse;
import com.recruitment.service.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Tag(name = "Resumes", description = "Resume upload and download")
@RestController
@RequestMapping("/api")
public class ResumeController {

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    private final ApplicationService applicationService;

    public ResumeController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping("/applications/{id}/resume")
    public ResponseEntity<ApplicationResponse> uploadResume(
            @AuthenticationPrincipal String candidateEmail,
            @PathVariable Integer id,
            @RequestParam("file") MultipartFile file) throws IOException {

        // Validate file type
        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename();
        if (contentType == null || !contentType.equals("application/pdf")
                || originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            return ResponseEntity.badRequest().build();
        }

        // Validate file size (5 MB max)
        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest().build();
        }

        // Ensure upload directory exists
        Path uploadPath = Paths.get(uploadDir);
        Files.createDirectories(uploadPath);

        // Save file as {applicationId}_{originalFilename}
        String savedFilename = id + "_" + originalFilename;
        Path targetPath = uploadPath.resolve(savedFilename);
        file.transferTo(targetPath.toFile());

        // Update the application record (also verifies ownership)
        ApplicationResponse response = applicationService.updateResumePath(candidateEmail, id, savedFilename);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/resumes/{filename}")
    public ResponseEntity<Resource> downloadResume(@PathVariable String filename) {
        Path filePath = Paths.get(uploadDir).resolve(filename).normalize();
        try {
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (MalformedURLException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
