import { redirect } from "react-router";
import type {Route} from "../../.react-router/types/app/+types/root";
import {getSession} from "~/utils/session.server";

export async function loader({params, request}: Route.LoaderArgs) {
    const session = await getSession(
        request.headers.get("Cookie")
    )
    const profileId = session.data.profile?.profileId
    if (!profileId) {
        return redirect("/login");
    }
    const url = new URL(request.url);
    const jobId = url.searchParams.get("id");
    if (!jobId) {
        return redirect("/jobs");
    }
    const jobFetch = await fetch(`${process.env.REST_API_URL}/job/jobAndNote/${jobId}`)
    const job = await jobFetch.json();
    return {job}
}

export default function JobDetail({loaderData}: Route.ComponentProps) {
    const {job} = loaderData as any;
    return (
        <div>
            <h2></h2>
        </div>
    )
}