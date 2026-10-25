package com.fairhire.controllers;

import com.fairhire.models.Job;
import com.fairhire.models.MatchResult;
import com.fairhire.repositories.JobRepository;
import com.fairhire.repositories.MatchResultRepository;
import com.fairhire.services.JobService;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller providing historical evaluation and screening audit records.
 * Serves the Audit Ledger frontend.
 */
@RestController
@RequestMapping({"/api/history", "/api/v1/history"})
@CrossOrigin(origins = "*")
public class HistoryController {

    private final JobRepository jobRepository;
    private final MatchResultRepository matchResultRepository;
    private final JobService jobService;

    public HistoryController(JobRepository jobRepository,
                             MatchResultRepository matchResultRepository,
                             JobService jobService) {
        this.jobRepository = jobRepository;
        this.matchResultRepository = matchResultRepository;
        this.jobService = jobService;
    }

    /**
     * Retrieve all screening audit runs.
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAuditHistory() {
        List<Job> jobs = jobRepository.findAllByOrderByIdDesc();
        List<Map<String, Object>> runs = new ArrayList<>();

        for (Job job : jobs) {
            List<MatchResult> matches = matchResultRepository.findByJobIdOrderByRankInPoolAsc(job.getId());
            int candidateCount = matches.size();

            Double fairnessScore = null;
            if (!matches.isEmpty()) {
                double avg = matches.stream()
                        .mapToDouble(m -> m.getOverallScore() != null ? m.getOverallScore().doubleValue() : 0.0)
                        .average()
                        .orElse(0.0);
                fairnessScore = Math.round(avg * 10.0) / 10.0;
            }

            Map<String, Object> run = new LinkedHashMap<>();
            run.put("id", job.getId());
            run.put("jd_title", job.getTitle() != null ? job.getTitle() : "Requisition #" + job.getId());
            run.put("created_at", job.getCreatedAt() != null ? job.getCreatedAt().toString() : Instant.now().toString());
            run.put("candidate_count", candidateCount);
            run.put("fairness_score", fairnessScore);
            runs.add(run);
        }

        return ResponseEntity.ok(runs);
    }

    /**
     * Delete or clear match audit records for a run ID.
     * Deletes the associated job requisition and cascades to match records.
     */
    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteAuditRecord(@PathVariable Long id) {
        if (!jobRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("error", "Audit record not found for ID: " + id));
        }
        matchResultRepository.markStaleByJobId(id);
        jobService.deleteJob(id);
        return ResponseEntity.ok(Map.of("message", "Audit record #" + id + " marked stale and deleted successfully."));
    }
}
