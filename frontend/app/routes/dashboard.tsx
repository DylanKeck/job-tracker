import RecentApplications from "~/components/RecentApplications";
import type {Route} from "../../.react-router/types/app/routes/+types/dashboard";
import {getJobLoaderData} from "~/utils/loaders/job-loader";


export async function loader({request}: Route.LoaderArgs) {
    return await getJobLoaderData(request)

}
export default function Dashboard({loaderData}: Route.ComponentProps) {
    const {jobs} = loaderData
    return (
        <>
            <div className="flex flex-col items-center justify-center min-h-screen py-2">
                <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
                <p className="text-lg">Welcome to your dashboard!</p>
            </div>
            <RecentApplications jobs={jobs}/></>
    );
}