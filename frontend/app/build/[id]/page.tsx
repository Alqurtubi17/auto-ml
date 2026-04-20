"use client";

import { useState } from "react";
import { useBuildStatus } from "@/hooks/useBuildStatus";
import { BuildStatusPanel } from "@/components/BuildStatusPanel";
import { 
  Play, Code2, Cpu, Terminal, Loader2, Activity, Zap, 
  Gauge, CheckCircle2, ChevronRight, Share2, Download, Copy, ExternalLink,
  Layers, BarChart4, Sparkles
} from "lucide-react";
import { api } from "@/lib/api";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid 
} from 'recharts';
import { toast } from "sonner";
import Link from "next/link";

interface Props { params: { id: string } }

export default function DeploymentPage({ params }: Props) {
  const { build: project, isLoading } = useBuildStatus(params.id);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  if (isLoading || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#61e786] border-t-[#48435c] rounded-full animate-spin" />
        <p className="text-label mt-6">Connecting Node...</p>
      </div>
    );
  }

  if (project.status !== "done") {
    return (
      <div className="min-h-screen py-10 flex justify-center px-6">
        <div className="w-full max-w-xl space-y-6">
          <header className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#61e786] text-[#9792e3] text-[10px] font-black uppercase tracking-[0.2em] border border-[#9792e3]/20">
               <Activity className="w-3.5 h-3.5 animate-pulse" /> Calibration Active
            </div>
            <h1 className="text-title text-2xl">Evolution in Progress</h1>
          </header>
          <BuildStatusPanel build={project} />
        </div>
      </div>
    );
  }

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setResult(null);
    try {
      const features: Record<string, number> = {};
      project.uiSchema?.inputs?.forEach((input: any) => {
        features[input.name] = parseFloat(form[input.name]) || 0;
      });
      const res = await api.builds.predict(project.id, features);
      setResult(res.prediction);
      toast.success("Execution successful.");
    } catch (error: any) {
      toast.error("Execution failed.");
    } finally {
      setLoading(false);
    }
  };

  const acc = project.accuracy ? (project.accuracy * 100).toFixed(1) : "0.0";
  const lat = project.metrics?.latencyMs ?? 0;
  const algo = project.metrics?.algorithmName || "Automated Champion";

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-label text-emerald-600 opacity-100">Node Online</span>
          </div>
          <h1 className="text-title text-3xl">{project.projectName}</h1>
          <p className="text-label text-[#9792e3] opacity-100">{algo} · {project.taskType.toUpperCase()}</p>
        </div>
        <div className="flex gap-2">
           <button title="API Authentication Keys" className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#48435c]/10 rounded-xl text-xs font-black text-[#48435c] hover:bg-[#61e786]/30 transition-all shadow-sm">
             <Share2 className="w-3.5 h-3.5" /> Auth Keys
           </button>
           <a href={`/api/v1/builds/${project.id}/model`} title="Download model weights (.joblib)" className="flex items-center gap-2 px-4 py-2.5 bg-[#48435c] text-[#61e786] rounded-xl text-xs font-black hover:opacity-90 transition-all shadow-lg shadow-teal-900/10">
             <Download className="w-3.5 h-3.5" /> Get Weights
           </a>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricTile label="Precision" value={`${acc}%`} icon={Zap} />
        <MetricTile label="Latency" value={`${lat}ms`} icon={Gauge} />
        <MetricTile label="Storage" value={project.metrics?.modelSize || "4.2 MB"} icon={Layers} />
        <MetricTile label="Core" value="v3.1" icon={Cpu} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Playground */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-[#48435c]/10 p-6 rounded-[2rem] shadow-sm space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <h3 className="text-label opacity-100">Lab Terminal</h3>
              <Terminal className="w-4 h-4 text-[#48435c]/10" />
            </div>

            <form onSubmit={handlePredict} className="space-y-4">
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {project.uiSchema?.inputs?.map((input: any) => (
                  <div key={input.name} className="space-y-1">
                    <label className="text-[10px] font-black text-[#48435c]/40 uppercase tracking-widest ml-1">{input.label || input.name}</label>
                    <input 
                      type="number" step="any" required
                      onChange={(e) => setForm(p => ({ ...p, [input.name]: e.target.value }))}
                      className="w-full bg-[#61e786]/10 border border-[#48435c]/10 rounded-xl px-4 py-2 text-xs font-black text-[#48435c] focus:bg-white focus:border-[#9792e3] transition-all outline-none placeholder:text-[#48435c]/10" 
                      placeholder="0.00"
                    />
                  </div>
                ))}
              </div>
              
              <button 
                type="submit" disabled={loading}
                className="w-full h-12 bg-[#48435c] text-[#61e786] rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.2em] shadow-lg"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {loading ? "Processing..." : "Run Test"}
              </button>
            </form>

            {result && (
              <div className="p-6 rounded-2xl bg-[#48435c] text-[#61e786] shadow-xl animate-in zoom-in-95 duration-500">
                 <p className="text-[10px] font-black text-[#9792e3] uppercase tracking-widest mb-1">Output</p>
                 <p className="text-3xl font-black tracking-tighter">{result}</p>
              </div>
            )}
          </div>
        </div>

        {/* Analytics */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-[#48435c]/10 p-8 rounded-[2rem] shadow-sm space-y-8">
            <div className="flex items-center justify-between">
               <div>
                 <h3 className="text-base font-black text-[#48435c] uppercase tracking-tight">Feature Influence</h3>
                 <p className="text-[10px] text-[#48435c]/40 font-bold mt-1 uppercase">Weighted calibration</p>
               </div>
               <BarChart4 className="w-6 h-6 text-[#61e786]" />
            </div>
            <div className="h-[220px]">
              {project.metrics?.chartData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={project.metrics.chartData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#edffec" />
                     <XAxis dataKey="name" fontSize={10} fontWeight={900} axisLine={false} tickLine={false} tick={{fill: '#48435c'}} />
                     <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(72,67,92,0.1)', fontSize: '11px', fontWeight: 900 }}
                     />
                     <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={24}>
                       {project.metrics.chartData.map((_: any, i: number) => (
                         <Cell key={i} fill={i % 2 === 0 ? "#48435c" : "#9792e3"} />
                       ))}
                     </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full bg-[#edffec] border-2 border-dashed border-[#48435c]/5 rounded-[1.5rem] flex flex-col items-center justify-center text-[#48435c]/20">
                   <Activity className="w-8 h-8 mb-2" />
                   <p className="text-label">No Meta-Data</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-8 bg-gradient-to-r from-[#48435c] to-[#5a5766] rounded-[2rem] text-[#61e786] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
             <div className="space-y-1 relative z-10">
               <h3 className="text-xl font-black tracking-tight">Deployment Console</h3>
               <p className="text-[11px] font-bold text-[#61e786]/60 uppercase tracking-widest">Build your production interface now.</p>
             </div>
             <Link href={`/build/${project.id}/deploy`} className="shrink-0 h-12 px-8 bg-[#61e786] text-[#48435c] rounded-xl font-black text-[11px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg flex items-center gap-2">
                Open Console <ExternalLink className="w-4 h-4" />
             </Link>
          </div>

          <div className="bg-[#48435c] rounded-2xl p-6 relative shadow-lg">
              <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3">
                    <Code2 className="w-4 h-4 text-[#9792e3]" />
                    <span className="text-[10px] font-black text-[#61e786] opacity-40 uppercase tracking-widest">SDK Endpoint</span>
                 </div>
                 <button onClick={() => {
                   navigator.clipboard.writeText(project.generatedCode || "");
                   toast.success("Copied SDK.");
                 }} className="p-2 text-[#61e786]/30 hover:text-white transition-all">
                   <Copy className="w-4 h-4" />
                 </button>
              </div>
              <pre className="text-[11px] font-mono leading-relaxed text-[#61e786]/40 overflow-x-auto custom-scrollbar max-h-[120px]">
                {project.generatedCode || "# Script loading..."}
              </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricTile({ label, value, icon: Icon }: any) {
  return (
    <div className="bg-white border border-[#48435c]/10 p-5 rounded-[1.75rem] space-y-4 group transition-all hover:border-[#9792e3]/40 shadow-sm">
       <div className="w-10 h-10 rounded-xl bg-[#61e786] text-[#48435c] flex items-center justify-center shadow-inner">
          <Icon className="w-5 h-5" />
       </div>
       <div>
         <p className="text-label mb-1 opacity-40">{label}</p>
         <p className="text-2xl font-black text-[#48435c] tracking-tighter">{value}</p>
       </div>
    </div>
  );
}