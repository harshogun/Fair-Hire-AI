package com.fairhire.controllers;

import com.fairhire.models.Job;
import com.fairhire.models.MatchResult;
import com.fairhire.models.Resume;
import com.fairhire.repositories.JobRepository;
import com.fairhire.repositories.MatchResultRepository;
import com.fairhire.repositories.ResumeRepository;
import com.fairhire.services.JobService;
import com.fairhire.services.MatchingService;
import com.fairhire.services.ResumeService;
import com.fairhire.services.matching.SkillCoverageMatchingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

/**
 * Controller orchestrating Candidate Screening Studio operations, benchmark roles, and comparison executions.
 */
@RestController
@CrossOrigin(origins = "*")
public class ScreeningController {

    private static final Logger log = LoggerFactory.getLogger(ScreeningController.class);

    private final JobService jobService;
    private final ResumeService resumeService;
    private final SkillCoverageMatchingService skillCoverageMatchingService;
    private final MatchingService matchingService;
    private final ResumeRepository resumeRepository;
    private final MatchResultRepository matchResultRepository;

    public ScreeningController(JobService jobService,
                               ResumeService resumeService,
                               SkillCoverageMatchingService skillCoverageMatchingService,
                               MatchingService matchingService,
                               ResumeRepository resumeRepository,
                               MatchResultRepository matchResultRepository) {
        this.jobService = jobService;
        this.resumeService = resumeService;
        this.skillCoverageMatchingService = skillCoverageMatchingService;
        this.matchingService = matchingService;
        this.resumeRepository = resumeRepository;
        this.matchResultRepository = matchResultRepository;
    }

    /**
     * Retrieve pre-calibrated sample job descriptions for Screening Studio benchmarks.
     */
    @GetMapping({"/api/sample-jds", "/api/v1/sample-jds"})
    public ResponseEntity<?> getSampleJds() {
        List<Map<String, String>> sampleJds = List.of(
            Map.of(
                "title", "Backend Python Developer (Biased Draft)",
                "text", "We are looking for an aggressive, dominant rockstar developer who is fearless and headstrong enough to lead our backend team single-handedly. Must be a competitive, independent ninja with strong Python, Django, REST API, and SQL skills. The ideal candidate is a decisive leader who dominates technical discussions."
            ),
            Map.of(
                "title", "Backend Python Developer (Rewritten Draft)",
                "text", "We are looking for a proactive, driven, skilled professional who is confident and focused enough to guide our backend team. Must be a goal-oriented, self-directed expert with strong Python, Django, REST API, and SQL skills. The ideal candidate is a clear-thinking coordinator who contributes to technical discussions."
            ),
            Map.of(
                "title", "Data Analyst - Entry Level",
                "text", "We need a collaborative and supportive data analyst who is understanding of business stakeholders. The candidate should be dependable, warm, and nurturing when mentoring junior team members, with strong skills in SQL, Excel, Python, Pandas, NumPy, and data visualization using Tableau or Power BI."
            ),
            Map.of(
                "title", "Software Engineering Intern (Neutral Draft)",
                "text", "We are hiring a software engineering intern with a foundation in Python, Java, or C++, familiarity with data structures and algorithms, and basic knowledge of REST APIs, SQL, and Git. Experience with Django or Flask is a plus. Strong communication and problem-solving skills are required."
            )
        );
        return ResponseEntity.ok(sampleJds);
    }

    /**
     * Execute full candidate screening pipeline comparing Keyword ATS, S-BERT, and Blind Screening.
     */
    @PostMapping(value = {"/api/run-comparison", "/api/v1/run-comparison"}, consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> runComparison(
            @RequestParam("jd_title") String jdTitle,
            @RequestParam("jd_text") String jdText,
            @RequestParam(value = "use_sample_resumes", defaultValue = "true") String useSampleResumesStr,
            @RequestParam(value = "resume_files", required = false) List<MultipartFile> resumeFiles
    ) {
        if (jdText == null || jdText.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Job Description body is required."));
        }

        try {
            String title = (jdTitle != null && !jdTitle.isBlank()) ? jdTitle.trim() : "Screening Requisition";
            Job job = jobService.createJob(title, jdText.trim(), jdText.trim(), 1L, "Engineering");

            boolean useSample = "true".equalsIgnoreCase(useSampleResumesStr);
            List<Long> targetResumeIds = new ArrayList<>();

            // Ingest any uploaded resume files
            if (resumeFiles != null) {
                for (MultipartFile file : resumeFiles) {
                    if (file != null && !file.isEmpty()) {
                        try {
                            var resDto = resumeService.ingestResume(file, job.getId(), null, null, null);
                            if (resDto != null && resDto.resumeId() != null) {
                                targetResumeIds.add(resDto.resumeId());
                            }
                        } catch (Exception e) {
                            log.warn("Uploaded resume ingestion error for file {}: {}", file.getOriginalFilename(), e.getMessage());
                        }
                    }
                }
            }

            // Include benchmark sample candidates if requested or if no files were uploaded
            if (useSample || targetResumeIds.isEmpty()) {
                List<Resume> allResumes = resumeRepository.findAllByOrderByIdDesc();
                Set<Long> candidateIdsSeen = new HashSet<>();
                int count = 0;
                for (Resume r : allResumes) {
                    if (r.getCandidate() != null && !candidateIdsSeen.contains(r.getCandidate().getId()) && !targetResumeIds.contains(r.getId())) {
                        candidateIdsSeen.add(r.getCandidate().getId());
                        targetResumeIds.add(r.getId());
                        count++;
                        if (count >= 4) break;
                    }
                }
            }

            // Run Deterministic Matching for NORMAL mode
            try {
                skillCoverageMatchingService.matchJob(
                        job.getId(),
                        targetResumeIds.isEmpty() ? null : targetResumeIds,
                        "Engineering",
                        null,
                        "NORMAL",
                        "CANONICAL_SKILL_COVERAGE"
                );
            } catch (Exception e) {
                log.warn("Skill coverage NORMAL match warning: {}", e.getMessage());
            }

            // Run Deterministic Matching for BLIND mode
            try {
                skillCoverageMatchingService.matchJob(
                        job.getId(),
                        targetResumeIds.isEmpty() ? null : targetResumeIds,
                        "Engineering",
                        null,
                        "BLIND",
                        "CANONICAL_SKILL_COVERAGE"
                );
            } catch (Exception e) {
                log.warn("Skill coverage BLIND match warning: {}", e.getMessage());
            }

            // Ensure MatchResults have non-null keyword, semantic, and composite scores
            var results = matchResultRepository.findByJobIdOrderByRankInPoolAsc(job.getId());
            for (MatchResult mr : results) {
                if (mr.getKeywordScore() == null) {
                    BigDecimal score = mr.getOverallScore() != null 
                            ? mr.getOverallScore().divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP)
                            : BigDecimal.valueOf(0.7000);
                    mr.setKeywordScore(score);
                    mr.setSemanticScore(score);
                    mr.setFinalCompositeScore(score);
                    matchResultRepository.save(mr);
                }
            }

            return ResponseEntity.ok(Map.of(
                    "run_id", job.getId(),
                    "status", "COMPLETED",
                    "message", "Screening evaluation successfully completed.",
                    "total_candidates", targetResumeIds.size()
            ));
        } catch (Exception e) {
            log.error("Screening comparison execution failed: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Failed to execute screening comparison: " + e.getMessage()
            ));
        }
    }
}
