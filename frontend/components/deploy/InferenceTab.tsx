export default function InferenceTab({ inputs, setMockForm, handleMockPredict, primary, lastPrediction }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-white rounded-xl border border-zinc-100 shadow-sm animate-in fade-in slide-in-from-right-4">
      <div className="space-y-4 border-r border-zinc-100 pr-6">
        <h3 className="text-xs font-black text-zinc-800">Feature Inputs</h3>
        <div className="space-y-3">
          {inputs.map((i: any) => (
            <div key={i.name} className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-zinc-500 uppercase">{i.name}</label>
              <input type="number" placeholder="0.00" onChange={(e) => setMockForm((p: any) => ({ ...p, [i.name]: parseFloat(e.target.value) || 0 }))} className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded-md text-xs outline-none focus:border-emerald-500 transition-all" />
            </div>
          ))}
        </div>
        <button onClick={handleMockPredict} className="w-full py-2.5 rounded-lg text-white text-[10px] font-black shadow flex items-center justify-center hover:opacity-90 transition-all" style={{ backgroundColor: primary }}>Execute Inference Command</button>
      </div>
      <div className="flex flex-col items-center justify-center">
        <h3 className="text-xs font-black text-zinc-800 mb-4 self-start w-full">Inference Result</h3>
        {lastPrediction !== null ? (
          <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6" style={{ borderColor: primary }}>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Engine Output</p>
            <h1 className="text-5xl font-black" style={{ color: primary }}>{lastPrediction.toFixed(4)}</h1>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-50 rounded-xl border border-zinc-100">
            <p className="text-[10px] font-bold text-zinc-400">Awaiting input data.</p>
          </div>
        )}
      </div>
    </div>
  );
}