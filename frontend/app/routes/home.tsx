import { Link } from "react-router";
import type { Route } from './+types/home';
import {useEffect, useState} from "react";


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
type Shot = { src: string; alt: string; label: string };

export default function Home() {
    const screenshots: Shot[] = [
        { src: "/dashboard.png", alt: "Dashboard overview", label: "Dashboard" },
        { src: "/jobs.png", alt: "Jobs list", label: "Jobs" },
        { src: "/addJob.png", alt: "Add job form", label: "Add Job" },
        { src: "/reminders.png", alt: "Reminders list", label: "Reminders" },
    ];

    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number>(0);

    const openLightbox = (index: number) => {
        setActiveIndex(index);
        setLightboxOpen(true);
    };
    const closeLightbox = () => setLightboxOpen(false);
    const prev = () => setActiveIndex((i) => (i - 1 + screenshots.length) % screenshots.length);
    const next = () => setActiveIndex((i) => (i + 1) % screenshots.length);

    // Keyboard: ESC to close, arrows to navigate
    useEffect(() => {
        if (!lightboxOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowLeft") prev();
            if (e.key === "ArrowRight") next();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [lightboxOpen]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            {/* Hero */}
            <section className="relative overflow-hidden border-b border-slate-800">
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 to-transparent pointer-events-none" />
                <div className="mx-auto max-w-7xl px-6 py-16">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Job Tracker — Stay organized, land faster.
                        </div>
                        <h1 className="mt-4 text-4xl md:text-5xl font-semibold leading-tight text-white">
                            Track applications, nail follow-ups, and visualize your progress.
                        </h1>
                        <p className="mt-3 text-slate-400">
                            A focused workspace for your job search: applications, reminders, notes, and analytics—without the chaos.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                to="/signup"
                                className="rounded-xl bg-violet-600 hover:bg-violet-500 px-5 py-2.5 text-sm font-medium text-white transition"
                            >
                                Get Started — It’s free
                            </Link>
                            <Link
                                to="/login"
                                className="rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 px-5 py-2.5 text-sm font-medium text-slate-200 transition"
                            >
                                I already have an account
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="mx-auto max-w-7xl px-6 py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Feature title="Organize everything" desc="Save roles, companies, locations, salary bands, and notes in one place." />
                    <Feature title="Never miss a follow-up" desc="Set reminders for screens, interviews, and offer reviews." />
                    <Feature title="See your momentum" desc="Weekly applications, interviews, and offer rate at a glance." />
                </div>
            </section>

            {/* Screenshot gallery */}
            <section className="mx-auto max-w-7xl px-6 pb-16">
                <h2 className="text-xl font-semibold text-white mb-4">Product previews</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {screenshots.map((shot, i) => (
                        <button
                            key={shot.src}
                            type="button"
                            onClick={() => openLightbox(i)}
                            className="group text-left overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-600"
                            aria-label={`Open ${shot.label} screenshot`}
                        >
                            <div className="aspect-[16/10] bg-slate-950/40">
                                <img
                                    src={shot.src}
                                    alt={shot.alt}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                    loading="lazy"
                                />
                            </div>
                            <div className="px-4 py-3 border-t border-slate-800 text-slate-300 text-sm flex items-center justify-between">
                                <span>{shot.label}</span>
                                <span className="text-slate-500">Click to enlarge</span>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-8 flex gap-3">
                    <Link
                        to="/signup"
                        className="rounded-xl bg-violet-600 hover:bg-violet-500 px-5 py-2.5 text-sm font-medium text-white transition"
                    >
                        Create your account
                    </Link>
                    {/*<Link*/}
                    {/*    to="/dashboard"*/}
                    {/*    className="rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 px-5 py-2.5 text-sm font-medium text-slate-200 transition"*/}
                    {/*>*/}
                    {/*    View demo dashboard*/}
                    {/*</Link>*/}
                </div>
            </section>

            {/* Lightbox Modal */}
            {lightboxOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4"
                    role="dialog"
                    aria-modal="true"
                    onClick={closeLightbox} // click outside to close
                >
                    <div
                        className="relative max-w-6xl w-full"
                        onClick={(e) => e.stopPropagation()} // prevent close when clicking image area
                    >
                        {/* Image */}
                        <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
                            <img
                                src={screenshots[activeIndex].src}
                                alt={screenshots[activeIndex].alt}
                                className="w-full h-auto max-h-[80vh] object-contain"
                            />
                        </div>

                        {/* Caption */}
                        <div className="mt-3 flex items-center justify-between text-slate-300 text-sm">
                            <span>{screenshots[activeIndex].label}</span>
                            <span>
                {activeIndex + 1} / {screenshots.length}
              </span>
                        </div>

                        {/* Controls */}
                        <button
                            onClick={closeLightbox}
                            className="absolute -top-10 right-0 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-200 px-3 py-1.5 text-sm border border-slate-700"
                        >
                            Close (Esc)
                        </button>

                        {/* Prev / Next */}
                        {screenshots.length > 1 && (
                            <>
                                <button
                                    onClick={prev}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 w-10 h-10 grid place-items-center text-slate-200"
                                    aria-label="Previous image"
                                >
                                    ‹
                                </button>
                                <button
                                    onClick={next}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 w-10 h-10 grid place-items-center text-slate-200"
                                    aria-label="Next image"
                                >
                                    ›
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="border-t border-slate-800">
                <div className="mx-auto max-w-7xl px-6 py-6 text-sm text-slate-500">
                    © {new Date().getFullYear()} Job Tracker. Built with React Router & Tailwind.
                </div>
            </footer>
        </div>
    );
}

function Feature({ title, desc }: { title: string; desc: string }) {
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <h3 className="text-white font-medium">{title}</h3>
            <p className="text-slate-400 text-sm mt-1">{desc}</p>
        </div>
    );
}