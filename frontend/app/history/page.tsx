"use client";

import useSWR from "swr";
import { api } from "@/lib/api";
import { MLProject } from "@/types";
import Link from "next/link";
import { Database, Network, BarChart3, Boxes, Clock, CheckCircle2, XCircle, ChevronRight, RefreshCw } from "lucide-react";

const STATUS_META: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  queued:     { label: "Antrean",  color: "text-amber-600", bg: "bg-amber-50", icon: <Clock className="w-3.5 h-3.5" /> },
  training:   { label: "Training", color: "text-emerald-500", bg: "bg-emerald-50", icon: <Loader2 className="w-3.5 h-3.5 animate-spin" /> },
  generating: { label: "Deploying",color: "text-teal-500",  bg: "bg-teal-50", icon: <Loader2 className="w-3.5 h-3.5 animate-spin" /> },
  done:       { label: "Selesai",  color: "text-emerald-700", bg: "bg-emerald-100/50", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  error:      { label: "Gagal",    color: "text-red-600", bg: "bg-red-50", icon: <XCircle className="w-3.5 h-3.5" /> },
};

function Loader2(props: any) { return <RefreshCw {...props} /> } // Fallback icon

export default function HistoryPage() {
  const { data, isLoading, error, mutate } = useSWR<{ builds: MLProject[] }>("/api/builds", api.builds.list);
  const builds = data?.builds || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-emerald-950 tracking-tight">Arsip Eksperimen</h1>
          <p className="text-emerald-800/60 font-medium text-sm mt-1">Kelola dan pantau seluruh model yang telah dilatih.</p>
        </div>
        <button 
          onClick={() => mutate()} 
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-emerald-100 text-xs font-bold text-emerald-700 shadow-sm hover:bg-emerald-50 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} /> Segarkan
        </button>
      </header>

      {/* Tabel Utama */}
      <div className="bg-white border border-emerald-100/60 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="hidden sm:flex items-center gap-4 px-8 py-4 bg-emerald-50/30 border-b border-emerald-100/60">
          <span className="text-[10px] font-extrabold text-emerald-700/50 uppercase tracking-widest w-32">Status</span>
          <span className="text-[10px] font-extrabold text-emerald-700/50 uppercase tracking-widest flex-1">Project</span>
          <span className="text-[10px] font-extrabold text-emerald-700/50 uppercase tracking-widest w-24 text-right">Akurasi</span>
          <span className="w-10" />
        </div>

        <div className="divide-y divide-emerald-50">
          {builds.length === 0 && !isLoading ? (
             <div className="py-20 text-center text-emerald-800/40 font-bold">Belum ada data eksperimen.</div>
          ) : builds.map((project) => {
            const meta = STATUS_META[project.status] ?? STATUS_META.queued;
            return (
              <Link 
                href={`/build/${project.id}`} 
                key={project.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 px-8 py-5 hover:bg-emerald-50/30 transition-all group"
              >
                <div className="w-32 shrink-0">
                  <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg ${meta.bg} ${meta.color} border border-white`}>
                    {meta.icon}
                    <span className="text-[10px] font-bold uppercase">{meta.label}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-emerald-950">{project.projectName}</h3>
                  <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-600/60 uppercase mt-0.5">
                    {project.taskType}
                  </div>
                </div>
                <div className="w-24 text-right">
                  <span className="text-sm font-extrabold text-emerald-600">
                    {project.accuracy != null ? `${(project.accuracy * 100).toFixed(1)}%` : "—"}
                  </span>
                </div>
                <div className="w-10 flex justify-end">
                   <ChevronRight className="w-5 h-5 text-emerald-200 group-hover:text-emerald-500 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}