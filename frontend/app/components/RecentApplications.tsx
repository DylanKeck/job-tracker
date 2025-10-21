import type { Job } from "~/utils/models/job-schema";
import { Link } from "react-router";

export default function RecentApplications({ jobs }: { jobs: Job[] }) {
    if (!jobs || jobs.length === 0) {
        return (
            <div className="text-center text-slate-400 text-sm py-6">
                No recent applications.
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
            <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-slate-800/50 text-slate-300 text-xs uppercase tracking-wide">
                <tr>
                    <th className="px-4 py-3 font-medium">Job Title</th>
                    <th className="px-4 py-3 font-medium">Company</th>
                    <th className="px-4 py-3 font-medium">Date Applied</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3"></th>
                </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                {jobs.map((job) => (
                    <tr
                        key={job.jobId}
                        className="hover:bg-slate-800/60 transition cursor-pointer"
                    >
                        <td className="px-4 py-3 text-white">{job.jobRole}</td>
                        <td className="px-4 py-3 text-slate-300">{job.jobCompany}</td>
                        <td className="px-4 py-3 text-slate-400">
                            {job.jobAppliedOn?.toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                <span className={`px-2 py-1 text-xs rounded-md
                  ${
                    job.jobStatus === "Interview"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : job.jobStatus === "Offer"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-700/40 text-slate-300 border border-slate-700"
                }
                `}>
                  {job.jobStatus}
                </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                            <Link
                                to={`/jobs/job-details?id=${job.jobId}`}
                                className="text-violet-400 hover:text-violet-300 text-xs underline-offset-2 hover:underline"
                            >
                                View →
                            </Link>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
