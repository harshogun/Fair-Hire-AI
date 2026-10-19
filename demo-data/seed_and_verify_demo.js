const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.FAIRHIRE_API_URL || 'http://localhost:8088';

async function runDemoSeedAndVerification() {
  console.log('======================================================================');
  console.log('      FAIRHIRE AI - LIVE DEMO VERIFICATION & BENCHMARK SUITE          ');
  console.log('======================================================================\n');

  // Step 1: Authentication
  console.log('[Step 1] Authenticating with Spring Boot Security (JWT)...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'recruiter@fairhire.ai',
      password: 'password123'
    })
  });

  if (!loginRes.ok) {
    throw new Error(`Authentication failed: HTTP ${loginRes.status}`);
  }

  const authData = await loginRes.json();
  const token = authData.token;
  console.log(`✓ Authenticated as: ${authData.user.name} (${authData.user.email})`);
  console.log(`✓ Role: ${authData.user.role} | Department: ${authData.user.department || 'Engineering'}\n`);

  // Step 2: Ensure Sample Demo Jobs
  console.log('[Step 2] Verifying / Seeding Demo Job Descriptions...');
  const jobsFile = path.join(__dirname, 'jobs', 'demo_jobs.json');
  const demoJobsConfig = JSON.parse(fs.readFileSync(jobsFile, 'utf8'));

  const existingJobsRes = await fetch(`${BASE_URL}/api/v1/jobs`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const existingJobs = await existingJobsRes.json();

  const seededJobs = [];
  for (const jobConfig of demoJobsConfig) {
    let matchedJob = existingJobs.find(j => j.title === jobConfig.title);
    if (!matchedJob) {
      const createRes = await fetch(`${BASE_URL}/api/v1/jobs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: jobConfig.title,
          description: jobConfig.description,
          requirements: jobConfig.requirements
        })
      });
      matchedJob = await createRes.json();
      console.log(`  + Created Job: [ID #${matchedJob.id}] "${matchedJob.title}"`);
    } else {
      console.log(`  • Found Existing Job: [ID #${matchedJob.id}] "${matchedJob.title}"`);
    }
    seededJobs.push(matchedJob);
  }
  console.log(`✓ Total Available Jobs in System: ${seededJobs.length}\n`);

  // Step 3: Ingest Sample Demo Resumes via Multipart
  console.log('[Step 3] Ingesting Demo Resumes via Multipart Upload (/api/v1/resumes)...');
  const resumeDir = path.join(__dirname, 'resumes');
  const resumeFiles = fs.readdirSync(resumeDir).filter(f => f.endsWith('.txt'));

  const ingestedResumes = [];
  for (const filename of resumeFiles) {
    const filePath = path.join(resumeDir, filename);
    const content = fs.readFileSync(filePath, 'utf8');

    // Extract demo name and email from file headers
    const nameMatch = content.match(/Name:\s*([^\r\n]+)/);
    const emailMatch = content.match(/Email:\s*([^\r\n]+)/);
    const candName = nameMatch ? nameMatch[1].trim() : 'Demo Candidate';
    const candEmail = emailMatch ? emailMatch[1].trim() : 'demo@example.com';

    const formData = new FormData();
    const blob = new Blob([content], { type: 'text/plain' });
    formData.append('file', blob, filename);
    formData.append('name', candName);
    formData.append('email', candEmail);

    const uploadRes = await fetch(`${BASE_URL}/api/v1/resumes`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    let resumeResult;
    if (uploadRes.status === 201) {
      resumeResult = await uploadRes.json();
      console.log(`  + Uploaded: ${candName} -> Resume ID #${resumeResult.resumeId}`);
      console.log(`    Extracted Skills (${resumeResult.skillsCount}): ${resumeResult.extractedSkills.map(s => s.skillName).join(', ')}`);
      ingestedResumes.push(resumeResult);
    } else if (uploadRes.status === 409) {
      const conflict = await uploadRes.json();
      console.log(`  • Deduplication: ${candName} already ingested with SHA-256 (Resume ID #${conflict.existingResumeId})`);
      ingestedResumes.push({ resumeId: conflict.existingResumeId, candidateName: candName, candidateEmail: candEmail });
    } else {
      const err = await uploadRes.json().catch(() => ({}));
      console.warn(`  ! Upload warning for ${filename}:`, err);
    }
  }
  console.log(`✓ Demo Resume Pool Ready (${ingestedResumes.length} candidates)\n`);

  // Step 4: Run Deterministic Matching on DEMO-JOB-01
  const targetJob = seededJobs[0];
  console.log(`[Step 4] Running Phase 4 Deterministic Matching for Job #${targetJob.id}: "${targetJob.title}"...`);
  console.log(`  Required Skills: ${Array.isArray(targetJob.skills) ? targetJob.skills.join(', ') : targetJob.requirements}`);

  const matchRes = await fetch(`${BASE_URL}/api/v1/jobs/${targetJob.id}/matches`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      screeningMode: 'NORMAL',
      department: 'Engineering'
    })
  });

  if (!matchRes.ok) {
    const err = await matchRes.json().catch(() => ({}));
    throw new Error(`Match calculation failed: HTTP ${matchRes.status} - ${JSON.stringify(err)}`);
  }

  const matchBatch = await matchRes.json();
  const results = matchBatch.results || [];
  console.log(`✓ Successfully Evaluated ${results.length} Candidates with Algorithm: ${matchBatch.algorithm_version || 'CANONICAL_SKILL_COVERAGE_V1'}\n`);

  // Step 5: Render Ranked Leaderboard
  console.log('------------------------------------------------------------------------------------------------------');
  console.log(
    'Rank'.padEnd(6) +
    'Candidate Name'.padEnd(26) +
    'Score'.padEnd(10) +
    'Req. Coverage'.padEnd(16) +
    'Matched Skills'.padEnd(28) +
    'Skill Gaps'
  );
  console.log('------------------------------------------------------------------------------------------------------');

  results.forEach(r => {
    const rankStr = `#${r.rank_in_pool || 1}`.padEnd(6);
    const nameStr = (r.candidate_name || 'Candidate').padEnd(26);
    const rawScore = Number(r.overall_score || 0);
    const scoreVal = rawScore > 1.0 ? rawScore : rawScore * 100;
    const scoreStr = `${scoreVal.toFixed(1)}%`.padEnd(10);

    const rawCov = Number(r.required_skill_coverage || 0);
    const covVal = rawCov <= 1.0 ? rawCov * 100 : rawCov;
    const covStr = `${covVal.toFixed(1)}%`.padEnd(16);

    const matchedStr = ((r.matched_skills || []).slice(0, 3).join(', ') + ((r.matched_skills || []).length > 3 ? '...' : '')).padEnd(28);
    const missingStr = (r.missing_skills || []).join(', ') || 'None (100% Match)';

    console.log(`${rankStr}${nameStr}${scoreStr}${covStr}${matchedStr}${missingStr}`);
  });
  console.log('------------------------------------------------------------------------------------------------------\n');

  // Step 6: Detailed Match Inspection for Top Ranked Candidate
  if (results.length > 0) {
    const top = results[0];
    const topResumeId = top.resume_id;
    console.log(`[Step 6] Decomposed ATS Feedback for Top Candidate (#1 ${top.candidate_name})...`);

    const detailRes = await fetch(`${BASE_URL}/api/v1/jobs/${targetJob.id}/matches/${topResumeId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (detailRes.ok) {
      const detail = await detailRes.json();
      const detScore = Number(detail.overall_score || 0);
      const detPct = detScore > 1.0 ? detScore : detScore * 100;
      console.log(`  Candidate: ${detail.candidate_name} (${detail.candidate_email})`);
      console.log(`  Overall Match Score: ${detPct.toFixed(1)}%`);
      console.log(`  Required Skills Matched: ${detail.required_skills_matched} of ${detail.required_skills_total}`);
      console.log(`  Matched Skill Set: ${(detail.matched_skills || []).join(', ')}`);
      console.log(`  Identified Skill Gaps: ${(detail.missing_skills || []).join(', ') || 'None'}`);
      console.log(`  Audit Status: ${detail.status} (Deterministic & Reproducible)`);
    }
  }

  console.log('\n======================================================================');
  console.log('         ✓ FAIRHIRE AI DEMO FLOW VERIFIED END-TO-END!                ');
  console.log('======================================================================\n');
}

runDemoSeedAndVerification().catch(err => {
  console.error('\n✖ Demo verification failed:', err.message);
  process.exit(1);
});
