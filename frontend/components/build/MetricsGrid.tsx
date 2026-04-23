import { Zap, Cpu, Gauge, Layers } from "lucide-react";

function MetricTile({ label, value, desc, icon: Icon }: any) {
  return (
    <div className="bg-white border border-zinc-200 p-4 rounded-[1.25rem] flex items-center gap-3.5 shadow-sm hover:-translate-y-0.5 transition-transform duration-300">
       <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-emerald-600" />
       </div>
       <div className="overflow-hidden flex-1">
         <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest truncate mb-0.5">{label}</p>
         <p className="text-lg font-black text-emerald-700 truncate leading-tight">{value}</p>
         {desc && <p className="text-[8px] font-bold text-zinc-400 mt-1 truncate">{desc}</p>}
       </div>
    </div>
  );
}

export default function MetricsGrid({ project, algo, topMetricLabel, topMetricValue, topMetricDesc, lat }: any) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <MetricTile label={topMetricLabel} value={topMetricValue} desc={topMetricDesc} icon={Zap} />
      <MetricTile label="Best Algorithm" value={algo} desc="Selected AI method" icon={Cpu} />
      <MetricTile label="Response Time" value={`${lat}ms`} desc="Engine prediction speed" icon={Gauge} />
      <MetricTile label="Model Weight" value={project.metrics?.modelSize || "4.2 MB"} desc="Ready-to-use file size" icon={Layers} />
    </div>
  );
}