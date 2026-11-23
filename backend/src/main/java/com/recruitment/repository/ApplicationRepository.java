package com.recruitment.repository;

import com.recruitment.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Integer> {
    List<Application> findByCandidate_CandidateId(Integer candidateId);
    List<Application> findByVacancy_VacancyId(Integer vacancyId);
    boolean existsByVacancy_VacancyIdAndCandidate_CandidateId(Integer vacancyId, Integer candidateId);
    boolean existsByVacancy_VacancyIdAndCandidate_CandidateIdAndStatusNot(Integer vacancyId, Integer candidateId, String status);
    Optional<Application> findByVacancy_VacancyIdAndCandidate_CandidateId(Integer vacancyId, Integer candidateId);
}
