"use client";

import { BookOpen, Zap, Layers, Terminal, Shield, ArrowRight } from "lucide-react";

export default function DocsPage() {
  const docs = [
    { title: "Core Architecture", icon: Zap, items: ["System Logic", "Inference Node Sync", "Telemetry Protocol"], color: "text-[#48435c]", bg: "bg-[#61e786]/50" },
    { title: "Training Lab", icon: Layers, items: ["Data Sanitation", "Validation", "Auto-Champion Pick"], color: "text-[#48435c]", bg: "bg-[#61e786]/50" },
    { title: "Deployment Hub", icon: Terminal, items: ["REST API /predict", "/telemetry Endpoint", "VPC"], color: "text-[#48435c]", bg: "bg-[#61e786]/50" },
    { title: "Security Grid", icon: Shield, items: ["Encryption", "Key Vault", "Auth Middleware"], color: "text-[#48435c]", bg: "bg-[#61e786]/50" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
      <header className="space-y-2">
        <h1 className="text-title text-4xl">Technical Documentation</h1>
        <p className="text-body text-base font-medium opacity-60">Specifications and implementation guides for the AutoML Studio environment.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {docs.map((d, i) => (
          <div key={i} className="bg-white border border-[#48435c]/10 p-8 rounded-[2rem] space-y-6 flex flex-col group hover:border-[#9792e3] transition-all cursor-pointer shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${d.bg} ${d.color} group-hover:bg-[#48435c] group-hover:text-[#61e786] transition-all shadow-inner`}>
                <d.icon className="w-5 h-5" />
              </div>
              <h3 className="text-[13px] font-black text-[#48435c] uppercase tracking-tight">{d.title}</h3>
            </div>
            <ul className="space-y-3 flex-1">
              {d.items.map((item, j) => (
                <li key={j}>
                  <a href="#" className="text-sm text-[#48435c]/40 hover:text-[#5a5766] font-bold transition-all flex items-center justify-between group/link">
                    {item}
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-all translate-x-[-10px] group-hover/link:translate-x-0" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-white border border-[#48435c]/10 p-16 rounded-[3.5rem] text-center space-y-6 shadow-sm group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[#9792e3]" />
          <BookOpen className="w-12 h-12 text-[#61e786] mx-auto group-hover:scale-110 transition-transform duration-700" />
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[#48435c] tracking-tight uppercase">Advanced Systems Support</h2>
            <p className="text-body text-base font-medium opacity-60 max-w-sm mx-auto leading-relaxed">Our technical engineers are available for custom pipeline integration and enterprise-grade cluster scaling.</p>
          </div>
          <button className="h-14 px-12 bg-[#48435c] text-[#61e786] rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-teal-900/20 hover:scale-105 transition-all">
            Open Technical Ticket
          </button>
      </div>
    </div>
  );
}
