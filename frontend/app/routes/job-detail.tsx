import {Form, redirect, useFetcher, useSubmit} from "react-router";
import type {Route} from "../../.react-router/types/app/+types/root";
import {getSession} from "~/utils/session.server";
import {useState} from "react";
import EditJob from "~/components/EditJob";
import {JobAndJobNoteSchema} from "~/utils/models/job-schema";

export async function loader({params, request}: Route.LoaderArgs) {
    const session = await getSession(
        request.headers.get("Cookie")
    )
    const profileId = session.data.profile?.profileId
    if (!profileId) {
        return redirect("/login");
    }

    const requestHeaders = new Headers();
    requestHeaders.append("Content-Type", "application/json");
    requestHeaders.append("Authorization", session.data?.authorization || "");
    const cookie = request.headers.get("Cookie");
    if (cookie) {
        requestHeaders.append("Cookie", cookie);
    }

    const url = new URL(request.url);
    const jobId = url.searchParams.get("id");
    if (!jobId) {
        return redirect("/jobs");
    }
    const jobFetch = await fetch(`${process.env.REST_API_URL}/job/jobAndNote/${jobId}`,
        {headers: requestHeaders})
        .then(res => res.json())
    const job = JobAndJobNoteSchema.parse(jobFetch.data);
    return {job}
}

export async function action({request}: Route.ActionArgs) {
    const session = await getSession(
        request.headers.get("Cookie")
    )
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    const url = new URL(request.url)
    const jobId = url.searchParams.get("id");
    if (!jobId) {
        return redirect("/jobs");
    }
    const requestHeaders = new Headers()
    requestHeaders.append('Content-Type', 'application/json')
    requestHeaders.append('Authorization', session.data?.authorization || '')
    const cookie = request.headers.get('Cookie')
    if (cookie) {
        requestHeaders.append('Cookie', cookie)
    }
    if (data.jobNoteBody) {
        const response = await fetch(`${process.env.REST_API_URL}/job/jobNotes/${jobId}`, {
            method: 'POST',
            headers: requestHeaders,
            body: JSON.stringify(data)
        })
    }
    const profileId = session.data.profile?.profileId
    if (!profileId) {
        return redirect("/login");
    }
}

export default function JobDetail({loaderData}: Route.ComponentProps) {
    const {job} = loaderData as any;
    const [editMode, setEditMode] = useState(false);
    const [addingNote, setAddingNote] = useState(false);
    const [noteText, setNoteText] = useState(job.jobNoteText || "");
    const fetcher = useFetcher()
    const submit = useSubmit()
    return (
        <div>
            <h2>{job.jobRole}, {job.jobCompany}</h2>
            <div>
            <button onClick={() => setEditMode(true)}>Edit Job</button>
            <button onClick={() => setAddingNote(true)}>Add Note</button>
            </div>
            {addingNote && !job.jobNoteId && (
                <Form method="post">
                    <input
                    type={"text"}
                    name={"jobNoteText"}
                    placeholder={"Enter note"}
                    defaultValue={job.jobNoteText || ""}
                    />
                </Form>
            )
            }
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
            {editMode ? (
                <div>
                <EditJob job={job} />
                </div>
            ) : (
            <div>
                <p>Location: {job.jobLocation}</p>
                <p>Salary: {job.jobSalaryMin} - {job.jobSalaryMax}</p>
                <p>{job.jobAppliedOn.toLocaleDateString()}</p>
                <p>Status: {job.jobStatus}</p>
                <a href={job.jobPostingUrl} target="_blank" rel="noopener noreferrer">Job Posting</a>
                <p>Source: {job.jobSource}</p>
                {job.jobNoteId && (
                <p>Notes: {job.jobNoteText} {job.jobNoteCreatedAt.toLocaleDateString()}</p>
                )}
            </div>

            )}
        </div>
    )
}