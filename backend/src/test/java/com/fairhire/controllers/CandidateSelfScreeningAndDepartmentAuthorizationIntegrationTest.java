package com.fairhire.controllers;

import com.fairhire.FairHireApplication;
import com.fairhire.config.JwtUtils;
import com.fairhire.models.*;
import com.fairhire.models.enums.*;
import com.fairhire.repositories.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = FairHireApplication.class)
@AutoConfigureMockMvc
@DisplayName("Candidate Self-Screening & Department Authorization Integration Tests (Task 7)")
class CandidateSelfScreeningAndDepartmentAuthorizationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtils jwtUtils;

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

    private User recruiter;
    private Job engineeringJob;
    private Job marketingJob;
    private Job unassignedJob;
    private Job inactiveJob;
    private Resume testResume;
    private String engineeringToken;
    private String marketingToken;

    @BeforeEach
    void setUp() {
        recruiter = userRepository.findByEmail("task7.recruiter@fairhire.test")
                .orElseGet(() -> userRepository.save(new User("Task7 Recruiter", "task7.recruiter@fairhire.test", "hashed_pw", UserRole.RECRUITER)));

        engineeringToken = jwtUtils.generateToken(recruiter.getId(), recruiter.getEmail(), "RECRUITER", "Engineering");
        marketingToken = jwtUtils.generateToken(recruiter.getId(), recruiter.getEmail(), "RECRUITER", "Marketing");

        Skill skillPython = skillRepository.findByName("Python")
                .orElseGet(() -> skillRepository.save(new Skill("Python", "PROGRAMMING_LANGUAGE")));
        Skill skillDocker = skillRepository.findByName("Docker")
                .orElseGet(() -> skillRepository.save(new Skill("Docker", "DEVOPS")));

        // Active Engineering Job
        engineeringJob = jobRepository.save(new Job("Backend Developer", "Python backend", recruiter));
        engineeringJob.setDepartment("Engineering");
        engineeringJob.setStatus(JobStatus.ACTIVE);
        engineeringJob = jobRepository.save(engineeringJob);

        jobSkillRepository.save(new JobSkill(engineeringJob, skillPython, true, 2, new BigDecimal("1.000"), "MANUAL", "Python", "Python"));
        jobSkillRepository.save(new JobSkill(engineeringJob, skillDocker, false, 1, new BigDecimal("1.000"), "MANUAL", "Docker", "Docker"));

        // Active Marketing Job
        marketingJob = jobRepository.save(new Job("Growth Marketer", "Marketing role", recruiter));
        marketingJob.setDepartment("Marketing");
        marketingJob.setStatus(JobStatus.ACTIVE);
        marketingJob = jobRepository.save(marketingJob);
        jobSkillRepository.save(new JobSkill(marketingJob, skillPython, true, 1, new BigDecimal("1.000"), "MANUAL", "Python", "Python"));

        // Unassigned Department Job
        unassignedJob = jobRepository.save(new Job("Unassigned Spec", "Unassigned role", recruiter));
        unassignedJob.setDepartment("unassigned");
        unassignedJob.setStatus(JobStatus.ACTIVE);
        unassignedJob = jobRepository.save(unassignedJob);
        jobSkillRepository.save(new JobSkill(unassignedJob, skillPython, true, 1, new BigDecimal("1.000"), "MANUAL", "Python", "Python"));

        // Inactive Job
        inactiveJob = jobRepository.save(new Job("Archived Role", "Archived position", recruiter));
        inactiveJob.setDepartment("Engineering");
        inactiveJob.setStatus(JobStatus.ARCHIVED);
        inactiveJob = jobRepository.save(inactiveJob);
        jobSkillRepository.save(new JobSkill(inactiveJob, skillPython, true, 1, new BigDecimal("1.000"), "MANUAL", "Python", "Python"));

        // Test Candidate & Resume
        Candidate candidate = candidateRepository.save(
                new Candidate("Task7 Candidate", "task7.candidate." + System.nanoTime() + "@fairhire.test", "555-7777", recruiter)
        );

        testResume = resumeRepository.save(
                new Resume(candidate, "resume.txt", ResumeFileType.TXT, "hash_task7_" + System.nanoTime(), "Experienced in Python and Docker", new BigDecimal("4.0"), "BS")
        );
        testResume.setParsingStatus(ParsingStatus.READY);
        testResume = resumeRepository.save(testResume);

        resumeSkillRepository.save(new ResumeSkill(testResume, skillPython, new BigDecimal("0.950"), "Python experience", "Python", "EXACT_CANONICAL_MATCH"));
    }

    @Test
    @DisplayName("T7-01: Anonymous candidate self-screens against active job and does NOT mutate recruiter match_results pool")
    void testAnonymousCandidateSelfScreen_SuccessAndDoesNotMutateMatchResults() throws Exception {
        long matchCountBefore = matchResultRepository.count();

        mockMvc.perform(post("/api/jobs/{jobId}/self-screen/{resumeId}", engineeringJob.getId(), testResume.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.job_id", is(engineeringJob.getId().intValue())))
                .andExpect(jsonPath("$.resume_id", is(testResume.getId().intValue())))
                .andExpect(jsonPath("$.overall_score", notNullValue()))
                .andExpect(jsonPath("$.required_skill_coverage", notNullValue()))
                .andExpect(jsonPath("$.matched_skills", hasItem("Python")))
                .andExpect(jsonPath("$.missing_skills", hasItem("Docker (Preferred)")));

        // Critical requirement: Private recruiter applicant pool MUST NOT be mutated by public candidate self-screening
        long matchCountAfter = matchResultRepository.count();
        assertEquals(matchCountBefore, matchCountAfter,
                "Candidate self-screening must be strictly read-only and must NOT create records in match_results");
    }

    @Test
    @DisplayName("T7-02: Candidate self-screening against inactive job fails with 400 Bad Request")
    void testCandidateSelfScreen_InactiveJob_ReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/api/jobs/{jobId}/self-screen/{resumeId}", inactiveJob.getId(), testResume.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("INVALID_SELF_SCREEN_STATE")));
    }

    @Test
    @DisplayName("T7-03: Candidate self-screening against non-existent job returns 404")
    void testCandidateSelfScreen_NonExistentJob_ReturnsNotFound() throws Exception {
        mockMvc.perform(post("/api/jobs/{jobId}/self-screen/{resumeId}", 999999L, testResume.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.error", is("RESOURCE_NOT_FOUND")));
    }

    @Test
    @DisplayName("T7-04: Authenticated recruiter uploads resume to authorized job (Engineering -> Engineering)")
    void testRecruiterUpload_AuthorizedDepartment_SucceedsAndAssociatesWithJob() throws Exception {
        String rawText = "Candidate with Python and Docker background: " + System.nanoTime();
        mockMvc.perform(post("/api/resumes")
                        .header("Authorization", "Bearer " + engineeringToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"raw_text\": \"" + rawText + "\", \"job_id\": " + engineeringJob.getId() + ", \"name\": \"Recruiter Applicant\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.resumeId", notNullValue()))
                .andExpect(jsonPath("$.candidateName", is("Recruiter Applicant")));
    }

    @Test
    @DisplayName("T7-05: Authenticated recruiter uploading to job in another department is rejected with 403 Forbidden")
    void testRecruiterUpload_CrossDepartment_Returns403Forbidden() throws Exception {
        // Marketing recruiter attempting to upload into Engineering job
        String rawText = "Cross-dept resume: " + System.nanoTime();
        mockMvc.perform(post("/api/resumes")
                        .header("Authorization", "Bearer " + marketingToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"raw_text\": \"" + rawText + "\", \"job_id\": " + engineeringJob.getId() + "}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error", is("UNAUTHORIZED_RESOURCE_ACCESS")));
    }

    @Test
    @DisplayName("T7-06: Recruiter upload to job with department 'unassigned' fails closed safely with 403 Forbidden")
    void testRecruiterUpload_UnassignedJob_FailsClosedSafely403Forbidden() throws Exception {
        String rawText = "Unassigned job upload attempt: " + System.nanoTime();
        mockMvc.perform(post("/api/resumes")
                        .header("Authorization", "Bearer " + engineeringToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"raw_text\": \"" + rawText + "\", \"job_id\": " + unassignedJob.getId() + "}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error", is("UNAUTHORIZED_RESOURCE_ACCESS")));
    }

    @Test
    @DisplayName("T7-07: Anonymous upload with job_id fails closed with 403 Forbidden (requires caller department context)")
    void testAnonymousUpload_WithJobId_Returns403Forbidden() throws Exception {
        String rawText = "Anonymous upload with job_id: " + System.nanoTime();
        mockMvc.perform(post("/api/resumes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"raw_text\": \"" + rawText + "\", \"job_id\": " + engineeringJob.getId() + "}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error", is("UNAUTHORIZED_RESOURCE_ACCESS")));
    }

    @Test
    @DisplayName("T7-08: Anonymous candidate upload WITHOUT job_id succeeds cleanly for public self-screening")
    void testAnonymousCandidateUpload_WithoutJobId_Succeeds() throws Exception {
        String rawText = "Pure anonymous candidate resume without requisition association: " + System.nanoTime();
        mockMvc.perform(post("/api/resumes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"raw_text\": \"" + rawText + "\", \"name\": \"Anonymous Job Seeker\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.resumeId", notNullValue()))
                .andExpect(jsonPath("$.candidateName", is("Anonymous Job Seeker")));
    }

    @Test
    @DisplayName("T7-09: Missing or invalid JWT cannot access protected recruiter matching endpoints")
    void testMissingJwt_CannotAccessRecruiterMatching() throws Exception {
        mockMvc.perform(post("/api/jobs/{jobId}/matches", engineeringJob.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"resume_ids\": [" + testResume.getId() + "]}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.error", is("UNAUTHORIZED")));
    }

    @Test
    @DisplayName("T7-10: Anonymous candidate cannot retrieve another candidate's private match detail")
    void testCandidate_CannotRetrieveAnotherCandidatePrivateMatchDetail() throws Exception {
        mockMvc.perform(get("/api/jobs/{jobId}/matches/{resumeId}", engineeringJob.getId(), testResume.getId()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)))
                .andExpect(jsonPath("$.error", is("UNAUTHORIZED")));
    }
}
