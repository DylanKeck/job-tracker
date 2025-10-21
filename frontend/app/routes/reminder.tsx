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
    const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null)
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
        <div className="mx-auto max-w-5xl px-6 py-8">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-semibold text-white">Reminders</h1>
                    <p className="text-slate-400 text-sm">Never miss a follow-up or interview</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setAddReminder(true);
                            setEditReminder(false);
                            setSelectedReminder(null);
                        }}
                        className="rounded-xl bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 text-sm font-medium transition"
                    >
                        + Add Reminder
                    </button>
                </div>
            </div>

            {/* Add Reminder Card */}
            {addReminder && (
                <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                        <h2 className="text-base md:text-lg font-semibold text-white">New Reminder</h2>
                        <button
                            onClick={() => setAddReminder(false)}
                            className="text-slate-300 text-sm px-2 py-1 rounded-md border border-slate-700 bg-slate-800 hover:bg-slate-700 transition"
                        >
                            Cancel
                        </button>
                    </div>

                    <Form method="post" id="reminderForm" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 md:col-span-2">
                            <label className="block text-sm text-slate-300">Label</label>
                            <input
                                type="text"
                                name="reminderLabel"
                                placeholder="e.g. Follow up with recruiter"
                                required
                                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-violet-600 focus:outline-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm text-slate-300">Reminder At</label>
                            <input
                                type="datetime-local"
                                name="reminderAt"
                                required
                                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white focus:ring-2 focus:ring-violet-600 focus:outline-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm text-slate-300">Related Job</label>
                            <select
                                name="reminderJobId"
                                value={selectedJob}
                                onChange={(e) => setSelectedJob(e.target.value)}
                                required
                                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white focus:ring-2 focus:ring-violet-600 focus:outline-none"
                            >
                                <option value="" disabled>
                                    Select a job
                                </option>
                                {jobs.map((job: Job) => (
                                    <option key={job.jobId} value={job.jobId}>
                                        {job.jobRole} · {job.jobCompany}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setAddReminder(false)}
                                className="rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 text-sm transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="rounded-lg bg-violet-600 hover:bg-violet-500 text-white px-3 py-2 text-sm font-medium transition"
                            >
                                Add Reminder
                            </button>
                        </div>
                    </Form>
                </div>
            )}

            {/* Edit Reminder Card */}
            {editReminder && selectedReminder && (
                <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                        <h2 className="text-base md:text-lg font-semibold text-white">Edit Reminder</h2>
                        <button
                            onClick={() => {
                                setEditReminder(false);
                                setSelectedReminder(null);
                            }}
                            className="text-slate-300 text-sm px-2 py-1 rounded-md border border-slate-700 bg-slate-800 hover:bg-slate-700 transition"
                        >
                            Cancel
                        </button>
                    </div>

                    <Form method="put" id="reminderForm" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="hidden" name="reminderId" defaultValue={selectedReminder.reminderId} />

                        <div className="space-y-1 md:col-span-2">
                            <label className="block text-sm text-slate-300">Label</label>
                            <input
                                type="text"
                                name="reminderLabel"
                                placeholder="Reminder Label"
                                defaultValue={selectedReminder.reminderLabel}
                                required
                                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-violet-600 focus:outline-none"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm text-slate-300">Reminder At</label>
                            <input
                                type="datetime-local"
                                name="reminderAt"
                                placeholder="Reminder At"
                                defaultValue={selectedReminder.reminderAt.toLocaleDateString()}
                                required
                                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white focus:ring-2 focus:ring-violet-600 focus:outline-none"
                            />
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setEditReminder(false);
                                    setSelectedReminder(null);
                                }}
                                className="rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 text-sm transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="rounded-lg bg-violet-600 hover:bg-violet-500 text-white px-3 py-2 text-sm font-medium transition"
                            >
                                Update Reminder
                            </button>
                        </div>
                    </Form>
                </div>
            )}

            {/* List of Reminders */}
            <div className="space-y-3">
                {reminders.length === 0 ? (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
                        <p className="text-slate-300">No reminders yet.</p>
                        <button
                            onClick={() => setAddReminder(true)}
                            className="mt-4 inline-flex items-center justify-center rounded-lg bg-violet-600 hover:bg-violet-500 px-4 py-2 text-sm font-medium text-white transition"
                        >
                            Create your first reminder
                        </button>
                    </div>
                ) : (
                    reminders.map((reminder: Reminder) => (
                        <div
                            key={reminder.reminderId}
                            className="rounded-xl border border-slate-800 bg-slate-900 p-4 flex items-start justify-between gap-3"
                        >
                            {/* Your existing item renderer */}
                            <div className="flex-1">
                                <ReminderItem reminder={reminder} jobs={jobs} />
                            </div>

                            {/* Actions */}
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setSelectedReminder(reminder);
                                        setEditReminder(true);
                                        setAddReminder(false);
                                    }}
                                    className="rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 text-xs transition"
                                >
                                    Edit
                                </button>

                                <deleteFetcher.Form method="delete">
                                    <input type="hidden" name="reminderId" value={reminder.reminderId} />
                                    <button
                                        type="submit"
                                        className="rounded-lg border border-rose-900 bg-rose-900/40 hover:bg-rose-900/60 text-rose-200 px-3 py-1.5 text-xs transition"
                                    >
                                        Delete
                                    </button>
                                </deleteFetcher.Form>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
