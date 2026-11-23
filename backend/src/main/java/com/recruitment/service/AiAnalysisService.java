package com.recruitment.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitment.entity.Application;
import com.recruitment.entity.Vacancy;
import com.recruitment.repository.ApplicationRepository;
import com.recruitment.repository.VacancyRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.pdfbox.Loader;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AiAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(AiAnalysisService.class);

    @Value("${claude.api.key:}")
    private String claudeApiKey;

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    private final ApplicationRepository applicationRepository;
    private final VacancyRepository vacancyRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiAnalysisService(ApplicationRepository applicationRepository,
                              VacancyRepository vacancyRepository) {
        this.applicationRepository = applicationRepository;
        this.vacancyRepository = vacancyRepository;
    }

    public static class AnalysisResult {
        public int score;
        public String summary;
    }

    @Transactional
    public List<com.recruitment.dto.ApplicationDTOs.ApplicationResponse> analyseVacancy(
            String employerEmail, Integer vacancyId,
            com.recruitment.service.ApplicationService applicationService) {

        Vacancy vacancy = vacancyRepository.findById(vacancyId)
                .orElseThrow(() -> new IllegalArgumentException("Vacancy not found"));
        if (!vacancy.getEmployer().getEmail().equals(employerEmail)) {
            throw new SecurityException("Access denied");
        }

        String jobDesc = buildJobContext(vacancy);
        List<Application> apps = applicationRepository.findByVacancy_VacancyId(vacancyId);

        for (Application app : apps) {
            if (app.getResumePath() == null || app.getResumePath().isBlank()) {
                app.setAiScore(null);
                app.setAiSummary("No resume uploaded");
                applicationRepository.save(app);
                continue;
            }
            try {
                String resumeText = extractPdfText(app.getResumePath());
                AnalysisResult result = callClaude(jobDesc, resumeText);
                app.setAiScore(result.score);
                app.setAiSummary(result.summary);
                applicationRepository.save(app);
                log.info("AI analysis complete for application {}: score={}", app.getApplicationId(), result.score);
            } catch (Exception e) {
                log.error("AI analysis failed for application {}: {}", app.getApplicationId(), e.getMessage());
                app.setAiSummary("Analysis failed: " + e.getMessage());
                applicationRepository.save(app);
            }
        }

        return applicationRepository.findByVacancy_VacancyId(vacancyId)
                .stream().map(applicationService::toResponse).collect(Collectors.toList());
    }

    private String buildJobContext(Vacancy v) {
        StringBuilder sb = new StringBuilder();
        sb.append("Job Title: ").append(v.getDesignation()).append("\n");
        if (v.getDepartment() != null) sb.append("Department: ").append(v.getDepartment()).append("\n");
        if (v.getJobDescription() != null) sb.append("Job Description: ").append(v.getJobDescription()).append("\n");
        if (v.getRequiredQual() != null) sb.append("Required Qualifications: ").append(v.getRequiredQual()).append("\n");
        if (v.getRequiredExpYrs() != null) sb.append("Required Experience: ").append(v.getRequiredExpYrs()).append(" years\n");
        return sb.toString();
    }

    private String extractPdfText(String resumePath) throws IOException {
        File file = new File(uploadDir, resumePath);
        if (!file.exists()) {
            // Try without subdirectory prefix (path may already be just filename)
            file = new File(uploadDir + "/" + resumePath);
        }
        try (PDDocument doc = Loader.loadPDF(file)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(doc);
            // Truncate to 4000 chars to stay within token limits
            return text.length() > 4000 ? text.substring(0, 4000) + "..." : text;
        }
    }

    private AnalysisResult callClaude(String jobContext, String resumeText) throws Exception {
        if (claudeApiKey == null || claudeApiKey.isBlank()) {
            throw new IllegalStateException("Claude API key not configured. Set claude.api.key in application.properties.");
        }

        String prompt = """
                You are a recruitment assistant. Analyse how well this candidate's resume matches the job requirements.

                JOB REQUIREMENTS:
                %s

                CANDIDATE RESUME:
                %s

                Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
                {"score": <integer 0-100>, "summary": "<2-3 sentences: key strengths and gaps>"}

                Score guide: 80-100 = excellent match, 60-79 = good match, 40-59 = partial match, 0-39 = poor match.
                """.formatted(jobContext, resumeText);

        String requestBody = objectMapper.writeValueAsString(new java.util.LinkedHashMap<>() {{
            put("model", "claude-haiku-5-5");
            put("max_tokens", 300);
            put("messages", List.of(java.util.Map.of("role", "user", "content", prompt)));
        }});

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.anthropic.com/v1/messages"))
                .header("Content-Type", "application/json")
                .header("x-api-key", claudeApiKey)
                .header("anthropic-version", "2023-06-01")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = HttpClient.newHttpClient()
                .send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Claude API error " + response.statusCode() + ": " + response.body());
        }

        JsonNode root = objectMapper.readTree(response.body());
        String content = root.path("content").get(0).path("text").asText();

        // Strip markdown code fences if present
        content = content.trim();
        if (content.startsWith("```")) {
            content = content.replaceAll("```[a-z]*\\n?", "").replace("```", "").trim();
        }

        JsonNode parsed = objectMapper.readTree(content);
        AnalysisResult result = new AnalysisResult();
        result.score = parsed.path("score").asInt(0);
        result.summary = parsed.path("summary").asText("No summary available");
        return result;
    }
}
