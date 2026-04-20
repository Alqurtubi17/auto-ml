"use client";
import { MLProject } from "@/types";
import { CheckCircle2, XCircle, Terminal, Activity, Zap, Loader2, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import Link from "next/link";

const STATUS: Record<string, { label: string; color: string; bg: string }> = {
  idle:       { label: "Dormant",      color: "text-[#48435c]", bg: "bg-[#61e786]/30" },
  queued:     { label: "Standby",      color: "text-[#9792e3]", bg: "bg-[#61e786]" },
  training:   { label: "Evolving",     color: "text-[#48435c]", bg: "bg-[#61e786]" },
  generating: { label: "Synthesizing", color: "text-[#5a5766]", bg: "bg-[#61e786]" },
  done:       { label: "Optimized",    color: "text-emerald-700", bg: "bg-emerald-50" },
  error:      { label: "Shut Down",    color: "text-[#5a5766]", bg: "bg-[#5a5766]/5" },
};

interface Props { build: MLProject }

export function BuildStatusPanel({ build }: Props) {
  const cfg = STATUS[build.status] ?? STATUS.idle;
  const active = ["training", "generating", "queued"].includes(build.status);
  const done = build.status === "done";
  const err = build.status === "error";

  return (
    <div className="bg-white border border-[#48435c]/10 p-8 rounded-[2rem] space-y-8 shadow-sm relative overflow-hidden transition-all hover:shadow-lg">
      <div className={`absolute top-0 left-0 w-full h-1.5 ${done ? 'bg-emerald-500' : 'bg-[#9792e3]'}`} />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-inner", cfg.bg, cfg.color)}>
            {done && <CheckCircle2 className="w-6 h-6" />}
            {err && <XCircle className="w-6 h-6" />}
            {active && <Loader2 className="w-6 h-6 animate-spin" />}
            {build.status === "idle" && <Zap className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-lg font-black text-[#48435c] tracking-tight leading-none mb-1 uppercase">
              {build.projectName || "Standard Job"}
            </h3>
            <p className={clsx("text-[10px] font-black uppercase tracking-widest", cfg.color)}>{cfg.label}</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-[#61e786]/50 text-[#48435c] border border-[#48435c]/5 rounded-lg text-[9px] font-black tracking-[0.2em] uppercase">
          Status: {build.status}
        </div>
      </div>

      {active && (
        <div className="space-y-3 p-6 bg-[#61e786]/10 rounded-[1.5rem] border border-[#48435c]/5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-[#48435c]/40 uppercase tracking-widest">Calibration Progress</span>
            <span className="text-sm font-black text-[#48435c]">{build.progress}%</span>
          </div>
          <div className="h-2 bg-white rounded-full overflow-hidden border border-[#48435c]/5">
            <div
              className="h-full bg-[#48435c] rounded-full transition-all duration-700"
              style={{ width: `${build.progress}%` }}
            />
          </div>
        </div>
      )}

      {build.logs.length > 0 && (
        <div className="bg-[#48435c] rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
             <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#9792e3]" />
                <span className="text-[10px] font-black text-[#61e786] opacity-30 uppercase tracking-widest">Cluster Stream</span>
             </div>
             <div className="w-1.5 h-1.5 rounded-full bg-[#9792e3] animate-pulse" />
          </div>
          <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-1.5">
            {build.logs.map((line, i) => (
              <p key={i} className="text-[11px] font-mono text-[#61e786]/40 leading-relaxed truncate">
                {line}
              </p>
            ))}
          </div>
        </div>
      )}

      {done && (
        <Link
          href={`/build/${build.id}`}
          className="w-full h-14 bg-[#48435c] text-[#61e786] rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex justify-center items-center gap-2 hover:bg-black transition-all shadow-xl"
        >
          Access Console <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
