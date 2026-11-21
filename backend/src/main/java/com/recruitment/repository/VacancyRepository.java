package com.recruitment.repository;

import com.recruitment.entity.Vacancy;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VacancyRepository extends JpaRepository<Vacancy, Integer> {
    List<Vacancy> findByEmployer_EmployerIdOrderByPostedAtDesc(Integer employerId);
}
