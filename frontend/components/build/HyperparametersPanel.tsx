import { Settings2, Info } from "lucide-react";

export default function HyperparametersPanel({ project }: any) {
  const params = project?.metrics?.bestParameters 
              || project?.metrics?.best_parameters
              || project?.uiSchema?._metrics?.bestParameters
              || project?.uiSchema?._metrics?.best_parameters;

  let fallbackParams = null;
  if (!params) {
     try {
         const logs = project?.logs || [];
         const tuneLog = [...logs].reverse().find((l: string) => l.includes("[tuning] Best params:"));
         if (tuneLog) {
             const paramStr = tuneLog.split("[tuning] Best params: ")[1].trim();
             fallbackParams = JSON.parse(paramStr);
         }
     } catch (e) {}
  }

  const finalParams = params || fallbackParams;
  const hasParams = finalParams && Object.keys(finalParams).length > 0;

  return (
    <div className="bg-white border border-zinc-200 p-5 rounded-[1.25rem] shadow-sm flex flex-col">
      <div className="flex flex-col gap-1 mb-4">
         <h3 className="text-xs font-black text-zinc-800 flex items-center gap-1.5"><Settings2 className="w-4 h-4 text-emerald-500" /> Optimal Hyperparameters</h3>
         <p className="text-[9px] font-bold text-zinc-400">Best parameter combination resulting from the Tuning process.</p>
      </div>

      {hasParams ? (
        <div className="flex flex-wrap gap-2">
          {Object.entries(finalParams).map(([key, val]: any) => (
            <div key={key} className="flex items-center gap-2 bg-zinc-50 border border-zinc-100 px-3 py-2 rounded-xl shadow-sm">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{key}</span>
              <span className="text-xs font-black text-emerald-700">{String(val)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center p-4 bg-zinc-50 border border-dashed border-zinc-200 rounded-xl">
          <p className="text-[10px] font-bold text-zinc-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" /> Model trained using default Fast-Mode parameters (No Tuning / Empty).
          </p>
        </div>
      )}
    </div>
  );
}