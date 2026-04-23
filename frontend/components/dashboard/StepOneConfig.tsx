import { Network, BarChart3, Boxes, FileUp, Wand2, ArrowLeftRight, Database, Target, ArrowRight } from "lucide-react";

export default function StepOneConfig({
  step, projectName, setProjectName, taskType, setTaskType, dataFile, handleFileUpload,
  nanStrategy, setNanStrategy, scalingStrategy, setScalingStrategy, encodeLabels, setEncodeLabels,
  previewTab, setPreviewTab, columns, rawRows, processedRows, selectedX, setSelectedX,
  selectedY, setSelectedY, setStep
}: any) {
  return (
    <div className={`absolute top-0 left-0 w-full transition-all duration-500 ${step === 1 ? "opacity-100 translate-x-0 pointer-events-auto relative" : "opacity-0 -translate-x-8 pointer-events-none absolute"}`}>
      <div className="space-y-4">
        <div className="bg-white/70 backdrop-blur-xl border border-white shadow-sm p-6 rounded-[1.5rem] space-y-4">
          <label className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">1</div>
            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-800">Experiment Identity</span>
          </label>
          <input
            type="text" 
            value={projectName} 
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="E.g., Customer Churn Prediction..."
            className="w-full bg-white/60 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-black outline-none focus:border-emerald-400 transition-all shadow-sm"
            required
          />
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white shadow-sm p-6 rounded-[1.5rem] space-y-4">
          <label className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">2</div>
            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-800">Architecture</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {([
              { id: "classification", label: "Classification", icon: Network, desc: "Discrete classes" },
              { id: "regression", label: "Regression", icon: BarChart3, desc: "Continuous values" },
              { id: "clustering", label: "Clustering", icon: Boxes, desc: "Unlabeled patterns" }
            ] as const).map((t) => (
              <button
                key={t.id} 
                type="button"
                onClick={() => setTaskType(t.id)}
                className={`group p-4 rounded-2xl border-2 text-left transition-all ${
                  taskType === t.id ? "border-emerald-400 bg-emerald-50/50 shadow-md" : "border-zinc-100 bg-white/50 hover:bg-white"
                }`}
              >
                <t.icon className={`w-5 h-5 mb-2 ${taskType === t.id ? "text-emerald-500" : "text-zinc-400"}`} />
                <h4 className={`font-black text-xs mb-0.5 ${taskType === t.id ? "text-emerald-900" : "text-zinc-700"}`}>{t.label}</h4>
                <p className="text-[9px] font-bold text-zinc-400">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white shadow-sm p-6 rounded-[1.5rem] space-y-4">
            <label className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">3</div>
            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-800">Data Pipeline</span>
          </label>
          
          {!dataFile ? (
            <label className="block p-10 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50 text-center cursor-pointer hover:border-emerald-400 transition-all">
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
              <FileUp className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-zinc-700 font-black text-xs">Drop CSV Dataset here</h4>
              <p className="text-[9px] font-bold text-zinc-400 mt-1">Maximum 5 MB (Preview 5 Rows)</p>
            </label>
          ) : (
            <div className="space-y-4 animate-in zoom-in-95">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-400 uppercase">NaN Strategy</label>
                  <select value={nanStrategy} onChange={e => setNanStrategy(e.target.value)} className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-[10px] font-bold">
                    <option value="drop">Drop Missing Rows</option>
                    <option value="mean">Fill with Mean</option>
                    <option value="median">Fill with Median</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-400 uppercase">Scaling Strategy</label>
                  <select value={scalingStrategy} onChange={e => setScalingStrategy(e.target.value)} className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-[10px] font-bold">
                    <option value="none">No Scaling</option>
                    <option value="x">Scale Features (X)</option>
                    <option value="all">Scale All (X & Y)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between p-3 bg-white rounded-xl border border-zinc-100 shadow-sm">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-black text-zinc-800">Auto-Cleaning Rules</span>
                </div>
                <div className="flex gap-2">
                      <button type="button" onClick={() => setEncodeLabels(!encodeLabels)} className={`px-3 py-1.5 rounded-md border text-[9px] font-black transition-all ${encodeLabels ? "bg-emerald-500 text-white border-emerald-500" : "bg-zinc-50 text-zinc-400 border-zinc-200"}`}>
                        Encode Labels {encodeLabels ? "(ON)" : "(OFF)"}
                      </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex bg-zinc-100 p-1 rounded-lg w-fit">
                  <button type="button" onClick={() => setPreviewTab("before")} className={`px-3 py-1 text-[9px] font-black rounded-md ${previewTab === "before" ? "bg-white shadow-sm" : "text-zinc-500"}`}>RAW DATA</button>
                  <button type="button" onClick={() => setPreviewTab("after")} className={`px-3 py-1 text-[9px] font-black rounded-md flex items-center gap-1 ${previewTab === "after" ? "bg-emerald-100 text-emerald-700 shadow-sm" : "text-zinc-500"}`}>
                    <ArrowLeftRight className="w-2.5 h-2.5" /> CLEANED
                  </button>
                </div>
                
                <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-zinc-50">
                        {columns.map((c: string, i: number) => (
                          <th key={i} className="p-2 text-[8px] font-black text-zinc-400 uppercase tracking-tighter border-b border-zinc-100">{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(previewTab === "before" ? rawRows : processedRows).map((row: string[], rIdx: number) => (
                        <tr key={rIdx} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50 transition-colors">
                          {row.map((val: string, cIdx: number) => (
                            <td key={cIdx} className="p-2 text-[10px] font-medium text-zinc-600 truncate max-w-[100px]">
                              {val === '' ? <span className="text-red-400 italic">NaN</span> : val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[8px] text-zinc-400 font-bold italic text-right mt-1">* Menampilkan 5 baris pertama untuk preview visual.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <p className="text-[9px] font-black text-zinc-400 uppercase flex items-center gap-1">
                    <Database className="w-2.5 h-2.5" /> Features (X)
                  </p>
                  <div className="flex flex-wrap gap-1">
                      {columns.map((colName: string) => (
                        <button key={`x-${colName}`} type="button" onClick={() => setSelectedX((prev: string[]) => prev.includes(colName) ? prev.filter(x => x !== colName) : [...prev, colName])} className={`px-2 py-1 rounded-md text-[9px] font-bold border transition-all ${selectedX.includes(colName) ? "bg-emerald-50 text-emerald-700 border-emerald-400 shadow-sm" : "bg-white text-zinc-500 border-zinc-200"}`}>
                          {colName}
                        </button>
                      ))}
                  </div>
                </div>
                
                {taskType !== "clustering" && (
                  <div className="space-y-1.5">
                    <p className="text-[9px] font-black text-zinc-400 uppercase flex items-center gap-1">
                      <Target className="w-2.5 h-2.5" /> Target (Y)
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {columns.map((colName: string) => (
                          <button key={`y-${colName}`} type="button" onClick={() => setSelectedY(colName)} className={`px-2 py-1 rounded-md text-[9px] font-bold border transition-all ${selectedY === colName ? "bg-zinc-900 text-white border-zinc-900 shadow-md" : "bg-white text-zinc-500 border-zinc-200"}`}>
                            {colName}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <button 
          type="button" 
          onClick={() => setStep(2)} 
          disabled={!projectName.trim() || (columns.length > 0 && (selectedX.length === 0 || (taskType !== "clustering" && !selectedY)))} 
          className="w-full h-12 bg-zinc-900 text-white rounded-xl flex items-center justify-center gap-2 disabled:opacity-30 transition-all font-black text-[11px] uppercase tracking-widest shadow-lg active:scale-[0.98]"
        >
          Confirm Architecture & Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}