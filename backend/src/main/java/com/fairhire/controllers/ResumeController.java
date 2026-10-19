package com.fairhire.controllers;

import com.fairhire.dto.ExtractedSkillDto;
import com.fairhire.dto.ResumeUploadResponse;
import com.fairhire.services.ResumeService;
import com.fairhire.services.matching.ResourceNotFoundException;
import com.fairhire.services.matching.UnauthorizedResourceAccessException;
import com.fairhire.services.parser.DuplicateResumeException;
import com.fairhire.services.parser.InvalidResumeUploadException;
import com.fairhire.services.skill.SkillExtractionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * REST controller for resume ingestion, validation, deterministic parsing, skill extraction, and retrieval.
 */
@RestController
@RequestMapping({"/api/v1/resumes", "/api/resumes"})
@CrossOrigin(origins = "*")
public class ResumeController {

    private final ResumeService resumeService;
    private final SkillExtractionService skillExtractionService;

    public ResumeController(ResumeService resumeService, SkillExtractionService skillExtractionService) {
        this.resumeService = resumeService;
        this.skillExtractionService = skillExtractionService;
    }

    /**
     * Upload and parse a resume document (.pdf, .docx, or .txt) via multipart/form-data.
     */
    @PostMapping(consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "jobId", required = false) Long jobId,
            @RequestParam(value = "candidateId", required = false) Long candidateId,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "email", required = false) String email
    ) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "File parameter is required and cannot be empty."
                ));
            }
            ResumeUploadResponse response = resumeService.ingestResume(file, jobId, candidateId, name, email);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (InvalidResumeUploadException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "error", "Upload validation failed",
                    "detail", e.getMessage()
            ));
        } catch (DuplicateResumeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "error", "Duplicate resume detected",
                    "detail", e.getMessage(),
                    "sha256", e.getSha256(),
                    "existingResumeId", e.getExistingResumeId()
            ));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", "RESOURCE_NOT_FOUND",
                    "detail", e.getMessage()
            ));
        } catch (UnauthorizedResourceAccessException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "error", "UNAUTHORIZED_RESOURCE_ACCESS",
                    "detail", e.getMessage()
            ));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "I/O failure processing file upload",
                    "detail", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "error", "Resume ingestion failed",
                    "detail", e.getMessage()
            ));
        }
    }

    /**
     * Ingest raw text resume via application/json.
     */
    @PostMapping(consumes = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> uploadResumeJson(@RequestBody Map<String, Object> jsonBody) {
        try {
            if (jsonBody == null || !jsonBody.containsKey("raw_text") || String.valueOf(jsonBody.get("raw_text")).isBlank()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "The 'raw_text' property is required in JSON payload."
                ));
            }
            Long jobId = null;
            if (jsonBody.containsKey("jobId") && jsonBody.get("jobId") != null && !String.valueOf(jsonBody.get("jobId")).isBlank()) {
                jobId = Long.valueOf(String.valueOf(jsonBody.get("jobId")).trim());
            } else if (jsonBody.containsKey("job_id") && jsonBody.get("job_id") != null && !String.valueOf(jsonBody.get("job_id")).isBlank()) {
                jobId = Long.valueOf(String.valueOf(jsonBody.get("job_id")).trim());
            }

            ResumeUploadResponse response = resumeService.ingestRawText(
                    String.valueOf(jsonBody.get("raw_text")),
                    jobId,
                    jsonBody.get("name") != null ? String.valueOf(jsonBody.get("name")) : null,
                    jsonBody.get("email") != null ? String.valueOf(jsonBody.get("email")) : null
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (InvalidResumeUploadException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "error", "Upload validation failed",
                    "detail", e.getMessage()
            ));
        } catch (DuplicateResumeException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "error", "Duplicate resume detected",
                    "detail", e.getMessage(),
                    "sha256", e.getSha256(),
                    "existingResumeId", e.getExistingResumeId()
            ));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", "RESOURCE_NOT_FOUND",
                    "detail", e.getMessage()
            ));
        } catch (UnauthorizedResourceAccessException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "error", "UNAUTHORIZED_RESOURCE_ACCESS",
                    "detail", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "error", "Resume ingestion failed",
                    "detail", e.getMessage()
            ));
        }
    }

    /**
     * Retrieve all ingested resumes (ordered by most recent ID descending).
     */
    @GetMapping
    public ResponseEntity<List<ResumeUploadResponse>> getAllResumes() {
        return ResponseEntity.ok(resumeService.getAllResumes());
    }

    /**
     * Retrieve single resume by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getResumeById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(resumeService.getResumeById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }

    /**
     * Retrieve extracted canonical skills for a resume.
     */
    @GetMapping("/{id}/skills")
    public ResponseEntity<?> getExtractedSkills(@PathVariable Long id) {
        try {
            List<ExtractedSkillDto> skills = skillExtractionService.getSkillsForResume(id);
            return ResponseEntity.ok(Map.of(
                    "resumeId", id,
                    "skillsCount", skills.size(),
                    "skills", skills
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }

    /**
     * Explicitly trigger or re-run deterministic skill extraction for an existing resume.
     */
    @PostMapping("/{id}/skills/extract")
    public ResponseEntity<?> triggerSkillExtraction(@PathVariable Long id) {
        try {
            List<ExtractedSkillDto> skills = skillExtractionService.extractSkillsForResumeId(id);
            return ResponseEntity.ok(Map.of(
                    "resumeId", id,
                    "message", "Skill extraction successfully completed.",
                    "skillsCount", skills.size(),
                    "skills", skills
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Skill extraction failed",
                    "detail", e.getMessage()
            ));
        }
    }

    /**
     * Delete resume record and associated storage file.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteResume(@PathVariable Long id) {
        try {
            resumeService.deleteResume(id);
            return ResponseEntity.ok(Map.of(
                    "message", "Resume " + id + " successfully deleted."
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "error", e.getMessage()
            ));
        }
    }

    /**
     * Handle oversized multipart upload rejections with HTTP 413 Payload Too Large.
     */
    @ExceptionHandler(org.springframework.web.multipart.MaxUploadSizeExceededException.class)
    public ResponseEntity<?> handleMaxUploadSizeExceeded(org.springframework.web.multipart.MaxUploadSizeExceededException e) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(Map.of(
                "status", 413,
                "error", "PAYLOAD_TOO_LARGE",
                "message", "Upload rejected: File size exceeds the maximum permitted limit of 10MB."
        ));
    }
}
