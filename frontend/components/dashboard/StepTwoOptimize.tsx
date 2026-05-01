import { Edit2, Check, Settings2, Loader2, Sparkles, Info } from "lucide-react";

const ALGORITHMS = {
  classification: [
    { id: "auto", name: "Champion Engine", desc: "Auto-optimize & select winner" },
    { id: "lr_clf", name: "Logistic Regression", desc: "Classic probability" },
    { id: "dt_clf", name: "Decision Tree", desc: "Rule-based splitting" },
    { id: "rf_clf", name: "Random Forest", desc: "Ensemble tree learning" },
    { id: "gb_clf", name: "Gradient Boosting", desc: "XGBoost, LightGBM, CatBoost" },
    { id: "svm_clf", name: "SVM", desc: "Optimal separation" },
    { id: "knn_clf", name: "K-Nearest Neighbors", desc: "Distance-based classification" },
    { id: "nb_clf", name: "Naive Bayes", desc: "Probabilistic classifier" },
    { id: "mlp_clf", name: "Neural Networks", desc: "MLP Classifier" },
    { id: "ada_clf", name: "AdaBoost", desc: "Adaptive Boosting" },
    { id: "et_clf", name: "Extra Trees", desc: "Extremely randomized trees" },
  ],
  regression: [
    { id: "auto", name: "Champion Engine", desc: "Auto-optimize & select winner" },
    { id: "lr_reg", name: "Linear Regression", desc: "Fundamental trends" },
    { id: "ridge_reg", name: "Ridge Regression", desc: "L2 Regularization" },
    { id: "lasso_reg", name: "Lasso Regression", desc: "L1 Regularization" },
    { id: "elastic_reg", name: "Elastic Net", desc: "L1 & L2 Regularization" },
    { id: "poly_reg", name: "Polynomial", desc: "Non-linear relationships" },
    { id: "dt_reg", name: "Decision Tree", desc: "Rule-based estimation" },
    { id: "rf_reg", name: "Random Forest", desc: "Non-linear estimation" },
    { id: "gb_reg", name: "Gradient Boosting", desc: "XGBoost, LightGBM, CatBoost" },
    { id: "svm_reg", name: "SVR", desc: "Margin-based regression" },
    { id: "knn_reg", name: "KNN Regression", desc: "Distance-based estimation" },
  ],
  clustering: [
    { id: "auto", name: "Champion Engine", desc: "Auto-optimize & select winner" },
    { id: "kmeans", name: "K-Means", desc: "Centroid partitioning" },
    { id: "dbscan", name: "DBSCAN", desc: "Density grouping" },
    { id: "agglomerative", name: "Agglomerative", desc: "Hierarchical merging" },
    { id: "gmm", name: "Gaussian Mix", desc: "Probabilistic density" },
  ]
};

export default function StepTwoOptimize({
  step, setStep, loading, taskType, selectedAlgo, setSelectedAlgo, useTuning, setUseTuning, loadTxt, customParams, setCustomParams
}: any) {
  return (
    <div className={`absolute top-0 left-0 w-full transition-all duration-500 ${step === 2 ? "opacity-100 translate-x-0 pointer-events-auto relative" : "opacity-0 translate-x-8 pointer-events-none absolute"}`}>
      <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-[1.5rem] flex items-center justify-between shadow-sm">
            <div>
              <span className="text-[10px] font-black text-emerald-800 uppercase block">Configuration Ready</span>
              <span className="text-xs font-medium text-emerald-600">Pipeline & Data validated.</span>
            </div>
            <button type="button" disabled={loading} onClick={() => setStep(1)} className="px-4 py-2 bg-white text-emerald-700 rounded-lg text-[10px] font-black uppercase hover:bg-emerald-50 transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-40">
              <Edit2 className="w-3 h-3" /> Edit Config
            </button>
          </div>

          <div className={`bg-white/70 backdrop-blur-xl border border-white shadow-sm p-6 rounded-[1.5rem] space-y-4 transition-opacity ${loading ? "opacity-60 pointer-events-none" : ""}`}>
            <label className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">4</div>
              <span className="text-[11px] font-black uppercase tracking-widest text-zinc-800">Engine Selection</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {(ALGORITHMS[taskType as keyof typeof ALGORITHMS] || []).map((algo) => (
                  <button key={algo.id} type="button" onClick={() => setSelectedAlgo(algo.id)} disabled={loading} className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${selectedAlgo === algo.id ? "border-emerald-400 bg-emerald-50 shadow-sm" : "border-zinc-100 bg-white hover:border-zinc-200"}`}>
                    <div className="text-left flex items-center gap-2">
                      <h4 className="font-black text-xs">
                        {algo.name}
                        {algo.id === "auto" && <span className="ml-2 text-[8px] font-black px-1.5 py-0.5 rounded bg-emerald-500 text-white">AUTO</span>}
                      </h4>
                      <span className="text-[10px] hidden sm:inline-block ml-1 text-zinc-400">— {algo.desc}</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${selectedAlgo === algo.id ? "border-emerald-500 bg-emerald-500 text-white" : "border-zinc-200 bg-zinc-50"}`}>
                      {selectedAlgo === algo.id && <Check className="w-2.5 h-2.5" />}
                    </div>
                  </button>
                ))}
            </div>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black text-zinc-800">Hyperparameter Optimization</span>
              </div>
              <button 
                type="button"
                onClick={() => setUseTuning(!useTuning)}
                className={`px-3 py-1.5 rounded-md border text-[9px] font-black transition-all ${useTuning ? "bg-emerald-500 text-white border-emerald-500" : "bg-zinc-50 text-zinc-400 border-zinc-200"}`}
              >
                {useTuning ? "Enabled (RandomSearch)" : "Disabled (Fast Mode)"}
              </button>
            </div>

            {useTuning && (
              <div className="mt-4 p-4 bg-zinc-50 border border-zinc-100 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
                {selectedAlgo === "auto" ? (
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-zinc-800 uppercase tracking-widest">Auto-Tuning Active</p>
                      <p className="text-xs font-medium text-zinc-600 mt-1">The system will automatically tune all algorithms using the built-in parameter grid. Please select a specific algorithm above if you want to enter custom parameters.</p>
                    </div>
                  </div>
                ) : (!customParams || Object.keys(customParams).length === 0) ? (
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-zinc-400 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-zinc-800 uppercase tracking-widest">No Tuning Required</p>
                      <p className="text-xs font-medium text-zinc-600 mt-1">This algorithm does not have major hyperparameters that need to be configured through this platform.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Tuning Bounds (Comma Separated)</p>
                    <div className="grid grid-cols-1 gap-3">
                      {Object.keys(customParams).map(key => (
                        <div key={key} className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-zinc-600">{key}</label>
                          <input 
                            type="text" 
                            value={customParams[key]} 
                            onChange={(e) => setCustomParams((p: any) => ({...p, [key]: e.target.value}))}
                            className="w-full p-2.5 bg-white border border-zinc-200 rounded-lg text-xs font-mono text-emerald-700 outline-none focus:border-emerald-500 transition-all shadow-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className={`p-6 bg-zinc-900 rounded-[1.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl relative overflow-hidden group transition-all ${loading ? "border border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]" : ""}`}>
            <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-2xl transition-all duration-700 ${loading ? "bg-emerald-500/30 animate-pulse" : "bg-emerald-500/10 group-hover:bg-emerald-500/20"}`} />
            <div className="relative z-10 text-center md:text-left">
              <h4 className="text-lg font-black tracking-tight">{loading ? "Training Node..." : "Ready for Calibration"}</h4>
              <p className="text-emerald-400/80 text-[9px] font-bold uppercase tracking-[0.2em]">{loading ? "Cluster processing vectors..." : "High-performance compute ready."}</p>
            </div>
            <button type="submit" disabled={loading} className="relative z-10 h-12 px-8 bg-gradient-to-r from-emerald-500 to-emerald-400 text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)] disabled:opacity-90 w-full md:w-auto flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> {loadTxt}</> : <><Sparkles className="w-4 h-4" /> Start Engine</>}
            </button>
          </div>
      </div>
    </div>
  );
}