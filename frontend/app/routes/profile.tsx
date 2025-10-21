import type {Route} from "../../.react-router/types/app/+types/root";
import {Form, redirect, useNavigation} from "react-router";
import  {ProfileSchema} from "~/utils/models/profile-schema";
import {useEffect, useRef, useState} from "react";
import {getSession} from "~/utils/session.server";

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

export async function action({request}: Route.LoaderArgs) {
    const formData = await request.formData()
    const updatedProfile = Object.fromEntries(formData)
    const session = await getSession(
        request.headers.get("Cookie")
    )
    const profileId = session.data.profile?.profileId
    if(!profileId){
        // Redirect if not logged in
        return redirect("/login")
    }
    const requestHeaders = new Headers()
    requestHeaders.append('Content-Type', 'application/json')
    requestHeaders.append('Authorization', session.data?.authorization || '')
    const cookie = request.headers.get('Cookie')
    if (cookie) {
        requestHeaders.append('Cookie', cookie)
    }
    const updatedProfileData = {
        profileId: profileId,
        profileCreatedAt: null,
        profileResumeUrl: null,
        profileUsername: updatedProfile.profileUsername,
        profileLocation: updatedProfile.profileLocation,
        profileEmail: updatedProfile.profileEmail
    }
    const response = await fetch(`${process.env.REST_API_URL}/profile/${profileId}`, {
        method: 'PUT',
        headers: requestHeaders,
        body: JSON.stringify(updatedProfileData)
    })
    const data = await response.json()
    if (!response.ok) {
        // Error updating profile data
        throw new Error('Failed to update profile data')
    }
    return {status: 200, message: "Profile updated successfully", success: true}
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
    const [editProfile, setEditProfile] = useState<boolean>(false)
    const navigation = useNavigation();
    const wasSubmitting = useRef(false);
    useEffect(() => {
        if (navigation.state === "submitting") wasSubmitting.current = true;
        if (wasSubmitting.current && navigation.state === "idle") {
            setEditProfile(false);        // ✅ close only after submit completes
            wasSubmitting.current = false;
        }
    }, [navigation.state, setEditProfile]);
    return (
        <div className="max-w-3xl mx-auto py-10 px-6 text-slate-100">
            <h2 className="text-3xl font-bold mb-6">My Profile</h2>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-md space-y-6">
                {/* Buttons */}
                <div className="flex items-center justify-between">
                    {!editProfile ? (
                        <button
                            onClick={() => setEditProfile(true)}
                            className="bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg text-white font-medium transition"
                        >
                            Edit Profile
                        </button>
                    ) : null}

                    <Form method="post" action="/logout">
                        <button
                            className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg text-white font-medium transition"
                        >
                            Logout
                        </button>
                    </Form>
                </div>

                {/* View Mode */}
                {!editProfile ? (
                    <div className="space-y-3">
                        <p><span className="text-slate-400">Name:</span> {profile.profileUsername}</p>
                        <p><span className="text-slate-400">Location:</span> {profile.profileLocation || 'Not set'}</p>
                        <p><span className="text-slate-400">Email:</span> {profile.profileEmail}</p>
                    </div>
                ) : (
                    /* Edit Mode */
                    <Form method="post" className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Username</label>
                            <input
                                type="text"
                                name="profileUsername"
                                defaultValue={profile.profileUsername}
                                className="w-full p-2.5 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Location</label>
                            <input
                                type="text"
                                name="profileLocation"
                                defaultValue={profile.profileLocation}
                                className="w-full p-2.5 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Email</label>
                            <input
                                type="email"
                                name="profileEmail"
                                defaultValue={profile.profileEmail}
                                className="w-full p-2.5 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-600"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg text-white font-medium transition"
                        >
                            Save Changes
                        </button>
                    </Form>
                )}
            </div>
        </div>
    )
}