import type {Route} from "../../.react-router/types/app/+types/root";
import {getSession} from "~/utils/session.server";
import {redirect} from "react-router";
import {JobSchema} from "~/utils/models/job-schema";
import type {Job} from "~/utils/models/job-schema";
export async function loader ({request}: Route.LoaderArgs) {
    const session = await getSession(
        request.headers.get("Cookie")
    )
    const profileId = session.data.profile?.profileId
    if (!profileId) {
        return redirect("/login");
    }
    const requestHeaders = new Headers();
    requestHeaders.append("Content-Type", "application/json");
    requestHeaders.append("Authorization", session.data?.authorization || "");
    const cookie = request.headers.get("Cookie");
    if (cookie) {
        requestHeaders.append("Cookie", cookie);
    }

    const profileJobsFetch = await fetch(`${process.env.REST_API_URL}/job/${profileId}`,
    {headers: requestHeaders}
    ).then(res => res.json());
    const jobs = JobSchema.array().parse(profileJobsFetch.data);
    return {jobs};
}

export default function Jobs({loaderData}: Route.ComponentProps) {
    // @ts-ignore
    const {jobs} = loaderData
    return (
        <div>
            <h2>My Jobs</h2>
            <table>
                <thead>
                <tr>
                    <th>Job Role</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Salary</th>
                    <th>Date Applied</th>
                    <th>Status</th>
                </tr>
                </thead>
                <tbody>
                {jobs.map((job: Job) => (
                    <tr key={job.jobId}>
                        <td>{job.jobRole}</td>
                        <td>{job.jobCompany}</td>
                        <td>{job.jobLocation}</td>
                        <td>{job.jobSalaryMin}-{job.jobSalaryMax}</td>
                        <td>{job.jobAppliedOn?.toLocaleDateString()}</td>
                        <td>{job.jobStatus}</td>
                    </tr>)
                )}
                </tbody>
            </table>
        </div>
    )
}