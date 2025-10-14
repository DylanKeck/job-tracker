import RecentApplications from "~/components/RecentApplications";
import type {Route} from "../../.react-router/types/app/routes/+types/dashboard";
import {getJobLoaderData} from "~/utils/loaders/job-loader";
import UpcomingReminders from "~/components/UpcomingReminders";
import {getReminderLoaderData} from "~/utils/loaders/reminder-loader";
import {getSession} from "~/utils/session.server";
import {redirect} from "react-router";


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
    if (!session.has("profile")) {
        return redirect("/login");
    }
   const [jobData, reminderData] = await Promise.all([
         getJobLoaderData(request),
         getReminderLoaderData(request),
        ]);
    return {
        jobs: jobData.jobs,
        reminders: reminderData.reminders};
}

/**
 * Dashboard component displays a welcome message and recent job applications.
 *
 * @param {Route.ComponentProps} props - Contains loaderData with jobs array.
 * @returns {JSX.Element} The dashboard UI.
 */
export default function Dashboard({loaderData}: Route.ComponentProps) {
    // Destructure jobs from loaderData
    const {jobs, reminders} = loaderData
    return (
        <>
            <div className="flex flex-col items-center justify-center min-h-screen py-2">
                <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
                <p className="text-lg">Welcome to your dashboard!</p>
            </div>
            <UpcomingReminders reminders={reminders} />
            {/* Render recent job applications */}
            <RecentApplications jobs={jobs}/>
        </>
    );
}