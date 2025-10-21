import { Form } from "react-router";
import type { Job } from "~/utils/types/job";

type Props = {
    job?: Partial<Job>
};

function formatDateForInput(dateString?: string | null) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

export default function EditJob({ job = {} }: Props) {
    return (
        <div className="max-w-2xl mx-auto p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4">
                {job?.jobId ? "Edit Job" : "Add Job"}
            </h2>

            <Form method="POST" encType="multipart/form-data" id="addJob" className="space-y-4">
                <div className="space-y-1">
                    <label className="block text-sm text-slate-300">Job Role</label>
                    <input
                        type="text"
                        name="jobRole"
                        placeholder="Senior Software Engineer"
                        defaultValue={job.jobRole ?? ""}
                        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-violet-600 focus:outline-none"
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-sm text-slate-300">Company</label>
                    <input
                        type="text"
                        name="jobCompany"
                        placeholder="Acme Corp"
                        defaultValue={job.jobCompany ?? ""}
                        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-violet-600 focus:outline-none"
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-sm text-slate-300">Location</label>
                    <input
                        type="text"
                        name="jobLocation"
                        placeholder="Remote / Albuquerque, NM"
                        defaultValue={job.jobLocation ?? ""}
                        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-violet-600 focus:outline-none"
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-sm text-slate-300">Posting URL</label>
                    <input
                        type="url"
                        name="jobPostingUrl"
                        placeholder="https://example.com/job-posting"
                        defaultValue={job.jobPostingUrl ?? ""}
                        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-violet-600 focus:outline-none"
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-sm text-slate-300">Date Applied</label>
                    <input
                        type="datetime-local"
                        name="jobAppliedOn"
                        placeholder="Date Applied"
                        defaultValue={formatDateForInput(job.jobAppliedOn)}
                        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white focus:ring-2 focus:ring-violet-600 focus:outline-none"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="block text-sm text-slate-300">Min Salary</label>
                        <input
                            type="number"
                            name="jobSalaryMin"
                            placeholder="e.g. 60000"
                            defaultValue={job.jobSalaryMin ?? ""}
                            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-violet-600 focus:outline-none"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="block text-sm text-slate-300">Max Salary</label>
                        <input
                            type="number"
                            name="jobSalaryMax"
                            placeholder="e.g. 120000"
                            defaultValue={job.jobSalaryMax ?? ""}
                            className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-violet-600 focus:outline-none"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="block text-sm text-slate-300">Source</label>
                    <input
                        type="text"
                        name="jobSource"
                        placeholder="LinkedIn / Indeed / Referral"
                        defaultValue={job.jobSource ?? ""}
                        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-violet-600 focus:outline-none"
                    />
                </div>

                <div className="space-y-1">
                    <label className="block text-sm text-slate-300">Status</label>
                    <select
                        name="jobStatus"
                        defaultValue={job.jobStatus ?? "Saved"}
                        className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white focus:ring-2 focus:ring-violet-600 focus:outline-none"
                    >
                        <option value="Saved">Saved</option>
                        <option value="Applied">Applied</option>
                        <option value="Interview">Interviewing</option>
                        <option value="Offer">Offered</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>

                <button
                    type="submit"
                    className="w-full rounded-lg bg-violet-600 hover:bg-violet-500 text-white py-2 font-medium transition"
                >
                    {job?.jobId ? "Update Job" : "Add Job"}
                </button>
            </Form>
        </div>
    );
}
