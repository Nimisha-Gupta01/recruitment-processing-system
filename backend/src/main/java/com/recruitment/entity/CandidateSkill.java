package com.recruitment.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "candidate_skills")
public class CandidateSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer skillId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @Column(nullable = false, length = 80)
    private String skillName;

    @Enumerated(EnumType.STRING)
    private Proficiency proficiency = Proficiency.Intermediate;

    public enum Proficiency { Beginner, Intermediate, Expert }
}
