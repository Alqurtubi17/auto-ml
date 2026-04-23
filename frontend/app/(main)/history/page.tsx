"use client";

import useSWR from "swr";
import { api } from "@/lib/api";
import { MLProject } from "@/types";
import Link from "next/link";
import { 
  RefreshCw, Trash2, Search, History, Database, ChevronRight, Activity, Beaker, Layers
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const STATUS: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  queued:     { label: "Standby",   color: "text-zinc-400", bg: "bg-zinc-50", dot: "bg-zinc-300" },
  training:   { label: "Training",  color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-500 animate-pulse" },
  generating: { label: "Building",  color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-400 animate-pulse" },
  done:       { label: "Success",   color: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-600" },
  error:      { label: "Failed",    color: "text-red-600", bg: "bg-red-50", dot: "bg-red-500" },
  stopped:    { label: "Stopped",   color: "text-zinc-500", bg: "bg-zinc-100", dot: "bg-zinc-400" },
};

export default function HistoryPage() {
  const { data, isLoading, mutate } = useSWR<{ builds: MLProject[] }>("/api/v1/builds", api.builds.list as any);
  const [search, setSearch] = useState("");
  const builds = (data?.builds || []).filter(b => b.projectName.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    toast('Purge experiment data?', {
      description: 'Model weights and system logs will be permanently deleted.',
      action: { 
        label: 'Confirm', 
        onClick: () => toast.promise(api.builds.delete(id), { 
          loading: 'Purging...', 
          success: () => { mutate(); return 'Archive updated'; }, 
          error: 'Failed to purge' 
        }) 
      },
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
             <History className="w-3.5 h-3.5" /> Experiment Logs
          </div>
          <h1 className="text-3xl font-black text-zinc-800 tracking-tight">Archive Repository</h1>
          <p className="text-zinc-500 text-sm font-medium">Manage and review historical model training iterations.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" placeholder="Search archive..." value={search} onChange={e => setSearch(e.target.value)}
              className="bg-zinc-100/50 border-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white w-64 transition-all"
            />
          </div>
          <button onClick={() => mutate()} className="p-2.5 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 text-zinc-400 hover:text-emerald-600 transition-all shadow-sm">
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-500" : ""}`} />
          </button>
        </div>
      </header>

      <div className="bg-white border border-zinc-200 rounded-[1.5rem] shadow-sm overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-zinc-50/50 border-b border-zinc-100">
           <div className="col-span-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Status</div>
           <div className="col-span-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Job Identity</div>
           <div className="col-span-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Accuracy</div>
           <div className="col-span-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Engine Config</div>
           <div className="col-span-1" />
        </div>

        <div className="divide-y divide-zinc-50">
          {builds.length === 0 && !isLoading ? (
             <div className="py-24 text-center space-y-4">
                <Database className="w-10 h-10 text-zinc-200 mx-auto" />
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">No historical data available</p>
             </div>
          ) : builds.map((p) => {
            const m = STATUS[p.status] ?? STATUS.queued;
            return (
              <Link key={p.id} href={`/build/${p.id}`} className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 px-6 py-5 hover:bg-emerald-50/30 transition-all group">
                
                <div className="col-span-2">
                  <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg ${m.bg} ${m.color} border border-transparent`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">{m.label}</span>
                  </div>
                </div>
                
                <div className="col-span-4">
                  <h3 className="font-bold text-zinc-800 text-sm tracking-tight group-hover:text-emerald-700 transition-colors uppercase truncate">
                    {p.projectName}
                  </h3>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase mt-0.5 tracking-wider">
                    {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>

                <div className="col-span-2 text-center">
                   <p className="text-base font-black text-zinc-900 tracking-tighter">
                     {p.accuracy != null ? `${(p.accuracy * 100).toFixed(1)}%` : "—"}
                   </p>
                   <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Performance</p>
                </div>

                <div className="col-span-3 flex justify-center">
                   <div className="flex items-center gap-2 px-3 py-1 bg-zinc-100 text-zinc-500 rounded-lg border border-zinc-200 group-hover:bg-emerald-100 group-hover:text-emerald-700 group-hover:border-emerald-200 transition-colors">
                      <Layers className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">{p.taskType}</span>
                   </div>
                </div>

                <div className="col-span-1 flex justify-end">
                  <button 
                    onClick={e => handleDelete(e, p.id)} 
                    className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <footer className="flex flex-col md:flex-row items-center justify-between gap-6 px-6 py-6 bg-zinc-50 rounded-3xl border border-zinc-200">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center text-zinc-400">
               <Beaker className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
               <h4 className="text-xs font-black text-zinc-800 uppercase tracking-tight">Encryption Active</h4>
               <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">Model weights secured via AES-256</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Archive Status: Nominal</span>
          </div>
      </footer>
    </div>
  );
}