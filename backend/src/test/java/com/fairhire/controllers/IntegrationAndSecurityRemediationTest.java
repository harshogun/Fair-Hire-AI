package com.fairhire.controllers;

import com.fairhire.FairHireApplication;
import com.fairhire.config.JwtUtils;
import com.fairhire.models.Job;
import com.fairhire.models.User;
import com.fairhire.models.enums.UserRole;
import com.fairhire.repositories.JobRepository;
import com.fairhire.repositories.UserRepository;
import com.fairhire.util.TestDocumentGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(classes = FairHireApplication.class)
@AutoConfigureMockMvc
@Transactional
class IntegrationAndSecurityRemediationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    private User recruiter;
    private User admin;
    private String recruiterToken;
    private String adminToken;
    private Job sampleJob;

    @BeforeEach
    void setUp() {
        recruiter = userRepository.findByEmail("remed.recruiter@fairhire.test")
                .orElseGet(() -> userRepository.save(new User("Remed Recruiter", "remed.recruiter@fairhire.test", "hash123", UserRole.RECRUITER)));

        admin = userRepository.findByEmail("remed.admin@fairhire.test")
                .orElseGet(() -> userRepository.save(new User("Remed Admin", "remed.admin@fairhire.test", "hash123", UserRole.ADMIN)));

        recruiterToken = jwtUtils.generateToken(recruiter.getId(), recruiter.getEmail(), "RECRUITER", "Engineering");
        adminToken = jwtUtils.generateToken(admin.getId(), admin.getEmail(), "ADMIN", "Research");

        sampleJob = jobRepository.save(new Job("Audit Test Job", "Audit Description", recruiter));
    }

    // =========================================================================
    // 1. Audit Ledger / History Tests
    // =========================================================================

    @Test
    @DisplayName("Audit History: Unauthenticated request to /api/history is rejected with 401")
    void testAuditHistory_Unauthenticated_Rejected() throws Exception {
        mockMvc.perform(get("/api/history"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)));
    }

    @Test
    @DisplayName("Audit History: Authenticated recruiter receives JSON array of screening runs")
    void testAuditHistory_Authenticated_ReturnsRunsArray() throws Exception {
        mockMvc.perform(get("/api/history")
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$", isA(List.class)))
                .andExpect(jsonPath("$[0].id", is(sampleJob.getId().intValue())))
                .andExpect(jsonPath("$[0].jd_title", is("Audit Test Job")));
    }

    @Test
    @DisplayName("Audit History: Authenticated recruiter can clear/stale audit record")
    void testAuditHistory_DeleteRun() throws Exception {
        mockMvc.perform(delete("/api/history/{id}", sampleJob.getId())
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("marked stale")));
    }

    // =========================================================================
    // 2. Research Admin Role-Based Access Control Tests
    // =========================================================================

    @Test
    @DisplayName("Research Admin: Unauthenticated request to /api/reports/metrics is rejected with 401")
    void testReportsMetrics_Unauthenticated_Rejected() throws Exception {
        mockMvc.perform(get("/api/reports/metrics"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status", is(401)));
    }

    @Test
    @DisplayName("Research Admin: Recruiter role (non-admin) is rejected with 403 Forbidden")
    void testReportsMetrics_RecruiterForbidden() throws Exception {
        mockMvc.perform(get("/api/reports/metrics")
                        .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status", is(403)))
                .andExpect(jsonPath("$.error", is("FORBIDDEN")));
    }

    @Test
    @DisplayName("Research Admin: Admin role is authorized (200 OK) to read research metrics")
    void testReportsMetrics_AdminAuthorized() throws Exception {
        mockMvc.perform(get("/api/reports/metrics")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.f1_score", notNullValue()));
    }

    @Test
    @DisplayName("Research Admin: Admin role is authorized (200 OK) to read experiment runs")
    void testReportsExperiments_AdminAuthorized() throws Exception {
        mockMvc.perform(get("/api/reports/experiments")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", isA(List.class)));
    }

    // =========================================================================
    // 3. File Upload Size Limits & Validation
    // =========================================================================

    @Test
    @DisplayName("Resume Upload: Valid PDF file (under 10MB) succeeds with 201 Created")
    void testUploadValidPdf() throws Exception {
        byte[] pdfBytes = TestDocumentGenerator.createValidPdf(List.of("Candidate Name: John Doe", "Skills: Java, SQL"));
        MockMultipartFile file = new MockMultipartFile("file", "valid_resume.pdf", "application/pdf", pdfBytes);

        mockMvc.perform(multipart("/api/resumes")
                        .file(file)
                        .param("name", "John Doe")
                        .param("email", "john.doe@example.com"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fileName", is("valid_resume.pdf")));
    }

    @Test
    @DisplayName("Resume Upload: Oversized file exceeding 10MB is rejected with informative error")
    void testUploadOversizedFile_Rejected() throws Exception {
        // Create 11MB byte array
        byte[] largeBytes = new byte[11 * 1024 * 1024];
        // PDF magic bytes %PDF
        largeBytes[0] = 0x25;
        largeBytes[1] = 0x50;
        largeBytes[2] = 0x44;
        largeBytes[3] = 0x46;

        MockMultipartFile largeFile = new MockMultipartFile("file", "huge_resume.pdf", "application/pdf", largeBytes);

        mockMvc.perform(multipart("/api/resumes")
                        .file(largeFile)
                        .param("name", "Big Candidate")
                        .param("email", "big@example.com"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", is("Upload validation failed")))
                .andExpect(jsonPath("$.detail", containsString("exceeds maximum permitted limit")));
    }
}
