import type {Route} from "../../.react-router/types/app/+types/root";
import {getSession} from "~/utils/session.server";
import {Link, redirect} from "react-router";
import {JobSchema} from "~/utils/models/job-schema";
import type {Job} from "~/utils/models/job-schema";
/**
 * Loader function for the Jobs route.
 * Fetches all jobs for the current user profile from the backend API.
 * Redirects to login if session/profile is missing.
 *
 * @param {Route.LoaderArgs} args - Contains the request object for session and data loading.
 * @returns {Promise<{jobs: Job[]}>} The jobs array for rendering.
 */
export async function loader ({request}: Route.LoaderArgs) {
    // Retrieve user session
    const session = await getSession(
        request.headers.get("Cookie")
    )
    const profileId = session.data.profile?.profileId
    if (!profileId) {
        // Redirect if not logged in
        return redirect("/login");
    }
    // Prepare request headers for API call
    const requestHeaders = new Headers();
    requestHeaders.append("Content-Type", "application/json");
    requestHeaders.append("Authorization", session.data?.authorization || "");
    const cookie = request.headers.get("Cookie");
    if (cookie) {
        requestHeaders.append("Cookie", cookie);
    }

    // Fetch jobs for the profile from backend
    const profileJobsFetch = await fetch(`${process.env.REST_API_URL}/job/${profileId}`,
    {headers: requestHeaders}
    ).then(res => res.json());
    // Validate and parse jobs data
    const jobs = JobSchema.array().parse(profileJobsFetch.data);
    return {jobs};
}

/**
 * Jobs component displays a table of all jobs for the current user.
 * Allows navigation to job details and adding a new job.
 *
 * @param {Route.ComponentProps} props - Contains loaderData with jobs array.
 * @returns {JSX.Element} The rendered jobs table UI.
 */
export default function Jobs({loaderData}: Route.ComponentProps) {
    // Destructure jobs from loaderData
    // @ts-ignore
    const {jobs} = loaderData
    return (
        <div>
            <h2>My Jobs</h2>
            {/* Link to add a new job */}
            <a href="/add-job">Add a new job</a>
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
                {/* Render each job row */}
                {jobs.map((job: Job) => (
                    <tr key={job.jobId}>
                        <td>
                            {/* Link to job details page */}
                            <Link to={`job-details?id=${job.jobId}`}>{job.jobRole}</Link>
                        </td>
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