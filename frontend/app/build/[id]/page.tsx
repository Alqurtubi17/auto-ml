"use client";

import { useState } from "react";
import { useBuildStatus } from "@/hooks/useBuildStatus";
import { BuildStatusPanel } from "@/components/BuildStatusPanel";
import { Play, Code2, Cpu, Terminal, Loader2, AlertCircle, BarChart3, Activity } from "lucide-react";
import { api } from "@/lib/api";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

interface Props { params: { id: string } }

export default function DeploymentPage({ params }: Props) {
  const { build: project, isLoading } = useBuildStatus(params.id);
  
  const [predictionResult, setPredictionResult] = useState<string | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState("");

  if (isLoading || !project) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-full max-w-md h-40 rounded-3xl bg-white border border-emerald-100 animate-pulse" />
      </div>
    );
  }

  if (project.status !== "done") {
    return (
      <div className="max-w-md mx-auto py-12 space-y-6">
        <div className="bg-white p-8 rounded-[2rem] border border-emerald-100 shadow-sm">
          <h1 className="text-2xl font-extrabold text-emerald-950 mb-6">Memproses Pipeline...</h1>
          <BuildStatusPanel build={project} />
        </div>
      </div>
    );
  }

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPredicting(true);
    setPredictionResult(null);
    setErrorMsg("");

    try {
      const features: Record<string, number> = {};
      for (const key in formData) {
        features[key] = parseFloat(formData[key]) || 0;
      }
      const result = await api.builds.predict(project.id, features);
      setPredictionResult(result.prediction);
    } catch (error: any) {
      setErrorMsg(error.message || "Terjadi kesalahan inferensi.");
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4 sm:px-0">
      
      {/* HEADER: Identitas & Metrik Utama */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-emerald-100 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white rounded-2xl border border-emerald-100 shadow-sm">
              <Cpu className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Deployed Engine: {project.metrics?.algorithmName || "Model Engine"} - {project.accuracy ? (project.accuracy * 100).toFixed(2) : 0}% Accuracy
              </p>
              <h1 className="text-3xl font-extrabold text-emerald-950 tracking-tight leading-none">
                {project.projectName}
              </h1>
              <p className="text-emerald-800/40 font-bold text-xs uppercase tracking-widest mt-2">
                Task: {project.taskType} • ID: {project.id.slice(0, 8)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white px-6 py-4 rounded-[1.5rem] border border-emerald-100 shadow-sm flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-emerald-700/50 uppercase tracking-widest">Akurasi Validasi</span>
              <span className="text-3xl font-black text-emerald-600 leading-none">
                {project.accuracy ? (project.accuracy * 100).toFixed(2) : 0}%
              </span>
            </div>
            <div className="h-10 w-[1px] bg-emerald-100" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-emerald-700/50 uppercase tracking-widest">Latensi</span>
              <span className="text-sm font-bold text-emerald-950">{project.metrics?.latencyMs ?? 0}ms</span>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* KOLOM KIRI: Interaksi & Analisis */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* PANEL 1: Live Prediction */}
          <section className="bg-white border border-emerald-100 rounded-[2.5rem] p-8 shadow-sm">
            <h2 className="text-lg font-extrabold text-emerald-950 mb-6 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-500" /> Live Prediction
            </h2>
            
            <form onSubmit={handlePredict} className="grid grid-cols-2 gap-4">
              {project.uiSchema?.inputs?.map((input: any) => (
                <div key={input.name} className="space-y-1.5">
                  <label className="text-[10px] font-bold text-emerald-700/60 uppercase tracking-widest ml-1">
                    {input.label}
                  </label>
                  <input 
                    type="number"
                    onChange={(e) => setFormData(prev => ({ ...prev, [input.name]: e.target.value }))}
                    className="w-full bg-emerald-50/30 border-2 border-emerald-50 rounded-xl px-4 py-2.5 text-sm text-emerald-950 font-semibold focus:border-emerald-500 focus:bg-white transition-all outline-none" 
                    required 
                    step="any"
                  />
                </div>
              ))}
              
              <button 
                type="submit" 
                disabled={isPredicting}
                className="col-span-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl text-sm transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex justify-center items-center gap-3 mt-2"
              >
                {isPredicting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                Eksekusi Inferensi
              </button>
            </form>

            {predictionResult && (
              <div className="mt-8 p-6 rounded-3xl border border-emerald-100 bg-emerald-50/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                <p className="text-[10px] uppercase tracking-widest text-emerald-600 font-extrabold mb-1">Resulting Output</p>
                <p className="text-3xl font-mono text-emerald-950 font-black tracking-tight">{predictionResult}</p>
              </div>
            )}
          </section>

          {/* PANEL 2: Feature Importance (Recharts) */}
          <section className="bg-white border border-emerald-100 rounded-[2.5rem] p-8 shadow-sm">
            <h2 className="text-lg font-extrabold text-emerald-950 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" /> Feature Importance
            </h2>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={project.metrics?.chartData || []} 
                  layout="vertical"
                  margin={{ left: -20 }}
                >
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    fontSize={10} 
                    axisLine={false} 
                    tickLine={false} 
                    width={80}
                    tick={{ fill: '#064e3b', fontWeight: 700 }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f0fdf4' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px rgba(0,0,0,0.05)', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>
                    {project.metrics?.chartData?.map((_: any, index: number) => (
                      <Cell key={index} fill={index === 0 ? '#059669' : '#a7f3d0'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-emerald-800/40 mt-4 text-center font-bold uppercase tracking-tighter">
              Indikator kontribusi variabel terhadap keputusan algoritma
            </p>
          </section>
        </div>

        {/* KOLOM KANAN: Technical Preview */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Panel Source Code */}
          <section className="bg-zinc-900 rounded-[2.5rem] overflow-hidden flex flex-col shadow-xl border border-zinc-800 h-[600px]">
            <div className="flex items-center justify-between bg-zinc-800/50 px-8 py-5 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <Code2 className="w-5 h-5 text-emerald-500" />
                <span className="text-xs font-bold font-mono text-zinc-400">deployment_script.py</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
              </div>
            </div>
            <div className="p-8 overflow-y-auto flex-1 bg-zinc-950/50 custom-scrollbar">
              <pre className="text-[13px] font-mono text-emerald-400/80 leading-relaxed">
                <code>{project.generatedCode}</code>
              </pre>
            </div>
          </section>

          {/* Panel Detail Teknis */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[1.5rem] border border-emerald-100 shadow-sm">
              <span className="text-[10px] font-bold text-emerald-700/40 uppercase block mb-1 tracking-widest">Model Size</span>
              <span className="text-xl font-black text-emerald-950">{project.metrics?.modelSize ?? "0 KB"}</span>
            </div>
            <div className="bg-white p-6 rounded-[1.5rem] border border-emerald-100 shadow-sm">
              <span className="text-[10px] font-bold text-emerald-700/40 uppercase block mb-1 tracking-widest">Serialization</span>
              <span className="text-xl font-black text-emerald-950">Joblib v1.3</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}