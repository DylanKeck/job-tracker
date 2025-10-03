import type {Route} from "../../.react-router/types/app/+types/root";
import {getSession} from "~/utils/session.server";

export async function action({request}: Route.ActionArgs) {
    const session = await getSession(
        request.headers.get("Cookie")
    );
    const formData = await request.json();
    console.log(formData);
    const requestHeaders = new Headers()
    const jobNoteId = formData.jobNoteId;
    requestHeaders.append('Content-Type', 'application/json')
    requestHeaders.append('Authorization', session.data?.authorization || '')
    const cookie = request.headers.get('Cookie')
    if (cookie) {
        requestHeaders.append('Cookie', cookie)
    }
    const response = await fetch(`${process.env.REST_API_URL}/job/updateJobNote/${jobNoteId}`, {
        method: 'PUT',
        headers: requestHeaders,
        body: JSON.stringify(formData)
    })
    const data = await response.json();
    if (!response.ok) {
        throw new Error('Failed to update job note')
    }
    return {success: true, message: "Updated Job Note", status: 200};
}