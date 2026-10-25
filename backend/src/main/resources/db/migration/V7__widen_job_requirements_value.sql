-- Flyway Migration V7: Alter job_requirements requirement_value from VARCHAR(255) to TEXT
-- Enables job requisitions to store comprehensive technical and operational requirements of arbitrary length without character overflow.

ALTER TABLE job_requirements
    ALTER COLUMN requirement_value TYPE TEXT;
