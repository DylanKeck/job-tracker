DROP TABLE IF EXISTS reminder;
DROP TABLE IF EXISTS document;
DROP TABLE IF EXISTS job_note;
DROP TABLE IF EXISTS job;
DROP TABLE IF EXISTS profile;


-- users
CREATE TABLE IF NOT EXISTS profile
(
    profile_id               uuid PRIMARY KEY,
    profile_activation_token char(32),
    profile_created_at       timestamptz DEFAULT now(),
    profile_email            varchar(128) UNIQUE NOT NULL,
    profile_location         text,
    profile_password_hash    char(97)                NOT NULL,
    profile_resume_url       varchar(255),
    profile_username         varchar(100) UNIQUE NOT NULL
);

-- job
CREATE TABLE IF NOT EXISTS job
(
    job_id          uuid PRIMARY KEY,
    job_profile_id  uuid NOT NULL,
    job_applied_on  date,
    job_company     text NOT NULL,
    job_created_at  timestamptz                                                                       DEFAULT now(),
    job_location    text,
    job_posting_url text,
    job_role        text NOT NULL,
    job_salary_max  int,
    job_salary_min  int,
    job_source      text, -- (LinkedIn, Indeed, referral, etc.)
    job_status      text CHECK (job_status IN ('saved', 'applied', 'interview', 'offer', 'rejected')) DEFAULT 'saved',
    job_updated_at  timestamptz                                                                       DEFAULT now(),
    FOREIGN KEY (job_profile_id) REFERENCES profile (profile_id)
);
CREATE INDEX ON JOB (job_profile_id);
-- job_notes
CREATE TABLE IF NOT EXISTS job_note
(
    job_note_id         uuid PRIMARY KEY,
    job_note_job_id     uuid NOT NULL,
    job_note            text NOT NULL,
    job_note_created_at timestamptz DEFAULT now(),
    FOREIGN KEY (job_note_job_id) REFERENCES job (job_id)
);
CREATE INDEX ON job_note (job_note_job_id);

-- documents (resume/cover letter variants per job)
CREATE TABLE IF NOT EXISTS document
(
    document_id         uuid PRIMARY KEY,
    document_job_id     uuid NOT NULL,
    document_created_at timestamptz DEFAULT now(),
    document_file_url   text NOT NULL, -- start with simple link; add real storage later
    document_label      text NOT NULL, -- e.g. "Resume v2"
    FOREIGN KEY (document_job_id) REFERENCES job (job_id)
);
CREATE INDEX ON document (document_job_id);

-- reminders (follow-ups/interviews)
CREATE TABLE IF NOT EXISTS reminder
(
    reminder_id         uuid PRIMARY KEY,
    reminder_job_id     uuid        NOT NULL,
    reminder_at         timestamptz NOT NULL,
    reminder_created_at timestamptz DEFAULT now(),
    reminder_done       boolean     DEFAULT false,
    reminder_label      text        NOT NULL,
    FOREIGN KEY (reminder_job_id) REFERENCES job (job_id)
);
CREATE INDEX ON reminder (reminder_job_id);
