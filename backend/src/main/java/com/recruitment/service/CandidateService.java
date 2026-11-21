package com.recruitment.service;

import com.recruitment.dto.CandidateDTOs.*;
import com.recruitment.entity.Candidate;
import com.recruitment.entity.Candidate.Gender;
import com.recruitment.entity.CandidateLocationPref;
import com.recruitment.entity.CandidateRolePref;
import com.recruitment.entity.CandidateSkill;
import com.recruitment.entity.CandidateSkill.Proficiency;
import com.recruitment.repository.CandidateLocationPrefRepository;
import com.recruitment.repository.CandidateRepository;
import com.recruitment.repository.CandidateRolePrefRepository;
import com.recruitment.repository.CandidateSkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class CandidateService {

    private final CandidateRepository candidateRepo;
    private final CandidateSkillRepository skillRepo;
    private final CandidateLocationPrefRepository locationPrefRepo;
    private final CandidateRolePrefRepository rolePrefRepo;

    public CandidateService(CandidateRepository candidateRepo,
                             CandidateSkillRepository skillRepo,
                             CandidateLocationPrefRepository locationPrefRepo,
                             CandidateRolePrefRepository rolePrefRepo) {
        this.candidateRepo = candidateRepo;
        this.skillRepo = skillRepo;
        this.locationPrefRepo = locationPrefRepo;
        this.rolePrefRepo = rolePrefRepo;
    }

    public ProfileResponse getProfile(String email) {
        Candidate c = candidateRepo.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Candidate not found"));
        return new ProfileResponse(c);
    }

    @Transactional
    public ProfileResponse updateProfile(String email, ProfileUpdateRequest req) {
        Candidate c = candidateRepo.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Candidate not found"));

        if (req.getFullName() != null) c.setFullName(req.getFullName());
        if (req.getPhone() != null) c.setPhone(req.getPhone());
        if (req.getDob() != null && !req.getDob().isBlank()) c.setDob(LocalDate.parse(req.getDob()));
        if (req.getGender() != null) c.setGender(Gender.valueOf(req.getGender()));
        if (req.getAddress() != null) c.setAddress(req.getAddress());
        if (req.getDegree() != null) c.setDegree(req.getDegree());
        if (req.getInstitution() != null) c.setInstitution(req.getInstitution());
        if (req.getYearOfPassing() != null) c.setYearOfPassing(req.getYearOfPassing());
        if (req.getPercentage() != null) c.setPercentage(req.getPercentage());
        if (req.getTotalExpYrs() != null) c.setTotalExpYrs(req.getTotalExpYrs());
        if (req.getExpectedSalMin() != null) c.setExpectedSalMin(req.getExpectedSalMin());
        if (req.getExpectedSalMax() != null) c.setExpectedSalMax(req.getExpectedSalMax());

        Candidate saved = candidateRepo.save(c);

        if (req.getSkills() != null) {
            skillRepo.deleteByCandidate_CandidateId(saved.getCandidateId());
            for (SkillRequest sr : req.getSkills()) {
                CandidateSkill skill = new CandidateSkill();
                skill.setCandidate(saved);
                skill.setSkillName(sr.getSkillName());
                if (sr.getProficiency() != null) {
                    skill.setProficiency(Proficiency.valueOf(sr.getProficiency()));
                }
                skillRepo.save(skill);
            }
        }

        if (req.getLocationPrefs() != null) {
            locationPrefRepo.deleteByCandidate_CandidateId(saved.getCandidateId());
            for (String loc : req.getLocationPrefs()) {
                CandidateLocationPref pref = new CandidateLocationPref();
                pref.setCandidate(saved);
                pref.setLocation(loc);
                locationPrefRepo.save(pref);
            }
        }

        if (req.getRolePrefs() != null) {
            rolePrefRepo.deleteByCandidate_CandidateId(saved.getCandidateId());
            for (String role : req.getRolePrefs()) {
                CandidateRolePref pref = new CandidateRolePref();
                pref.setCandidate(saved);
                pref.setPreferredRole(role);
                rolePrefRepo.save(pref);
            }
        }

        return getProfile(email);
    }
}
