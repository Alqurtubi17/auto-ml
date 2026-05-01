import { useState, useEffect } from "react";
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from "recharts";

export default function TelemetryTab({ inferenceHistory, accent, primary }: any) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (inferenceHistory.length === 0) {
    return <div className="p-10 bg-zinc-50 rounded-xl border border-dashed text-center text-[10px] font-bold text-zinc-400">No inference history available yet.</div>;
  }

  return (
    <div className="p-5 bg-white rounded-xl border border-zinc-100 shadow-sm animate-in fade-in slide-in-from-right-4 space-y-6">
      <h3 className="text-xs font-black text-zinc-800 border-b border-zinc-100 pb-2">Session Analytics</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 h-48 bg-zinc-50 border border-zinc-100 rounded-lg p-4" style={{ minWidth: '1px', minHeight: '1px' }}>
          {isMounted && (
            <ResponsiveContainer width="100%" height={192}>
              <LineChart data={inferenceHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                <XAxis dataKey="time" fontSize={8} tickLine={false} axisLine={false} />
                <YAxis fontSize={8} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '10px', padding: '4px' }} />
                <Line type="monotone" dataKey="output" stroke={accent} strokeWidth={3} dot={{ r: 4, fill: primary }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="overflow-x-auto h-48 border border-zinc-100 rounded-lg bg-zinc-50">
          <table className="w-full text-left">
            <thead className="bg-white border-b border-zinc-100">
              <tr className="text-[8px] text-zinc-400 uppercase font-black"><th className="p-2">Time</th><th className="p-2 text-right">Output</th></tr>
            </thead>
            <tbody className="text-[9px] text-zinc-700 font-bold">
              {inferenceHistory.slice(-10).map((h: any, i: number) => (
                <tr key={i} className="border-b border-zinc-100/50">
                  <td className="p-2">{h.time}</td>
                  <td className="p-2 text-right">{h.output.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}