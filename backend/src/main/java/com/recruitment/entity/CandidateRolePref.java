package com.recruitment.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "candidate_role_prefs")
public class CandidateRolePref {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer prefId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @Column(nullable = false, length = 100)
    private String preferredRole;
}
