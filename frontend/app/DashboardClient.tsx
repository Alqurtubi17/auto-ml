"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { MLTaskType } from "@/types";
import { Network, BarChart3, Database, ArrowRight, GitMerge, Loader2, Server, Boxes, Settings2 } from "lucide-react";

// Konfigurasi Algoritma per Task
const ALGORITHMS = {
  classification: [
    { id: "auto", name: "Auto-Optimize (Best Model)", desc: "Latih semua algoritma dan pilih yang terbaik." },
    { id: "rf_clf", name: "Random Forest", desc: "Ensemble robust untuk data kompleks." },
    { id: "svm_clf", name: "Support Vector Machine", desc: "Pemisahan margin optimal." },
    { id: "lr_clf", name: "Logistic Regression", desc: "Analisis probabilistik linear." },
    { id: "gb_clf", name: "Gradient Boosting", desc: "Reduksi error sekuensial." },
    { id: "knn_clf", name: "K-Nearest Neighbors", desc: "Klasifikasi berbasis jarak terdekat." },
  ],
  regression: [
    { id: "auto", name: "Auto-Optimize (Best Model)", desc: "Latih semua algoritma dan pilih yang terbaik." },
    { id: "rf_reg", name: "Random Forest Regressor", desc: "Estimasi non-linear akurat." },
    { id: "svm_reg", name: "Support Vector Regression", desc: "Regresi dengan toleransi margin." },
    { id: "lr_reg", name: "Linear Regression", desc: "Garis tren dasar linier." },
    { id: "ridge_reg", name: "Ridge Regression", desc: "Regresi linier dengan penalti L2." },
    { id: "gb_reg", name: "Gradient Boosting Regressor", desc: "Optimasi prediksi bertahap." },
  ],
  clustering: [
    { id: "auto", name: "Auto-Optimize (Best Model)", desc: "Latih semua algoritma dan pilih yang terbaik." },
    { id: "kmeans", name: "K-Means", desc: "Partisi berbasis titik pusat (centroid)." },
    { id: "dbscan", name: "DBSCAN", desc: "Pengelompokan berbasis kepadatan." },
    { id: "agglomerative", name: "Agglomerative", desc: "Hierarki klaster bottom-up." },
    { id: "gmm", name: "Gaussian Mixture", desc: "Distribusi probabilitas klaster." },
    { id: "birch", name: "BIRCH", desc: "Klastering efisien untuk dataset besar." },
  ]
};

export default function DashboardClient() {
  const router = useRouter();
  const [projectName, setProjectName] = useState("");
  const [taskType, setTaskType] = useState<MLTaskType>("classification");
  
  // State baru untuk menyimpan algoritma yang dipilih
  const [selectedAlgo, setSelectedAlgo] = useState(ALGORITHMS["classification"][0].id);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Otomatis reset algoritma jika Task berubah (tanpa useEffect, langsung dilampirkan ke handler)
  const handleTaskChange = (newTask: MLTaskType) => {
    setTaskType(newTask);
    setSelectedAlgo(ALGORITHMS[newTask][0].id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !selectedAlgo) return;
    
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      // Mengirim taskType dan algorithm ke backend
      const job = await api.builds.create({ 
        projectName, 
        taskType,
        algorithm: selectedAlgo // <--- Parameter baru
      });
      router.push(`/build/${job.id}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menghubungi server FastAPI.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold text-emerald-950 tracking-tight leading-tight">
          Inisialisasi Model Prediktif.
        </h1>
        <p className="text-emerald-800/60 font-medium text-sm leading-relaxed">
          Konfigurasi parameter dasar dan pilih algoritma untuk memulai proses pelatihan.
        </p>
      </header>

      <div className="bg-white rounded-[2rem] shadow-sm border border-emerald-100/50 flex flex-col lg:flex-row overflow-hidden relative z-10">
        
        {/* PANEL KIRI: Form Input */}
        <div className="w-full lg:w-3/5 p-6 sm:p-10 flex flex-col justify-center bg-white relative border-b lg:border-b-0 lg:border-r border-emerald-50">
          <div className="max-w-md w-full mx-auto space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                  1. Identitas Eksperimen
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Masukkan nama eksperimen..."
                  className="w-full bg-white border-2 border-emerald-100 rounded-xl px-4 py-3 text-sm text-emerald-950 font-semibold focus:border-emerald-500 transition-all outline-none placeholder:text-emerald-200 hover:border-emerald-200"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                  2. Arsitektur Algoritma
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: "classification", label: "Klasifikasi", icon: Network, desc: "Kategori diskrit." },
                    { id: "regression", label: "Regresi", icon: BarChart3, desc: "Nilai kontinu." },
                    { id: "clustering", label: "Clustering", icon: Boxes, desc: "Data tanpa label." }
                  ].map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => handleTaskChange(task.id as MLTaskType)}
                      disabled={isSubmitting}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all duration-300 flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-0 ${
                        taskType === task.id 
                          ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/10" 
                          : "border-emerald-50 bg-white hover:border-emerald-100"
                      }`}
                    >
                      <task.icon className={`w-5 h-5 sm:mb-2 shrink-0 ${taskType === task.id ? "text-emerald-600" : "text-emerald-300"}`} />
                      <div>
                        <div className={`font-bold text-xs sm:text-sm ${taskType === task.id ? "text-emerald-950" : "text-emerald-800"}`}>{task.label}</div>
                        <div className="text-[10px] sm:text-[11px] text-emerald-600/70 mt-0.5 sm:mt-1 font-medium">{task.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* BARU: PEMILIHAN ALGORITMA SPESIFIK */}
              <div className="space-y-3 pt-2">
                <label className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                  <Settings2 className="w-3.5 h-3.5" /> 3. Spesifikasi Engine
                </label>
                <div className="bg-emerald-50/50 p-1.5 rounded-xl border border-emerald-100/60 grid grid-cols-1 gap-1">
                  {ALGORITHMS[taskType].map((algo) => (
                    <button
                      key={algo.id}
                      type="button"
                      onClick={() => setSelectedAlgo(algo.id)}
                      disabled={isSubmitting}
                      className={`px-4 py-3 rounded-lg text-left transition-all flex flex-col justify-center ${
                        selectedAlgo === algo.id 
                          ? (algo.id === "auto" ? "bg-emerald-600 border-emerald-600 shadow-md shadow-emerald-600/20" : "bg-white border-emerald-200 shadow-sm")
                          : (algo.id === "auto" ? "bg-emerald-100/50 border border-emerald-200/50 hover:bg-emerald-200/50" : "border border-transparent hover:bg-emerald-100/50")
                      }`}
                    >
                      <div className={`text-xs font-bold flex items-center gap-2 ${
                          selectedAlgo === algo.id 
                            ? (algo.id === "auto" ? "text-white" : "text-emerald-900")
                            : (algo.id === "auto" ? "text-emerald-800" : "text-emerald-800/70")
                        }`}>
                        {algo.name}
                        {algo.id === "auto" && <div className={`text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded-sm ${selectedAlgo === algo.id ? "bg-emerald-500/50 text-white" : "bg-emerald-200/50 text-emerald-700"}`}>Champion</div>}
                      </div>
                      {selectedAlgo === algo.id && (
                         <div className={`text-[10px] font-medium mt-0.5 ${algo.id === "auto" ? "text-emerald-50" : "text-emerald-600/80"}`}>{algo.desc}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs font-semibold rounded-xl">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !projectName.trim()}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-100 text-white font-bold py-4 rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20 flex justify-center items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : "Mulai Pelatihan Model"}
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>

        {/* PANEL KANAN: Pipeline Info */}
        <div className="w-full lg:w-2/5 bg-emerald-50/30 p-6 sm:p-10 flex flex-col justify-center relative">
          {/* ... (Panel Pipeline Kanan tetap sama seperti versi sebelumnya) ... */}
          <div className="max-w-sm mx-auto w-full space-y-6">
            <h3 className="text-emerald-700 font-bold tracking-widest uppercase text-[10px] flex items-center gap-2">
              <span className="w-8 h-[2px] bg-emerald-200" /> System Pipeline
            </h3>
            
            {[
              { label: "Data Provisioning", icon: Database, desc: "Penyiapan dataset dan pemilihan arsitektur." },
              { label: "Algorithmic Fitting", icon: GitMerge, desc: "Eksekusi komputasi model yang diplih." },
              { label: "Live Deployment", icon: Server, desc: "Pembuatan dashboard analitik otomatis.", primary: true }
            ].map((step, idx) => (
              <div key={idx} className={`p-5 rounded-xl border transition-all ${step.primary ? 'bg-emerald-600 border-emerald-200 text-white shadow-md shadow-emerald-600/20' : 'bg-white border-emerald-100 text-emerald-950'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <step.icon className={`w-4 h-4 ${step.primary ? 'text-white' : 'text-emerald-600'}`} />
                  <h4 className="font-bold text-sm">{step.label}</h4>
                </div>
                <p className={`text-[12px] leading-relaxed pl-7 ${step.primary ? 'text-emerald-50' : 'text-emerald-800/70'}`}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}