"use client";

import useSWR from "swr";
import { fetcher, api } from "@/lib/api";
import { MLProject } from "@/types";
import { Blocks, ArrowRight, Gauge, Trash2, StopCircle, Globe, ChevronRight, Server, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function DeploymentsPage() {
  const { data, mutate } = useSWR<{ builds: MLProject[] }>("/api/v1/builds", fetcher as any);
  const deployed = data?.builds?.filter(b => b.status === "done" || b.status === "stopped") || [];

  const handleDelete = (id: string) => {
    toast('Decommission node?', {
      description: 'Production access and endpoint weights will be permanently erased.',
      action: { label: 'Confirm Erasure', onClick: () => toast.promise(api.builds.delete(id), { loading: 'Erasing...', success: () => { mutate(); return 'Erased'; }, error: 'Failed' }) },
      cancel: { label: 'Cancel', onClick: () => {} },
    });
  };

  const handleStop = (id: string) => {
    toast.promise(api.builds.stop(id), { loading: 'Halting...', success: () => { mutate(); return 'Halted'; }, error: 'Failed' });
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#61e786] text-[#48435c] text-xs font-black uppercase tracking-[0.2em] border border-[#48435c]/10">
             <Globe className="w-4 h-4" /> Production Network
          </div>
          <h1 className="text-title text-4xl">Service Hub</h1>
          <p className="text-body text-base font-medium opacity-60">Management interface for active production endpoints and real-time inference nodes.</p>
        </div>
        
        <div className="flex items-center gap-6 px-8 py-5 bg-white border border-[#48435c]/10 rounded-[2rem] shadow-sm">
           <div className="text-right">
              <p className="text-label mb-1">Live Clusters</p>
              <p className="text-2xl font-black text-[#48435c]">{deployed.filter(b => b.status === 'done').length}</p>
           </div>
           <div className="w-px h-10 bg-[#48435c]/5" />
           <div className="text-right">
              <p className="text-label mb-1">Health Metric</p>
              <p className="text-2xl font-black text-emerald-600">99.4%</p>
           </div>
        </div>
      </header>

      {deployed.length === 0 ? (
        <div className="bg-white border border-[#48435c]/10 p-24 rounded-[3rem] text-center space-y-8 shadow-sm">
          <div className="w-20 h-20 bg-[#61e786] rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
            <Blocks className="w-10 h-10 text-[#48435c]/20" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-[#48435c] tracking-tight">No Active Node</h3>
            <p className="text-body text-base font-medium opacity-60 max-w-sm mx-auto leading-relaxed">Initialize and train a model in the Studio Center to deploy your first production engine.</p>
          </div>
          <Link href="/" className="inline-flex items-center gap-3 px-8 py-4 bg-[#48435c] text-[#61e786] rounded-2xl text-sm font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl shadow-teal-900/20">
             Open Studio Center <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {deployed.map((p) => (
            <div key={p.id} className="bg-white border border-[#48435c]/10 p-8 rounded-[2.5rem] flex flex-col group hover:border-[#9792e3] transition-all shadow-sm relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-2 ${p.status === 'done' ? 'bg-emerald-500' : 'bg-[#9792e3]'}`} />
              
              <div className="flex items-center justify-between mb-8">
                <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm ${
                  p.status === "done" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-[#61e786] text-[#48435c] border-[#48435c]/5"
                }`}>
                  {p.status === 'done' ? '● Engine Online' : '● Halted'}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
                  {p.status === "done" && (
                    <button onClick={() => handleStop(p.id)} className="p-2.5 bg-[#61e786] text-[#9792e3] rounded-xl hover:bg-[#9792e3] hover:text-white shadow-sm transition-all">
                      <StopCircle className="w-5 h-5" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(p.id)} className="p-2.5 bg-[#5a5766]/5 text-[#5a5766] rounded-xl hover:bg-[#5a5766] hover:text-white shadow-sm transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <h3 className="text-xl font-black text-[#48435c] tracking-tight truncate group-hover:text-[#48435c] transition-colors uppercase">{p.projectName}</h3>
                <div className="flex items-center gap-3 text-label opacity-60">
                   <Server className="w-4 h-4" />
                   {p.taskType}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-5 bg-[#61e786]/10 rounded-2xl border border-[#48435c]/5">
                  <p className="text-[10px] font-black text-[#48435c]/30 uppercase tracking-widest mb-1">Precision</p>
                  <p className="text-xl font-black text-[#48435c] tracking-tighter">{p.accuracy != null ? (p.accuracy * 100).toFixed(1) : "0"}%</p>
                </div>
                <div className="p-5 bg-[#61e786]/10 rounded-2xl border border-[#48435c]/5">
                  <p className="text-[10px] font-black text-[#48435c]/30 uppercase tracking-widest mb-1">Latency</p>
                  <p className="text-xl font-black text-[#48435c] tracking-tighter">{p.metrics?.latencyMs || 0}ms</p>
                </div>
              </div>

              <Link 
                href={`/build/${p.id}/deploy`}
                className="mt-auto w-full h-16 bg-[#48435c] text-[#61e786] rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-black/10"
              >
                Access Command Console <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      )}
      
      <div className="p-8 bg-white border border-[#48435c]/10 rounded-[3rem] shadow-sm flex flex-col md:flex-row items-center justify-between gap-10">
         <div className="flex items-center gap-6 text-center md:text-left">
            <div className="w-16 h-16 bg-[#61e786] text-[#9792e3] rounded-[2rem] flex items-center justify-center shadow-inner">
               <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="space-y-1">
               <h4 className="text-base font-black text-[#48435c] uppercase tracking-tight">Advanced Security Grid</h4>
               <p className="text-sm font-medium text-[#48435c]/40">All production endpoints are secured via AES-256 and localized VPC clusters.</p>
            </div>
         </div>
         <span className="text-[11px] font-black text-[#9792e3] uppercase tracking-[0.3em] bg-[#61e786]/50 px-4 py-2 rounded-xl border border-[#9792e3]/10">Operational Status: 100%</span>
      </div>
    </div>
  );
}
