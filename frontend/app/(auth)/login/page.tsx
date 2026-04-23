"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, Mail, Lock, User, Zap, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

type AuthMode = "login" | "register" | "forgot";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (searchParams.get("mode") === "register") {
      setMode("register");
    } else {
      setMode("login");
    }
  }, [searchParams]);

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "forgot") {
        const res = await fetch("/api/auth/forgot-password", {
          method: "POST",
          body: JSON.stringify({ email: formData.email }),
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          toast.success("Instruksi pemulihan telah dikirim ke email Bos.");
          setMode("login");
        } else {
          toast.error("Gagal mengirim email pemulihan.");
        }
      } else if (mode === "login") {
        const res = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (res?.error) {
          toast.error("Email atau password salah, Bos!");
        } else {
          toast.success("Login sukses! Dialihkan...");
          router.push("/dashboards");
          router.refresh();
        }
      } else {
        if (!validatePassword(formData.password)) {
          toast.error("Password minimal 8 karakter, wajib ada huruf besar, huruf kecil, dan angka.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          body: JSON.stringify(formData),
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          toast.success("Akun berhasil dibuat! Silakan cek email untuk verifikasi.");
          setMode("login");
        } else {
          const data = await res.json();
          toast.error(data.message || "Registrasi gagal, Bos.");
        }
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex bg-zinc-50 font-sans overflow-hidden selection:bg-emerald-200 selection:text-emerald-900">
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-zinc-900 text-white p-12 relative overflow-hidden h-full">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-700 rounded-full blur-[130px]" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10 shrink-0">
              <Image src="/icon.png" alt="Larik AI Logo" width={50} height={50} className="w-15 h-15 object-contain" priority unoptimized/>
            </div>
            <span className="font-black text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-amber-400">
              Larik AI
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight mb-6">
            Predict the future. <br />
            <span className="text-emerald-400">Ship today.</span>
          </h2>
          <p className="text-zinc-400 text-lg font-medium leading-relaxed mb-10">
            Join engineering teams turning raw CSV data into production-ready Web Apps in minutes.
          </p>
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <Zap className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="font-bold text-white text-sm uppercase tracking-tight">Enterprise Grade</h4>
                <p className="text-zinc-400 text-xs mt-0.5 font-medium italic">Secured by strict validation and encrypted sessions.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
          Enterprise Machine Learning Architecture © 2026
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative h-full overflow-hidden">
        <div className="w-full max-w-sm flex flex-col h-full justify-center">
          
          {mode === "forgot" && (
            <button 
              onClick={() => setMode("login")}
              className="mb-8 w-fit flex items-center gap-2 text-xs font-black text-zinc-400 hover:text-zinc-900 uppercase tracking-widest transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </button>
          )}

          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl font-black text-zinc-900 tracking-tight mb-2">
              {mode === "login" ? "Welcome back" : mode === "register" ? "Create workspace" : "Reset Password"}
            </h1>
            <p className="text-zinc-500 text-sm font-medium">
              {mode === "login" ? "Enter your credentials to access your models." : mode === "register" ? "Start training your first AI model for free today." : "Enter your email and we will send you instructions."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "register" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe" 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="name@company.com" 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                />
              </div>
            </div>

            {mode !== "forgot" && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Password</label>
                  {mode === "login" && (
                    <button type="button" onClick={() => setMode("forgot")} className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-widest">
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••" 
                    className="w-full pl-10 pr-10 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {mode === "register" && (
                  <p className="text-[10px] text-zinc-400 ml-1 mt-1 font-medium">Min 8 chars, 1 uppercase, 1 number.</p>
                )}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-black uppercase tracking-[0.15em] transition-all shadow-lg flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? "Processing..." : mode === "login" ? "Sign In" : mode === "register" ? "Initialize Workspace" : "Send Reset Link"} 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {mode !== "forgot" && (
            <>
              <div className="mt-8 flex items-center justify-center">
                <div className="w-full h-px bg-zinc-200" />
                <span className="px-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] bg-zinc-50">OR</span>
                <div className="w-full h-px bg-zinc-200" />
              </div>

              <div className="mt-8">
                <button 
                  type="button" 
                  onClick={() => signIn("google", { callbackUrl: "/dashboards" })}
                  className="w-full py-3.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-sm flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </button>
              </div>

              <div className="mt-8 text-center">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  {mode === "login" ? "No account?" : "Have an account?"}
                  <button 
                    onClick={() => setMode(mode === "login" ? "register" : "login")}
                    className="ml-2 font-black text-emerald-600 hover:text-emerald-700 transition-colors underline decoration-2 underline-offset-4"
                  >
                    {mode === "login" ? "Create now" : "Login here"}
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-zinc-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <AuthContent />
    </Suspense>
  );
}