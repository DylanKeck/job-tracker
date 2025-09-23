import type {Job} from "~/utils/types/job";

export default function Jobs({jobs}: {jobs: Job[]}) {
    return (
        <div>
            <h2>My Jobs</h2>
            <table>
                <thead>
                <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Date Applied</th>
                    <th>Status</th>
                </tr>
                </thead>
                <tbody>
                {jobs.map((job) => (
                    <tr key={job.jobId}>
                        <td>{job.jobRole}</td>
                        <td>{job.jobCompany}</td>
                        <td>{job.jobAppliedOn?.toString()}</td>
                        <td>{job.jobStatus}</td>
                    </tr>)
                )}
                </tbody>
            </table>
        </div>
    )
}