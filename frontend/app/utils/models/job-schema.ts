import {z} from "zod/v4";

/**
 * Zod schema for a Job object.
 *
 * Validates job data before database operations. Each field mirrors the job table schema.
 */
export const JobSchema = z.object({
    jobId: z.uuidv7('Please provide a valid uuid7 for jobId'),
    jobProfileId: z.uuidv7('Please provide a valid uuid7 for jobProfileId'),
    jobAppliedOn: z.coerce.date('Please provide a valid date')
    .nullable(),
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
export type Job = z.infer<typeof JobSchema>
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
