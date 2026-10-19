package com.fairhire.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for transparent, read-only candidate self-screening ATS feedback.
 * Does not mutate recruiter requisitions or private applicant pools.
 */
public record CandidateSelfScreenResponseDto(
        @JsonProperty("job_id") Long jobId,
        @JsonProperty("job_title") String jobTitle,
        @JsonProperty("department") String department,
        @JsonProperty("resume_id") Long resumeId,
        @JsonProperty("candidate_name") String candidateName,
        @JsonProperty("overall_score") BigDecimal overallScore,
        @JsonProperty("required_skill_coverage") BigDecimal requiredSkillCoverage,
        @JsonProperty("preferred_skill_coverage") BigDecimal preferredSkillCoverage,
        @JsonProperty("is_qualified") Boolean isQualified,
        @JsonProperty("matched_skills") List<String> matchedSkills,
        @JsonProperty("missing_skills") List<String> missingSkills
) {}
