import { Link, NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import type {Route} from "../../.react-router/types/app/+types/root";
import {getSession} from "~/utils/session.server";


export async function loader({request}: Route.LoaderArgs) {
    const session = await getSession(
        request.headers.get("Cookie")
    )
    const profileId = session.data.profile?.profileId
    if(!profileId){
        return {profile: null}
    }
    const requestHeaders = new Headers()
    requestHeaders.append('Content-Type', 'application/json')
    requestHeaders.append('Authorization', session.data?.authorization || '')
    const cookie = request.headers.get('Cookie')
    if (cookie) {
        requestHeaders.append('Cookie', cookie)
    }
    const username = session.data.profile?.profileUsername
    return {username}
}


export default function Navbar({loaderData}: Route.ComponentProps) {
    const {username} = loaderData as any
    const [open, setOpen] = useState(false);

    const linkClass = ({ isActive }: { isActive: boolean }) =>
        `block px-3 py-2 rounded-md transition ${
            isActive ? "text-violet-400 font-medium" : "text-slate-300 hover:text-white"
        }`;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
            {/* NAVBAR */}
            <header className="sticky top-0 z-20 backdrop-blur bg-slate-950/90 border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                    {/* Brand */}
                    <Link to="/dashboard" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-violet-600 grid place-items-center text-white font-bold">
                            JT
                        </div>
                        <span className="text-white text-lg font-semibold">Job Tracker</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-6">
                        <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
                        <NavLink to="/jobs" className={linkClass}>Jobs</NavLink>
                        <NavLink to="/reminders" className={linkClass}>Reminders</NavLink>
                        <NavLink to="/analytics" className={linkClass}>Analytics</NavLink>
                    </nav>

                    {/* Right actions */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link
                            to="/jobs/new"
                            className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition"
                        >
                            + Add Job
                        </Link>
                        <Link
                            to="/profile"
                            className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 text-sm font-semibold hover:ring-2 hover:ring-violet-500 transition"
                            title="Profile"
                        >
                            {username ? username.slice(0,2).toUpperCase() : ""}
                        </Link>
                    </div>

                    {/* Mobile toggle */}
                    <button
                        className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-slate-300 hover:text-white hover:bg-slate-800 transition"
                        onClick={() => setOpen(o => !o)}
                        aria-label="Toggle menu"
                        aria-expanded={open}
                    >
                        <span className={`h-0.5 w-5 bg-current block transition ${open ? "rotate-45 translate-y-1" : ""}`}/>
                        <span className={`h-0.5 w-5 bg-current block my-1 transition ${open ? "opacity-0" : ""}`}/>
                        <span className={`h-0.5 w-5 bg-current block transition ${open ? "-rotate-45 -translate-y-1" : ""}`}/>
                    </button>
                </div>

                {/* Mobile menu */}
                {open && (
                    <div className="md:hidden border-t border-slate-800 bg-slate-950/95">
                        <div className="px-4 py-3 space-y-2">
                            <NavLink to="/dashboard" className={linkClass} onClick={() => setOpen(false)}>Dashboard</NavLink>
                            <NavLink to="/jobs" className={linkClass} onClick={() => setOpen(false)}>Jobs</NavLink>
                            <NavLink to="/reminders" className={linkClass} onClick={() => setOpen(false)}>Reminders</NavLink>
                            <NavLink to="/analytics" className={linkClass} onClick={() => setOpen(false)}>Analytics</NavLink>
                            <Link
                                to="/jobs/new"
                                onClick={() => setOpen(false)}
                                className="block mt-2 text-center bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-3 py-2 rounded-lg transition"
                            >
                                + Add Job
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            {/* ROUTE CONTENT */}
            <main className="max-w-7xl mx-auto w-full px-6 py-6 grow">
                <Outlet />
            </main>
        </div>
    );
}
