package com.fairhire.services.matching;

import com.fairhire.FairHireApplication;
import com.fairhire.dto.MatchBatchResponseDto;
import com.fairhire.dto.MatchResponseDto;
import com.fairhire.dto.ResumeUploadResponse;
import com.fairhire.models.*;
import com.fairhire.models.enums.*;
import com.fairhire.repositories.*;
import com.fairhire.services.ResumeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = FairHireApplication.class)
@DisplayName("Task 6: Candidate Selection and Batch Matching Regression Tests")
class CandidateSelectionAndBatchMatchingTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private JobSkillRepository jobSkillRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private ResumeSkillRepository resumeSkillRepository;

    @Autowired
    private MatchResultRepository matchResultRepository;

    @Autowired
    private SkillCoverageMatchingService matchingService;

    @Autowired
    private ResumeService resumeService;

    private User testRecruiter;
    private Skill skillJava;
    private Skill skillSpring;
    private Skill skillSql;

    @BeforeEach
    void setUp() {
        testRecruiter = userRepository.findByEmail("recruiter.task6@fairhire.ai")
                .orElseGet(() -> userRepository.save(new User("Task6 Recruiter", "recruiter.task6@fairhire.ai", "hash", UserRole.RECRUITER)));

        skillJava = skillRepository.findByName("Java")
                .orElseGet(() -> skillRepository.save(new Skill("Java", "PROGRAMMING_LANGUAGE")));

        skillSpring = skillRepository.findByName("Spring Boot")
                .orElseGet(() -> skillRepository.save(new Skill("Spring Boot", "FRAMEWORK")));

        skillSql = skillRepository.findByName("SQL")
                .orElseGet(() -> skillRepository.save(new Skill("SQL", "DATABASE")));
    }

    private Job createJob(String title, String department, List<Skill> required, List<Skill> preferred) {
        Job job = new Job(title, "Description for " + title, testRecruiter);
        job.setDepartment(department);
        job = jobRepository.save(job);

        for (Skill s : required) {
            jobSkillRepository.save(new JobSkill(job, s, true, 2, new BigDecimal("1.000"), "MANUAL", "Required " + s.getName(), s.getName()));
        }
        for (Skill s : preferred) {
            jobSkillRepository.save(new JobSkill(job, s, false, 0, new BigDecimal("1.000"), "MANUAL", "Preferred " + s.getName(), s.getName()));
        }
        return jobRepository.findById(job.getId()).orElseThrow();
    }

    private Resume createResume(String candidateName, List<Skill> skills) {
        Candidate candidate = candidateRepository.save(new Candidate(
                candidateName,
                "cand." + System.nanoTime() + "@example.com",
                "555-" + (1000 + (int)(Math.random() * 9000)),
                testRecruiter
        ));

        Resume resume = new Resume(
                candidate,
                candidateName.replace(" ", "_") + ".pdf",
                ResumeFileType.PDF,
                "hash_" + System.nanoTime(),
                "Candidate profile text for " + candidateName,
                new BigDecimal("5.0"),
                "BS Computer Science"
        );
        resume.setParsingStatus(ParsingStatus.READY);
        resume = resumeRepository.save(resume);

        for (Skill s : skills) {
            resumeSkillRepository.save(new ResumeSkill(
                    resume, s, new BigDecimal("0.950"), "Experience in " + s.getName(), s.getName(), "EXACT_CANONICAL_MATCH"
            ));
        }
        return resumeRepository.findById(resume.getId()).orElseThrow();
    }

    @Test
    @DisplayName("Test 1: 0 Eligible Candidates - Returns empty batch safely without error")
    void testZeroEligibleCandidates() {
        Job job = createJob("Clean Slate Job", "Engineering", List.of(skillJava), Collections.emptyList());

        // No applicants have been assigned or uploaded for this job
        MatchBatchResponseDto batch = matchingService.matchJob(job.getId(), null, "Engineering", null);

        assertNotNull(batch);
        assertEquals(0, batch.getTotalEvaluated());
        assertNotNull(batch.getResults());
        assertTrue(batch.getResults().isEmpty());
    }

    @Test
    @DisplayName("Test 2: 1 Eligible Candidate - Evaluates and ranks single applicant")
    void testOneEligibleCandidate() {
        Job job = createJob("Single Candidate Job", "Engineering", List.of(skillJava), Collections.emptyList());
        Resume resume = createResume("Single Cand", List.of(skillJava));

        // Evaluate explicitly with single candidate
        MatchBatchResponseDto batch = matchingService.matchJob(job.getId(), List.of(resume.getId()), "Engineering", null);

        assertNotNull(batch);
        assertEquals(1, batch.getTotalEvaluated());
        assertEquals(1, batch.getResults().size());
        assertEquals(1, batch.getResults().get(0).getRankInPool());
        assertEquals(0, new BigDecimal("100.00").compareTo(batch.getResults().get(0).getOverallScore()));

        // Subsequent evaluation using null explicit IDs finds the job's applicant pool of 1
        MatchBatchResponseDto poolBatch = matchingService.matchJob(job.getId(), null, "Engineering", null);
        assertEquals(1, poolBatch.getTotalEvaluated());
        assertEquals(1, poolBatch.getResults().size());
    }

    @Test
    @DisplayName("Test 3: 100 Eligible Candidates - Successfully evaluates maximum synchronous batch")
    void testExactly100EligibleCandidates() {
        Job job = createJob("Century Batch Job", "Engineering", List.of(skillJava), Collections.emptyList());
        List<Long> resumeIds = new ArrayList<>();

        for (int i = 0; i < 100; i++) {
            Resume r = createResume("Century Candidate " + i, List.of(skillJava));
            resumeIds.add(r.getId());
        }

        // Evaluate all 100 explicitly
        MatchBatchResponseDto batch = matchingService.matchJob(job.getId(), resumeIds, "Engineering", null);

        assertNotNull(batch);
        assertEquals(100, batch.getTotalEvaluated());
        assertEquals(100, batch.getResults().size());
        assertEquals(1, batch.getResults().get(0).getRankInPool());
        assertEquals(100, batch.getResults().get(99).getRankInPool());

        // Check applicant pool query evaluates all 100 associated
        MatchBatchResponseDto poolBatch = matchingService.matchJob(job.getId(), null, "Engineering", null);
        assertEquals(100, poolBatch.getTotalEvaluated());
    }

    @Test
    @DisplayName("Test 4: 101 Eligible Candidates - Rejects safely with BatchSizeLimitExceededException (HTTP 422)")
    void test101EligibleCandidatesRejection() {
        Job job = createJob("Overflow Batch Job", "Engineering", List.of(skillJava), Collections.emptyList());
        List<Long> resumeIds = new ArrayList<>();

        for (int i = 0; i < 101; i++) {
            Resume r = createResume("Overflow Candidate " + i, List.of(skillJava));
            resumeIds.add(r.getId());
        }

        // 1. Explicit 101 resume IDs
        BatchSizeLimitExceededException ex = assertThrows(BatchSizeLimitExceededException.class, () -> {
            matchingService.matchJob(job.getId(), resumeIds, "Engineering", null);
        });
        assertTrue(ex.getMessage().contains("exceeds maximum synchronous limit (100)"));

        // 2. Associate 101 records directly in match_results to test pool retrieval limit
        for (Long rId : resumeIds) {
            Resume r = resumeRepository.findById(rId).orElseThrow();
            MatchResult mr = new MatchResult();
            mr.setJob(job);
            mr.setResume(r);
            mr.setCandidate(r.getCandidate());
            mr.setOverallScore(new BigDecimal("50.00"));
            mr.setRankInPool(1);
            mr.setRequiredSkillCoverage(new BigDecimal("0.5000"));
            mr.setPreferredSkillCoverage(BigDecimal.ZERO);
            matchResultRepository.save(mr);
        }

        BatchSizeLimitExceededException poolEx = assertThrows(BatchSizeLimitExceededException.class, () -> {
            matchingService.matchJob(job.getId(), null, "Engineering", null);
        });
        assertTrue(poolEx.getMessage().contains("exceeds maximum synchronous limit (100)"));
    }

    @Test
    @DisplayName("Test 5: Large Corpus Isolation - Evaluates only job-specific applicants, ignoring unrelated resumes")
    void testLargeHistoricalCorpusIsolation() {
        // Create 15 unassigned/other historical resumes
        for (int i = 0; i < 15; i++) {
            createResume("Historical Unassigned " + i, List.of(skillJava, skillSpring));
        }

        Job jobTarget = createJob("Target Job", "Engineering", List.of(skillJava, skillSpring), Collections.emptyList());
        Resume applicantA = createResume("Target Applicant A", List.of(skillJava, skillSpring));
        Resume applicantB = createResume("Target Applicant B", List.of(skillJava));

        // Explicitly link only applicantA and applicantB to jobTarget
        matchingService.matchJob(jobTarget.getId(), List.of(applicantA.getId(), applicantB.getId()), "Engineering", null);

        // Subsequent job pool match should only evaluate the 2 assigned applicants, NOT all historical resumes
        MatchBatchResponseDto targetBatch = matchingService.matchJob(jobTarget.getId(), null, "Engineering", null);

        assertNotNull(targetBatch);
        assertEquals(2, targetBatch.getTotalEvaluated());
        assertEquals(2, targetBatch.getResults().size());
        Set<Long> evaluatedResumeIds = new HashSet<>();
        targetBatch.getResults().forEach(r -> evaluatedResumeIds.add(r.getResumeId()));
        assertTrue(evaluatedResumeIds.contains(applicantA.getId()));
        assertTrue(evaluatedResumeIds.contains(applicantB.getId()));
    }

    @Test
    @DisplayName("Test 6: Newly Uploaded Resume - Associated with job and included in matching pool")
    void testNewlyUploadedResumeAssignedToJob() {
        Job job = createJob("Fullstack Requisition", "Engineering", List.of(skillJava, skillSpring), List.of(skillSql));

        String rawResumeText = "Jane Dev\nSenior Software Engineer\nSkilled in Java, Spring Boot, SQL, and Docker.\nExperience: 5 years.";
        ResumeUploadResponse uploadResponse = resumeService.ingestRawText(
                rawResumeText,
                job.getId(),
                "Jane Dev",
                "jane.dev@example.com"
        );

        assertNotNull(uploadResponse);
        assertNotNull(uploadResponse.resumeId());

        // Now run matching without specifying resume IDs - the new applicant must be automatically included!
        MatchBatchResponseDto batch = matchingService.matchJob(job.getId(), null, "Engineering", null);

        assertNotNull(batch);
        assertEquals(1, batch.getTotalEvaluated());
        MatchResponseDto result = batch.getResults().get(0);
        assertEquals(uploadResponse.resumeId(), result.getResumeId());
        assertEquals("Jane Dev", result.getCandidateName());
        assertTrue(result.getOverallScore().compareTo(BigDecimal.ZERO) > 0);
    }

    @Test
    @DisplayName("Test 7: Cross-Department Access Blocked - Fails closed with UnauthorizedResourceAccessException (HTTP 403)")
    void testCrossDepartmentAccessBlocked() {
        Job salesJob = createJob("Sales Specialist", "Sales", List.of(skillJava), Collections.emptyList());
        Resume resume = createResume("Sales Cand", List.of(skillJava));

        // Recruiter with "Engineering" department context attempts to evaluate "Sales" job
        assertThrows(UnauthorizedResourceAccessException.class, () -> {
            matchingService.matchJob(salesJob.getId(), List.of(resume.getId()), "Engineering", null);
        });

        assertThrows(UnauthorizedResourceAccessException.class, () -> {
            matchingService.matchJob(salesJob.getId(), null, "Engineering", null);
        });
    }

    @Test
    @DisplayName("Test 8: Invalid Resume ID - Fails closed with ResourceNotFoundException (HTTP 404)")
    void testInvalidResumeId() {
        Job job = createJob("Backend Engineer", "Engineering", List.of(skillJava), Collections.emptyList());

        assertThrows(ResourceNotFoundException.class, () -> {
            matchingService.matchJob(job.getId(), List.of(999999999L), "Engineering", null);
        });
    }

    @Test
    @DisplayName("Test 9: Duplicate Resume IDs - De-duplicated without error or double scoring")
    void testDuplicateResumeIdsDeduplicated() {
        Job job = createJob("Unique Candidate Job", "Engineering", List.of(skillJava), Collections.emptyList());
        Resume resume = createResume("Candidate Dup", List.of(skillJava));

        // Pass the same resume ID multiple times
        List<Long> duplicateIds = List.of(resume.getId(), resume.getId(), resume.getId());
        MatchBatchResponseDto batch = matchingService.matchJob(job.getId(), duplicateIds, "Engineering", null);

        assertNotNull(batch);
        assertEquals(1, batch.getTotalEvaluated(), "Duplicate resume IDs should be de-duplicated into a single evaluation");
        assertEquals(1, batch.getResults().size());
    }

    @Test
    @DisplayName("Test 10: Repeat Matching Idempotency - Scores and rankings are strictly reproducible")
    void testRepeatMatchingIsIdempotent() {
        Job job = createJob("Idempotent Job", "Engineering", List.of(skillJava, skillSpring), List.of(skillSql));
        Resume r1 = createResume("Applicant 1", List.of(skillJava, skillSpring));
        Resume r2 = createResume("Applicant 2", List.of(skillJava));

        List<Long> ids = List.of(r1.getId(), r2.getId());

        MatchBatchResponseDto firstRun = matchingService.matchJob(job.getId(), ids, "Engineering", null);
        MatchBatchResponseDto secondRun = matchingService.matchJob(job.getId(), null, "Engineering", null);

        assertEquals(firstRun.getTotalEvaluated(), secondRun.getTotalEvaluated());
        assertEquals(firstRun.getResults().size(), secondRun.getResults().size());

        for (int i = 0; i < firstRun.getResults().size(); i++) {
            MatchResponseDto res1 = firstRun.getResults().get(i);
            MatchResponseDto res2 = secondRun.getResults().get(i);
            assertEquals(res1.getResumeId(), res2.getResumeId());
            assertEquals(res1.getRankInPool(), res2.getRankInPool());
            assertEquals(0, res1.getOverallScore().compareTo(res2.getOverallScore()));
            assertEquals(0, res1.getRequiredSkillCoverage().compareTo(res2.getRequiredSkillCoverage()));
            assertEquals(0, res1.getPreferredSkillCoverage().compareTo(res2.getPreferredSkillCoverage()));
        }
    }
}
