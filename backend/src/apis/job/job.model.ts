import {z} from "zod/v4";
import {sql} from "../../utils/database.utils.ts";

/**
 * Zod schema for a Job object.
 *
 * Validates job data before database operations. Each field mirrors the job table schema.
 */
export const JobSchema = z.object({
    jobId: z.uuidv7('Please provide a valid uuid7 for jobId'),
    jobProfileId: z.uuidv7('Please provide a valid uuid7 for jobProfileId'),
    jobAppliedOn: z.coerce.date('Please provide a valid date'),
    jobCompany: z.string('Please provide a company name')
        .min(1, 'Must be at least 1 character'),
    jobCreatedAt: z.coerce.date('Please provide a valid date'),
    jobLocation: z.string('Please provide a valid location'),
    jobPostingUrl: z.string('Please provide a valid url'),
    jobRole: z.string('Please provide a valid role'),
    jobSalaryMax: z.coerce.number('Please provide a valid max'),
    jobSalaryMin: z.coerce.number('Please provide a valid min'),
    jobSource: z.string('Please provide a valid source'),
    jobStatus: z.string('Please provide a valid status'),
    jobUpdatedAt: z.coerce.date('Please provide a valid update'),
})

// TypeScript type inferred from JobSchema
export type Job = z.infer<typeof JobSchema>;

/**
 * Zod schema for a JobNote object.
 *
 * Validates job note data before database operations.
 */
export const JobNoteSchema = z.object({
    jobNoteId: z.uuidv7('Please provide a valid uuid7 for jobNoteId'),
    jobNoteJobId: z.uuidv7('Please provide a valid uuid7 for jobNoteJobId'),
    jobNoteText: z.string('Please provide a valid job note'),
    jobNoteCreatedAt: z.coerce.date('Please provide a valid date'),
})

// TypeScript type inferred from JobNoteSchema
export type JobNote = z.infer<typeof JobNoteSchema>;

export const JobAndJobNoteSchema = z.object({
    jobId: z.uuidv7('Please provide a valid uuid7 for jobId'),
    jobProfileId: z.uuidv7('Please provide a valid uuid7 for jobProfileId'),
    jobAppliedOn: z.coerce.date('Please provide a valid date'),
    jobCompany: z.string('Please provide a company name')
        .min(1, 'Must be at least 1 character'),
    jobCreatedAt: z.coerce.date('Please provide a valid date'),
    jobLocation: z.string('Please provide a valid location'),
    jobPostingUrl: z.string('Please provide a valid url'),
    jobRole: z.string('Please provide a valid role'),
    jobSalaryMax: z.coerce.number('Please provide a valid max'),
    jobSalaryMin: z.coerce.number('Please provide a valid min'),
    jobSource: z.string('Please provide a valid source'),
    jobStatus: z.string('Please provide a valid status'),
    jobUpdatedAt: z.coerce.date('Please provide a valid update'),
    jobNoteId: z.uuidv7('Please provide a valid uuid7 for jobNoteId')
        .nullish(),
    jobNoteJobId: z.uuidv7('Please provide a valid uuid7 for jobNoteJobId')
        .nullish(),
    jobNoteText: z.string('Please provide a valid job note')
        .nullish(),
    jobNoteCreatedAt: z.coerce.date('Please provide a valid date')
        .nullish(),
})
export type JobAndJobNote = z.infer<typeof JobAndJobNoteSchema>;

/**
 * Inserts a new job into the database.
 *
 * @param job - Job object validated by JobSchema
 * @returns Success message string
 */
export async function insertJob(job: Job): Promise<string> {
    // Destructure job fields for SQL insert
    const {jobId, jobProfileId, jobAppliedOn, jobCompany, jobCreatedAt, jobLocation, jobPostingUrl, jobRole, jobSalaryMax, jobSalaryMin, jobSource, jobStatus, jobUpdatedAt} = job
    // Insert job into the database, using now() for created/updated timestamps
    await sql`INSERT INTO job (job_id, job_profile_id, job_applied_on, job_company, job_created_at, job_location, job_posting_url, job_role, job_salary_max, job_salary_min, job_source, job_status, job_updated_at) VALUES (${jobId}, ${jobProfileId}, ${jobAppliedOn}, ${jobCompany}, now(), ${jobLocation}, ${jobPostingUrl}, ${jobRole}, ${jobSalaryMax}, ${jobSalaryMin}, ${jobSource}, ${jobStatus}, now())`
    return 'Job added successfully'
}

/**
 * Updates an existing job in the database.
 *
 * @param job - Job object with updated fields
 * @returns Success message string
 */
export async function updateJob(job: Job): Promise<string> {
    // Destructure job fields for SQL update
    const {jobId, jobProfileId, jobAppliedOn, jobCompany, jobCreatedAt, jobLocation, jobPostingUrl, jobRole, jobSalaryMax, jobSalaryMin, jobSource, jobStatus, jobUpdatedAt} = job
    // Update job in the database, using now() for updated timestamp
    await sql`UPDATE job SET  job_applied_on = ${jobAppliedOn}, job_company = ${jobCompany}, job_created_at = ${jobCreatedAt}, job_location = ${jobLocation}, job_posting_url = ${jobPostingUrl}, job_role = ${jobRole}, job_salary_max = ${jobSalaryMax}, job_salary_min = ${jobSalaryMin}, job_source = ${jobSource}, job_status = ${jobStatus}, job_updated_at = now() WHERE job_id = ${jobId}`
    return 'Job updated successfully'
}

/**
 * Selects all jobs for a given profileId.
 *
 * @param profileId - The profile ID to filter jobs by
 * @returns Array of Job objects or null if none found
 */
export async function selectJobsByProfileId(profileId: string): Promise<Job[] | null> {
 const rowList = await sql`SELECT job_id, job_profile_id, job_applied_on, job_company, job_created_at, job_location, job_posting_url, job_role, job_salary_max, job_salary_min, job_source, job_status, job_updated_at FROM job WHERE job_profile_id = ${profileId}`;
 return JobSchema.array().parse(rowList) ?? null;
}

/**
 * Deletes a job by its jobId.
 *
 * @param jobId - The job ID to delete
 * @returns Success message string
 */
export async function deleteJobByJobId(jobId: string): Promise<string> {
    // Delete job from the database
    await sql`DELETE FROM job WHERE job_id = ${jobId}`;
    return 'Job deleted successfully';
}

/**
 * Inserts a new job note into the database.
 *
 * @param jobNote - JobNote object validated by JobNoteSchema
 * @returns Success message string
 */
export async function insertJobNote(jobNote: JobNote): Promise<string> {
    // Destructure job note fields for SQL insert
    const {jobNoteId, jobNoteJobId, jobNoteText, jobNoteCreatedAt} = jobNote
    // Insert job note into the database, using now() for created timestamp
    await sql`INSERT INTO job_note (job_note_id, job_note_job_id, job_note_text, job_note_created_at) VALUES (${jobNoteId}, ${jobNoteJobId}, ${jobNoteText}, now())`
    return 'Job note added successfully'
}

/**
 * Updates an existing job note in the database.
 *
 * @param jobNote - JobNote object with updated fields
 * @returns Success message string
 */
export async function updateJobNote(jobNote: JobNote): Promise<string> {
    // Destructure job note fields for SQL update
    const {jobNoteId, jobNoteJobId, jobNoteText, jobNoteCreatedAt} = jobNote
    // Update job note text in the database
    await sql`UPDATE job_note SET  job_note_text = ${jobNoteText}  WHERE job_note_id = ${jobNoteId}`
    return 'Job note updated successfully'
}

/**
 * Selects all job notes for a given jobId.
 *
 * @param jobId - The job ID to filter notes by
 * @returns Array of JobNote objects or null if none found
 */
export async function selectJobNotesByJobId(jobId: string): Promise<JobNote[] | null> {
    // Query job notes by jobId
    const rowList = await sql`SELECT job_note_id, job_note_job_id, job_note_text, job_note_created_at FROM job_note WHERE job_note_job_id = ${jobId}`;
    // Parse result using JobNoteSchema array
    return JobNoteSchema.array().parse(rowList) ?? null;
}

export async function selectJobByRecentlyAdded(profileId: string): Promise<Job[] | null> {
    // Query jobs by profileId ordered by creation date descending
    const rowList = await sql`SELECT job_id, job_profile_id, job_applied_on, job_company, job_created_at, job_location, job_posting_url, job_role, job_salary_max, job_salary_min, job_source, job_status, job_updated_at FROM job WHERE job_profile_id = ${profileId} ORDER BY job_created_at DESC LIMIT 5`;
    // Parse result using JobSchema array
    return JobSchema.array().parse(rowList) ?? null;
}
/**
 * Deletes all job notes for a given jobId.
 *
 * @param jobId - The job ID whose notes should be deleted
 * @returns Success message string
 */
export async function deleteJobNote(jobId: string): Promise<string> {
    // Delete job notes from the database
    await sql`DELETE FROM job_note WHERE job_note_job_id = ${jobId}`;
    return 'Job notes deleted successfully';
}
/**
 * Selects a job and its associated notes by jobId.
 *
 * @param jobId - The job ID to filter by
 * @returns Job object with associated notes or null if not found
 */

export async function selectJobAndJobNoteByJobId(jobId: string): Promise<Job | null> {
    // Query job and its notes by jobId
    const rowList = await sql`SELECT job_id, job_profile_id, job_applied_on, job_company, job_created_at, job_location, job_posting_url, job_role, job_salary_max, job_salary_min, job_source, job_status, job_updated_at, job_note_id, job_note_job_id, job_note_text, job_note_created_at FROM job LEFT JOIN job_note ON job.job_id = job_note.job_note_job_id WHERE job.job_id = ${jobId}`;
    // Parse result using JobSchema array
    return JobAndJobNoteSchema.array().parse(rowList)[0] ?? null;
}

export async function getWeeklyApplications(profileId: string, weeks = 4) {
    const safeWeeks = Math.max(1, Math.min(12, Number(weeks) || 4));

    const rows = await sql<{ week_label: string; applications: number }[]>`
        WITH series AS (
            SELECT generate_series(
                           date_trunc('week', now()) - ((${safeWeeks}::int - 1) * interval '1 week'),
                           date_trunc('week', now()),
                           interval '1 week'
                   ) AS wk
        )
        SELECT
            to_char(series.wk, '"Wk" IW')           AS week_label,
            COALESCE(COUNT(j.job_id), 0)::int      AS applications
        FROM series
                 LEFT JOIN job j
                           ON j.job_profile_id = ${profileId}
                               AND date_trunc('week', j.job_applied_on) = series.wk
        GROUP BY series.wk
        ORDER BY series.wk;
    `;

    return rows.map(r => ({ week: r.week_label, applications: r.applications }));
}
