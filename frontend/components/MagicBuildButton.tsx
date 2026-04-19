"use client";
import { Sparkles, Loader2 } from "lucide-react";
import { clsx } from "clsx";

interface Props {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  label?: string;
}

export function MagicBuildButton({ onClick, disabled, loading, label = "Magic Build" }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        "relative inline-flex items-center gap-2.5 px-6 py-3 rounded-xl",
        "bg-zinc-900 text-white font-medium text-sm",
        "transition-all duration-200 active:scale-[0.98]",
        "disabled:opacity-40 disabled:pointer-events-none",
        !disabled && !loading && "hover:bg-zinc-800 hover:shadow-lg hover:-translate-y-0.5",
        loading && "pulse-ring"
      )}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Sparkles className="w-4 h-4" />
      )}
      <span>{loading ? "Building…" : label}</span>

      {!loading && !disabled && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-white" />
      )}
    </button>
  );
}
