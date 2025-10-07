import {Form, redirect, useFetcher, useNavigation, useSubmit} from "react-router";
import type {Route} from "../../.react-router/types/app/+types/root";
import {getSession} from "~/utils/session.server";
import {useEffect, useRef, useState} from "react";
import EditJob from "~/components/EditJob";
import {JobAndJobNoteSchema} from "~/utils/models/job-schema";
import {v7 as uuidv7} from "uuid";


/**
 * Loader function for the JobDetail route.
 * Fetches job and job note data for the given job ID and user session.
 * Redirects to login if session is missing, or to jobs if jobId is missing.
 *
 * @param {Route.LoaderArgs} args - Contains params and request for session and job data loading.
 * @returns {Promise<object>} The job and job note data for rendering.
 */
export async function loader({params, request}: Route.LoaderArgs) {
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

    // Get jobId from URL search params
    const url = new URL(request.url);
    const jobId = url.searchParams.get("id");
    if (!jobId) {
        // Redirect if jobId is missing
        return redirect("/jobs");
    }
    // Fetch job and note data from backend
    const jobFetch = await fetch(`${process.env.REST_API_URL}/job/jobAndNote/${jobId}`,
        {headers: requestHeaders})
        .then(res => res.json())
    // Validate and parse job data
    const job = JobAndJobNoteSchema.parse(jobFetch.data)
    return {job}
}

/**
 * Action function for the JobDetail route.
 * Handles adding a job note or updating job details based on form data.
 *
 * @param {Route.ActionArgs} args - Contains the request object for form data and headers.
 * @returns {Promise<object|Response>} Success message, error, or redirect.
 */
export async function action({request}: Route.ActionArgs) {
    // Retrieve user session
    const session = await getSession(
        request.headers.get("Cookie")
    )
    // Parse form data
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    console.log(data)
    // Get jobId from URL search params
    const url = new URL(request.url)
    const jobId = url.searchParams.get("id");
    if (!jobId) {
        // Redirect if jobId is missing
        return redirect("/jobs");
    }
    // Prepare request headers for API call
    const requestHeaders = new Headers()
    requestHeaders.append('Content-Type', 'application/json')
    requestHeaders.append('Authorization', session.data?.authorization || '')
    const cookie = request.headers.get('Cookie')
    if (cookie) {
        requestHeaders.append('Cookie', cookie)
    }
    // Handle adding a job note
    if (data.jobNoteText) {
        const jobNote = {
            jobNoteText: data.jobNoteText,
            jobNoteJobId: jobId,
            jobNoteCreatedAt: null,
            jobNoteId: uuidv7()
        }
        const response = await fetch(`${process.env.REST_API_URL}/job/jobNotes/${jobId}`, {
            method: 'POST',
            headers: requestHeaders,
            body: JSON.stringify(jobNote)
        })
        if(!response.ok) {
            // Error adding job note
            throw new Error('Failed to add job note')
        }
        return {success: true, message: 'Job note added', status: 200};
    }
    // Handle updating job details
    if (data.jobRole) {
        const job = {
            jobRole: data.jobRole,
            jobCompany: data.jobCompany,
            jobLocation: data.jobLocation,
            jobSalaryMin: data.jobSalaryMin,
            jobSalaryMax: data.jobSalaryMax,
            jobAppliedOn: data.jobAppliedOn,
            jobStatus: data.jobStatus,
            jobPostingUrl: data.jobPostingUrl,
            jobSource: data.jobSource,
            jobUpdatedAt: null,
            jobId: jobId,
            jobProfileId: session.data.profile?.profileId,
            jobCreatedAt: null
        }
        const response = await fetch(`${process.env.REST_API_URL}/job/updateJob/${jobId}`, {
            method: 'PUT',
            headers: requestHeaders,
            body: JSON.stringify(job)
        })
        const fetchData = await response.json()
        if(!response.ok) {
            // Error updating job
            throw new Error('Failed to update job note')
        }
        return {success: true, message: fetchData.message, status: 200};
    }
    // Redirect if session is missing
    const profileId = session.data.profile?.profileId
    if (!profileId) {
        return redirect("/login");
    }
}

/**
 * JobDetail component displays job details, allows editing, and adding/updating notes.
 * Handles UI state for edit mode and note addition, and submits data via forms.
 *
 * @param {Route.ComponentProps} props - Contains loaderData with job and job note info.
 * @returns {JSX.Element} The rendered job detail UI.
 */
export default function JobDetail({loaderData}: Route.ComponentProps) {
    // Destructure job from loaderData
    const {job} = loaderData as any;
    // State for edit mode, note addition, and note text
    const [editMode, setEditMode] = useState(false);
    const [addingNote, setAddingNote] = useState(false);
    const [noteText, setNoteText] = useState(job.jobNoteText || "");
    const fetcher = useFetcher()
    const navigation = useNavigation();
    const wasSubmitting = useRef(false);

    // Effect to close edit mode after submit completes
    useEffect(() => {
        if (navigation.state === "submitting") wasSubmitting.current = true;
        if (wasSubmitting.current && navigation.state === "idle") {
            setEditMode(false);        // ✅ close only after submit completes
            wasSubmitting.current = false;
        }
    }, [navigation.state, setEditMode]);

    const submit = useSubmit()
    return (
        <div>
            {/* Job title and company */}
            <h2>{job.jobRole}, {job.jobCompany}</h2>
            <div>
            {/* Edit and Add Note buttons */}
            <button onClick={() => setEditMode(true)}>Edit Job</button>
            <button onClick={() => setAddingNote(true)}>Add Note</button>
            </div>
            {/* Add note form if no note exists */}
            {addingNote && !job.jobNoteId && (
                <Form method="post" encType="multipart/form-data" id="addJobNote">
                    <input
                    type="text"
                    name="jobNoteText"
                    placeholder="Enter note"
                    defaultValue={job.jobNoteText || ""}
                    />
                    <button onClick={() => setAddingNote(false)} type="submit">Add Note</button>
                </Form>
            )
            }
            {/* Update note form if note exists */}
            {addingNote && job.jobNoteId && (
                <Form method="put">
                    <input
                        type="text"
                        name="jobNoteText"
                        placeholder="Enter note"
                        defaultValue={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                    />
                    <input type="hidden" name="jobNoteId" defaultValue={job.jobNoteId} />
                    <button onClick={() => {
                        // Submit updated job note
                        const jobNote = {
                            jobNoteId: job.jobNoteId,
                            jobNoteText: noteText,
                            jobNoteCreatedAt: job.jobNoteCreatedAt,
                            jobNoteJobId: job.jobNoteJobId
                        }
                        fetcher.submit(jobNote, {
                            method: 'put',
                        action: "/api/update-job-note",
                        encType: "application/json"})
                        setAddingNote(false)
                    }} type="submit">Update Note</button>
                </Form>

            )}
            {/* Edit job form if in edit mode */}
            {editMode ? (
                <div>
                <EditJob job={job} />

                </div>
            ) : (
            <div>
                {/* Job details display */}
                <p>Location: {job.jobLocation}</p>
                <p>Salary: {job.jobSalaryMin} - {job.jobSalaryMax}</p>
                <p>{job.jobAppliedOn.toLocaleDateString()}</p>
                <p>Status: {job.jobStatus}</p>
                <a href={job.jobPostingUrl} target="_blank" rel="noopener noreferrer">Job Posting</a>
                <p>Source: {job.jobSource}</p>
                {/* Display job note if exists */}
                {job.jobNoteId && (
                <p>Notes: {job.jobNoteText} {job.jobNoteCreatedAt.toLocaleDateString()}</p>
                )}
            </div>

            )}
        </div>
    )
}