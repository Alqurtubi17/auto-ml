import { Target, Info } from "lucide-react";

export default function SummarySidebar({ projectName, taskType, dataFile, selectedX, selectedY }: any) {
  return (
    <>
      <div className="bg-white/70 backdrop-blur-xl border border-white p-5 rounded-[1.5rem] shadow-sm space-y-3">
        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5"><Target className="w-3 h-3" /> Live Summary</p>
        <div className="space-y-1.5">
            <SummaryRow label="Identity" value={projectName || "Pending..."} />
            <SummaryRow label="Architecture" value={taskType.toUpperCase()} />
            <SummaryRow label="Data Status" value={dataFile ? "CSV Validated" : "Awaiting..."} />
            <SummaryRow label="Features Extracted" value={`${selectedX.length} Cols`} />
            <SummaryRow label="Target Objective" value={selectedY || "None"} />
        </div>
      </div>
      <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-100 rounded-2xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0"><Info className="w-4 h-4 text-emerald-500" /></div>
        <div>
          <h4 className="text-[11px] font-black text-emerald-900">Enterprise Preprocessing</h4>
          <p className="text-[10px] text-emerald-700/70 mt-1 font-medium leading-relaxed">System will automatically apply label encoding, zero-imputation, and feature selection based on your strategy.</p>
        </div>
      </div>
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/50 border border-zinc-100/50">
      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{label}</span>
      <span className="text-[11px] font-black text-zinc-900 truncate max-w-[120px]">{value}</span>
    </div>
  );
}