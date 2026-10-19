package com.fairhire.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.Instant;

public class MatchResponseDto {

    @JsonProperty("match_id")
    private Long matchId;

    @JsonProperty("resume_id")
    private Long resumeId;

    @JsonProperty("candidate_id")
    private Long candidateId;

    @JsonProperty("overall_score")
    private BigDecimal overallScore;

    @JsonProperty("required_skill_coverage")
    private BigDecimal requiredSkillCoverage;

    @JsonProperty("preferred_skill_coverage")
    private BigDecimal preferredSkillCoverage;

    @JsonProperty("required_skills_matched")
    private Integer requiredSkillsMatched;

    @JsonProperty("required_skills_total")
    private Integer requiredSkillsTotal;

    @JsonProperty("preferred_skills_matched")
    private Integer preferredSkillsMatched;

    @JsonProperty("preferred_skills_total")
    private Integer preferredSkillsTotal;

    @JsonProperty("is_stale")
    private Boolean isStale;

    @JsonProperty("scored_at")
    private Instant scoredAt;

    @JsonProperty("rank_in_pool")
    @com.fasterxml.jackson.annotation.JsonAlias("normal_rank")
    private Integer rankInPool;

    @JsonProperty("candidate_name")
    private String candidateName;

    @JsonProperty("candidate_email")
    private String candidateEmail;

    @JsonProperty("matched_skills")
    private java.util.List<String> matchedSkills = new java.util.ArrayList<>();

    @JsonProperty("missing_skills")
    private java.util.List<String> missingSkills = new java.util.ArrayList<>();

    public MatchResponseDto() {}

    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }

    public Long getResumeId() { return resumeId; }
    public void setResumeId(Long resumeId) { this.resumeId = resumeId; }

    public Long getCandidateId() { return candidateId; }
    public void setCandidateId(Long candidateId) { this.candidateId = candidateId; }

    public BigDecimal getOverallScore() { return overallScore; }
    public void setOverallScore(BigDecimal overallScore) { this.overallScore = overallScore; }

    public BigDecimal getRequiredSkillCoverage() { return requiredSkillCoverage; }
    public void setRequiredSkillCoverage(BigDecimal requiredSkillCoverage) { this.requiredSkillCoverage = requiredSkillCoverage; }

    public BigDecimal getPreferredSkillCoverage() { return preferredSkillCoverage; }
    public void setPreferredSkillCoverage(BigDecimal preferredSkillCoverage) { this.preferredSkillCoverage = preferredSkillCoverage; }

    public Integer getRequiredSkillsMatched() { return requiredSkillsMatched; }
    public void setRequiredSkillsMatched(Integer requiredSkillsMatched) { this.requiredSkillsMatched = requiredSkillsMatched; }

    public Integer getRequiredSkillsTotal() { return requiredSkillsTotal; }
    public void setRequiredSkillsTotal(Integer requiredSkillsTotal) { this.requiredSkillsTotal = requiredSkillsTotal; }

    public Integer getPreferredSkillsMatched() { return preferredSkillsMatched; }
    public void setPreferredSkillsMatched(Integer preferredSkillsMatched) { this.preferredSkillsMatched = preferredSkillsMatched; }

    public Integer getPreferredSkillsTotal() { return preferredSkillsTotal; }
    public void setPreferredSkillsTotal(Integer preferredSkillsTotal) { this.preferredSkillsTotal = preferredSkillsTotal; }

    public Boolean getIsStale() { return isStale; }
    public void setIsStale(Boolean isStale) { this.isStale = isStale; }

    public Instant getScoredAt() { return scoredAt; }
    public void setScoredAt(Instant scoredAt) { this.scoredAt = scoredAt; }

    public Integer getRankInPool() { return rankInPool; }
    public void setRankInPool(Integer rankInPool) { this.rankInPool = rankInPool; }

    public String getCandidateName() { return candidateName; }
    public void setCandidateName(String candidateName) { this.candidateName = candidateName; }

    public String getCandidateEmail() { return candidateEmail; }
    public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }

    public java.util.List<String> getMatchedSkills() { return matchedSkills; }
    public void setMatchedSkills(java.util.List<String> matchedSkills) { this.matchedSkills = matchedSkills; }

    public java.util.List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(java.util.List<String> missingSkills) { this.missingSkills = missingSkills; }

    @JsonProperty("final_score")
    public BigDecimal getFinalScore() { return overallScore; }

    @JsonProperty("keyword_score")
    public BigDecimal getKeywordScore() { return requiredSkillCoverage; }

    @JsonProperty("semantic_score")
    public BigDecimal getSemanticScore() { return preferredSkillCoverage; }

    @JsonProperty("normal_rank")
    public Integer getNormalRank() { return rankInPool; }
}
