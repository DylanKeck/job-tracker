import {getSession} from "~/utils/session.server";
import {redirect} from "react-router";
import {JobSchema} from "~/utils/models/job-schema";

export async function getJobLoaderData(request: Request) {
    const session = await getSession(
        request.headers.get("Cookie")
    )
    if (!session.has("profile")) {
        return redirect("/login");
    }
    const profile = session.data.profile
    const profileId = profile?.profileId

    const requestHeaders = new Headers()
    requestHeaders.append("Content-Type", "application/json")
    requestHeaders.append("Authorization", session.data?.authorization || "")
    const cookies = request.headers.get("Cookie")
    if (cookies) {
        requestHeaders.append("Cookie", cookies)
    }
    const jobsFetch = await fetch(`${process.env.REST_API_URL}/job/recentJobs/${profileId}`,
        {headers: requestHeaders}
    ).then(res => res.json())
    const jobs = JobSchema.array().parse(jobsFetch.data || [])
    return {jobs}
}