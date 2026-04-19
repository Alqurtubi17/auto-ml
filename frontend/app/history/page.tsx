"use client";
import Link from "next/link";
import { useBuildList } from "@/hooks/useBuildStatus";
import { BuildJob } from "@/types";
import {
  ArrowLeft, CheckCircle2, XCircle, Clock, Loader2,
  ExternalLink, RefreshCw, Zap,
} from "lucide-react";
import { clsx } from "clsx";

const STATUS_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  queued:     { label: "Queued",     color: "text-amber-500",  icon: <Clock     className="w-3.5 h-3.5" /> },
  training:   { label: "Training",   color: "text-indigo-500", icon: <Loader2   className="w-3.5 h-3.5 animate-spin" /> },
  generating: { label: "Generating", color: "text-blue-500",   icon: <Loader2   className="w-3.5 h-3.5 animate-spin" /> },
  done:       { label: "Done",       color: "text-emerald-600",icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  error:      { label: "Failed",     color: "text-red-500",    icon: <XCircle   className="w-3.5 h-3.5" /> },
};

function elapsed(createdAt: string, completedAt?: string | null): string {
  const end = completedAt ? new Date(completedAt) : new Date();
  const ms  = end.getTime() - new Date(createdAt).getTime();
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function BuildRow({ build }: { build: BuildJob }) {
  const meta = STATUS_META[build.status] ?? STATUS_META.queued;
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-50 transition-colors border-b border-zinc-50 last:border-0 group">
      {/* Status */}
      <div className={clsx("flex items-center gap-1.5 w-28 shrink-0", meta.color)}>
        {meta.icon}
        <span className="text-xs font-medium">{meta.label}</span>
      </div>

      {/* Build ID */}
      <span className="font-mono text-[11px] text-zinc-400 w-20 shrink-0">
        {build.id.slice(0, 8)}
      </span>

      {/* Template */}
      <span className="text-sm text-zinc-700 flex-1 truncate font-medium">
        {build.templateId}
      </span>

      {/* ML accuracy */}
      <span className="text-xs text-zinc-400 w-16 text-right shrink-0">
        {build.mlMetrics?.accuracy != null
          ? `${(build.mlMetrics.accuracy * 100).toFixed(1)}%`
          : "—"}
      </span>

      {/* Elapsed time */}
      <span className="text-xs text-zinc-400 w-12 text-right shrink-0">
        {elapsed(build.createdAt, build.completedAt)}
      </span>

      {/* Action link */}
      <div className="w-8 flex justify-end">
        {build.status === "done" && build.outputUrl ? (
          <a
            href={build.outputUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-700 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <Link
            href={`/build/${build.id}`}
            className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-700 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

export default function BuildHistoryPage() {
  const { builds, isLoading, error, refresh } = useBuildList();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-zinc-100 bg-white flex flex-col">
        <div className="px-5 py-5 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-zinc-900 text-sm tracking-tight">WebForge AI</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4">
          <Link
            href="/"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">
        <header className="px-8 py-5 border-b border-zinc-100 bg-white flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900 tracking-tight">Build History</h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              {builds.length} build{builds.length !== 1 ? "s" : ""} total
            </p>
          </div>
          <button onClick={() => refresh()} className="btn-secondary">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </header>

        <div className="flex-1 p-8">
          {error && (
            <div className="card p-4 flex items-center gap-3 border-red-100 bg-red-50 text-red-700 text-sm mb-6">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              Failed to load builds — check your API connection.
            </div>
          )}

          {isLoading && !builds.length ? (
            <div className="card overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-zinc-50 last:border-0">
                  <div className="skeleton h-4 w-20 rounded" />
                  <div className="skeleton h-4 w-16 rounded" />
                  <div className="skeleton h-4 flex-1 rounded" />
                  <div className="skeleton h-4 w-10 rounded" />
                </div>
              ))}
            </div>
          ) : builds.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5 text-zinc-400" />
              </div>
              <p className="font-medium text-zinc-700 mb-1">No builds yet</p>
              <p className="text-sm text-zinc-400 mb-4">Select a template on the dashboard to start building.</p>
              <Link href="/" className="btn-primary">Go to dashboard</Link>
            </div>
          ) : (
            <div className="card overflow-hidden">
              {/* Table header */}
              <div className="flex items-center gap-4 px-5 py-2.5 bg-zinc-50 border-b border-zinc-100">
                <span className="section-label w-28 shrink-0">Status</span>
                <span className="section-label w-20 shrink-0">ID</span>
                <span className="section-label flex-1">Template</span>
                <span className="section-label w-16 text-right shrink-0">Accuracy</span>
                <span className="section-label w-12 text-right shrink-0">Time</span>
                <span className="w-8" />
              </div>
              {builds.map((b) => (
                <BuildRow key={b.id} build={b} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
