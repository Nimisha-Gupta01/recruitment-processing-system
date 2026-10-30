package com.recruitment.entity;

import jakarta.persistence.*;

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

    public Integer getSkillId() { return skillId; }
    public void setSkillId(Integer skillId) { this.skillId = skillId; }

    public Candidate getCandidate() { return candidate; }
    public void setCandidate(Candidate candidate) { this.candidate = candidate; }

    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }

    public Proficiency getProficiency() { return proficiency; }
    public void setProficiency(Proficiency proficiency) { this.proficiency = proficiency; }
}
