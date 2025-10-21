import RecentApplications from "~/components/RecentApplications";
import type {Route} from "../../.react-router/types/app/routes/+types/dashboard";
import {getJobLoaderData} from "~/utils/loaders/job-loader";
import UpcomingReminders from "~/components/UpcomingReminders";
import {getReminderLoaderData} from "~/utils/loaders/reminder-loader";
import {getSession} from "~/utils/session.server";
import {redirect, Link} from "react-router";
import KPI from "~/components/KPI";
import ApplicationsChart from "~/components/ApplicationsChart";
import {JobSchema} from "~/utils/models/job-schema";


/**
 * Loader function for the Dashboard route.
 * Fetches job data for the current user session using getJobLoaderData.
 *
 * @param {Route.LoaderArgs} args - Contains the request object for session and data loading.
 * @returns {Promise<object>} The loader data containing jobs and related info.
 */
export async function loader({request}: Route.LoaderArgs) {
    // Delegate job data loading to utility function
    const session = await getSession(
        request.headers.get("Cookie")
    )
    const profileId = session.data.profile?.profileId
    if (!session.has("profile")) {
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
    // Validate and parse jobs data
    const allJobs = JobSchema.array().parse(profileJobsFetch.data);
    const applicationDataFetch = await fetch(`${process.env.REST_API_URL}/job/${profileId}/weekly`, {
        headers: requestHeaders
    }).then(res => res.json());
    console.log(applicationDataFetch);
   const [jobData, reminderData] = await Promise.all([
         getJobLoaderData(request),
         getReminderLoaderData(request),
        ]);
    return {
        jobs: jobData.jobs,
        reminders: reminderData.reminders,
    allJobs, applicationDataFetch};
}

/**
 * Dashboard component displays a welcome message and recent job applications.
 *
 * @param {Route.ComponentProps} props - Contains loaderData with jobs array.
 * @returns {JSX.Element} The dashboard UI.
 */
export default function Dashboard({loaderData}: Route.ComponentProps) {
    // Destructure jobs from loaderData
    const {jobs, reminders, allJobs, applicationDataFetch} = loaderData

    const interviewCount = allJobs.filter(job => job.jobStatus === 'Interview').length;
    const offerCount = allJobs.filter(job => job.jobStatus === 'Offer').length;
    const successRate = allJobs.length > 0 ? ((offerCount / allJobs.length) * 100).toFixed(2) : '0.00';



    return (
        <div className="max-w-7xl mx-auto w-full px-6 py-6 grow">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-sm text-slate-400 mt-1">Overview of your job applications, reminders, and progress.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/add-job" className="hidden md:inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition">
                        + Add Job
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4">
                    <KPI label="Total Applied" value={allJobs.length} accent="violet" />
                </div>
                <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4">
                    <KPI label="Interviews" value={interviewCount} accent="amber" />
                </div>
                <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4">
                    <KPI label="Offers" value={offerCount} accent="emerald" />
                </div>
                <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4">
                    <KPI label="Success Rate" value={`${successRate}%`} accent="violet" />
                </div>
            </div>

            {/* Main grid: Chart + Reminders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-lg p-4">
                    <h2 className="text-sm text-slate-300 font-medium mb-3">Applications (Last 7 days)</h2>
                    <ApplicationsChart data={applicationDataFetch?.data || []} />
                </div>

                <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4">
                    <h2 className="text-sm text-slate-300 font-medium mb-3">Upcoming Reminders</h2>
                    <UpcomingReminders reminders={reminders} />
                </div>
            </div>

            {/* Recent applications list */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-lg p-4">
                <h2 className="text-sm text-slate-300 font-medium mb-3">Recent Applications</h2>
                <RecentApplications jobs={jobs} />
            </div>
        </div>
    );
}