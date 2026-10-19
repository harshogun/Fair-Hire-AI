-- Flyway Migration V6: Backfill department for legacy sample jobs created by Lead Recruiter prior to department tracking
-- Safely associates legacy sample jobs created by recruiter@fairhire.ai with the recruiter's department ('Engineering')
-- Ensures unassigned jobs are handled intentionally without altering other records.

UPDATE jobs
SET department = 'Engineering'
WHERE (department IS NULL OR department = '' OR department = 'unassigned')
  AND creator_id IN (SELECT id FROM users WHERE email = 'recruiter@fairhire.ai');
