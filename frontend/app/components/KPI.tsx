export default function KPI({ label, value, accent }:{label:string; value:string|number; accent?: "violet"|"amber"|"emerald"}) {
    const ring = accent === "amber" ? "ring-amber-500/40" :
        accent === "emerald" ? "ring-emerald-500/40" : "ring-violet-600/40";
    const num  = accent === "amber" ? "text-amber-400" :
        accent === "emerald" ? "text-emerald-400" : "text-violet-400";
    return (
        <div className={`rounded-2xl border border-slate-800 bg-slate-900 p-4 ring-1 ${ring}`}>
            <div className="text-sm text-slate-400">{label}</div>
            <div className={`text-2xl font-semibold mt-1 ${num}`}>{value}</div>
        </div>
    );
}
