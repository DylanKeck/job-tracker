import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

export default function ApplicationsChart({ data }:{ data:{week:string; applications:number}[] }) {
    return (
        <div className="h-64 rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-base md:text-lg font-semibold">Applications per Week</h2>
                <div className="text-xs text-slate-400">Last 4 weeks</div>
            </div>
            <div className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid stroke="#334155" vertical={false} />
                        <XAxis dataKey="week" stroke="#CBD5E1" tickLine={false} axisLine={{ stroke: "#475569" }} />
                        <YAxis stroke="#CBD5E1" tickLine={false} axisLine={{ stroke: "#475569" }} />
                        <Tooltip cursor={{ fill: "#020617" }} contentStyle={{ background: "#0F172A", border: "1px solid #334155", color: "#F3F4F6" }} />
                        <Bar dataKey="applications" radius={[8,8,0,0]} fill="#7C3AED" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
