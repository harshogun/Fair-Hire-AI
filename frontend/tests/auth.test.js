import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAuthToken,
  getStoredUser,
  getAuthHeaders,
  logoutRecruiter,
  loginRecruiter
} from '../src/services/api.js';

// Setup mock localStorage in Node global for testing
const mockStore = new Map();
globalThis.localStorage = {
  getItem: (key) => mockStore.get(key) || null,
  setItem: (key, val) => mockStore.set(key, String(val)),
  removeItem: (key) => mockStore.delete(key),
  clear: () => mockStore.clear()
};

test('Authentication: Initial unauthenticated state', async (t) => {
  localStorage.clear();
  assert.equal(getAuthToken(), null, 'Unauthenticated token must be null');
  assert.equal(getStoredUser(), null, 'Unauthenticated user must be null');

  const headers = await getAuthHeaders();
  assert.equal(headers['Authorization'], undefined, 'Unauthenticated headers must not have Authorization');
  assert.equal(headers['X-Department'], 'Engineering', 'Default department should be Engineering');
});

test('Authentication: Session storage and authenticated headers', async (t) => {
  localStorage.clear();
  const testToken = 'eyJhbGciOiJIUzUxMiJ9.test.demo.token';
  const testUser = { id: 1, name: 'Lead Recruiter', email: 'recruiter@fairhire.ai', role: 'RECRUITER', department: 'Engineering' };

  localStorage.setItem('fairhire_jwt_token', testToken);
  localStorage.setItem('fairhire_user', JSON.stringify(testUser));

  assert.equal(getAuthToken(), testToken, 'getAuthToken must return stored token');
  assert.deepEqual(getStoredUser(), testUser, 'getStoredUser must return stored user object');

  const headers = await getAuthHeaders();
  assert.equal(headers['Authorization'], `Bearer ${testToken}`, 'Authenticated headers must include Bearer token');
  assert.equal(headers['X-Department'], 'Engineering', 'Department should match user department');
});

test('Authentication: Logout completely purges session credentials', async (t) => {
  localStorage.setItem('fairhire_jwt_token', 'temporary.token');
  localStorage.setItem('fairhire_user', JSON.stringify({ name: 'Temp' }));

  logoutRecruiter();

  assert.equal(getAuthToken(), null, 'Token must be cleared on logout');
  assert.equal(getStoredUser(), null, 'User object must be cleared on logout');
  assert.equal(localStorage.getItem('fairhire_jwt_token'), null);
  assert.equal(localStorage.getItem('fairhire_user'), null);

  const headers = await getAuthHeaders();
  assert.equal(headers['Authorization'], undefined, 'No authorization header after logout');
});

test('Authentication: Login validation rejects missing parameters', async (t) => {
  await assert.rejects(
    async () => loginRecruiter('', 'password123'),
    { message: 'Please enter both email and password.' }
  );
  await assert.rejects(
    async () => loginRecruiter('recruiter@fairhire.ai', ''),
    { message: 'Please enter both email and password.' }
  );
});

test('Authentication: Successful login parses response and persists session', async (t) => {
  localStorage.clear();
  const mockToken = 'jwt.mock.token.from.backend';
  const mockUser = { id: 1, name: 'Lead Recruiter', email: 'recruiter@fairhire.ai', role: 'RECRUITER', department: 'Engineering' };

  // Temporarily mock global fetch
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    assert.match(url, /\/auth\/login/);
    const body = JSON.parse(options.body);
    assert.equal(body.email, 'recruiter@fairhire.ai');
    assert.equal(body.password, 'password123');

    return {
      ok: true,
      status: 200,
      json: async () => ({ token: mockToken, user: mockUser })
    };
  };

  try {
    const result = await loginRecruiter('recruiter@fairhire.ai', 'password123');
    assert.equal(result.token, mockToken);
    assert.deepEqual(result.user, mockUser);
    assert.equal(getAuthToken(), mockToken);
    assert.deepEqual(getStoredUser(), mockUser);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('Authentication: Failed login raises backend error message', async (t) => {
  localStorage.clear();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: false,
    status: 401,
    json: async () => ({ error: 'Invalid email or password.' })
  });

  try {
    await assert.rejects(
      async () => loginRecruiter('bad@email.com', 'wrongpassword'),
      { message: 'Invalid email or password.' }
    );
    assert.equal(getAuthToken(), null, 'No token should be stored on failed login');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
