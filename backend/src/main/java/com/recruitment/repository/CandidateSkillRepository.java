package com.recruitment.repository;

import com.recruitment.entity.CandidateSkill;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CandidateSkillRepository extends JpaRepository<CandidateSkill, Integer> {
    List<CandidateSkill> findByCandidate_CandidateId(Integer candidateId);
    void deleteByCandidate_CandidateId(Integer candidateId);
}
