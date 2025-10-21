import type {Route} from "../../.react-router/types/app/+types/root";
import {getSession} from "~/utils/session.server";
import {Link, redirect} from "react-router";
import {JobSchema} from "~/utils/models/job-schema";
import type {Job} from "~/utils/models/job-schema";
import StatusBadge from "~/components/StatusBadege";
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


function formatSalary(min?: number | null, max?: number | null) {
    if (min == null && max == null) return "—";
    if (min != null && max != null) return `$${min.toLocaleString()} – $${max.toLocaleString()}`;
    if (min != null) return `from $${min.toLocaleString()}`;
    return `up to $${(max as number).toLocaleString()}`;
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
        <div className="mx-auto max-w-7xl px-6 py-8">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-semibold text-white">My Jobs</h1>
                    <p className="text-slate-400 text-sm">Track all your applications in one place</p>
                </div>
                <Link
                    to="/add-job"
                    className="inline-flex items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2 text-sm font-medium text-white transition"
                >
                    + Add a new job
                </Link>
            </div>

            {/* Empty state */}
            {!jobs || jobs.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
                    <p className="text-slate-300">No jobs yet.</p>
                    <Link
                        to="/add-job"
                        className="mt-4 inline-flex items-center justify-center rounded-lg bg-violet-600 hover:bg-violet-500 px-4 py-2 text-sm font-medium text-white transition"
                    >
                        Add your first job
                    </Link>
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse text-left text-sm">
                            <thead className="bg-slate-800/50 text-slate-300 text-xs uppercase tracking-wide">
                            <tr>
                                <th className="px-4 py-3 font-medium">Job Role</th>
                                <th className="px-4 py-3 font-medium">Company</th>
                                <th className="px-4 py-3 font-medium">Location</th>
                                <th className="px-4 py-3 font-medium">Salary</th>
                                <th className="px-4 py-3 font-medium">Date Applied</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                            {jobs.map((job: Job) => (
                                <tr key={job.jobId} className="hover:bg-slate-800/60 transition">
                                    <td className="px-4 py-3">
                                        <Link
                                            to={`job-details?id=${job.jobId}`}
                                            className="text-white hover:underline underline-offset-2"
                                        >
                                            {job.jobRole}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-slate-300">{job.jobCompany}</td>
                                    <td className="px-4 py-3 text-slate-300">{job.jobLocation || "—"}</td>
                                    <td className="px-4 py-3 text-slate-300">
                                        {formatSalary(job.jobSalaryMin as number | null, job.jobSalaryMax as number | null)}
                                    </td>
                                    <td className="px-4 py-3 text-slate-400">
                                        {job.jobAppliedOn?.toLocaleDateString() }
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={job.jobStatus as string} />
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            to={`job-details?id=${job.jobId}`}
                                            className="text-violet-400 hover:text-violet-300 text-xs underline-offset-2 hover:underline"
                                        >
                                            View →
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );

}