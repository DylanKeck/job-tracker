import type {Route} from "../../.react-router/types/app/+types/root";
import {getSession} from "~/utils/session.server";

/**
 * Action function for updating a job note.
 * Retrieves session, validates and forwards job note update to backend API.
 *
 * @param {Route.ActionArgs} args - Contains the request object for job note update and headers.
 * @returns {Promise<object>} Success message or throws error on failure.
 */
export async function action({request}: Route.ActionArgs) {
    // Retrieve user session from cookies
    const session = await getSession(
        request.headers.get("Cookie")
    );
    // Parse job note update data from request body
    const formData = await request.json();
    console.log(formData);
    // Prepare request headers for backend API
    const requestHeaders = new Headers()
    const jobNoteId = formData.jobNoteId;
    requestHeaders.append('Content-Type', 'application/json')
    requestHeaders.append('Authorization', session.data?.authorization || '')
    const cookie = request.headers.get('Cookie')
    if (cookie) {
        requestHeaders.append('Cookie', cookie)
    }
    // Send PUT request to backend to update job note
    const response = await fetch(`${process.env.REST_API_URL}/job/updateJobNote/${jobNoteId}`, {
        method: 'PUT',
        headers: requestHeaders,
        body: JSON.stringify(formData)
    })
    const data = await response.json();
    if (!response.ok) {
        // Backend responded with error
        throw new Error('Failed to update job note')
    }
    // Success response
    return {success: true, message: "Updated Job Note", status: 200};
}