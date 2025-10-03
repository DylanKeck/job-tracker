import type {Route} from "../../.react-router/types/app/+types/root";
import {getSession} from "~/utils/session.server";
import {Form, redirect} from "react-router";
import {ProfileSchema} from "~/utils/models/profile-schema";

export async function loader(request: Route.LoaderArgs) {
    const session = await getSession(
request.request.headers.get("Cookie")
    )
    const profileId = session.data.profile?.profileId
    if(!profileId){
        return redirect("/login")
    }
    const requestHeaders = new Headers()
    requestHeaders.append('Content-Type', 'application/json')
    requestHeaders.append('Authorization', session.data?.authorization || '')
    const cookie = request.request.headers.get('Cookie')
    if (cookie) {
        requestHeaders.append('Cookie', cookie)
    }
    const response = await fetch(`${process.env.REST_API_URL}/profile/${profileId}`, {
        method: 'GET',
        headers: requestHeaders
    })
    if (!response.ok) {
            throw new Error('Failed to fetch profile data')
    }
   const profileData = await response.json()
    const profile = ProfileSchema.parse(profileData.data)
    return {profile}

}




export default function Profile({loaderData}: Route.ComponentProps) {
    const {profile} = loaderData as any
    return (
        <>
            <h2>My Profile</h2>
            <Form method="post" action="/logout">
            <button>Logout</button>
            </Form>
            <p>Name: {profile.profileUsername}</p>
            <p>Location: {profile.profileLocation}</p>
            <p>Email: {profile.profileEmail}</p>
        </>
    )
}