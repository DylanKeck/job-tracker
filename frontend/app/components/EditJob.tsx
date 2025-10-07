import {Form} from "react-router";
import type {Job} from "~/utils/types/job";

type Props = {
    job?: Partial<Job>
}

/**
 * Formats a date string for use in a datetime-local input field.
 * Converts a string to 'YYYY-MM-DDTHH:mm' format required by HTML input.
 *
 * @param {string | null | undefined} dateString - The date string to format.
 * @returns {string} The formatted date string or empty string if invalid.
 */
function formatDateForInput(dateString?: string | null) {
    if (!dateString) return "";
    const date = new Date(dateString);

    // Get YYYY-MM-DD and HH:mm parts
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

/**
 * EditJob component renders a form for creating or editing a job entry.
 * Accepts an optional job prop to pre-fill form fields for editing.
 *
 * @param {Props} props - Contains optional job object for editing.
 * @returns {JSX.Element} The rendered job form UI.
 */
export default function EditJob({job = {}}: Props) {
    return (

        <>
            {/* Job form for add or update */}
            <Form method="POST" encType="multipart/form-data" id="addJob">
                {/* Job Role input */}
                <input type="text"
                       name="jobRole"
                       placeholder="Job Role"
                       defaultValue={job.jobRole ?? ''}
                />
                {/* Company Name input */}
                <input
                    type="text"
                    name="jobCompany"
                    placeholder="Company Name"
                    defaultValue={job.jobCompany ?? ''}
                />
                {/* Location input */}
                <input
                    type="text"
                    name="jobLocation"
                    placeholder="Location"
                    defaultValue={job.jobLocation ?? ''}
                />
                {/* Job Posting URL input */}
                <input
                    type="url"
                    name="jobPostingUrl"
                    placeholder="Job Posting URL"
                    defaultValue={job.jobPostingUrl ?? ''}
                />
                {/* Date Applied input */}
                <input
                    type="datetime-local"
                    name="jobAppliedOn"
                    placeholder="Date Applied"
                    defaultValue={formatDateForInput(job.jobAppliedOn) ?? ''}

                />
                {/* Minimum Salary input */}
                <input
                    type="number"
                    name="jobSalaryMin"
                    placeholder="Minimum Salary"
                    defaultValue={job.jobSalaryMin ?? ''}
                />
                {/* Maximum Salary input */}
                <input
                    type="number"
                    name="jobSalaryMax"
                    placeholder="Maximum Salary"
                    defaultValue={job.jobSalaryMax ?? ''}
                />
                {/* Job Source input */}
                <input
                    type="text"
                    name="jobSource"
                    defaultValue={job.jobSource ?? ''}
                    placeholder="Job Source"
                />
                {/* Job Status select */}
                <select
                    name="jobStatus"
                    defaultValue={job.jobStatus ?? 'Saved'}
                >
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interviewing</option>
                    <option value="Offer">Offered</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Saved">Saved</option>
                </select>
                {/* Submit button changes label based on edit/add mode */}
                <button type="submit">{job?.jobId ? "Update Job" : "Add Job"}</button>
            </Form>
        </>
    )
}