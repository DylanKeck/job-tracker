import {Form} from "react-router";
import type {Job} from "~/utils/types/job";

type Props = {
    job?: Partial<Job>
}

export default function EditJob({job = {}}: Props) {
    return (

        <>
            <Form method="POST" encType="multipart/form-data" id="addJob">
                <input type="text"
                       name="jobRole"
                       placeholder="Job Role"
                          defaultValue={job.jobRole || ''}
                />
                <input
                    type="text"
                    name="jobCompany"
                    placeholder="Company Name"
                    defaultValue={job.jobCompany || ''}
                />
                <input
                    type="text"
                    name="jobLocation"
                    placeholder="Location"
                    defaultValue={job.jobLocation || ''}
                />
                <input
                    type="url"
                    name="jobPostingUrl"
                    placeholder="Job Posting URL"
                    defaultValue={job.jobPostingUrl || ''}
                />
                <input
                    type="datetime-local"
                    name="jobAppliedOn"
                    placeholder="Date Applied"
                    defaultValue={job.jobAppliedOn || ''}

                />
                <input
                    type="number"
                    name="jobSalaryMin"
                    placeholder="Minimum Salary"
                    defaultValue={job.jobSalaryMin || ''}
                />
                <input
                    type="number"
                    name="jobSalaryMax"
                    placeholder="Maximum Salary"
                    defaultValue={job.jobSalaryMax || ''}
                />
                <input
                    type="text"
                    name="jobSource"
                    defaultValue={job.jobSource || ''}
                    placeholder="Job Source"
                />
                <select
                    name="jobStatus"
                    defaultValue={job.jobStatus || 'Saved'}
                >
                    <option value="Applied">Applied</option>
                    <option value="Interviw">Interviewing</option>
                    <option value="Offer">Offered</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Saved">Saved</option>
                </select>
                <button type="submit">{job?.jobId ? "Update Job" : "Add Job"}</button>
            </Form>
        </>
    )
}