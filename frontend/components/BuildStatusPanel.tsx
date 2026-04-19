"use client";
import { BuildJob } from "@/types";
import { CheckCircle2, XCircle, AlertCircle, ExternalLink, Terminal } from "lucide-react";
import { clsx } from "clsx";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  idle:       { label: "Idle",             color: "text-zinc-400"   },
  queued:     { label: "Queued",           color: "text-amber-500"  },
  training:   { label: "Training ML model",color: "text-indigo-500" },
  generating: { label: "Generating site",  color: "text-blue-500"   },
  done:       { label: "Complete",         color: "text-emerald-600"},
  error:      { label: "Failed",           color: "text-red-500"    },
};

interface Props { build: BuildJob }

export function BuildStatusPanel({ build }: Props) {
  const cfg      = STATUS_CONFIG[build.status] ?? STATUS_CONFIG.idle;
  const isActive = build.status === "training" || build.status === "generating";
  const isDone   = build.status === "done";
  const isError  = build.status === "error";

  return (
    <div className="card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isDone   && <CheckCircle2  className="w-4 h-4 text-emerald-500" />}
          {isError  && <XCircle       className="w-4 h-4 text-red-500"     />}
          {isActive && <AlertCircle   className="w-4 h-4 text-indigo-500 animate-pulse" />}
          <span className={clsx("text-sm font-medium", cfg.color)}>{cfg.label}</span>
        </div>
        <span className="text-[11px] text-zinc-400 font-mono">{build.id.slice(0, 8)}</span>
      </div>

      {/* Progress bar */}
      {isActive && (
        <div className="space-y-1.5">
          <span className="text-xs text-zinc-500">{build.progress}%</span>
          <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-zinc-900 rounded-full transition-all duration-700"
              style={{ width: `${build.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* ML metrics */}
      {build.mlMetrics && (
        <div className="grid grid-cols-3 gap-3">
          {build.mlMetrics.accuracy   != null && (
            <Metric label="Accuracy" value={`${(build.mlMetrics.accuracy * 100).toFixed(1)}%`} />
          )}
          {build.mlMetrics.latencyMs  != null && (
            <Metric label="Latency"  value={`${build.mlMetrics.latencyMs}ms`} />
          )}
          {build.mlMetrics.modelSize  != null && (
            <Metric label="Model"    value={build.mlMetrics.modelSize} />
          )}
        </div>
      )}

      {/* Log terminal */}
      {build.logs.length > 0 && (
        <div className="bg-zinc-950 rounded-lg p-3 space-y-1 max-h-40 overflow-y-auto no-scrollbar">
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="w-3 h-3 text-zinc-500" />
            <span className="text-[10px] uppercase tracking-widest text-zinc-500">Build log</span>
          </div>
          {build.logs.map((line, i) => (
            <p key={i} className="text-[11px] font-mono text-zinc-400 leading-relaxed">{line}</p>
          ))}
        </div>
      )}

      {/* View site CTA */}
      {isDone && build.outputUrl && (
        <a
          href={build.outputUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary w-full justify-center"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View site
        </a>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-50 rounded-lg p-2.5 text-center">
      <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-semibold text-zinc-900">{value}</p>
    </div>
  );
}
