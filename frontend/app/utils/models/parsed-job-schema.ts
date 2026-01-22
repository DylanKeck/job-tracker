import {z} from "zod/v4";

export const ParsedJobSchema = z.object({
    sourceUrl: z.string().url(),

    // maps nicely to your `job` table
    title: z.string().nullable(),     // → job_role
    company: z.string().nullable(),   // → job_company
    location: z.string().nullable(),  // → job_location
    source: z.string().nullable(),    // → job_source (LinkedIn, Indeed, etc.)

    salaryMin: z.number().nullable(), // → job_salary_min
    salaryMax: z.number().nullable(), // → job_salary_max

    // extra AI/future fields – stored in job_parsed JSONB
    employmentType: z.string().nullable(), // Full-time, Contract, etc.
    remoteType: z.string().nullable(),     // Remote, Hybrid, On-site
    seniority: z.string().nullable(),      // Junior/Mid/Senior

    techStack: z.array(z.string()),        // ["React", "Node", ...]
    keywords: z.array(z.string()),         // ["React", "TypeScript", "REST"]

    descriptionRaw: z.string().nullable(), // cleaned job description
    responsibilities: z.array(z.string()), // bullet-like lines
    qualifications: z.array(z.string()),   // requirements

    rawPageText: z.string().nullable(),    // whole page text for AI prompts
});

export type ParsedJob = z.infer<typeof ParsedJobSchema>;