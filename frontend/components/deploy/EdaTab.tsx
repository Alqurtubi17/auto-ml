import { useState, useEffect } from "react";
import { ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Line, ScatterChart, Scatter } from "recharts";

export default function EdaTab({ numericStats, getHistogramData, primary, accent, inputs, scatterTarget, getScatterDataWithTrend, rawRows, totalRows }: any) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="p-5 bg-white rounded-xl border border-zinc-100 shadow-sm space-y-6 animate-in fade-in zoom-in-95">
      <div className="space-y-4">
        <div className="flex justify-between items-end border-b border-zinc-100 pb-2">
          <h4 className="text-xs font-black text-zinc-800">Descriptive Statistics</h4>
          <span className="text-[9px] font-bold text-zinc-400">Calculated from {totalRows?.toLocaleString() || rawRows.length} total rows <span className="text-emerald-500 font-black ml-1">(Preview limited to first 20 rows)</span></span>
        </div>
        {numericStats.length > 0 ? (
          <div className="overflow-x-auto border border-zinc-100 rounded-lg">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50 text-[9px] text-zinc-500 uppercase tracking-widest font-black">
                  <th className="p-2 border-b border-zinc-100">Feature</th>
                  <th className="p-2 border-b border-zinc-100">Mean</th>
                  <th className="p-2 border-b border-zinc-100">Min</th>
                  <th className="p-2 border-b border-zinc-100">Max</th>
                </tr>
              </thead>
              <tbody className="text-[10px] text-zinc-700 font-medium">
                {numericStats.map((s: any, i: number) => (
                  <tr key={i} className="hover:bg-zinc-50/50">
                    <td className="p-2 border-b border-zinc-50 font-bold text-zinc-900">{s.col}</td>
                    <td className="p-2 border-b border-zinc-50">{s.mean}</td>
                    <td className="p-2 border-b border-zinc-50">{s.min}</td>
                    <td className="p-2 border-b border-zinc-50">{s.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 bg-zinc-50 text-center text-xs font-bold text-zinc-400 rounded-lg">No numerical data found for analysis.</div>
        )}
      </div>

      <div className="space-y-4 pt-2">
        <h4 className="text-xs font-black text-zinc-800 border-b border-zinc-100 pb-2">Feature Distributions</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {numericStats.map((stat: any, i: number) => (
            <div key={i} className="bg-zinc-50 border border-zinc-100 rounded-lg p-3">
              <p className="text-[9px] font-bold text-zinc-500 uppercase mb-2 text-center">{stat.col}</p>
              <div className="h-32" style={{ minWidth: '1px', minHeight: '1px' }}>
                {isMounted && (
                  <ResponsiveContainer width="100%" height={128}>
                    <ComposedChart data={getHistogramData(stat.data)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                      <XAxis dataKey="name" fontSize={8} tickLine={false} axisLine={false} />
                      <YAxis fontSize={8} tickLine={false} axisLine={false} allowDecimals={false} />
                      <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', fontSize: '10px', padding: '4px' }} />
                      <Bar dataKey="count" fill={primary} radius={[2, 2, 0, 0]} />
                      <Line type="monotone" dataKey="count" stroke={accent} strokeWidth={2} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t border-zinc-100">
        <h4 className="text-xs font-black text-zinc-800 border-b border-zinc-100 pb-2">Correlation Analysis (Y: {scatterTarget})</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inputs.map((input: any, i: number) => {
            if (input.name === scatterTarget) return null;
            const sData = getScatterDataWithTrend(input.name, scatterTarget);
            if (sData.data.length === 0) return null;
            return (
              <div key={i} className="bg-zinc-50 border border-zinc-100 rounded-lg p-3">
                <p className="text-[9px] font-bold text-zinc-500 uppercase mb-2 text-center">{input.name} (X) vs {scatterTarget} (Y)</p>
                <div className="h-32" style={{ minWidth: '1px', minHeight: '1px' }}>
                  {isMounted && (
                    <ResponsiveContainer width="100%" height={128}>
                      <ScatterChart margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                        <XAxis type="number" dataKey="x" fontSize={8} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                        <YAxis type="number" dataKey="y" fontSize={8} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                        <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', fontSize: '10px', padding: '4px' }} />
                        <Scatter name="Data Points" data={sData.data} fill={accent} opacity={0.6} />
                        {sData.trend.length > 0 && <Scatter name="Trend" data={sData.trend} line={{ stroke: primary, strokeWidth: 2 }} shape={() => <circle r={0} />} isAnimationActive={false} />}
                      </ScatterChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}