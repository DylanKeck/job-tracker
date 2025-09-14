import {z} from "zod/v4";
import {sql} from "../../utils/database.utils.ts";

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
    jobSalaryMax: z.number('Please provide a valid max'),
    jobSalaryMin: z.number('Please provide a valid min'),
    jobSource: z.string('Please provide a valid source'),
    jobStatus: z.string('Please provide a valid status'),
    jobUpdatedAt: z.coerce.date('Please provide a valid update'),
})
export type Job = z.infer<typeof JobSchema>;

export const JobNoteSchema = z.object({
    jobNoteId: z.uuidv7('Please provide a valid uuid7 for jobNoteId'),
    jobNoteJobId: z.uuidv7('Please provide a valid uuid7 for jobNoteJobId'),
    jobNoteText: z.string('Please provide a valid job note'),
    jobNoteCreatedAt: z.coerce.date('Please provide a valid date'),
})
export type JobNote = z.infer<typeof JobNoteSchema>;

export async function insertJob(job: Job): Promise<string> {
    const {jobId, jobProfileId, jobAppliedOn, jobCompany, jobCreatedAt, jobLocation, jobPostingUrl, jobRole, jobSalaryMax, jobSalaryMin, jobSource, jobStatus, jobUpdatedAt} = job
    await sql`INSERT INTO job (job_id, job_profile_id, job_applied_on, job_company, job_created_at, job_location, job_posting_url, job_role, job_salary_max, job_salary_min, job_source, job_status, job_updated_at) VALUES (${jobId}, ${jobProfileId}, ${jobAppliedOn}, ${jobCompany}, now(), ${jobLocation}, ${jobPostingUrl}, ${jobRole}, ${jobSalaryMax}, ${jobSalaryMin}, ${jobSource}, ${jobStatus}, now())`
    return 'Job added successfully'
}
export async function updateJob(job: Job): Promise<string> {
    const {jobId, jobProfileId, jobAppliedOn, jobCompany, jobCreatedAt, jobLocation, jobPostingUrl, jobRole, jobSalaryMax, jobSalaryMin, jobSource, jobStatus, jobUpdatedAt} = job
    await sql`UPDATE job SET  job_applied_on = ${jobAppliedOn}, job_company = ${jobCompany}, job_created_at = ${jobCreatedAt}, job_location = ${jobLocation}, job_posting_url = ${jobPostingUrl}, job_role = ${jobRole}, job_salary_max = ${jobSalaryMax}, job_salary_min = ${jobSalaryMin}, job_source = ${jobSource}, job_status = ${jobStatus}, job_updated_at = now() WHERE job_id = ${jobId}`
    return 'Job updated successfully'
}

export async function selectJobsByProfileId(profileId: string): Promise<Job[] | null> {
 const rowList = await sql`SELECT job_id, job_profile_id, job_applied_on, job_company, job_created_at, job_location, job_posting_url, job_role, job_salary_max, job_salary_min, job_source, job_status, job_updated_at FROM job WHERE job_profile_id = ${profileId}`;
 return JobSchema.array().parse(rowList) ?? null;
}

export async function deleteJobByJobId(jobId: string): Promise<string> {
    await sql`DELETE FROM job WHERE job_id = ${jobId}`;
    return 'Job deleted successfully';
}

export async function insertJobNote(jobNote: JobNote): Promise<string> {
    const {jobNoteId, jobNoteJobId, jobNoteText, jobNoteCreatedAt} = jobNote
    await sql`INSERT INTO job_note (job_note_id, job_note_job_id, job_note_text, job_note_created_at) VALUES (${jobNoteId}, ${jobNoteJobId}, ${jobNoteText}, now())`
    return 'Job note added successfully'
}

export async function updateJobNote(jobNote: JobNote): Promise<string> {
    const {jobNoteId, jobNoteJobId, jobNoteText, jobNoteCreatedAt} = jobNote
    await sql`UPDATE job_note SET  job_note_text = ${jobNoteText}  WHERE job_note_id = ${jobNoteId}`
    return 'Job note updated successfully'
}

export async function selectJobNotesByJobId(jobId: string): Promise<JobNote[] | null> {
    const rowList = await sql`SELECT job_note_id, job_note_job_id, job_note_text, job_note_created_at FROM job_note WHERE job_note_job_id = ${jobId}`;
    return JobNoteSchema.array().parse(rowList) ?? null;
}

export async function deleteJobNote(jobId: string): Promise<string> {
    await sql`DELETE FROM job_note WHERE job_note_job_id = ${jobId}`;
    return 'Job notes deleted successfully';
}