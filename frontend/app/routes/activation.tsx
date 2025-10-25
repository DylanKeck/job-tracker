import type {Route} from "../../.react-router/types/app/+types/root";
import {redirect, useNavigate, useNavigation} from "react-router";
import {useEffect} from "react";


export async function loader({params, request}: Route.LoaderArgs) {
    // This function is intentionally left empty as the activation process does not require any data fetching.
    // It serves as a placeholder for future enhancements if needed.
    const profileActivationToken = params.profileActivationToken;
    const activationFetch = await fetch(`${process.env.REST_API_URL}/sign-up/activation/${profileActivationToken}`)
}

/**
 * Activation component displays an activation message and redirects to login after a short delay.
 * Uses useEffect to trigger redirect.
 */
export default function Activation() {
    const navigate = useNavigate()
    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/login');
        }, 2000); // Redirect after 2 seconds
        return () => clearTimeout(timer);
    })
    return (
        <>
            <div className="py-10">
                <p className="text-center">Activating...</p>
            </div>
        </>
    )
}