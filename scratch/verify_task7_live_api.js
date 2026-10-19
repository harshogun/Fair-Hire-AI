// scratch/verify_task7_live_api.js
// Live end-to-end API verification for Task 7

const BASE_URL = "http://localhost:8088";

async function run() {
  console.log("=== Task 7 Live API Verification ===");

  // 1. Check health
  const healthRes = await fetch(`${BASE_URL}/api/v1/health`);
  console.log("Health check status:", healthRes.status, await healthRes.json());

  // 2. Query jobs list
  const jobsRes = await fetch(`${BASE_URL}/api/jobs`);
  const jobs = await jobsRes.json();
  console.log("Active jobs count:", jobs.length);
  console.log("First job:", { id: jobs[0]?.id, title: jobs[0]?.title, department: jobs[0]?.department });

  // 3. Anonymous Candidate Ingestion (NO jobId)
  const candidateRawResume = `Alex Morgan\nBackend Developer with 5 years experience in Python, SQL, REST APIs, Docker, and Git. Built distributed microservices.`;
  const candUploadRes = await fetch(`${BASE_URL}/api/resumes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      raw_text: candidateRawResume,
      name: "Alex Morgan",
      email: "alex.morgan@example.com"
    })
  });
  console.log("Anonymous Candidate Upload status:", candUploadRes.status);
  const candUploadData = await candUploadRes.json();
  console.log("Uploaded Resume ID:", candUploadData.resumeId, "Skills:", candUploadData.skillsCount);
  const candidateResumeId = candUploadData.resumeId;

  // 4. Verify candidate self-screening against Job 1 (Senior Backend Python Developer)
  const selfScreenRes = await fetch(`${BASE_URL}/api/jobs/${jobs[0].id}/self-screen/${candidateResumeId}`, {
    method: "POST"
  });
  console.log("Candidate Self-Screen status:", selfScreenRes.status);
  const scorecard = await selfScreenRes.json();
  console.log("Candidate Scorecard:", {
    job_id: scorecard.job_id,
    job_title: scorecard.job_title,
    overall_score: scorecard.overall_score,
    required_skill_coverage: scorecard.required_skill_coverage,
    preferred_skill_coverage: scorecard.preferred_skill_coverage,
    matched_skills: scorecard.matched_skills,
    missing_skills: scorecard.missing_skills
  });

  // 5. Verify that recruiter match results table did NOT receive an application from this self-screen
  // Login as recruiter to inspect job match results
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "recruiter@fairhire.ai",
      password: "password123"
    })
  });
  console.log("Recruiter login status:", loginRes.status);
  const loginData = await loginRes.json();
  const recruiterToken = loginData.token;
  console.log("Recruiter department:", loginData.user?.department);

  const matchDetailRes = await fetch(`${BASE_URL}/api/jobs/${jobs[0].id}/matches/${candidateResumeId}`, {
    headers: { "Authorization": `Bearer ${recruiterToken}` }
  });
  console.log("Checking if candidate resume exists in recruiter requisition applicant pool (expect 404):", matchDetailRes.status);
  if (matchDetailRes.status === 404) {
    console.log("VERIFIED: Candidate self-screening did NOT create a row in the recruiter's applicant pool!");
  } else {
    console.error("FAIL: Candidate resume was unexpectedly found in recruiter applicant pool with status:", matchDetailRes.status);
  }

  // 6. Recruiter Upload to Authorized Requisition (Job 1 - Engineering)
  const recruiterResumeText = `Taylor Swift\nSenior Python Engineer with 6 years experience in Python, SQL, REST APIs, Docker, Git, and Linux.`;
  const recUploadRes = await fetch(`${BASE_URL}/api/resumes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${recruiterToken}`
    },
    body: JSON.stringify({
      raw_text: recruiterResumeText,
      name: "Taylor Swift",
      email: "taylor.swift@example.com",
      job_id: jobs[0].id
    })
  });
  console.log("Recruiter Upload with job_id status:", recUploadRes.status);
  const recUploadData = await recUploadRes.json();
  console.log("Recruiter Uploaded Resume ID:", recUploadData.resumeId);
  const recruiterResumeId = recUploadData.resumeId;

  // 7. Verify recruiter requisition matching works for the uploaded candidate
  const recMatchDetailRes = await fetch(`${BASE_URL}/api/jobs/${jobs[0].id}/matches/${recruiterResumeId}`, {
    headers: { "Authorization": `Bearer ${recruiterToken}` }
  });
  console.log("Recruiter match detail status (expect 200):", recMatchDetailRes.status);
  if (recMatchDetailRes.status === 200) {
    const recMatchData = await recMatchDetailRes.json();
    console.log("Recruiter Match Detail:", {
      overall_score: recMatchData.overall_score,
      matched_skills: recMatchData.matched_skills
    });
  }

  // 8. Anonymous upload with job_id must fail closed with 403
  const anonJobUploadRes = await fetch(`${BASE_URL}/api/resumes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      raw_text: "Malicious or unauthorized job_id injection attempt",
      job_id: jobs[0].id
    })
  });
  console.log("Anonymous upload with job_id status (expect 403):", anonJobUploadRes.status);

  console.log("=== Live API Verification Complete ===");
}

run().catch(console.error);
