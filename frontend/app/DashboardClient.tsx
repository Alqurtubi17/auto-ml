"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { MLTaskType } from "@/types";
import { 
  Network, BarChart3, Boxes, ArrowRight, Loader2, 
  FileUp, Check, Info, Sparkles, Database, Target, GitBranch
} from "lucide-react";
import { toast } from "sonner";

const ALGORITHMS = {
  classification: [
    { id: "auto", name: "Champion Engine", desc: "Auto-optimize & select winner" },
    { id: "rf_clf", name: "Random Forest", desc: "Ensemble tree learning" },
    { id: "svm_clf", name: "SVM", desc: "Optimal separation" },
    { id: "lr_clf", name: "Logistic Reg", desc: "Classic probability" },
    { id: "gb_clf", name: "Gradient Boost", desc: "Sequential optimization" },
  ],
  regression: [
    { id: "auto", name: "Champion Engine", desc: "Auto-optimize & select winner" },
    { id: "rf_reg", name: "Random Forest", desc: "Non-linear estimation" },
    { id: "svm_reg", name: "SVR", desc: "Margin-based regression" },
    { id: "lr_reg", name: "Linear Reg", desc: "Fundamental trends" },
    { id: "gb_reg", name: "Gradient Boost", desc: "Iterative refinement" },
  ],
  clustering: [
    { id: "auto", name: "Champion Engine", desc: "Auto-optimize & select winner" },
    { id: "kmeans", name: "K-Means", desc: "Centroid partitioning" },
    { id: "dbscan", name: "DBSCAN", desc: "Density grouping" },
    { id: "agglomerative", name: "Agglomerative", desc: "Hierarchical merging" },
    { id: "gmm", name: "Gaussian Mix", desc: "Probabilistic density" },
  ]
};

export default function DashboardClient() {
  const router = useRouter();
  const [projectName, setProjectName] = useState("");
  const [taskType, setTaskType] = useState<MLTaskType>("classification");
  const [selectedAlgo, setSelectedAlgo] = useState("auto");
  const [dataFile, setDataFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedX, setSelectedX] = useState<string[]>([]);
  const [selectedY, setSelectedY] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadTxt, setLoadTxt] = useState("Initializing...");

  useEffect(() => {
    if (!loading) return;
    const t = ["Analyzing Data...", "Training Engines...", "Optimizing Weights...", "Finalizing Dashboard..."];
    let i = 0;
    const iv = setInterval(() => { i = (i + 1) % t.length; setLoadTxt(t[i]); }, 1200);
    return () => clearInterval(iv);
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;
    setLoading(true);
    try {
      const job = await api.builds.create({ projectName, taskType, algorithm: selectedAlgo, dataFile, featureColumns: selectedX, targetColumn: selectedY });
      toast.success("Job initialized successfully.");
      router.push(`/build/${job.id}`);
    } catch (err: any) {
      toast.error(err.message || "Engine failure.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="space-y-1">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#61e786] text-[#9792e3] text-[10px] font-black uppercase tracking-[0.2em] border border-[#9792e3]/20">
           <Sparkles className="w-3 h-3" /> Initialize Experiment
        </div>
        <h1 className="text-title text-3xl">Studio Center</h1>
        <p className="text-body text-sm font-medium opacity-60">Configure your predictive pipeline and deploy the champion model.</p>
      </header>

      {/* Compact Stepper */}
      <div className="flex gap-3">
        {[1, 2].map(s => (
          <div key={s} className="flex-1">
            <div className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? "bg-[#48435c]" : "bg-[#48435c]/10"}`} />
            <p className={`text-[10px] font-black uppercase tracking-widest mt-2 ${step >= s ? "opacity-100 text-[#48435c]" : "opacity-40"}`}>
              {s === 1 ? "Configuration" : "Optimization"}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <div className="lg:col-span-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
              <div className="space-y-6 animate-in slide-in-from-left-4 duration-500">
                {/* Identity */}
                <div className="bg-white border border-[#48435c]/10 p-6 rounded-[1.5rem] shadow-sm space-y-4">
                  <label className="text-label flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#48435c] text-[#61e786] flex items-center justify-center text-[9px]">1</span>
                    Identity
                  </label>
                  <input
                    type="text" value={projectName} onChange={e => setProjectName(e.target.value)}
                    placeholder="Project Name..."
                    className="w-full bg-[#61e786]/10 border border-[#48435c]/10 rounded-xl px-5 py-3 text-lg font-black text-[#48435c] outline-none focus:bg-white focus:border-[#9792e3] transition-all"
                    required
                  />
                </div>

                {/* Task */}
                <div className="bg-white border border-[#48435c]/10 p-6 rounded-[1.5rem] shadow-sm space-y-4">
                  <label className="text-label flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#48435c] text-[#61e786] flex items-center justify-center text-[9px]">2</span>
                    Predictive Task
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { id: "classification", label: "Class", icon: Network },
                      { id: "regression", label: "Regress", icon: BarChart3 },
                      { id: "clustering", label: "Cluster", icon: Boxes }
                    ] as const).map(t => (
                      <button
                        key={t.id} type="button"
                        onClick={() => { setTaskType(t.id); setSelectedAlgo("auto"); }}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          taskType === t.id 
                            ? "border-[#9792e3] bg-[#61e786]/30 shadow-md" 
                            : "border-[#48435c]/5 bg-white hover:border-[#48435c]/20"
                        }`}
                      >
                        <t.icon className={`w-5 h-5 mb-2 transition-colors ${taskType === t.id ? "text-[#9792e3]" : "text-[#48435c]/20"}`} />
                        <h4 className="font-black text-[#48435c] text-[13px]">{t.label}</h4>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Data */}
                <div className="bg-white border border-[#48435c]/10 p-6 rounded-[1.5rem] shadow-sm space-y-4">
                   <label className="text-label flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#48435c] text-[#61e786] flex items-center justify-center text-[9px]">3</span>
                    Data Source
                  </label>
                  <label className={`block p-8 rounded-xl border-2 border-dashed transition-all text-center relative cursor-pointer z-0 ${
                    dataFile ? "bg-[#61e786]/20 border-[#9792e3]" : "bg-[#61e786]/5 border-[#48435c]/10 hover:border-[#48435c]/40"
                  }`}>
                    <input type="file" accept=".csv" className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0] || null; setDataFile(f);
                        if (f) {
                          const r = new FileReader();
                          r.onload = ev => {
                            const txt = ev.target?.result as string;
                            if (txt) { const h = txt.split('\n')[0].split(',').map(s => s.trim().replace(/["']/g, '')); setColumns(h.filter(Boolean)); setSelectedX([]); setSelectedY(""); }
                          };
                          r.readAsText(f);
                        }
                      }} />
                    {dataFile ? (
                      <div className="flex flex-col items-center gap-2">
                        <Check className="w-5 h-5 text-emerald-500" />
                        <h4 className="text-[#48435c] font-black text-xs">{dataFile.name}</h4>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <FileUp className="w-6 h-6 text-[#48435c]/20" />
                        <h4 className="text-[#48435c] font-black text-xs">Drop CSV Dataset</h4>
                        <p className="text-[10px] font-bold text-[#48435c]/20">Limit: 50MB</p>
                      </div>
                    )}
                  </label>

                  {columns.length > 0 && (
                    <div className="p-4 bg-[#61e786]/10 border border-[#48435c]/5 rounded-xl space-y-6 animate-in slide-in-from-top-2 duration-300">
                       <div className="space-y-2">
                          <p className="text-[10px] font-black text-[#48435c]/40 uppercase tracking-widest">Feature Vars (X)</p>
                          <div className="flex flex-wrap gap-1.5">
                             {columns.map(c => (
                               <button key={`x-${c}`} type="button"
                                 onClick={() => setSelectedX(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c])}
                                 className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                                   selectedX.includes(c) ? "bg-[#48435c] text-[#61e786]" : "bg-white text-[#48435c]/40"
                                 }`}>
                                 {c}
                               </button>
                             ))}
                          </div>
                       </div>
                       {taskType !== "clustering" && (
                         <div className="pt-4 border-t border-[#48435c]/5 space-y-2">
                            <p className="text-[10px] font-black text-[#48435c]/40 uppercase tracking-widest">Target Var (Y)</p>
                            <div className="flex flex-wrap gap-1.5">
                               {columns.map(c => (
                                 <button key={`y-${c}`} type="button" onClick={() => setSelectedY(c)}
                                   className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                                     selectedY === c ? "bg-[#9792e3] text-white" : "bg-white text-[#48435c]/40"
                                   }`}>
                                   {c}
                                 </button>
                               ))}
                            </div>
                         </div>
                       )}
                    </div>
                  )}
                </div>

                <button
                  type="button" onClick={() => setStep(2)}
                  disabled={!projectName.trim() || (columns.length > 0 && (selectedX.length === 0 || (taskType !== "clustering" && !selectedY)))}
                  className="w-full h-14 bg-[#48435c] text-[#61e786] rounded-xl flex items-center justify-center gap-2 disabled:opacity-20 transition-all text-xs font-black uppercase tracking-widest shadow-lg"
                >
                  Verify Configuration <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                 <div className="bg-white border border-[#48435c]/10 p-6 rounded-[1.5rem] shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <label className="text-label flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#48435c] text-[#61e786] flex items-center justify-center text-[9px]">4</span>
                        Algorithm Selection
                      </label>
                      <button onClick={() => setStep(1)} className="text-[10px] font-black text-[#9792e3] hover:underline uppercase tracking-widest">Edit</button>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                       {ALGORITHMS[taskType].map(a => (
                         <button
                           key={a.id} type="button" onClick={() => setSelectedAlgo(a.id)}
                           className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                             selectedAlgo === a.id 
                               ? "border-[#9792e3] bg-[#48435c] text-[#61e786] shadow-md" 
                               : "border-[#48435c]/5 bg-white hover:border-[#48435c]/10"
                           }`}
                         >
                           <div className="text-left">
                             <h4 className="font-black text-[13px] flex items-center gap-2">
                               {a.name}
                               {a.id === "auto" && <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${selectedAlgo === a.id ? "bg-[#9792e3] text-white" : "bg-[#61e786] text-[#9792e3]"}`}>AUTO</span>}
                             </h4>
                             <p className={`text-[10px] font-bold ${selectedAlgo === a.id ? "text-[#61e786]/50" : "text-[#48435c]/30"}`}>{a.desc}</p>
                           </div>
                           <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                             selectedAlgo === a.id ? "border-[#9792e3] bg-[#9792e3] text-white" : "border-[#48435c]/5"
                           }`}>
                             {selectedAlgo === a.id && <Check className="w-3 h-3" />}
                           </div>
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="p-8 bg-[#48435c] rounded-[2rem] text-[#61e786] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                    <div className="space-y-1 relative z-10">
                      <h4 className="text-lg font-black tracking-tight">Ready for Calibration</h4>
                      <p className="text-[#61e786]/40 text-[10px] font-black uppercase tracking-widest">Compute units standby.</p>
                    </div>
                    <button
                      type="submit" disabled={loading}
                      className="h-12 px-8 bg-[#61e786] text-[#48435c] rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> {loadTxt}</> : <><Sparkles className="w-4 h-4" /> Start Engine</>}
                    </button>
                 </div>
              </div>
            )}
          </form>
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-4 sticky top-10 space-y-4">
           <div className="bg-white border border-[#48435c]/10 p-6 rounded-[1.5rem] shadow-sm space-y-4">
              <p className="text-label">Summary</p>
              <div className="space-y-3">
                 <Row label="Identity" value={projectName || "—"} icon={Target} />
                 <Row label="Task" value={taskType.toUpperCase()} icon={GitBranch} />
                 <Row label="Source" value={dataFile ? "CSV" : "Synthetic"} icon={Database} />
              </div>
           </div>

           <div className="p-6 bg-[#61e786]/30 border border-[#9792e3]/20 rounded-[1.5rem] space-y-2">
              <Info className="w-5 h-5 text-[#9792e3]" />
              <h4 className="text-[10px] font-black text-[#48435c] uppercase tracking-widest">Compute Spec</h4>
              <p className="text-[10px] text-[#48435c]/60 font-bold leading-relaxed">System will perform automated data sanitation and hyperparameter tuning.</p>
           </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
         <Icon className="w-4 h-4 text-[#48435c]/10" />
         <span className="text-[10px] font-bold text-[#48435c]/40 uppercase tracking-tight">{label}</span>
      </div>
      <span className="text-[11px] font-black text-[#48435c] truncate max-w-[100px]">{value}</span>
    </div>
  );
}