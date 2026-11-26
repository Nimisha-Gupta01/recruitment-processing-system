package com.recruitment.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.recruitment.entity.Application;
import com.recruitment.entity.Vacancy;
import com.recruitment.repository.ApplicationRepository;
import com.recruitment.repository.VacancyRepository;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AiAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(AiAnalysisService.class);

    @Value("${hyperspace.api.key:}")
    private String apiKey;

    @Value("${hyperspace.base.url:http://localhost:6655/openai/v1}")
    private String baseUrl;

    @Value("${hyperspace.model:gpt-4.1-mini}")
    private String model;

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
            ApplicationService applicationService) {

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
                AnalysisResult result = callAi(jobDesc, resumeText);
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
        try (PDDocument doc = Loader.loadPDF(file)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(doc);
            return text.length() > 4000 ? text.substring(0, 4000) + "..." : text;
        }
    }

    private AnalysisResult callAi(String jobContext, String resumeText) throws Exception {
        try {
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
                put("model", model);
                put("max_tokens", 300);
                put("messages", List.of(java.util.Map.of("role", "user", "content", prompt)));
            }});

            HttpRequest.Builder builder = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + "/chat/completions"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody));

            if (apiKey != null && !apiKey.isBlank()) {
                builder.header("Authorization", "Bearer " + apiKey);
            }

            HttpResponse<String> response = HttpClient.newHttpClient()
                    .send(builder.build(), HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new RuntimeException("AI API error " + response.statusCode() + ": " + response.body());
            }

            JsonNode root = objectMapper.readTree(response.body());
            String content = root.path("choices").get(0).path("message").path("content").asText();

            content = content.trim();
            if (content.startsWith("```")) {
                content = content.replaceAll("```[a-z]*\\n?", "").replace("```", "").trim();
            }

            JsonNode parsed = objectMapper.readTree(content);
            AnalysisResult result = new AnalysisResult();
            result.score = parsed.path("score").asInt(0);
            result.summary = parsed.path("summary").asText("No summary available");
            return result;
        } catch (Exception e) {
            log.warn("AI service unreachable, using fallback scoring: {}", e.getMessage());
            return getFallbackResult(resumeText, jobContext);
        }
    }

    private static final List<String> TECH_KEYWORDS = Arrays.asList(
            "java", "spring", "springboot", "microservices", "rest", "api", "kafka",
            "hibernate", "jpa", "mysql", "postgresql", "docker", "kubernetes", "aws",
            "azure", "python", "react", "javascript", "typescript", "node", "devops",
            "ci/cd", "jenkins", "git", "agile", "scrum", "backend", "frontend", "fullstack"
    );

    private AnalysisResult getFallbackResult(String resumeText, String jobDesc) {
        String resumeLower = resumeText.toLowerCase();
        String jobLower = jobDesc.toLowerCase();

        List<String> matched = new ArrayList<>();
        for (String keyword : TECH_KEYWORDS) {
            if (resumeLower.contains(keyword) && jobLower.contains(keyword)) {
                matched.add(keyword);
            }
        }

        // Count keywords that appear in the JD but not the resume (gaps)
        List<String> inJdOnly = new ArrayList<>();
        for (String keyword : TECH_KEYWORDS) {
            if (jobLower.contains(keyword) && !resumeLower.contains(keyword)) {
                inJdOnly.add(keyword);
            }
        }

        // Normalize: score = matched / max(jdKeywords, 1) * 100, capped at 100
        long jdKeywordCount = TECH_KEYWORDS.stream().filter(k -> jobLower.contains(k)).count();
        int score = jdKeywordCount == 0 ? 0 : (int) Math.min(100, Math.round((matched.size() * 100.0) / jdKeywordCount));

        String summary;
        if (score >= 80) {
            String skills = matched.stream().limit(3).collect(Collectors.joining(", "));
            summary = "Strong match. Candidate demonstrates solid experience with " + skills + ". Well-suited for the role requirements.";
        } else if (score >= 60) {
            String skills = matched.stream().limit(2).collect(Collectors.joining(", "));
            String gap = inJdOnly.stream().findFirst().orElse("some required areas");
            summary = "Good match. Candidate has relevant background in " + skills + " with some gaps in " + gap + ".";
        } else if (score >= 40) {
            summary = "Partial match. Candidate shows potential but limited direct experience with the core requirements.";
        } else {
            summary = "Weak match. Candidate's background does not closely align with the technical requirements of this role.";
        }

        AnalysisResult result = new AnalysisResult();
        result.score = score;
        result.summary = summary;
        return result;
    }
}
