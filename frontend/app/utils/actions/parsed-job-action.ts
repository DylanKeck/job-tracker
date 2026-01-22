import type {ParsedJob} from "~/utils/models/parsed-job-schema";

export async function importParsedJobFromUrl(url: string): Promise<ParsedJob> {
    const res = await fetch("/api/parsed-job/import-from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(data?.error || "Failed to import job");
    }

    return data.job as ParsedJob;
}