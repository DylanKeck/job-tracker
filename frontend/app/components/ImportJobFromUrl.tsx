// frontend/src/components/ImportJobFromUrl.tsx
import { useState } from "react";
import type {ParsedJob} from "~/utils/models/parsed-job-schema";
import {importParsedJobFromUrl} from "~/utils/actions/parsed-job-action";


type Props = {
    onImported: (job: ParsedJob) => void;
};

export function ImportJobFromUrl({ onImported }: Props) {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleImport(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const parsed = await importParsedJobFromUrl(url);
            onImported(parsed);
        } catch (err: any) {
            setError(err?.message ?? "Import failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleImport} className="space-y-2">
            <label className="block text-sm font-medium">
                Job posting URL
                <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    required
                    className="mt-1 w-full rounded border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm"
                />
            </label>

            <button
                type="submit"
                disabled={loading}
                className="rounded bg-sky-600 px-3 py-2 text-sm font-semibold hover:bg-sky-500 disabled:opacity-50"
            >
                {loading ? "Importing..." : "Import from URL"}
            </button>

            {error && <p className="text-xs text-red-400">{error}</p>}
        </form>
    );
}
