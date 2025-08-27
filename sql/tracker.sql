-- users
CREATE TABLE users (
                       id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                       email text UNIQUE NOT NULL,
                       password_hash text NOT NULL,
                       created_at timestamptz DEFAULT now()
);

-- jobs
CREATE TABLE jobs (
                      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                      user_id uuid REFERENCES users(id) ON DELETE CASCADE,
                      company text NOT NULL,
                      role text NOT NULL,
                      posting_url text,
                      location text,
                      applied_on date,
                      status text CHECK (status IN ('saved','applied','interview','offer','rejected')) DEFAULT 'saved',
                      source text,               -- (LinkedIn, Indeed, referral, etc.)
                      salary_min int,
                      salary_max int,
                      created_at timestamptz DEFAULT now(),
                      updated_at timestamptz DEFAULT now()
);

-- job_notes
CREATE TABLE job_notes (
                           id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                           job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
                           note text NOT NULL,
                           created_at timestamptz DEFAULT now()
);

-- documents (resume/cover letter variants per job)
CREATE TABLE documents (
                           id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                           job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
                           label text NOT NULL,         -- e.g. "Resume v2"
                           file_url text NOT NULL,      -- start with simple link; add real storage later
                           created_at timestamptz DEFAULT now()
);

-- reminders (follow-ups/interviews)
CREATE TABLE reminders (
                           id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                           job_id uuid REFERENCES jobs(id) ON DELETE CASCADE,
                           remind_at timestamptz NOT NULL,
                           label text NOT NULL,
                           done boolean DEFAULT false,
                           created_at timestamptz DEFAULT now()
);
