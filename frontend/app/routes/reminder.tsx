import type {Route} from "../../.react-router/types/app/+types/root";
import {getSession} from "~/utils/session.server";
import {Form, redirect, useNavigation} from "react-router";
import {useEffect, useRef, useState} from "react";
import type {Job} from "~/utils/types/job";
import {JobSchema} from "~/utils/models/job-schema";
import {ReminderSchema, type Reminder} from "~/utils/models/reminder-schema";
import {v7 as uuidv7} from "uuid";

export async function loader({request}: Route.LoaderArgs) {
    const session = await getSession(
        request.headers.get("Cookie")
    )
    const profileId = session.data.profile?.profileId
    if (!profileId) {
        return redirect("/login");
    }
    const requestHeaders = new Headers()
    requestHeaders.append('Content-Type', 'application/json')
    requestHeaders.append('Authorization', session.data?.authorization || '')
    const cookie = request.headers.get('Cookie')
    if (cookie) {
        requestHeaders.append('Cookie', cookie)
    }
    const reminderFetch = await fetch(`${process.env.REST_API_URL}/reminder/${profileId}`,
        {headers: requestHeaders}).then(res => res.json())
    const reminders = ReminderSchema.array().parse(reminderFetch.data)
    const jobFetch = await fetch(`${process.env.REST_API_URL}/job/${profileId}`,
        {headers: requestHeaders}).then(res => res.json())
    const jobs = JobSchema.array().parse(jobFetch.data)
    return {reminders, jobs}
}

export async function action({request}: Route.ActionArgs) {

    const session = await getSession(request.headers.get("Cookie"));

    const formData = await request.formData()
    const reminder = Object.fromEntries(formData)
    const reminderObject = {
        reminderId: uuidv7(),
        reminderJobId: reminder.reminderJobId,
        reminderLabel: reminder.reminderLabel,
        reminderAt: reminder.reminderAt,
        reminderDone: false,
        reminderCreatedAt: null
    }
    const requestHeaders = new Headers()
    requestHeaders.append('Content-Type', 'application/json')
    requestHeaders.append('Authorization', session.data?.authorization || '')
    const cookie = request.headers.get('Cookie')
    if (cookie) {
        requestHeaders.append('Cookie', cookie)
    }
    const response = await fetch(`${process.env.REST_API_URL}/reminder`, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(reminderObject)
    })
    const data = await response.json()
    if (!response.ok) {
        throw new Error('Failed to add reminder')
    }
}


export default function Reminder({loaderData}: Route.ComponentProps) {
    const {reminders, jobs} = loaderData as any
    const [addReminder, setAddReminder] = useState(false)
    const[editReminder, setEditReminder] = useState(false)
    const [selectedJob, setSelectedJob] = useState<string>("")
    const reminderJobs = reminders.map((reminder: Reminder) =>
        jobs.find((job: Job) => job.jobId === reminder.reminderJobId)
    );
    const navigation = useNavigation();
    const wasSubmitting = useRef(false);

    // Effect to close edit mode after submit completes
    useEffect(() => {
        if (navigation.state === "submitting") wasSubmitting.current = true;
        if (wasSubmitting.current && navigation.state === "idle") {
            setAddReminder(false);        // ✅ close only after submit completes
            wasSubmitting.current = false;
        }
    }, [navigation.state, setAddReminder]);
    return (
        <>
            <h1>Reminders</h1>
            <button onClick={() => setAddReminder(true)}>Add Reminder</button>
            {addReminder && (
                <Form method="post" id="reminderForm">
                    <input
                        type="text"
                        name="reminderLabel"
                        placeholder="Reminder Label"
                        required
                    />
                    <input
                        type="datetime-local"
                        name="reminderAt"
                        placeholder="Reminder At"
                        required
                    />
                    <select
                        name="reminderJobId"
                        value={selectedJob}
                        onChange={(e) => setSelectedJob(e.target.value)}
                        required
                    >
                        <option value="" disabled>Select a job</option>
                        {jobs.map((job: Job) => (
                            <option id="selectedItem" key={job.jobId} value={job.jobId}>
                                {job.jobRole} at {job.jobCompany}
                            </option>
                        ))}
                    </select>
                    <button type="submit">Add Reminder</button>
                </Form>
            )}
            <div>
                {reminders.map((reminder: Reminder) => (
                    <ul key={reminder.reminderId}>
                        <li>{reminder.reminderLabel}</li>
                        <li>{reminder.reminderAt.toLocaleDateString()}</li>
                        <li>{reminder.reminderDone}</li>
                        <li>For {reminderJobs[0].jobRole} at {reminderJobs[0].jobCompany}</li>
                        <button onClick={() => setEditReminder(true)}>Edit Reminder</button>
                    </ul>
                ))}
            </div>
            {editReminder && (
            <Form method="put" id="reminderForm">
                    <input
                        type="text"
                        name="reminderLabel"
                        placeholder="Reminder Label"
                        required
                    />
                    <input
                        type="datetime-local"
                        name="reminderAt"
                        placeholder="Reminder At"
                        required
                    />

            </Form>
            )}
        </>
    )
}