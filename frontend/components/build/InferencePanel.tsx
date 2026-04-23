import { useState } from "react";
import { Terminal, Loader2, Play } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function InferencePanel({ project, isClustering }: any) {
  const [form, setForm] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); 
    setResult(null);
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

  return (
    <div className="bg-white border border-zinc-200 p-5 rounded-[1.25rem] space-y-4 shadow-sm">
      <div className="flex flex-col gap-1 border-b border-zinc-100 pb-3">
        <h3 className="text-xs font-black text-zinc-800 flex items-center gap-1.5">
          <Terminal className="w-4 h-4 text-emerald-500" /> Manual Inference
        </h3>
        <p className="text-[9px] font-bold text-zinc-400">Enter values below to test AI predictions directly.</p>
      </div>

      <form onSubmit={handlePredict} className="space-y-3">
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
          {project.uiSchema?.inputs?.map((input: any) => (
            <div key={input.name} className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">{input.label || input.name}</label>
              <input 
                type="number" step="any" required
                onChange={(e) => setForm(p => ({ ...p, [input.name]: e.target.value }))}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-medium text-zinc-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" 
              />
            </div>
          ))}
        </div>
        
        <button 
          type="submit" disabled={loading}
          className="w-full h-11 bg-zinc-900 text-white rounded-lg flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all disabled:opacity-50 shadow-md mt-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {loading ? "Processing..." : (isClustering ? "Assign to Cluster" : "Run Prediction")}
        </button>
      </form>

      {result && (
        <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-300 pt-2">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center">
             <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">AI Output Result</p>
             <p className="text-3xl font-black tracking-tight">
               {isClustering ? `Cluster ${result}` : result}
             </p>
             {project.uiSchema?.labelMapping && project.uiSchema.labelMapping[result] && (
               <span className="block mt-1 text-xs text-emerald-700 font-bold bg-white w-fit mx-auto px-3 py-1 rounded-full border border-emerald-100 shadow-sm">
                 Category: {project.uiSchema.labelMapping[result]}
               </span>
             )}
          </div>
          
          {project.uiSchema?.labelMapping && (
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-100">
              <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2">Label Dictionary</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(project.uiSchema.labelMapping).map(([key, val]: any) => (
                  <span key={key} className="text-[9px] font-bold text-zinc-700 bg-white px-2 py-1 rounded-md border border-zinc-200 shadow-sm">
                    {key} = {val}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}