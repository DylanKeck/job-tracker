import type {Job} from "~/utils/types/job";

export default function RecentApplications({jobs}: {jobs: Job[]}) {
    return (
        <div>
            <h2>Recent Applications</h2>
            {!jobs ?  (
                <p>No recent applications.</p>
                ):(
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

            )}
        </div>
    )
}