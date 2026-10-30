package com.recruitment.repository;

import com.recruitment.entity.CandidateRolePref;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CandidateRolePrefRepository extends JpaRepository<CandidateRolePref, Integer> {
    List<CandidateRolePref> findByCandidate_CandidateId(Integer candidateId);
    void deleteByCandidate_CandidateId(Integer candidateId);
}
