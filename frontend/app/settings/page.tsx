"use client";

import { Settings, User, Palette, HardDrive, Cpu, Key } from "lucide-react";

export default function SettingsPage() {
  const sections = [
    { title: "Identity", icon: User, desc: "Security & profile.", bg: "bg-[#61e786]", color: "text-[#48435c]" },
    { title: "Compute Units", icon: Cpu, desc: "Resource allocation.", bg: "bg-[#61e786]", color: "text-[#48435c]" },
    { title: "API Vault", icon: Key, desc: "Auth & endpoints.", bg: "bg-[#61e786]", color: "text-[#48435c]" },
    { title: "Visuals", icon: Palette, desc: "Theme configurations.", bg: "bg-[#61e786]", color: "text-[#48435c]" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700">
      <header className="space-y-2">
        <h1 className="text-title text-4xl">System Configuration</h1>
        <p className="text-body text-base font-medium opacity-60">Manage your AutoML Studio global environment and security parameters.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((s, i) => (
          <div key={i} className="bg-white border border-[#48435c]/10 p-8 rounded-[2rem] flex items-start gap-6 hover:border-[#9792e3] transition-all cursor-pointer group shadow-sm">
            <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center ${s.bg} ${s.color} group-hover:bg-[#48435c] group-hover:text-[#61e786] transition-all shadow-inner`}>
              <s.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#48435c] uppercase tracking-tight">{s.title}</h3>
              <p className="text-sm font-bold text-[#48435c]/40 leading-tight mt-1">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#48435c]/10 p-10 rounded-[2.5rem] space-y-8 shadow-sm">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <HardDrive className="w-6 h-6 text-[#9792e3]" />
              <h3 className="text-base font-black text-[#48435c] uppercase tracking-widest">Compute Load Distribution</h3>
           </div>
           <span className="text-[11px] font-black text-[#48435c]/20 uppercase tracking-[0.2em]">Cluster: US-East-1</span>
        </div>
        <div className="space-y-4">
           <div className="flex justify-between text-label">
              <span>Active Node Usage</span>
              <span>12.4% Allocated</span>
           </div>
           <div className="w-full h-3 bg-[#61e786]/30 rounded-full overflow-hidden border border-[#48435c]/5 shadow-inner">
              <div className="w-[12%] h-full bg-[#48435c] rounded-full shadow-lg" />
           </div>
        </div>
        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-[#48435c]/5">
           <div className="space-y-1">
              <p className="text-label">Active Cores</p>
              <p className="text-3xl font-black text-[#48435c]">4 / 32</p>
           </div>
           <div className="space-y-1">
              <p className="text-label">Node Integrity</p>
              <p className="text-3xl font-black text-emerald-600">Optimal</p>
           </div>
        </div>
      </div>
    </div>
  );
}
