package com.fairhire.services;

import com.fairhire.client.AIServiceClient;
import com.fairhire.models.*;
import com.fairhire.models.enums.MatchingMethod;
import com.fairhire.models.enums.ScreeningMode;
import com.fairhire.repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.*;

@Service
public class MatchingService {

    private final JobRepository jobRepository;
    private final ResumeRepository resumeRepository;
    private final MatchResultRepository matchResultRepository;
    private final AIServiceClient aiServiceClient;

    public MatchingService(JobRepository jobRepository, ResumeRepository resumeRepository,
                           MatchResultRepository matchResultRepository, AIServiceClient aiServiceClient) {
        this.jobRepository = jobRepository;
        this.resumeRepository = resumeRepository;
        this.matchResultRepository = matchResultRepository;
        this.aiServiceClient = aiServiceClient;
    }

    @Transactional
    public List<Map<String, Object>> runJobMatching(Long jobId, Double keywordWeight, Double semanticWeight) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job with ID " + jobId + " not found."));

        List<Long> associatedResumeIds = matchResultRepository.findDistinctResumeIdsByJobId(job.getId());
        List<Resume> targetResumes = new ArrayList<>();
        if (!associatedResumeIds.isEmpty()) {
            for (Long rId : associatedResumeIds) {
                resumeRepository.findById(rId).ifPresent(targetResumes::add);
            }
        }
        if (targetResumes.isEmpty()) {
            targetResumes = resumeRepository.findAll().stream()
                    .filter(r -> r.getRawText() != null && !r.getRawText().trim().isEmpty())
                    .limit(50)
                    .toList();
        }
        if (targetResumes.isEmpty()) {
            throw new IllegalStateException("No candidate resumes found in the system to match.");
        }

        double kwW = keywordWeight != null ? keywordWeight : 0.8;
        double semW = semanticWeight != null ? semanticWeight : 0.2;
        double totalW = (kwW + semW) > 0 ? (kwW + semW) : 1.0;
        kwW /= totalW;
        semW /= totalW;
        final double finalKwW = kwW;
        final double finalSemW = semW;

        Set<String> jobSkills = new HashSet<>(job.getJobSkills().stream()
                .map(js -> js.getSkill().getName().toLowerCase())
                .toList());

        String jdText = (job.getRawDescription() != null && !job.getRawDescription().isBlank())
                ? job.getRawDescription().trim()
                : (job.getTitle() + " requirements: " + String.join(", ", jobSkills));

        List<MatchScoreTemp> scoredList = new ArrayList<>();

        for (Resume resume : targetResumes) {
            String resumeText = resume.getRawText() != null ? resume.getRawText().trim() : "";
            if (resumeText.isEmpty()) {
                continue;
            }

            Set<String> resumeSkills = new HashSet<>(resume.getResumeSkills().stream()
                    .map(rs -> rs.getSkill().getName().toLowerCase())
                    .toList());

            // 1. Keyword Score (Overlap with job skills)
            long overlap = resumeSkills.stream().filter(jobSkills::contains).count();
            double kwScore = !jobSkills.isEmpty() ? (double) overlap / jobSkills.size() : 0.5;

            // 2. Semantic Score via S-BERT embeddings
            double semScore = kwScore;
            try {
                Map<String, Object> semResult = aiServiceClient.computeSemanticScore(jdText, resumeText);
                if (semResult != null && semResult.get("semantic_score") instanceof Number n) {
                    semScore = n.doubleValue();
                }
            } catch (Exception e) {
                System.err.println("[MatchingService] Semantic score calculation warning: " + e.getMessage());
            }

            double finalScore = (finalKwW * kwScore) + (finalSemW * semScore);
            double blindScore = finalScore;

            // 3. Blind Semantic Score via Anonymized Text (if available)
            String anonText = resume.getAnonymizedText();
            if (anonText != null && !anonText.isBlank()) {
                try {
                    Map<String, Object> blindSemResult = aiServiceClient.computeSemanticScore(jdText, anonText.trim());
                    if (blindSemResult != null && blindSemResult.get("semantic_score") instanceof Number n) {
                        double blindSemScore = n.doubleValue();
                        blindScore = (finalKwW * kwScore) + (finalSemW * blindSemScore);
                    }
                } catch (Exception e) {
                    // Fallback to normal finalScore
                }
            }

            scoredList.add(new MatchScoreTemp(resume, kwScore, semScore, finalScore, blindScore));
        }

        // Rank by final_score descending
        scoredList.sort((a, b) -> Double.compare(b.finalScore, a.finalScore));
        for (int i = 0; i < scoredList.size(); i++) {
            scoredList.get(i).normalRank = i + 1;
        }

        // Rank by blind_score descending
        List<MatchScoreTemp> blindSorted = new ArrayList<>(scoredList);
        blindSorted.sort((a, b) -> Double.compare(b.blindScore, a.blindScore));
        for (int i = 0; i < blindSorted.size(); i++) {
            blindSorted.get(i).blindRank = i + 1;
        }

        // Save or update NORMAL match_results
        for (MatchScoreTemp temp : scoredList) {
            MatchResult normalResult = matchResultRepository.findByJobIdAndResumeIdAndScreeningModeAndMatchingMethod(
                    job.getId(), temp.resume.getId(), ScreeningMode.NORMAL, MatchingMethod.HYBRID
            ).orElseGet(() -> {
                MatchResult nr = new MatchResult();
                nr.setJob(job);
                nr.setCandidate(temp.resume.getCandidate());
                nr.setResume(temp.resume);
                nr.setScreeningMode(ScreeningMode.NORMAL);
                nr.setMatchingMethod(MatchingMethod.HYBRID);
                return nr;
            });

            normalResult.setKeywordScore(BigDecimal.valueOf(temp.kwScore).setScale(4, RoundingMode.HALF_UP));
            normalResult.setSemanticScore(BigDecimal.valueOf(temp.semScore).setScale(4, RoundingMode.HALF_UP));
            normalResult.setKeywordWeight(BigDecimal.valueOf(finalKwW).setScale(3, RoundingMode.HALF_UP));
            normalResult.setSemanticWeight(BigDecimal.valueOf(finalSemW).setScale(3, RoundingMode.HALF_UP));
            normalResult.setFinalCompositeScore(BigDecimal.valueOf(temp.finalScore).setScale(4, RoundingMode.HALF_UP));
            normalResult.setOverallScore(BigDecimal.valueOf(temp.finalScore * 100.0).setScale(2, RoundingMode.HALF_UP));
            normalResult.setRequiredSkillCoverage(BigDecimal.valueOf(temp.kwScore).setScale(4, RoundingMode.HALF_UP));
            normalResult.setPreferredSkillCoverage(BigDecimal.valueOf(temp.semScore).setScale(4, RoundingMode.HALF_UP));
            normalResult.setRankInPool(temp.normalRank);
            normalResult.setIsStale(false);
            normalResult.setScoredAt(Instant.now());
            matchResultRepository.save(normalResult);

            // Save or update BLIND match_results
            MatchResult blindResult = matchResultRepository.findByJobIdAndResumeIdAndScreeningModeAndMatchingMethod(
                    job.getId(), temp.resume.getId(), ScreeningMode.BLIND, MatchingMethod.HYBRID
            ).orElseGet(() -> {
                MatchResult br = new MatchResult();
                br.setJob(job);
                br.setCandidate(temp.resume.getCandidate());
                br.setResume(temp.resume);
                br.setScreeningMode(ScreeningMode.BLIND);
                br.setMatchingMethod(MatchingMethod.HYBRID);
                return br;
            });

            blindResult.setKeywordScore(BigDecimal.valueOf(temp.kwScore).setScale(4, RoundingMode.HALF_UP));
            blindResult.setSemanticScore(BigDecimal.valueOf(temp.semScore).setScale(4, RoundingMode.HALF_UP));
            blindResult.setKeywordWeight(BigDecimal.valueOf(finalKwW).setScale(3, RoundingMode.HALF_UP));
            blindResult.setSemanticWeight(BigDecimal.valueOf(finalSemW).setScale(3, RoundingMode.HALF_UP));
            blindResult.setFinalCompositeScore(BigDecimal.valueOf(temp.blindScore).setScale(4, RoundingMode.HALF_UP));
            blindResult.setOverallScore(BigDecimal.valueOf(temp.blindScore * 100.0).setScale(2, RoundingMode.HALF_UP));
            blindResult.setRequiredSkillCoverage(BigDecimal.valueOf(temp.kwScore).setScale(4, RoundingMode.HALF_UP));
            blindResult.setPreferredSkillCoverage(BigDecimal.valueOf(temp.semScore).setScale(4, RoundingMode.HALF_UP));
            blindResult.setRankInPool(temp.blindRank);
            blindResult.setIsStale(false);
            blindResult.setScoredAt(Instant.now());
            matchResultRepository.save(blindResult);
        }

        return getJobMatchResults(jobId);
    }

    public List<Map<String, Object>> getJobMatchResults(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new IllegalArgumentException("Job not found."));

        List<MatchResult> normalMatches = matchResultRepository.findByJobIdAndScreeningModeAndMatchingMethodOrderByRankInPoolAsc(
                jobId, ScreeningMode.NORMAL, MatchingMethod.HYBRID);
        if (normalMatches.isEmpty()) {
            normalMatches = matchResultRepository.findByJobIdAndScreeningModeOrderByRankInPoolAsc(jobId, ScreeningMode.NORMAL);
        }
        if (normalMatches.isEmpty()) {
            return runJobMatching(jobId, 0.8, 0.2);
        }

        List<MatchResult> blindMatches = matchResultRepository.findByJobIdAndScreeningModeAndMatchingMethodOrderByRankInPoolAsc(
                jobId, ScreeningMode.BLIND, MatchingMethod.HYBRID);
        if (blindMatches.isEmpty()) {
            blindMatches = matchResultRepository.findByJobIdAndScreeningModeOrderByRankInPoolAsc(jobId, ScreeningMode.BLIND);
        }
        Map<Long, Integer> blindRankByResumeId = new HashMap<>();
        for (MatchResult bm : blindMatches) {
            blindRankByResumeId.put(bm.getResume().getId(), bm.getRankInPool());
        }

        List<String> jobSkills = job.getJobSkills().stream()
                .map(js -> js.getSkill().getName())
                .toList();

        return normalMatches.stream().map(m -> {
            List<String> rSkills = m.getResume().getResumeSkills().stream()
                    .map(rs -> rs.getSkill().getName())
                    .toList();

            List<String> matched = jobSkills.stream().filter(rSkills::contains).toList();
            List<String> missing = jobSkills.stream().filter(s -> !rSkills.contains(s)).toList();

            int nRank = m.getRankInPool() != null ? m.getRankInPool() : 1;
            int bRank = blindRankByResumeId.getOrDefault(m.getResume().getId(), nRank);

            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", m.getId());
            map.put("job_id", m.getJob().getId());
            map.put("resume_id", m.getResume().getId());
            map.put("candidate_id", m.getCandidate().getId());
            map.put("candidate_name", m.getCandidate().getFullName());
            map.put("candidate_email", m.getCandidate().getEmail() != null ? m.getCandidate().getEmail() : "");
            double kw = m.getKeywordScore() != null ? m.getKeywordScore().doubleValue()
                    : (m.getRequiredSkillCoverage() != null ? m.getRequiredSkillCoverage().doubleValue() : 0.5);
            double sem = m.getSemanticScore() != null ? m.getSemanticScore().doubleValue()
                    : (m.getPreferredSkillCoverage() != null ? m.getPreferredSkillCoverage().doubleValue() : kw);
            double fin = m.getFinalCompositeScore() != null ? m.getFinalCompositeScore().doubleValue()
                    : (m.getOverallScore() != null ? m.getOverallScore().doubleValue() / 100.0 : (kw * 0.8 + sem * 0.2));
            map.put("keyword_score", Math.round(kw * 1000.0) / 1000.0);
            map.put("semantic_score", Math.round(sem * 1000.0) / 1000.0);
            map.put("final_score", Math.round(fin * 1000.0) / 1000.0);
            map.put("overall_score", Math.round(fin * 10000.0) / 100.0);
            map.put("required_skill_coverage", Math.round(kw * 10000.0) / 100.0);
            map.put("preferred_skill_coverage", Math.round(sem * 10000.0) / 100.0);
            map.put("keyword_weight", m.getKeywordWeight() != null ? m.getKeywordWeight().doubleValue() : 0.8);
            map.put("semantic_weight", m.getSemanticWeight() != null ? m.getSemanticWeight().doubleValue() : 0.2);
            map.put("normal_rank", nRank);
            map.put("rank_in_pool", nRank);
            map.put("blind_rank", bRank);
            map.put("rank_shift", Math.abs(nRank - bRank));
            map.put("matched_skills", matched);
            map.put("missing_skills", missing);
            map.put("matching_method", m.getMatchingMethod() != null ? m.getMatchingMethod().name() : "HYBRID");
            return map;
        }).toList();
    }

    public Map<String, Object> getMatchDetail(Long id) {
        MatchResult m = matchResultRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Match result not found."));
        return Map.of(
                "id", m.getId(),
                "job_title", m.getJob().getTitle(),
                "candidate_name", m.getCandidate().getFullName(),
                "final_score", m.getFinalCompositeScore().doubleValue(),
                "normal_rank", m.getRankInPool(),
                "screening_mode", m.getScreeningMode().name()
        );
    }

    private static class MatchScoreTemp {
        Resume resume;
        double kwScore;
        double semScore;
        double finalScore;
        double blindScore;
        int normalRank;
        int blindRank;

        MatchScoreTemp(Resume resume, double kwScore, double semScore, double finalScore, double blindScore) {
            this.resume = resume;
            this.kwScore = kwScore;
            this.semScore = semScore;
            this.finalScore = finalScore;
            this.blindScore = blindScore;
        }
    }
}
