import {Form, redirect} from "react-router";
import type {Route} from "../../.react-router/types/app/+types/root";
import {getSession} from "~/utils/session.server";
import {v7 as uuidv7} from "uuid";
import EditJob from "~/components/EditJob";

/**
 * Handles the creation of a new job entry via form submission.
 * - Retrieves user session and profile ID.
 * - Constructs job object from form data.
 * - Sends POST request to backend API to create the job.
 * - Redirects to jobs page on success.
 *
 * @param {Route.ActionArgs} args - Contains the request object for form data and headers.
 * @returns {Promise<Response|object>} Redirects on success, or returns error object on failure.
 */
export async function action({request}: Route.ActionArgs) {
    try {
        // Retrieve session and profile ID
        const session = await getSession(request.headers.get("Cookie"));
        const formData = await request.formData();
        const newJob = Object.fromEntries(formData);
        const profileId = session.data.profile?.profileId;

        // Construct job object for API
        const job = {
            jobId: uuidv7(),
            jobProfileId: profileId,
            jobAppliedOn: newJob.jobAppliedOn,
            jobCompany: newJob.jobCompany,
            jobCreatedAt: null,
            jobLocation: newJob.jobLocation,
            jobPostingUrl: newJob.jobPostingUrl,
            jobRole: newJob.jobRole,
            jobSalaryMax: newJob.jobSalaryMax,
            jobSalaryMin: newJob.jobSalaryMin,
            jobSource: newJob.jobSource,
            jobStatus: newJob.jobStatus,
            jobUpdatedAt: null
        }
        if (!profileId) {
            // User is not authorized
            return {success: false, error: "Unauthorized", status: 401};
        }

        // Prepare request headers for API call
        const requestHeaders = new Headers()
        requestHeaders.append('Content-Type', 'application/json')
        requestHeaders.append('Authorization', session.data?.authorization || '')
        const cookie = request.headers.get('Cookie')
        if (cookie) {
            requestHeaders.append('Cookie', cookie)
        }

        // Send POST request to backend API
        const response = await fetch(`${process.env.REST_API_URL}/job`, {
            method: 'POST',
            headers: requestHeaders,
            body: JSON.stringify(job)
        })
        const data = await response.json();

        if (!response.ok) {
            // API responded with error
            throw new Error('Failed to create job');
        }
        if(data.status === 200){
            // Job created successfully, redirect to jobs page
            return redirect("/jobs");
        }
    } catch (error: any) {
        // Handle unexpected errors
        return {success: false, error: error instanceof Error ? error.message : 'Unknown error', status: 500};
    }
}

/**
 * Renders the AddJob page with a form for creating a new job.
 * Uses the EditJob component for job input fields.
 */
export default function AddJob() {
    return (
        <>
            <h1 className="text-4xl font-bold mb-4">New Job</h1>
           {/* EditJob component renders the job form */}
           <EditJob  />
        </>
    )
}