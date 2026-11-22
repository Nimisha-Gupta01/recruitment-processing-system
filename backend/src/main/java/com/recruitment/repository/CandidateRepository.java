package com.recruitment.repository;

import com.recruitment.entity.Candidate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CandidateRepository extends JpaRepository<Candidate, Integer> {
    Optional<Candidate> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Candidate> findByIsActiveTrue();
}
