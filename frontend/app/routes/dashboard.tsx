import RecentApplications from "~/components/RecentApplications";
import type {Route} from "../../.react-router/types/app/routes/+types/dashboard";
import {getJobLoaderData} from "~/utils/loaders/job-loader";
import UpcomingReminders from "~/components/UpcomingReminders";
import {getReminderLoaderData} from "~/utils/loaders/reminder-loader";
import {getSession} from "~/utils/session.server";
import {redirect} from "react-router";
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
   const [jobData, reminderData] = await Promise.all([
         getJobLoaderData(request),
         getReminderLoaderData(request),
        ]);
    return {
        jobs: jobData.jobs,
        reminders: reminderData.reminders,
    allJobs};
}

/**
 * Dashboard component displays a welcome message and recent job applications.
 *
 * @param {Route.ComponentProps} props - Contains loaderData with jobs array.
 * @returns {JSX.Element} The dashboard UI.
 */
export default function Dashboard({loaderData}: Route.ComponentProps) {
    // Destructure jobs from loaderData
    const {jobs, reminders, allJobs} = loaderData

    const interviewCount = allJobs.filter(job => job.jobStatus === 'Interview').length;
    const offerCount = allJobs.filter(job => job.jobStatus === 'Offer').length;
    const successRate = allJobs.length > 0 ? ((offerCount / allJobs.length) * 100).toFixed(2) : '0.00';



    return (
        <>
            <div className="flex flex-col items-center justify-center min-h-screen py-2">
                <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
                <p className="text-lg">Welcome to your dashboard!</p>
                <KPI label="Total Applied" value={allJobs.length} accent="violet" />
                <KPI label="Interviews" value={interviewCount} accent="amber" />
                <KPI label="Offers" value={offerCount} accent="emerald" />
                <KPI label="success Rate" value={successRate} accent="violet" />
                <ApplicationsChart data={jobs} />
                <UpcomingReminders reminders={reminders} />
                {/* Render recent job applications */}
                <RecentApplications jobs={jobs}/>
            </div>

        </>
    );
}