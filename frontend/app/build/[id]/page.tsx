"use client";
import { useBuildStatus } from "@/hooks/useBuildStatus";
import { BuildStatusPanel } from "@/components/BuildStatusPanel";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  params: { id: string };
}

export default function BuildPage({ params }: Props) {
  const { build, isLoading } = useBuildStatus(params.id);

  if (isLoading || !build) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="skeleton w-80 h-52 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to dashboard
        </Link>
        <h1 className="text-lg font-semibold text-zinc-900">
          Build <span className="font-mono text-zinc-400 text-sm">{params.id.slice(0, 8)}</span>
        </h1>
        <BuildStatusPanel build={build} />
      </div>
    </div>
  );
}
