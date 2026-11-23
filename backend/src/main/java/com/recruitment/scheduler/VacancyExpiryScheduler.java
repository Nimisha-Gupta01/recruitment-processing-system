package com.recruitment.scheduler;

import com.recruitment.entity.Vacancy;
import com.recruitment.repository.VacancyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
public class VacancyExpiryScheduler {

    private static final Logger log = LoggerFactory.getLogger(VacancyExpiryScheduler.class);
    private final VacancyRepository vacancyRepository;

    public VacancyExpiryScheduler(VacancyRepository vacancyRepository) {
        this.vacancyRepository = vacancyRepository;
    }

    // Runs daily at midnight server time
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void closeExpiredVacancies() {
        List<Vacancy> expired = vacancyRepository.findByStatusAndApplicationDeadlineBefore(
                Vacancy.VacancyStatus.Open, LocalDate.now());
        if (expired.isEmpty()) return;
        expired.forEach(v -> v.setStatus(Vacancy.VacancyStatus.Closed));
        vacancyRepository.saveAll(expired);
        log.info("Auto-closed {} expired vacancies", expired.size());
    }
}
