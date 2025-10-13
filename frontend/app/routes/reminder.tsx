import type {Route} from "../../.react-router/types/app/+types/root";
import {getSession} from "~/utils/session.server";
import {Form, redirect, useFetcher, useNavigation} from "react-router";
import {useEffect, useRef, useState} from "react";
import type {Job} from "~/utils/types/job";
import {JobSchema} from "~/utils/models/job-schema";
import {ReminderSchema, type Reminder} from "~/utils/models/reminder-schema";
import {v7 as uuidv7} from "uuid";
import ReminderItem from "~/components/ReminderItem";

/**
 * Loader for reminders route.
 * Fetches reminders and jobs for the authenticated user.
 * Redirects to login if no profileId is found in session.
 * @param {Route.LoaderArgs} args - Loader arguments containing the request.
 * @returns {Promise<{reminders: Reminder[], jobs: Job[]}>}
 */
export async function loader({request}: Route.LoaderArgs) {
    // Get session and profileId from cookies
    const session = await getSession(
        request.headers.get("Cookie")
    )
    const profileId = session.data.profile?.profileId
    if (!profileId) {
        // Redirect to login if not authenticated
        return redirect("/login");
    }
    // Prepare headers for API requests
    const requestHeaders = new Headers()
    requestHeaders.append('Content-Type', 'application/json')
    requestHeaders.append('Authorization', session.data?.authorization || '')
    const cookie = request.headers.get('Cookie')
    if (cookie) {
        requestHeaders.append('Cookie', cookie)
    }
    // Fetch reminders and jobs from REST API
    const reminderFetch = await fetch(`${process.env.REST_API_URL}/reminder/${profileId}`,
        {headers: requestHeaders}).then(res => res.json())
    const reminders = ReminderSchema.array().parse(reminderFetch.data)
    const jobFetch = await fetch(`${process.env.REST_API_URL}/job/${profileId}`,
        {headers: requestHeaders}).then(res => res.json())
    const jobs = JobSchema.array().parse(jobFetch.data)
    return {reminders, jobs}
}

/**
 * Action for reminders route.
 * Handles adding a new reminder and toggling reminder completion.
 * @param {Route.ActionArgs} args - Action arguments containing the request.
 * @returns {Promise<null|void>}
 */
export async function action({request}: Route.ActionArgs) {
    // Get session from cookies
    const session = await getSession(request.headers.get("Cookie"));
    // Parse form data
    const formData = await request.formData()
    const reminder = Object.fromEntries(formData)
    const intent = formData.get("_action")
    // Prepare headers for API requests
    const requestHeaders = new Headers()
    requestHeaders.append('Content-Type', 'application/json')
    requestHeaders.append('Authorization', session.data?.authorization || '')
    const cookie = request.headers.get('Cookie')
    if (cookie) {
        requestHeaders.append('Cookie', cookie)
    }
    // Toggle reminder done status
    if (intent === "toggleDone") {
        const reminderId = formData.get("reminderId")
        const reminderDone = formData.get("reminderDone") === "true"
        // Update reminder done status via API
        const res = await fetch(`${process.env.REST_API_URL}/reminder/reminderDone/${reminderId}`, {
            method: 'PUT',
            headers: requestHeaders,
            body: JSON.stringify({reminderDone}),
        })
        const data = await res.json() // API response, not used
        if (!res.ok) {
            throw new Error('Failed to update reminder status')
        }
        return null
    }
    if (intent === "deleteReminder") {
        const reminderId = formData.get("reminderId")
        // Delete reminder via API
        const res = await fetch(`${process.env.REST_API_URL}/reminder/${reminderId}`, {
            method: 'DELETE',
            headers: requestHeaders,
        })
        const data = await res.json() // API response, not used
        if (!res.ok) {
            throw new Error('Failed to delete reminder')
        }
        return null
    }
    // Add new reminder via API
    const reminderObject = {
        reminderId: uuidv7(),
        reminderJobId: reminder.reminderJobId,
        reminderLabel: reminder.reminderLabel,
        reminderAt: reminder.reminderAt,
        reminderDone: false,
        reminderCreatedAt: null
    }
    const response = await fetch(`${process.env.REST_API_URL}/reminder`, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(reminderObject)
    })
    const data = await response.json() // API response, not used
    if (!response.ok) {
        throw new Error('Failed to add reminder')
    }
}

/**
 * Reminder component.
 * Displays reminders and jobs, allows adding and editing reminders.
 * @param {Route.ComponentProps} props - Component props containing loaderData.
 * @returns {JSX.Element}
 */
export default function Reminder({loaderData}: Route.ComponentProps) {
    // Destructure reminders and jobs from loaderData
    const {reminders, jobs} = loaderData as any
    // State for add/edit reminder forms
    const [addReminder, setAddReminder] = useState(false)
    const [editReminder, setEditReminder] = useState(false)
    const [selectedJob, setSelectedJob] = useState<string>("")
    // Map reminders to their associated jobs (unused)
    const reminderJobs = reminders.map((reminder: Reminder) =>
        jobs.find((job: Job) => job.jobId === reminder.reminderJobId)
    );
    const navigation = useNavigation();
    const wasSubmitting = useRef(false);
    const deleteFetcher = useFetcher();
    const fetcher = useFetcher();
    // Determine optimistic done state for reminders (unused)
    const optimisticDone = fetcher.formData
        ? fetcher.formData.get("reminderDone") === "true"
        : reminders.reminderDone;

    // Effect to close add reminder form after submit completes
    useEffect(() => {
        if (navigation.state === "submitting") wasSubmitting.current = true;
        if (wasSubmitting.current && navigation.state === "idle") {
            setAddReminder(false);        //  close only after submit completes
            wasSubmitting.current = false;
        }
    }, [navigation.state, setAddReminder]);
    return (
        <>
            <h1>Reminders</h1>
            {/* Button to open add reminder form */}
            <button onClick={() => setAddReminder(true)}>Add Reminder</button>
            {/* Add Reminder Form */}
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
                        {/* Render job options for selection */}
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
                {/* Render each reminder item */}
                {reminders.map((reminder: Reminder) => (
                    <>
                        <ReminderItem key={reminder.reminderId} reminder={reminder} jobs={jobs}/>
                        {/* Button to open edit reminder form */}
                        <button onClick={() => setEditReminder(true)}>Edit Reminder</button>
                        <button onClick={() => {
                            deleteFetcher.submit(
                                {reminderId: reminder.reminderId, _action: "deleteReminder"},
                                {method: "delete"}

                            )
                        }}>X</button>
                    </>
                ))}
            </div>
            {/* Edit Reminder Form */}
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
