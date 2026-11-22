package com.recruitment.repository;

import com.recruitment.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InterviewRepository extends JpaRepository<Interview, Integer> {
    List<Interview> findByApplication_ApplicationId(Integer applicationId);
}
