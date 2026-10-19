import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRoute, isProtectedRoute } from '../src/utils/router.js';
import {
  MAX_RESUME_FILE_SIZE_BYTES,
  uploadResume,
  fetchAuditHistory,
  isAdmin
} from '../src/services/api.js';

// Setup mock storage for Node environment
const mockStore = new Map();
globalThis.localStorage = {
  getItem: (key) => mockStore.get(key) || null,
  setItem: (key, val) => mockStore.set(key, String(val)),
  removeItem: (key) => mockStore.delete(key),
  clear: () => mockStore.clear()
};

test('File Upload: MAX_RESUME_FILE_SIZE_BYTES is bounded at 10 MB', () => {
  assert.equal(MAX_RESUME_FILE_SIZE_BYTES, 10 * 1024 * 1024, 'Limit should be 10MB (10485760 bytes)');
});

test('File Upload: Client-side oversized file rejection before network call', async () => {
  const oversizedFile = {
    name: 'giant_resume.pdf',
    size: 11 * 1024 * 1024, // 11 MB
    type: 'application/pdf'
  };

  await assert.rejects(
    async () => uploadResume({ file: oversizedFile }),
    /Upload rejected: File size .* exceeds maximum permitted limit of 10MB/
  );
});

test('File Upload: HTTP 413 response from server or proxy returns clean user message', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: false,
    status: 413,
    statusText: 'Payload Too Large',
    json: async () => ({ error: 'Payload Too Large' })
  });

  const validSizedFile = {
    name: 'resume.pdf',
    size: 2 * 1024 * 1024,
    type: 'application/pdf'
  };

  try {
    await assert.rejects(
      async () => uploadResume({ file: validSizedFile }),
      /Upload rejected: File size exceeds the maximum permitted limit of 10MB/
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Audit History: Valid array response returns correctly', async () => {
  const originalFetch = globalThis.fetch;
  const mockRuns = [
    { id: 'run-1', candidate_name: 'Maya', job_title: 'Software Engineer', final_score: 85 }
  ];

  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => mockRuns
  });

  try {
    const data = await fetchAuditHistory();
    assert.deepEqual(data, mockRuns);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Audit History: Error/404 response throws clean Error and does not corrupt client data', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: false,
    status: 404,
    json: async () => ({ error: 'Not Found' })
  });

  try {
    await assert.rejects(
      async () => fetchAuditHistory(),
      /Not Found/
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Role Authorization: isAdmin correctly checks server-assigned role', () => {
  localStorage.clear();
  assert.equal(isAdmin(), false, 'Unauthenticated user is not admin');

  localStorage.setItem('fairhire_user', JSON.stringify({ role: 'RECRUITER' }));
  assert.equal(isAdmin(), false, 'RECRUITER role is not admin');

  localStorage.setItem('fairhire_user', JSON.stringify({ role: 'ADMIN' }));
  assert.equal(isAdmin(), true, 'ADMIN role is recognized as admin');
});

test('URL Routing: Route parser maps standard paths correctly', () => {
  assert.equal(parseRoute('/').name, 'root');
  assert.equal(parseRoute('/login').name, 'login');
  assert.equal(parseRoute('/candidate').name, 'candidate');
  assert.equal(parseRoute('/candidate/results').name, 'candidate-results');
  assert.equal(parseRoute('/recruiter').name, 'recruiter');
  assert.equal(parseRoute('/recruiter/jobs').name, 'recruiter-jobs');
  
  const jobDetail = parseRoute('/recruiter/jobs/42');
  assert.equal(jobDetail.name, 'recruiter-job-detail');
  assert.equal(jobDetail.jobId, '42');

  assert.equal(parseRoute('/recruiter/audit').name, 'recruiter-audit');
  assert.equal(parseRoute('/history').name, 'history-redirect');
  assert.equal(parseRoute('/admin/research').name, 'admin-research');
  assert.equal(parseRoute('/admin/experiments').name, 'admin-experiments');
  assert.equal(parseRoute('/architecture').name, 'architecture');

  const unknown = parseRoute('/unknown/path/here');
  assert.equal(unknown.name, 'not-found');
  assert.equal(unknown.path, '/unknown/path/here');
});

test('URL Routing: Protected route checker identifies protected vs public views', () => {
  // Public views
  assert.equal(isProtectedRoute('login'), false);
  assert.equal(isProtectedRoute('candidate'), false);
  assert.equal(isProtectedRoute('candidate-results'), false);
  assert.equal(isProtectedRoute('architecture'), false);
  assert.equal(isProtectedRoute('not-found'), false);

  // Protected views
  assert.equal(isProtectedRoute('recruiter'), true);
  assert.equal(isProtectedRoute('recruiter-jobs'), true);
  assert.equal(isProtectedRoute('recruiter-job-detail'), true);
  assert.equal(isProtectedRoute('recruiter-audit'), true);
  assert.equal(isProtectedRoute('admin-research'), true);
  assert.equal(isProtectedRoute('admin-experiments'), true);
});
