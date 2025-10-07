import type {Route} from "../../.react-router/types/app/+types/root";
import {getSession} from "~/utils/session.server";
import {Form, redirect} from "react-router";
import {ProfileSchema} from "~/utils/models/profile-schema";

/**
 * Loader function for the Profile route.
 * Fetches the current user's profile data from the backend API using the session.
 * Redirects to login if session/profile is missing.
 *
 * @param {Route.LoaderArgs} request - Contains the request object for session and data loading.
 * @returns {Promise<{profile: Profile}>} The profile data for rendering.
 */
export async function loader({request}: Route.LoaderArgs) {
    // Retrieve user session from cookies
    const session = await getSession(
        request.headers.get("Cookie")
    )
    const profileId = session.data.profile?.profileId
    if(!profileId){
        // Redirect if not logged in
        return redirect("/login")
    }
    // Prepare request headers for API call
    const requestHeaders = new Headers()
    requestHeaders.append('Content-Type', 'application/json')
    requestHeaders.append('Authorization', session.data?.authorization || '')
    const cookie = request.headers.get('Cookie')
    if (cookie) {
        requestHeaders.append('Cookie', cookie)
    }
    // Fetch profile data from backend
    const response = await fetch(`${process.env.REST_API_URL}/profile/${profileId}`, {
        method: 'GET',
        headers: requestHeaders
    })
    if (!response.ok) {
        // Error fetching profile data
        throw new Error('Failed to fetch profile data')
    }
    const profileData = await response.json()
    // Validate and parse profile data
    const profile = ProfileSchema.parse(profileData.data)
    return {profile}
}

/**
 * Profile component displays the current user's profile information.
 * Provides a logout button to end the session.
 *
 * @param {Route.ComponentProps} props - Contains loaderData with profile info.
 * @returns {JSX.Element} The rendered profile page UI.
 */
export default function Profile({loaderData}: Route.ComponentProps) {
    // Destructure profile from loaderData
    const {profile} = loaderData as any
    return (
        <>
            <h2>My Profile</h2>
            {/* Logout button triggers session destruction */}
            <Form method="post" action="/logout">
                <button>Logout</button>
            </Form>
            {/* Display profile information */}
            <p>Name: {profile.profileUsername}</p>
            <p>Location: {profile.profileLocation}</p>
            <p>Email: {profile.profileEmail}</p>
        </>
    )
}