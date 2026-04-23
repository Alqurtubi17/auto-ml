"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your security credentials...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          body: JSON.stringify({ token }),
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          setStatus("success");
          setMessage("Your workspace access has been successfully verified.");
        } else {
          const data = await res.json();
          setStatus("error");
          setMessage(data.message || "Invalid or expired token.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("A network error occurred during verification.");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 font-sans p-6 relative">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-10 relative z-10 shadow-xl flex flex-col items-center text-center">
        
        {status === "loading" && (
          <>
            <div className="w-20 h-20 mb-6 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-200">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">Authenticating</h1>
            <p className="text-zinc-500 text-sm font-medium">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-20 h-20 mb-6 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">Verification Complete</h1>
            <p className="text-zinc-500 text-sm font-medium mb-8">{message}</p>
            <Link 
              href="/login" 
              className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              Proceed to Login <ArrowRight className="w-4 h-4" />
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-20 h-20 mb-6 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">Verification Failed</h1>
            <p className="text-zinc-500 text-sm font-medium mb-8">{message}</p>
            <Link 
              href="/login" 
              className="w-full py-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-xs font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2"
            >
              Return to Login
            </Link>
          </>
        )}

      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-zinc-50" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}