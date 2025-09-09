import {z} from "zod/v4";

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
    jobUpdate: z.coerce.date('Please provide a valid update'),
})
export type Job = z.infer<typeof JobSchema>;