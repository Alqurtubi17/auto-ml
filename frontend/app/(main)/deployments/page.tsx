"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher, api } from "@/lib/api";
import { MLProject } from "@/types";
import { Blocks, ArrowRight, Trash2, StopCircle, Globe, ChevronRight, Server, ShieldCheck, Activity, Search, Filter, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function DeploymentsPage() {
  const { data, mutate } = useSWR<{ builds: MLProject[] }>("/api/v1/builds", fetcher as any);
  const [search, setSearch] = useState("");
  
  const allNodes = data?.builds?.filter(b => b.status === "done" || b.status === "stopped") || [];
  const deployed = allNodes.filter(p => p.projectName.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (id: string) => {
    toast('Decommission node?', {
      description: 'Action cannot be undone.',
      action: { 
        label: 'Confirm', 
        onClick: () => toast.promise(api.builds.delete(id), { 
          loading: 'Deleting...', success: () => { mutate(); return 'Node removed'; }, error: 'Failed' 
        }) 
      },
    });
  };

  const handleStop = (id: string) => {
    toast.promise(api.builds.stop(id), { 
      loading: 'Stopping...', success: () => { mutate(); return 'Halted'; }, error: 'Failed' 
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* --- MINIMALIST HEADER --- */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             System Live
          </div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tighter">Service Hub</h1>
          <p className="text-zinc-500 text-xs font-medium">Monitoring active production clusters and inference weights.</p>
        </div>

        <div className="flex gap-4">
          <div className="px-5 py-3 bg-white border border-zinc-200 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="text-left">
              <p className="text-[8px] font-black text-zinc-400 uppercase">Active Clusters</p>
              <p className="text-xl font-black text-zinc-900">{allNodes.filter(b => b.status === 'done').length}</p>
            </div>
            <div className="w-px h-8 bg-zinc-100" />
            <div className="text-left">
              <p className="text-[8px] font-black text-zinc-400 uppercase">Avg Latency</p>
              <p className="text-xl font-black text-emerald-600">24<span className="text-xs ml-0.5">ms</span></p>
            </div>
          </div>
        </div>
      </header>

      {/* --- FILTER & SEARCH (Gaya Modern) --- */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input 
            type="text"
            placeholder="Search clusters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-zinc-100/50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all font-medium"
          />
        </div>
        <div className="flex gap-2">
          <button className="h-11 px-4 bg-white border border-zinc-200 rounded-xl text-zinc-600 text-xs font-bold hover:bg-zinc-50 transition-all flex items-center gap-2">
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
        </div>
      </div>

      {/* --- DATA GRID (List View) --- */}
      <div className="bg-white border border-zinc-200 rounded-[1.5rem] shadow-sm overflow-hidden">
        {deployed.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Blocks className="w-10 h-10 text-zinc-200 mx-auto" />
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">No matching nodes found</p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100 text-[9px] font-black text-zinc-400 uppercase tracking-[0.15em]">
                <th className="px-6 py-4 text-left font-black">Cluster Identification</th>
                <th className="px-6 py-4 text-center font-black">Status</th>
                <th className="px-6 py-4 text-center font-black">Performance</th>
                <th className="px-6 py-4 text-center font-black">Load Time</th>
                <th className="px-6 py-4 text-right font-black">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {deployed.map((p) => (
                <tr key={p.id} className="group hover:bg-emerald-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-1 h-8 rounded-full ${p.status === 'done' ? 'bg-emerald-500' : 'bg-zinc-300'}`} />
                      <div>
                        <p className="text-sm font-bold text-zinc-900 uppercase tracking-tight">{p.projectName}</p>
                        <p className="text-[10px] font-medium text-zinc-400 flex items-center gap-1">
                          <Server className="w-3 h-3" /> {p.taskType}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                      p.status === 'done' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-zinc-50 text-zinc-400 border-zinc-200'
                    }`}>
                      {p.status === 'done' ? 'Online' : 'Halted'}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <p className="text-sm font-black text-zinc-800">{p.accuracy != null ? (p.accuracy * 100).toFixed(1) : "0"}%</p>
                    <p className="text-[8px] font-bold text-zinc-400 uppercase">Accuracy</p>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <p className="text-sm font-black text-zinc-800">{p.metrics?.latencyMs || 0}ms</p>
                    <p className="text-[8px] font-bold text-zinc-400 uppercase">Latency</p>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link 
                        href={`/build/${p.id}/deploy`}
                        className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                        title="Access Console"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                      
                      <button 
                        onClick={() => handleStop(p.id)} 
                        className="p-2 text-zinc-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                        title="Halt Engine"
                      >
                        <StopCircle className="w-5 h-5" />
                      </button>

                      <button 
                        onClick={() => handleDelete(p.id)} 
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Decommission"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- FOOTER (Subtle & Proportional) --- */}
      <footer className="flex flex-col md:flex-row items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-3 opacity-50">
          <ShieldCheck className="w-4 h-4 text-zinc-900" />
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            Production environment encrypted via AES-256
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <p className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">System Status: Nominal</p>
        </div>
      </footer>
    </div>
  );
}