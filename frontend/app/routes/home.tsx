import type { Route } from './+types/home';


/**
 * Returns meta information for the Home route, such as title and description.
 * Used by the framework to set document head tags.
 *
 * @param {Route.MetaArgs} args - Arguments for meta generation (unused).
 * @returns {Array<object>} Array of meta tag objects.
 */
export function meta({}: Route.MetaArgs) {
    return [
        { title: "Job Tracker" },
        { name: "description", content: "Welcome to Job Tracker" },
    ];
}

/**
 * Home component renders the landing page for the Job Tracker app.
 * Displays a heading and can be extended with more content.
 *
 * @returns {JSX.Element} The rendered Home page UI.
 */
export default function Home() {
    return(
        <>
            {/* Main heading for the home page */}
            <h1 className={'text-3xl font-bold'}> Home </h1>
        </>
    )
}
