export interface Job {
    jobId: string
    jobCompany: string
    jobRole: string
    jobLocation: string
    jobStatus: string
    jobPostingUrl: string
    jobSalaryMin: number | null
    jobSalaryMax: number | null
    jobAppliedOn: string | null
    jobSource: string

}