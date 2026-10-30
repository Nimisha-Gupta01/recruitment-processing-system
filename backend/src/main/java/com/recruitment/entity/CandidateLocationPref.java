package com.recruitment.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "candidate_location_prefs")
public class CandidateLocationPref {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer prefId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_id", nullable = false)
    private Candidate candidate;

    @Column(nullable = false, length = 100)
    private String location;

    public Integer getPrefId() { return prefId; }
    public void setPrefId(Integer prefId) { this.prefId = prefId; }

    public Candidate getCandidate() { return candidate; }
    public void setCandidate(Candidate candidate) { this.candidate = candidate; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
}
