import {getSession} from "~/utils/session.server";
import {ReminderSchema} from "~/utils/models/reminder-schema";

export async function getReminderLoaderData(request: Request) {
    const session = await getSession(
        request.headers.get("Cookie")
    )
    const profile = session.data.profile
    const profileId = profile?.profileId

    const requestHeaders = new Headers()
    requestHeaders.append('Content-Type', 'application/json')
    requestHeaders.append('Authorization', session.data?.authorization || '')
    const cookie = request.headers.get('Cookie')
    if (cookie) {
        requestHeaders.append('Cookie', cookie)
    }
    // Fetch reminders for the user from backend
    const response = await fetch(`${process.env.REST_API_URL}/reminder/upcoming/${profileId}`, {
        headers: requestHeaders,
    }) .then (res => res.json())
    // Parse response and return reminders
    const reminders = ReminderSchema.array().parse(response.data || []);
    return {reminders};

}