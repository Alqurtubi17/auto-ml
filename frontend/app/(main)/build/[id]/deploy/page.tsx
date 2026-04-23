"use client";

import { useState, useEffect, useMemo } from "react";
import { useBuildStatus } from "@/hooks/useBuildStatus";
import { ArrowLeft, LayoutTemplate, Trash2 } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import DeploySidebar from "@/components/deploy/DeploySidebar";
import EdaTab from "@/components/deploy/EdaTab";
import InferenceTab from "@/components/deploy/InferenceTab";
import TelemetryTab from "@/components/deploy/TelemetryTab";
import CodeBlock from "@/components/deploy/CodeBlock";

interface Props { params: { id: string } }

export default function DeployPage({ params }: Props) {
  const { build: project, isLoading } = useBuildStatus(params.id);
  const [fw, setFw] = useState<"streamlit" | "gradio">("streamlit");
  const router = useRouter();
  
  const [mockActiveTab, setMockActiveTab] = useState<"eda" | "inference" | "telemetry">("eda");
  const [primary, setPrimary] = useState("#10b981");
  const [accent, setAccent] = useState("#059669");
  const [bg, setBg] = useState("#fafafa");
  const [saving, setSaving] = useState(false);

  const [mockForm, setMockForm] = useState<Record<string, number>>({});
  const [inferenceHistory, setInferenceHistory] = useState<any[]>([]);
  const [lastPrediction, setLastPrediction] = useState<number | null>(null);
  const [scatterTarget, setScatterTarget] = useState<string>("");

  useEffect(() => {
    const theme = (project?.uiSchema as any)?.theme;
    if (theme) {
      if (theme.primary) setPrimary(theme.primary);
      if (theme.accent) setAccent(theme.accent);
      if (theme.bg) setBg(theme.bg);
    }
  }, [project]);

  const rawRows = useMemo(() => (project?.uiSchema as any)?.previewData?.rows || [], [project]);
  const columns = useMemo(() => (project?.uiSchema as any)?.previewData?.columns || project?.uiSchema?.inputs?.map((i: any) => i.name) || [], [project]);
  const inputs = project?.uiSchema?.inputs || [];

  useEffect(() => {
    if (columns.length > 0 && !scatterTarget) {
      const featureNames = inputs.map((i: any) => i.name);
      const bestTarget = columns.find((c: string) => !featureNames.includes(c)) || columns[columns.length - 1];
      setScatterTarget(bestTarget);
    }
  }, [columns, inputs, scatterTarget]);

  const numericStats = useMemo(() => {
    if (!columns.length || !rawRows.length) return [];
    const stats: any[] = [];
    const featuresToPlot = [...inputs.map((i: any) => i.name)];
    if (scatterTarget && !featuresToPlot.includes(scatterTarget)) featuresToPlot.push(scatterTarget);
    featuresToPlot.forEach((col: string) => {
      const cIdx = columns.indexOf(col);
      if (cIdx !== -1) {
        const nums = rawRows.map((r: any[]) => parseFloat(r[cIdx])).filter((n: number) => !isNaN(n));
        if (nums.length > 0) {
          stats.push({ col, mean: (nums.reduce((a: number, b: number) => a + b, 0) / nums.length).toFixed(2), min: Math.min(...nums).toFixed(2), max: Math.max(...nums).toFixed(2), data: nums });
        }
      }
    });
    return stats;
  }, [columns, rawRows, inputs, scatterTarget]);

  const getHistogramData = (data: number[]) => {
    const min = Math.min(...data), max = Math.max(...data), binCount = 10, binSize = (max - min) / binCount || 1;
    const bins = Array.from({ length: binCount }, (_, i) => ({ name: (min + i * binSize).toFixed(1), count: 0 }));
    data.forEach(n => { for (let i = 0; i < binCount; i++) { if (n >= (min + i * binSize) && (n <= (min + (i + 1) * binSize))) { bins[i].count++; break; } } });
    return bins;
  };

  const getScatterDataWithTrend = (xCol: string, yCol: string) => {
    const xIdx = columns.indexOf(xCol), yIdx = columns.indexOf(yCol);
    if (xIdx === -1 || yIdx === -1) return { data: [], trend: [] };
    const data = rawRows.map((r: any[]) => ({ x: parseFloat(r[xIdx]), y: parseFloat(r[yIdx]) })).filter((d: any) => !isNaN(d.x) && !isNaN(d.y));
    if (data.length < 2) return { data, trend: [] };
    const n = data.length, sumX = data.reduce((a: any, b: any) => a + b.x, 0), sumY = data.reduce((a: any, b: any) => a + b.y, 0), sumXY = data.reduce((a: any, b: any) => a + b.x * b.y, 0), sumX2 = data.reduce((a: any, b: any) => a + b.x * b.x, 0);
    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX), b = (sumY - m * sumX) / n;
    const minX = Math.min(...data.map((p: any) => p.x)), maxX = Math.max(...data.map((p: any) => p.x));
    return { data, trend: [{ x: minX, y: m * minX + b }, { x: maxX, y: m * maxX + b }] };
  };

  const handleMockPredict = () => {
    const res = project?.taskType === "classification" ? (Math.random() > 0.5 ? 1 : 0) : parseFloat((Math.random() * 100).toFixed(2));
    setLastPrediction(res);
    setInferenceHistory(prev => [...prev, { time: new Date().toLocaleTimeString(), output: res }]);
    toast.success("Inference executed successfully.");
  };

  const dlFile = () => {
    toast.info("Preparing export...");
  };

  if (isLoading || !project) return <div className="min-h-screen flex items-center justify-center bg-zinc-50"><div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12 bg-zinc-50">
      <div className="flex items-center justify-between">
        <Link href={`/build/${project.id}`} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 text-xs font-bold transition-all group"><ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Build</Link>
        <div className="flex items-center gap-2">
          <button onClick={() => api.builds.delete(project.id).then(() => router.push("/history"))} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
          <span className="px-3 py-1 bg-[#10b981] text-white rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 tracking-widest"><LayoutTemplate className="w-3 h-3" /> Console</span>
        </div>
      </div>

      <header><h1 className="text-3xl font-black text-zinc-900 tracking-tight">Deployment Console</h1><p className="text-sm font-medium text-zinc-500 mt-1">Generate a production-ready application with EDA, Inference, and Telemetry.</p></header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <DeploySidebar project={project} fw={fw} setFw={setFw} primary={primary} setPrimary={setPrimary} accent={accent} setAccent={setAccent} bg={bg} setBg={setBg} saving={saving} setSaving={setSaving} dlFile={dlFile} fileName="app.py" />
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-white border border-zinc-200 rounded-[2rem] shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-700">{fw} Application Mockup</span>
              <span className="text-[9px] font-black bg-zinc-200/50 text-zinc-500 px-2.5 py-1 rounded-lg flex items-center gap-1 uppercase tracking-widest"><LayoutTemplate className="w-3 h-3" /> Live Preview</span>
            </div>
            <div className="p-6 space-y-5" style={{ borderTop: `3px solid ${primary}`, backgroundColor: `${bg}` }}>
              <div><h2 className="text-2xl font-black tracking-tight" style={{ color: primary }}>{project.projectName}</h2><p className="text-[11px] font-medium opacity-70" style={{ color: primary }}>LarikAI Intelligence Platform</p></div>
              <div className="flex gap-2 border-b border-zinc-200/50">
                {[{ id: 'eda', label: 'Analysis' }, { id: 'inference', label: 'Engine' }, { id: 'telemetry', label: 'Telemetry' }].map(t => (
                  <button key={t.id} onClick={() => setMockActiveTab(t.id as any)} className={`px-4 py-2 text-[10px] font-black rounded-t-lg transition-colors ${mockActiveTab === t.id ? 'text-white' : 'text-zinc-500'}`} style={{ backgroundColor: mockActiveTab === t.id ? primary : 'transparent' }}>{t.label.toUpperCase()}</button>
                ))}
              </div>
              {mockActiveTab === 'eda' ? <EdaTab numericStats={numericStats} getHistogramData={getHistogramData} primary={primary} accent={accent} inputs={inputs} scatterTarget={scatterTarget} getScatterDataWithTrend={getScatterDataWithTrend} rawRows={rawRows} /> :
               mockActiveTab === 'inference' ? <InferenceTab inputs={inputs} setMockForm={setMockForm} handleMockPredict={handleMockPredict} primary={primary} lastPrediction={lastPrediction} /> :
               <TelemetryTab inferenceHistory={inferenceHistory} accent={accent} primary={primary} />}
            </div>
          </div>
          
          <CodeBlock 
            project={project} 
            fw={fw} 
            primary={primary} 
            accent={accent} 
            bg={bg} 
            inputs={inputs} 
            scatterTarget={scatterTarget} 
          />
        </div>
      </div>
    </div>
  );
}