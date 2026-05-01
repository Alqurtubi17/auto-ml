import { Terminal, CheckCircle2 } from "lucide-react";

export default function TrainerGuidePanel({ projectName }: { projectName: string }) {
  const modelName = `model_${projectName.toLowerCase().replace(/ /g, '_')}.joblib`;

  return (
    <div className="bg-white border border-zinc-200 rounded-[1.25rem] shadow-sm overflow-hidden">
      <div className="p-5 border-b border-zinc-100 bg-zinc-50/50">
        <div className="flex items-center gap-2 mb-1">
          <Terminal className="w-4 h-4 text-emerald-500" />
          <h3 className="text-xs font-black text-zinc-800 uppercase tracking-widest">Local Training Guide</h3>
        </div>
        <p className="text-[10px] font-bold text-zinc-500">How to train this model on your own PC with unlimited data.</p>
      </div>
      
      <div className="p-5 space-y-6">
        {/* Step 1: VENV */}
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">1</div>
            <div className="w-0.5 h-full bg-zinc-100 my-1"></div>
          </div>
          <div className="flex-1 pb-4">
            <h4 className="text-[11px] font-black text-zinc-800 mb-2">Create Environment</h4>
            <div className="bg-zinc-900 rounded-lg p-3 font-mono text-[9px] text-emerald-400 space-y-1">
              <div className="text-zinc-500"># 1. Create venv</div>
              <div>python -m venv venv</div>
              <div className="text-zinc-500 pt-2"># 2. Activate (Windows)</div>
              <div>.\venv\Scripts\activate</div>
              <div className="text-zinc-500 pt-2"># 2. Activate (Mac/Linux)</div>
              <div>source venv/bin/activate</div>
            </div>
          </div>
        </div>

        {/* Step 2: Install */}
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">2</div>
            <div className="w-0.5 h-full bg-zinc-100 my-1"></div>
          </div>
          <div className="flex-1 pb-4">
            <h4 className="text-[11px] font-black text-zinc-800 mb-2">Install Libraries</h4>
            <div className="bg-zinc-900 rounded-lg p-3 font-mono text-[10px] text-emerald-400">
              pip install pandas numpy scikit-learn joblib
            </div>
          </div>
        </div>

        {/* Step 3: Run */}
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">3</div>
          </div>
          <div className="flex-1">
            <h4 className="text-[11px] font-black text-zinc-800 mb-2">Download & Train</h4>
            <ul className="text-[10px] font-bold text-zinc-500 space-y-1.5 mb-3">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Download <span className="text-zinc-800">trainer.py</span></li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Use your data as <span className="text-zinc-800">data_anda.csv</span></li>
            </ul>
            <div className="bg-zinc-900 rounded-lg p-3 font-mono text-[10px] text-emerald-400 mb-2">
              python trainer.py
            </div>
            <p className="text-[9px] font-bold text-zinc-400 italic">This generates <span className="text-emerald-600">"{modelName}"</span>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
