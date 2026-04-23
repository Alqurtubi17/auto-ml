"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { SystemStats } from "@/types";
import { 
  Settings, User, Palette, HardDrive, Cpu, Key, 
  ShieldCheck, Activity, Globe, Zap, Cloud, Database, Loader2 
} from "lucide-react";

export default function SettingsPage() {
  const { data: stats, isLoading } = useSWR<SystemStats>("/api/v1/system/stats", fetcher as any);

  const sections = [
    { title: "Identity", icon: User, desc: "Account security & profile.", status: "Verified" },
    { title: "Compute", icon: Cpu, desc: "GPU & CPU cluster status.", status: stats?.computeStatus || "Idle" },
    { title: "API Vault", icon: Key, desc: "Key management & tokens.", status: `${stats?.activeKeys || 0} Active` },
    { title: "Visuals", icon: Palette, desc: "Interface configurations.", status: "Emerald" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-200 pb-8">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest border border-emerald-100">
             <Settings className="w-3.5 h-3.5" /> Core System
          </div>
          <h1 className="text-3xl font-black text-zinc-800 tracking-tight">System Configuration</h1>
          <p className="text-zinc-500 text-sm font-medium">Monitoring real-time environment metrics and resource distribution.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="text-right">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Last Sync</p>
                <p className="text-xs font-bold text-zinc-800">{new Date().toLocaleTimeString()}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 font-black">
                {stats?.userInitials || "A"}
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {sections.map((s, i) => (
          <div key={i} className="bg-white border border-zinc-200 p-6 rounded-2xl flex flex-col gap-4 hover:border-emerald-500/50 transition-all group shadow-sm">
            <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-zinc-50 text-zinc-600 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                    <s.icon className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase">{s.status}</span>
            </div>
            <div>
              <h3 className="text-sm font-black text-zinc-800 uppercase tracking-tight">{s.title}</h3>
              <p className="text-[11px] font-medium text-zinc-400 leading-snug mt-1">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-white border border-zinc-200 p-8 rounded-[2rem] space-y-8 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 rounded-lg">
                        <HardDrive className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-zinc-800 uppercase tracking-widest">Resource Allocation</h3>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase">Node ID: {stats?.nodeId || "CL-01"}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xl font-black text-zinc-800 tracking-tighter">{stats?.cpuUsage || 0}%</p>
                    <p className="text-[9px] font-black text-zinc-400 uppercase">Compute Load</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                        <span>CPU Compute Power</span>
                        <span className="text-zinc-800">{stats?.activeCores || 0} / {stats?.totalCores || 32} Cores</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${stats?.cpuUsage || 0}%` }} />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                        <span>Database Storage</span>
                        <span className="text-emerald-600">{stats?.storageUsed || "0GB"} / {stats?.storageLimit || "10GB"}</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-zinc-800 rounded-full transition-all duration-1000" style={{ width: `${stats?.storagePercent || 0}%` }} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-zinc-100">
                <div className="text-center p-3 bg-zinc-50 rounded-xl">
                    <Zap className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                    <p className="text-[8px] font-black text-zinc-400 uppercase">Latency</p>
                    <p className="text-xs font-black text-zinc-800">{stats?.networkLatency || 0}ms</p>
                </div>
                <div className="text-center p-3 bg-zinc-50 rounded-xl">
                    <Globe className="w-4 h-4 text-zinc-400 mx-auto mb-1" />
                    <p className="text-[8px] font-black text-zinc-400 uppercase">Availability</p>
                    <p className="text-xs font-black text-zinc-800">{stats?.uptime || "100%"}</p>
                </div>
                <div className="text-center p-3 bg-zinc-50 rounded-xl">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                    <p className="text-[8px] font-black text-zinc-400 uppercase">Security</p>
                    <p className="text-xs font-black text-zinc-800">AES-256</p>
                </div>
            </div>
        </div>

        <div className="bg-zinc-900 rounded-[2rem] p-8 flex flex-col justify-between shadow-xl">
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                        <Cloud className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Service Quota</h3>
                </div>
                
                <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Successful Builds</p>
                            <Database className="w-3 h-3 text-emerald-400" />
                        </div>
                        <p className="text-2xl font-black text-white tracking-tighter">{stats?.totalBuilds || 0} <span className="text-xs text-zinc-600">Total</span></p>
                    </div>

                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Model Accuracy Avg</p>
                            <Activity className="w-3 h-3 text-emerald-400" />
                        </div>
                        <p className="text-2xl font-black text-white tracking-tighter">{stats?.avgAccuracy || 0}%</p>
                    </div>
                </div>
            </div>

            <button className="w-full py-4 bg-emerald-500 text-zinc-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20">
                Refresh Diagnostics
            </button>
        </div>
      </div>

      <footer className="flex items-center justify-between px-6 py-6 bg-zinc-50 rounded-3xl border border-zinc-200">
        <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.2em]">Dynamic Environment Active</p>
        </div>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">Production Node: {stats?.region || "Local"}</p>
      </footer>
    </div>
  );
}