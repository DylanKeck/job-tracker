import type {Route} from "../../.react-router/types/app/+types/root";
import {destroySession, getSession} from "~/utils/session.server";
import {redirect} from "react-router";

/**
 * Action function for the Logout route.
 * Destroys the current user session and redirects to the login page.
 *
 * @param {Route.ActionArgs} request - Contains the request object for session destruction.
 * @returns {Promise<Response>} Redirects to /login and sets the session cookie to expire.
 */
export async function action(request: Route.ActionArgs) {
    // Retrieve the current session from cookies
    const session = await getSession(
        request.request.headers.get("Cookie"))
    // Destroy the session and redirect to login
    return redirect("/login", {
        headers: {
            "Set-Cookie": await destroySession(session),
        },
    });
}