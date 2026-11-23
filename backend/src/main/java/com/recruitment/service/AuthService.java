package com.recruitment.service;

import com.recruitment.dto.AuthDTOs.*;
import com.recruitment.entity.Candidate;
import com.recruitment.entity.Employer;
import com.recruitment.repository.CandidateRepository;
import com.recruitment.repository.EmployerRepository;
import com.recruitment.security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class AuthService {

    private final EmployerRepository employerRepo;
    private final CandidateRepository candidateRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(EmployerRepository employerRepo,
                       CandidateRepository candidateRepo,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.employerRepo = employerRepo;
        this.candidateRepo = candidateRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse registerEmployer(EmployerRegisterRequest req) {
        if (employerRepo.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }
        Employer employer = new Employer();
        employer.setOrgName(req.getOrgName());
        employer.setEstablishedYr(req.getEstablishedYr());
        employer.setNumEmployees(req.getNumEmployees());
        employer.setAnnualTurnover(req.getAnnualTurnover());
        employer.setContactName(req.getContactName());
        employer.setEmail(req.getEmail());
        employer.setPhone(req.getPhone());
        employer.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        employer.setAddress(req.getAddress());
        employer.setWebsite(req.getWebsite());
        Employer saved = employerRepo.save(employer);
        String token = jwtUtil.generateToken(saved.getEmail(), "EMPLOYER", saved.getEmployerId());
        return new AuthResponse(token, "EMPLOYER", saved.getEmployerId(), saved.getContactName());
    }

    public AuthResponse registerCandidate(CandidateRegisterRequest req) {
        if (candidateRepo.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }
        Candidate candidate = new Candidate();
        candidate.setFullName(req.getFullName());
        candidate.setEmail(req.getEmail());
        candidate.setPhone(req.getPhone());
        candidate.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        if (req.getDob() != null) candidate.setDob(LocalDate.parse(req.getDob()));
        if (req.getGender() != null) candidate.setGender(Candidate.Gender.valueOf(req.getGender()));
        candidate.setAddress(req.getAddress());
        candidate.setDegree(req.getDegree());
        candidate.setInstitution(req.getInstitution());
        candidate.setYearOfPassing(req.getYearOfPassing());
        candidate.setPercentage(req.getPercentage());
        if (req.getTotalExpYrs() != null) candidate.setTotalExpYrs(req.getTotalExpYrs());
        candidate.setExpectedSalMin(req.getExpectedSalMin());
        candidate.setExpectedSalMax(req.getExpectedSalMax());
        Candidate saved = candidateRepo.save(candidate);
        String token = jwtUtil.generateToken(saved.getEmail(), "CANDIDATE", saved.getCandidateId());
        return new AuthResponse(token, "CANDIDATE", saved.getCandidateId(), saved.getFullName());
    }

    public AuthResponse login(LoginRequest req) {
        if ("EMPLOYER".equals(req.getRole())) {
            Employer employer = employerRepo.findByEmail(req.getEmail())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
            if (!passwordEncoder.matches(req.getPassword(), employer.getPasswordHash())) {
                throw new IllegalArgumentException("Invalid credentials");
            }
            String token = jwtUtil.generateToken(employer.getEmail(), "EMPLOYER", employer.getEmployerId());
            return new AuthResponse(token, "EMPLOYER", employer.getEmployerId(), employer.getContactName());
        } else {
            Candidate candidate = candidateRepo.findByEmail(req.getEmail())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
            if (!passwordEncoder.matches(req.getPassword(), candidate.getPasswordHash())) {
                throw new IllegalArgumentException("Invalid credentials");
            }
            String token = jwtUtil.generateToken(candidate.getEmail(), "CANDIDATE", candidate.getCandidateId());
            return new AuthResponse(token, "CANDIDATE", candidate.getCandidateId(), candidate.getFullName());
        }
    }

    public AuthResponse getMe(String email) {
        return candidateRepo.findByEmail(email)
            .map(c -> new AuthResponse(null, "CANDIDATE", c.getCandidateId(), c.getFullName()))
            .orElseGet(() -> employerRepo.findByEmail(email)
                .map(e -> new AuthResponse(null, "EMPLOYER", e.getEmployerId(), e.getContactName()))
                .orElseThrow(() -> new IllegalArgumentException("User not found")));
    }
}
