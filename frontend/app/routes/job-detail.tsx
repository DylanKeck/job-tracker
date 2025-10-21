import {Form, Link, redirect, useFetcher, useNavigation, useSubmit} from "react-router";
import type {Route} from "../../.react-router/types/app/+types/root";
import {getSession} from "~/utils/session.server";
import {useEffect, useRef, useState} from "react";
import EditJob from "~/components/EditJob";
import {JobAndJobNoteSchema} from "~/utils/models/job-schema";
import {v7 as uuidv7} from "uuid";
import StatusBadge from "~/components/StatusBadege";


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
function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="grid grid-cols-3 gap-2">
            <dt className="col-span-1 text-slate-400 text-xs uppercase tracking-wide">{label}</dt>
            <dd className="col-span-2 text-slate-200 text-sm">{value}</dd>
        </div>
    );
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
        <div className="mx-auto max-w-5xl px-6 py-8">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Link to="/jobs" className="hover:text-white transition">← Back to Jobs</Link>
                    </div>
                    <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-white">
                        {job.jobRole} <span className="text-slate-400">@ {job.jobCompany}</span>
                    </h1>
                    <div className="mt-1 flex items-center gap-2">
                        <StatusBadge status={job.jobStatus} />
                        <span className="text-slate-400 text-sm">
              Applied: {job.jobAppliedOn.toLocaleDateString()}
            </span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <a
                        href={job.jobPostingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 text-sm transition"
                    >
                        View Posting
                    </a>
                    <button
                        onClick={() => setAddingNote(true)}
                        className="rounded-lg border border-amber-500/40 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-3 py-2 text-sm transition"
                    >
                        Add Note
                    </button>
                    <button
                        onClick={() => setEditMode(true)}
                        className="rounded-lg bg-violet-600 hover:bg-violet-500 text-white px-3 py-2 text-sm transition"
                    >
                        Edit Job
                    </button>
                </div>
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: details or edit form */}
                <div className="lg:col-span-2">
                    {editMode ? (
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                            <EditJob job={job} />
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-slate-800 bg-slate-900">
                            <div className="px-4 py-3 border-b border-slate-800">
                                <h2 className="text-base md:text-lg font-semibold text-white">Job Details</h2>
                            </div>
                            <div className="p-4">
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                                    <DetailRow label="Company" value={job.jobCompany} />
                                    <DetailRow label="Location" value={job.jobLocation || "—"} />
                                    <DetailRow
                                        label="Salary"
                                        value={
                                            job.jobSalaryMin || job.jobSalaryMax
                                                ? `${job.jobSalaryMin ?? "?"} – ${job.jobSalaryMax ?? "?"}`
                                                : "—"
                                        }
                                    />
                                    <DetailRow label="Applied On" value={job.jobAppliedOn.toLocaleDateString()} />
                                    <DetailRow label="Source" value={job.jobSource || "—"} />
                                    <DetailRow label="Status" value={<StatusBadge status={job.jobStatus} />} />
                                    <DetailRow
                                        label="Posting URL"
                                        value={
                                            <a
                                                href={job.jobPostingUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-violet-400 hover:text-violet-300 underline underline-offset-2 break-all"
                                            >
                                                {job.jobPostingUrl}
                                            </a>
                                        }
                                    />
                                </dl>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: notes */}
                <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900">
                        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                            <h2 className="text-base md:text-lg font-semibold text-white">Notes</h2>
                            {!addingNote && (
                                <button
                                    onClick={() => {
                                        setNoteText(job.jobNoteText || "");
                                        setAddingNote(true);
                                    }}
                                    className="text-xs rounded-md bg-slate-800 border border-slate-700 text-slate-200 px-2 py-1 hover:bg-slate-700 transition"
                                >
                                    {job.jobNoteId ? "Edit Note" : "Add Note"}
                                </button>
                            )}
                        </div>

                        <div className="p-4">
                            {/* Add note */}
                            {addingNote && !job.jobNoteId && (
                                <Form method="post" encType="multipart/form-data" id="addJobNote" className="space-y-3">
                  <textarea
                      name="jobNoteText"
                      placeholder="Enter note"
                      defaultValue={job.jobNoteText || ""}
                      className="w-full min-h-28 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-violet-600 focus:outline-none"
                  />
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setAddingNote(false)}
                                            className="rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 text-sm transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="rounded-lg bg-violet-600 hover:bg-violet-500 text-white px-3 py-2 text-sm transition"
                                        >
                                            Add Note
                                        </button>
                                    </div>
                                </Form>
                            )}

                            {/* Update note */}
                            {addingNote && job.jobNoteId && (
                                <Form method="put" className="space-y-3">
                  <textarea
                      name="jobNoteText"
                      placeholder="Enter note"
                      defaultValue={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="w-full min-h-28 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-violet-600 focus:outline-none"
                  />
                                    <input type="hidden" name="jobNoteId" defaultValue={job.jobNoteId} />
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setAddingNote(false)}
                                            className="rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 text-sm transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const payload = {
                                                    jobNoteId: job.jobNoteId,
                                                    jobNoteText: noteText,
                                                    jobNoteCreatedAt: job.jobNoteCreatedAt,
                                                    jobNoteJobId: job.jobNoteJobId,
                                                };
                                                fetcher.submit(payload, {
                                                    method: "put",
                                                    action: "/api/update-job-note",
                                                    encType: "application/json",
                                                });
                                                setAddingNote(false);
                                            }}
                                            className="rounded-lg bg-violet-600 hover:bg-violet-500 text-white px-3 py-2 text-sm transition"
                                        >
                                            Update Note
                                        </button>
                                    </div>
                                </Form>
                            )}

                            {/* Read-only note */}
                            {!addingNote && job.jobNoteId && (
                                <div className="rounded-lg bg-slate-950 border border-slate-800 p-3">
                                    <div className="text-slate-200 whitespace-pre-wrap">{job.jobNoteText}</div>
                                    <div className="text-slate-500 text-xs mt-2">
                                        Added: {job.jobNoteCreatedAt.toLocaleDateString()}
                                    </div>
                                </div>
                            )}

                            {/* No note yet */}
                            {!addingNote && !job.jobNoteId && (
                                <div className="text-slate-400 text-sm">
                                    No notes yet. Click <span className="text-slate-200">“Add Note”</span> to attach one.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Danger zone (optional delete) */}
                    <div className="rounded-2xl border border-rose-900 bg-rose-950/30 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-semibold text-rose-300">Danger Zone</h3>
                                <p className="text-xs text-rose-200/70">Delete this job and its notes</p>
                            </div>
                            <Form method="post" action={`/jobs/delete?id=${job.jobId}`}>
                                <button
                                    type="submit"
                                    className="rounded-lg border border-rose-900 bg-rose-900/40 hover:bg-rose-900/60 text-rose-200 px-3 py-2 text-xs transition"
                                >
                                    Delete Job
                                </button>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )
}