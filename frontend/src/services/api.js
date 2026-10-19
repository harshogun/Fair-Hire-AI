/**
 * FairHire AI - Core API Client Service
 * Communicates with the Spring Boot Backend (Port 8088 / /api/v1)
 */

export const API_BASE = '/api';

function getStorage() {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  if (typeof localStorage !== "undefined") {
    return localStorage;
  }
  return null;
}

function notifyAuthChanged() {
  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    try {
      window.dispatchEvent(new Event("fairhire_auth_state_changed"));
    } catch {
      // Ignored in headless/test environments
    }
  }
}

/**
 * Retrieve cached recruiter JWT token.
 * Strictly reads from active session storage without silent auto-login.
 */
export function getAuthToken() {
  const storage = getStorage();
  return storage ? storage.getItem("fairhire_jwt_token") || null : null;
}

/**
 * Retrieve cached recruiter user metadata.
 */
export function getStoredUser() {
  try {
    const storage = getStorage();
    const raw = storage ? storage.getItem("fairhire_user") : null;
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Authenticate recruiter with email & password against the Spring Boot auth endpoint.
 * Returns { user, token }.
 */
export async function loginRecruiter(email, password) {
  if (!email || !password) {
    throw new Error("Please enter both email and password.");
  }

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.trim(),
      password: password
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || data.message || `Authentication failed (HTTP ${res.status})`);
  }
  if (!data.token) {
    throw new Error("No authentication token received from backend server.");
  }

  const storage = getStorage();
  if (storage) {
    storage.setItem("fairhire_jwt_token", data.token);
    if (data.user) {
      storage.setItem("fairhire_user", JSON.stringify(data.user));
    }
  }
  notifyAuthChanged();
  return data;
}

/**
 * Terminate recruiter session and clear stored tokens.
 */
export function logoutRecruiter() {
  const storage = getStorage();
  if (storage) {
    storage.removeItem("fairhire_jwt_token");
    storage.removeItem("fairhire_user");
  }
  notifyAuthChanged();
}

/**
 * Build authenticated headers with JWT Bearer token and department context.
 * Strictly uses the authenticated session token.
 */
export async function getAuthHeaders() {
  const token = getAuthToken();
  const user = getStoredUser();
  const headers = {
    "Content-Type": "application/json",
    "X-Department": user?.department || "Engineering"
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Fetch Spring Boot Backend Health Status
 */
export async function fetchHealth() {
  const response = await fetch(`${API_BASE}/v1/health`);
  if (!response.ok) {
    throw new Error(`Health check failed with status: ${response.status}`);
  }
  return response.json();
}

/**
 * Fetch Comprehensive System Health (Backend + PostgreSQL + AI Service)
 */
export async function fetchSystemHealth() {
  const response = await fetch(`${API_BASE}/v1/health/system`);
  if (!response.ok) {
    throw new Error(`System health check failed with status: ${response.status}`);
  }
  return response.json();
}

/**
 * Fetch all job requisitions.
 */
export async function fetchJobs() {
  const res = await fetch(`${API_BASE}/jobs`);
  if (!res.ok) {
    throw new Error(`Failed to fetch jobs (HTTP ${res.status})`);
  }
  return res.json();
}

/**
 * Create a new job requisition.
 */
export async function createJob({ title, description, requirements }) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/jobs`, {
    method: "POST",
    headers,
    body: JSON.stringify({ title, description, requirements })
  });
  if (!res.ok) {
    if (res.status === 401) {
      logoutRecruiter();
      throw new Error("Authentication session expired or unauthorized. Please sign in as a recruiter.");
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || `Job creation failed with status ${res.status}`);
  }
  return res.json();
}

/**
 * Fetch all parsed resumes from the candidate pool.
 */
export async function fetchResumes() {
  const res = await fetch(`${API_BASE}/resumes`);
  if (!res.ok) {
    throw new Error(`Failed to fetch resumes (HTTP ${res.status})`);
  }
  return res.json();
}

/**
 * Maximum permitted resume file upload size in bytes (10MB).
 * Aligned strictly with backend ResumeValidator limit.
 */
export const MAX_RESUME_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Check if active session belongs to an authorized Research Admin.
 */
export function isAdmin() {
  const user = getStoredUser();
  return user?.role === "ADMIN";
}

/**
 * Ingest resume file or raw text with optional job association.
 */
export async function uploadResume({ file, rawText, name, email, jobId }) {
  if (file) {
    if (file.size > MAX_RESUME_FILE_SIZE_BYTES) {
      throw new Error(`Upload rejected: File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds maximum permitted limit of 10MB.`);
    }
    if (file.size === 0) {
      throw new Error("Upload rejected: File is empty or not provided.");
    }
  }

  let res;
  const token = getAuthToken();
  if (file) {
    const formData = new FormData();
    formData.append("file", file);
    if (name) formData.append("name", name);
    if (email) formData.append("email", email);
    if (jobId) formData.append("jobId", jobId);
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    res = await fetch(`${API_BASE}/resumes`, {
      method: "POST",
      headers,
      body: formData
    });
  } else {
    const payload = {
      raw_text: rawText,
      name: name || "Demo Candidate",
      email: email || "demo.candidate@fairhire.ai"
    };
    if (jobId) {
      payload.job_id = jobId;
    }
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    res = await fetch(`${API_BASE}/resumes`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });
  }

  if (!res.ok) {
    if (res.status === 413) {
      throw new Error("Upload rejected: File size exceeds the maximum permitted limit of 10MB (HTTP 413 Payload Too Large).");
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.message || err.error || `Resume upload failed with status ${res.status}`);
  }
  return res.json();
}

/**
 * Execute transparent, read-only candidate self-screening against an active job.
 * Evaluates candidate canonical skill coverage without mutating recruiter applicant records.
 */
export async function selfScreenCandidate(jobId, resumeId) {
  const res = await fetch(`${API_BASE}/jobs/${jobId}/self-screen/${resumeId}`, {
    method: "POST"
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.detail || err.error || `Self-screening failed with status ${res.status}`);
  }
  return res.json();
}

/**
 * Execute Phase 4 Deterministic Matching for a job.
 * Runs CANONICAL_SKILL_COVERAGE engine against the candidate pool.
 * Accepts optional explicit resumeIds array.
 */
export async function runJobMatches(jobId, screeningMode = "NORMAL", resumeIds = null) {
  const headers = await getAuthHeaders();
  const user = getStoredUser();
  const body = {
    screeningMode,
    department: user?.department || "Engineering"
  };
  if (Array.isArray(resumeIds) && resumeIds.length > 0) {
    body.resume_ids = resumeIds;
  }
  const res = await fetch(`${API_BASE}/jobs/${jobId}/matches`, {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    if (res.status === 401) {
      logoutRecruiter();
      throw new Error("Authentication session expired or unauthorized. Please sign in as a recruiter.");
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || `Matching execution failed with status ${res.status}`);
  }
  return res.json();
}

/**
 * Retrieve match results for a job using the Phase 4 Deterministic Engine.
 */
export async function fetchJobMatches(jobId) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/jobs/${jobId}/matches`, {
    headers
  });
  if (!res.ok) {
    if (res.status === 401) {
      logoutRecruiter();
      throw new Error("Authentication session expired or unauthorized. Please sign in as a recruiter.");
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || `Failed to fetch matches (HTTP ${res.status})`);
  }
  return res.json();
}

/**
 * Retrieve detailed decomposed match explanation for a single resume against a job.
 */
export async function fetchJobMatchDetail(jobId, resumeId) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/jobs/${jobId}/matches/${resumeId}`, {
    headers
  });
  if (!res.ok) {
    if (res.status === 401) {
      logoutRecruiter();
      throw new Error("Authentication session expired or unauthorized. Please sign in as a recruiter.");
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || `Failed to fetch match details (HTTP ${res.status})`);
  }
  return res.json();
}

/**
 * Fetch persistent screening audit runs for the Audit Ledger.
 */
export async function fetchAuditHistory() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/history`, { headers });
  if (!res.ok) {
    if (res.status === 401) {
      logoutRecruiter();
      throw new Error("Authentication required to view audit records. Please sign in as a recruiter.");
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || `Failed to load audit history (HTTP ${res.status})`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Clear/stale audit record for a screening run ID.
 */
export async function deleteAuditRecord(id) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/history/${id}`, {
    method: "DELETE",
    headers
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || `Failed to delete audit record (HTTP ${res.status})`);
  }
  return res.json();
}

/**
 * Fetch academic research evaluation metrics (Precision, Recall, F1-Score).
 * STRICTLY requires ADMIN role.
 */
export async function fetchResearchMetrics() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/reports/metrics`, { headers });
  if (!res.ok) {
    if (res.status === 401) {
      logoutRecruiter();
      throw new Error("Authentication required for research metrics.");
    }
    if (res.status === 403) {
      throw new Error("Access denied: Research Admin role required (HTTP 403 Forbidden).");
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || `Failed to load research metrics (HTTP ${res.status})`);
  }
  return res.json();
}

/**
 * Fetch experiment logs and benchmarks.
 * STRICTLY requires ADMIN role.
 */
export async function fetchResearchExperiments() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/reports/experiments`, { headers });
  if (!res.ok) {
    if (res.status === 403) {
      throw new Error("Access denied: Research Admin role required (HTTP 403 Forbidden).");
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || `Failed to load experiments (HTTP ${res.status})`);
  }
  return res.json();
}

