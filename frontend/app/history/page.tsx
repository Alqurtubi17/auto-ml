"use client";

import useSWR from "swr";
import { api } from "@/lib/api";
import { MLProject } from "@/types";
import Link from "next/link";
import { 
  RefreshCw, Trash2, StopCircle, Search, History, Database
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  queued:     { label: "Standby",   color: "text-[#9792e3]", bg: "bg-[#61e786]/50" },
  training:   { label: "Training",  color: "text-[#48435c]", bg: "bg-[#61e786]/50" },
  generating: { label: "Building",  color: "text-[#5a5766]", bg: "bg-[#61e786]/50" },
  done:       { label: "Success",   color: "text-emerald-700", bg: "bg-emerald-50" },
  error:      { label: "Failed",    color: "text-[#5a5766]", bg: "bg-[#5a5766]/5" },
  stopped:    { label: "Stopped",   color: "text-[#48435c]/40", bg: "bg-[#48435c]/5" },
};

export default function HistoryPage() {
  const { data, isLoading, mutate } = useSWR<{ builds: MLProject[] }>("/api/v1/builds", api.builds.list as any);
  const [search, setSearch] = useState("");
  const builds = (data?.builds || []).filter(b => b.projectName.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    toast('Purge experiment data?', {
      description: 'Model weights and system logs will be permanently deleted.',
      action: { label: 'Confirm', onClick: () => toast.promise(api.builds.delete(id), { loading: 'Purging...', success: () => { mutate(); return 'Deleted'; }, error: 'Failed' }) },
      cancel: { label: 'Cancel', onClick: () => {} },
    });
  };

  const handleStop = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    toast.promise(api.builds.stop(id), { loading: 'Stopping...', success: () => { mutate(); return 'Stopped'; }, error: 'Failed' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#61e786] text-[#48435c] text-[10px] font-black uppercase tracking-[0.2em] border border-[#48435c]/10">
             <History className="w-3.5 h-3.5" /> System Logs
          </div>
          <h1 className="text-title text-3xl">Experiment Archive</h1>
          <p className="text-body text-sm font-medium opacity-60">Repository of historical training runs.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#48435c]/20" />
            <input 
              type="text" placeholder="Filter..." value={search} onChange={e => setSearch(e.target.value)}
              className="bg-white border border-[#48435c]/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-black text-[#48435c] outline-none focus:border-[#9792e3] w-48 shadow-sm transition-all"
            />
          </div>
          <button onClick={() => mutate()} className="p-2.5 bg-white border border-[#48435c]/10 rounded-xl hover:bg-[#61e786]/50 transition-all shadow-sm">
            <RefreshCw className={`w-4 h-4 text-[#48435c]/40 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      <div className="bg-white border border-[#48435c]/10 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-[#61e786]/10 border-b border-[#48435c]/5">
           <div className="col-span-2 text-label">Status</div>
           <div className="col-span-5 text-label">Job Identity</div>
           <div className="col-span-2 text-label">Precision</div>
           <div className="col-span-2 text-label">Engine</div>
           <div className="col-span-1" />
        </div>

        <div className="divide-y divide-[#48435c]/5">
          {builds.length === 0 && !isLoading ? (
             <div className="py-20 text-center space-y-2">
                <Database className="w-10 h-10 text-[#61e786] mx-auto" />
                <p className="text-label opacity-40">No logs found</p>
             </div>
          ) : builds.map((p) => {
            const m = STATUS[p.status] ?? STATUS.queued;
            return (
              <Link key={p.id} href={`/build/${p.id}`} className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 px-6 py-4 hover:bg-[#61e786]/10 transition-all group">
                <div className="col-span-2">
                  <div className={`inline-flex items-center gap-2 px-2 py-0.5 rounded-lg ${m.bg} ${m.color} border border-white shadow-sm`}>
                    <div className={`w-1 h-1 rounded-full ${m.color.replace('text-', 'bg-')}`} />
                    <span className="text-[10px] font-black uppercase tracking-tight">{m.label}</span>
                  </div>
                </div>
                
                <div className="col-span-5">
                  <h3 className="font-black text-[#48435c] text-[13px] tracking-tight group-hover:text-[#5a5766] transition-colors">{p.projectName}</h3>
                  <p className="text-[10px] font-black text-[#48435c]/20 uppercase tracking-widest mt-0.5">{new Date(p.createdAt).toLocaleDateString()}</p>
                </div>

                <div className="col-span-2">
                   <p className="text-base font-black text-[#48435c] tracking-tighter">
                     {p.accuracy != null ? `${(p.accuracy * 100).toFixed(1)}%` : "—"}
                   </p>
                </div>

                <div className="col-span-2">
                   <span className="text-[9px] font-black text-[#9792e3] bg-[#61e786] px-2 py-1 rounded-lg uppercase tracking-widest">
                      {p.taskType}
                   </span>
                </div>

                <div className="col-span-1 flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={e => handleDelete(e, p.id)} className="p-1.5 bg-[#5a5766]/5 text-[#5a5766] rounded-lg hover:bg-[#5a5766] hover:text-white transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}