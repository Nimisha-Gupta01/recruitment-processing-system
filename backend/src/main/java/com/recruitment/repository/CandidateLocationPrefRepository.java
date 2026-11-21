package com.recruitment.repository;

import com.recruitment.entity.CandidateLocationPref;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CandidateLocationPrefRepository extends JpaRepository<CandidateLocationPref, Integer> {
    List<CandidateLocationPref> findByCandidate_CandidateId(Integer candidateId);
    void deleteByCandidate_CandidateId(Integer candidateId);
}
