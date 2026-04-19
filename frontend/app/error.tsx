"use client";
import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      // wire to Sentry / Datadog here
      console.error("[GlobalError]", error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
      <div className="card p-8 max-w-sm w-full text-center space-y-4">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h2 className="font-semibold text-zinc-900 mb-1">Something went wrong</h2>
          <p className="text-sm text-zinc-500 leading-relaxed">
            {error.message ?? "An unexpected error occurred. Please try again."}
          </p>
          {error.digest && (
            <p className="text-[11px] font-mono text-zinc-400 mt-2">ref: {error.digest}</p>
          )}
        </div>
        <button onClick={reset} className="btn-secondary w-full justify-center">
          <RotateCcw className="w-3.5 h-3.5" />
          Try again
        </button>
      </div>
    </div>
  );
}
