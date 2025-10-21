export default function StatusBadge({ status }: { status?: string | null }) {
    const s = (status ?? "Saved").toLowerCase();
    const map: Record<string, string> = {
        saved: "bg-slate-700/40 text-slate-300 border border-slate-700",
        applied: "bg-violet-600/20 text-violet-300 border border-violet-600/30",
        interview: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
        offer: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
        rejected: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
    };
    return (
        <span className={`px-2 py-1 text-xs rounded-md ${map[s] ?? map.saved}`}>
      {status ?? "Saved"}
    </span>
    );
}