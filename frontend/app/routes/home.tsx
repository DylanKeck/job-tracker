import type { Route } from './+types/home';


export function meta({}: Route.MetaArgs) {
    return [
        { title: "Job Tracker" },
        { name: "description", content: "Welcome to Job Tracker" },
    ];
}

export default function Home() {
    return(
        <>
            <h1 className={'text-3xl font-bold'}> Home </h1>
        </>
    )

}
