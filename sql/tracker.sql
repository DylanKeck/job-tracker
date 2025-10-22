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
    job_status      text CHECK (job_status IN ('Saved', 'Applied', 'Interview', 'Offer', 'Rejected')) DEFAULT 'Saved',
    job_updated_at  timestamptz                                                                       DEFAULT now(),
    FOREIGN KEY (job_profile_id) REFERENCES profile (profile_id)
);
CREATE INDEX ON JOB (job_profile_id);
-- job_notes
CREATE TABLE IF NOT EXISTS job_note
(
    job_note_id         uuid PRIMARY KEY,
    job_note_job_id     uuid NOT NULL,
    job_note_text            text NOT NULL,
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
select inet_server_addr(), current_database();

BEGIN;

-- ------------------------------------------------------------
-- Jobs (12 rows) – last ~6 weeks, mixed statuses & sources
-- ------------------------------------------------------------
-- Helper: existing profile id
-- 0199970d-5e2d-7658-9a19-37f269628c3d

INSERT INTO job (
    job_id, job_profile_id, job_applied_on, job_company, job_created_at,
    job_location, job_posting_url, job_role, job_salary_max, job_salary_min,
    job_source, job_status, job_updated_at
) VALUES
-- Week of Sep 15–21 (Wk 38)
('0199a001-1111-7aaa-8a11-111111111111','0199970d-5e2d-7658-9a19-37f269628c3d','2025-09-16 10:15:00','Acme Creative','2025-09-16 10:15:00','Remote','https://jobs.example.com/acme-creative-fe','Junior Frontend Engineer',90000,65000,'LinkedIn','Applied','2025-09-16 10:15:00'),
('0199a002-2222-7aaa-8a22-222222222222','0199970d-5e2d-7658-9a19-37f269628c3d','2025-09-18 14:30:00','Northstar Labs','2025-09-18 14:30:00','Denver, CO','https://northstar.example/careers/fs','Full-Stack Developer (Node/React)',110000,80000,'Indeed','Saved','2025-09-18 14:30:00'),

-- Week of Sep 22–28 (Wk 39)
('0199a003-3333-7aaa-8a33-333333333333','0199970d-5e2d-7658-9a19-37f269628c3d','2025-09-23 09:05:00','Helix Health','2025-09-23 09:05:00','Remote (US)','https://helix.example/jobs/frontend','Frontend Engineer I (React)',95000,70000,'Company Site','Applied','2025-09-23 09:05:00'),
('0199a004-4444-7aaa-8a44-444444444444','0199970d-5e2d-7658-9a19-37f269628c3d','2025-09-25 13:00:00','Orbit Finance','2025-09-25 13:00:00','Austin, TX (Hybrid)','https://orbit.example/careers/jr-swe','Software Engineer I',120000,90000,'LinkedIn','Interview','2025-10-01 16:00:00'),

-- Week of Sep 29–Oct 5 (Wk 40)
('0199a005-5555-7aaa-8a55-555555555555','0199970d-5e2d-7658-9a19-37f269628c3d','2025-09-30 11:45:00','Brightbyte','2025-09-30 11:45:00','Remote','https://brightbyte.example/jobs/fs','Junior Full-Stack (TS/Node)',100000,75000,'Indeed','Applied','2025-09-30 11:45:00'),
('0199a006-6666-7aaa-8a66-666666666666','0199970d-5e2d-7658-9a19-37f269628c3d','2025-10-02 15:10:00','River Tech','2025-10-02 15:10:00','Seattle, WA','https://river.example/jobs/swe1','SWE I (Platform)',125000,95000,'Referral','Rejected','2025-10-08 09:00:00'),

-- Week of Oct 6–12 (Wk 41)
('0199a007-7777-7aaa-8a77-777777777777','0199970d-5e2d-7658-9a19-37f269628c3d','2025-10-07 10:20:00','Atlas Retail','2025-10-07 10:20:00','Remote (US)','https://atlas.example/careers/frontend','Frontend Engineer (Next.js)',105000,78000,'Company Site','Applied','2025-10-07 10:20:00'),
('0199a008-8888-7aaa-8a88-888888888888','0199970d-5e2d-7658-9a19-37f269628c3d','2025-10-09 12:40:00','Pinnacle AI','2025-10-09 12:40:00','San Francisco, CA (Hybrid)','https://pinnacle.example/jobs/swe-new-grad','SWE (New Grad)',145000,120000,'Greenhouse','Interview','2025-10-15 13:30:00'),

-- Week of Oct 13–19 (Wk 42)
('0199a009-9999-7aaa-8a99-999999999999','0199970d-5e2d-7658-9a19-37f269628c3d','2025-10-14 09:35:00','Cobalt Cloud','2025-10-14 09:35:00','Remote','https://cobalt.example/jobs/fs','Full-Stack Engineer (Postgres/React)',115000,90000,'LinkedIn','Applied','2025-10-14 09:35:00'),
('0199a00a-aaaa-7aaa-8aaa-aaaaaaaaaaaa','0199970d-5e2d-7658-9a19-37f269628c3d','2025-10-16 16:00:00','Metro Media','2025-10-16 16:00:00','NYC (Hybrid)','https://metro.example/jobs/frontend-jr','Junior Frontend (TS/React)',98000,78000,'Indeed','Offer','2025-10-21 17:30:00'),

-- Week of Oct 20–26 (Wk 43) – current week
('0199a00b-bbbb-7aaa-8abb-bbbbbbbbbbbb','0199970d-5e2d-7658-9a19-37f269628c3d','2025-10-21 11:10:00','Fabrik','2025-10-21 11:10:00','Remote','https://fabrik.example/careers/fs-jr','Junior Full-Stack (Remix/Node)',102000,82000,'Company Site','Applied','2025-10-21 11:10:00'),
('0199a00c-cccc-7aaa-8acc-cccccccccccc','0199970d-5e2d-7658-9a19-37f269628c3d','2025-10-22 09:00:00','Nova Payments','2025-10-22 09:00:00','Remote (US)','https://nova.example/jobs/fe','Frontend Engineer I',108000,84000,'Lever','Saved','2025-10-22 09:00:00');

-- ------------------------------------------------------------
-- Job Notes – attach to a few of the above jobs
-- (use the job_id values defined above)
-- ------------------------------------------------------------
INSERT INTO job_note (job_note_id, job_note_job_id, job_note_text, job_note_created_at) VALUES
                                                                                            ('0199b001-d111-7bbb-8d11-111111111111','0199a004-4444-7aaa-8a44-444444444444','Phone screen scheduled for 10/03 with recruiter. Prepare project overview & STAR stories.','2025-10-01 09:00:00'),
                                                                                            ('0199b002-d222-7bbb-8d22-222222222222','0199a008-8888-7aaa-8a88-888888888888','Received take-home. Build a small CRUD with auth; due 10/13.','2025-10-10 08:30:00'),
                                                                                            ('0199b003-d333-7bbb-8d33-333333333333','0199a00a-aaaa-7aaa-8aaa-aaaaaaaaaaaa','Verbal offer received; awaiting written offer & comp breakdown.','2025-10-21 18:00:00');

-- ------------------------------------------------------------
-- Reminders – upcoming items tied to specific jobs
-- ------------------------------------------------------------
INSERT INTO reminder (reminder_id, reminder_job_id, reminder_label, reminder_at, reminder_done, reminder_created_at) VALUES
                                                                                                                         ('0199c001-e111-7ccc-8e11-111111111111','0199a004-4444-7aaa-8a44-444444444444','Prep for Orbit Finance phone screen','2025-10-03 18:00:00',false,'2025-10-01 09:05:00'),
                                                                                                                         ('0199c002-e222-7ccc-8e22-222222222222','0199a008-8888-7aaa-8a88-888888888888','Submit Pinnacle AI take-home','2025-10-13 12:00:00',false,'2025-10-10 08:35:00'),
                                                                                                                         ('0199c003-e333-7ccc-8e33-333333333333','0199a00a-aaaa-7aaa-8aaa-aaaaaaaaaaaa','Review offer terms from Metro Media','2025-10-22 15:00:00',false,'2025-10-21 18:05:00'),
                                                                                                                         ('0199c004-e444-7ccc-8e44-444444444444','0199a00b-bbbb-7aaa-8abb-bbbbbbbbbbbb','Follow up on Fabrik application','2025-10-24 09:00:00',false,'2025-10-21 11:15:00');

COMMIT;
