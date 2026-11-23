package com.recruitment.repository;

import com.recruitment.entity.Vacancy;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface VacancyRepository extends JpaRepository<Vacancy, Integer> {
    List<Vacancy> findByEmployer_EmployerIdOrderByPostedAtDesc(Integer employerId);
    List<Vacancy> findByStatusOrderByPostedAtDesc(Vacancy.VacancyStatus status);
    List<Vacancy> findByStatusAndApplicationDeadlineBefore(Vacancy.VacancyStatus status, LocalDate date);
}
