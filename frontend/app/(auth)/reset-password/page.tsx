"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = (pw: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(pw);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast.error("Token tidak valid atau tidak ditemukan.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Password tidak cocok.");
      return;
    }

    if (!validatePassword(password)) {
      toast.error("Password minimal 8 karakter, wajib ada huruf besar, huruf kecil, dan angka.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password/confirm", {
        method: "POST",
        body: JSON.stringify({ token, password }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        toast.success("Password berhasil diubah! Silakan login.");
        router.push("/login");
      } else {
        const data = await res.json();
        toast.error(data.message || "Gagal mengubah password.");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 font-sans selection:bg-emerald-200 selection:text-emerald-900 p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-40 pointer-events-none flex items-center justify-center">
        <div className="w-[600px] h-[600px] bg-emerald-100 rounded-full blur-[150px]" />
      </div>

      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-10 relative z-10 shadow-xl">
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-emerald-600" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight mb-2">Secure New Password</h1>
          <p className="text-zinc-500 text-sm font-medium">Enter a strong password to protect your Larik AI workspace.</p>
        </div>

        {!token ? (
          <div className="text-center p-4 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-red-600 text-sm font-bold">Invalid Security Token</p>
            <Link href="/login" className="text-zinc-500 text-xs mt-2 block hover:text-zinc-900 underline">Return to login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-10 pr-10 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                />
              </div>
              <p className="text-[10px] text-zinc-400 ml-1 mt-1 font-medium">Min 8 chars, 1 uppercase, 1 number.</p>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg"
            >
              {loading ? "Updating..." : "Update Password"} 
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-zinc-50" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}