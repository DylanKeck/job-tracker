import {Form, redirect} from "react-router";
import type {Route} from "../../.react-router/types/app/+types/root";
import {getSession} from "~/utils/session.server";
import {v7 as uuidv7} from "uuid";

export async function action({request}: Route.ActionArgs) {
    try {
        const session = await getSession(request.headers.get("Cookie"));
        const formData = await request.formData();
        const newJob = Object.fromEntries(formData);
        const profileId = session.data.profile?.profileId;


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
console.log(newJob);
        if (!profileId) {
            return {success: false, error: "Unauthorized", status: 401};
        }

        const requestHeaders = new Headers()
        requestHeaders.append('Content-Type', 'application/json')
        requestHeaders.append('Authorization', session.data?.authorization || '')
        const cookie = request.headers.get('Cookie')
        if (cookie) {
            requestHeaders.append('Cookie', cookie)
        }

        const response = await fetch(`${process.env.REST_API_URL}/job`, {
            method: 'POST',
            headers: requestHeaders,
            body: JSON.stringify(job)
        })
        const data = await response.json();
        console.log(job)

        if (!response.ok) {
            throw new Error('Failed to create job');
        }
        if(data.status === 200){
            return redirect("/jobs");
        }
    } catch (error: any) {
        return {success: false, error: error instanceof Error ? error.message : 'Unknown error', status: 500};
    }
}

export default function AddJob() {
    return (
        <div>
            <h1 className="text-4xl font-bold mb-4">New Job</h1>
            <Form method="POST" encType="multipart/form-data" id="addJob">
                <input type="text"
                name="jobRole"
                placeholder="Job Role"
                />
                <input
                type="text"
                name="jobCompany"
                placeholder="Company Name"
                />
                <input
                type="text"
                name="jobLocation"
                placeholder="Location"
                />
                <input
                type="url"
                name="jobPostingUrl"
                placeholder="Job Posting URL"
                />
                <input
                    type="datetime-local"
                    name="jobAppliedOn"
                    placeholder="Date Applied"
                />
                <input
                type="number"
                name="jobSalaryMin"
                placeholder="Minimum Salary"
                />
                <input
                type="number"
                name="jobSalaryMax"
                placeholder="Maximum Salary"
                />
                <input
                type="text"
                name="jobSource"
                placeholder="Job Source"
                />
                <select
                name="jobStatus"
                defaultValue="Saved"
                >
                    <option value="Applied">Applied</option>
                    <option value="Interviw">Interviewing</option>
                    <option value="Offer">Offered</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Saved">Saved</option>
                </select>
                <button type="submit">Add Job</button>
            </Form>
        </div>
    )
}