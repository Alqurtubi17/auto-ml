"use client";

import { Inter } from "next/font/google";
import "@/app/globals.css";
import { SWRProvider } from "@/components/SWRProvider";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutGrid, Archive, Settings, 
  Menu, X, Blocks, LogOut, ShieldCheck
} from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { MLProject } from "@/types";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const mainNav = [
  { label: "Studio Center", href: "/dashboards", icon: LayoutGrid },
  { label: "Active Deployments", href: "/deployments", icon: Blocks },
  { label: "Experiment Archive", href: "/history", icon: Archive },
];

const secondaryNav = [
  { label: "Settings", href: "/settings", icon: Settings },
];

const Feed = ({ close, pathname }: { close: () => void; pathname: string }) => {
  const { data } = useSWR<{ builds: MLProject[] }>("/api/v1/builds", fetcher as any);
  const active = data?.builds?.filter(b => b.status === "done").slice(0, 3) || [];
  
  if (active.length === 0) return null;
  
  return (
    <div className="mt-6 px-3">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2 ml-2">Live Nodes</p>
      <div className="space-y-1">
        {active.map(m => {
          const isActive = pathname === `/build/${m.id}/deploy` || pathname === `/build/${m.id}`;
          return (
            <Link key={m.id} href={`/build/${m.id}`} onClick={close}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-300 ${
                isActive 
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20 font-bold" 
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/80 font-medium"
              } text-xs`}>
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? "bg-white animate-pulse" : "bg-emerald-300"}`} />
              <span className="truncate">{m.projectName}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const NavLink = ({ item, pathname, onClick, dense = false }: any) => {
  const active = pathname === item.href;
  return (
    <Link href={item.href} onClick={onClick}
      className={`flex items-center gap-3 px-3 ${dense ? 'py-2 text-xs' : 'py-2.5 text-[13px]'} rounded-xl transition-all duration-300 ${
        active 
          ? "bg-emerald-500/10 text-emerald-700 shadow-sm font-bold border border-emerald-500/10" 
          : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50 font-medium"
      }`}>
      <item.icon className={`w-4 h-4 ${active ? "text-emerald-600" : "text-zinc-400"}`} />
      {item.label}
    </Link>
  );
};

export default function MainLayoutClient({ children, user }: { children: React.ReactNode, user?: any }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const userName = user?.name || "Pelanggan";
  const userInitials = userName.substring(0, 2).toUpperCase();
  const planLabel = user?.plan === "ENTERPRISE" ? "Enterprise" : "Free Tier";
  
  const isAdmin = user?.role === "ADMIN";
  const isAdminActive = pathname.startsWith("/admin");

  return (
    <div className={`antialiased font-sans text-zinc-900 selection:bg-emerald-200 selection:text-emerald-950 bg-zinc-50 overflow-x-hidden min-h-screen ${inter.variable}`}>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[40rem] h-[40rem] bg-emerald-200/30 rounded-full blur-[100px] mix-blend-multiply opacity-60 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-[30rem] h-[30rem] bg-emerald-300/20 rounded-full blur-[80px] mix-blend-multiply opacity-50" />
      </div>

      <SWRProvider>
        <Toaster position="top-center" richColors />
        <div className="flex min-h-screen relative z-10">
          
          <aside className="hidden lg:flex w-64 flex-col bg-white/60 backdrop-blur-2xl border-r border-zinc-200/50 fixed inset-y-0 left-0 z-50">
            <div className="p-6">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform overflow-hidden shrink-0">
                  <Image src="/icon.png" alt="Larik AI" width={50} height={50} className="object-contain w-50 h-50" priority />
                </div>
                <div>
                  <span className="text-lg font-black text-zinc-900 block leading-none tracking-tight">Larik AI</span>
                </div>
              </Link>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
              <div className="space-y-1">
                {mainNav.map(item => <NavLink key={item.href} item={item} pathname={pathname} />)}
              </div>
              
              <Feed close={() => setIsOpen(false)} pathname={pathname} />

              <div className="mt-8 pt-4 border-t border-zinc-200/50 px-1 space-y-1">
                 {secondaryNav.map(item => <NavLink key={item.href} item={item} pathname={pathname} dense />)}
              </div>
            </nav>

            <div className="p-4">
              <div className="p-3 rounded-2xl bg-white border border-zinc-200 shadow-sm flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-8 h-8 rounded-lg ${isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'} flex items-center justify-center text-[10px] font-black shrink-0`}>
                    {userInitials}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[13px] font-black text-zinc-900 truncate">{userName}</p>
                    <p className={`text-[9px] font-bold uppercase tracking-widest truncate ${isAdmin ? 'text-purple-600' : 'text-emerald-600'}`}>
                      {isAdmin ? "System Admin" : planLabel}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => signOut({ callbackUrl: "/login" })} 
                  className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all shrink-0"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </aside>

          <main className="flex-1 lg:pl-64 w-full min-h-screen relative">
            <div className="lg:hidden p-3 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b border-zinc-200 sticky top-0 z-40">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                  <Image src="/icon.png" alt="Larik AI" width={20} height={20} className="object-contain w-5 h-5" />
                </div>
                <span className="font-black text-zinc-900 text-sm tracking-tight">Larik AI</span>
              </Link>
              <button onClick={() => setIsOpen(true)} className="p-1.5 rounded-lg bg-white border border-zinc-200">
                <Menu className="w-5 h-5 text-zinc-900" />
              </button>
            </div>

            <div className="p-4 md:p-8">
              <div className="max-w-5xl mx-auto">
                 {children}
              </div>
            </div>
          </main>
        </div>

        {isOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden flex">
            <div className="fixed inset-0 bg-zinc-900/20 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
            <aside className="relative w-64 bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
              <div className="p-5 flex items-center justify-between border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <Image src="/icon.png" alt="Larik AI" width={20} height={20} className="object-contain w-5 h-5" />
                  <span className="font-black text-zinc-900 text-sm tracking-tight">Larik AI</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg bg-zinc-50"><X className="w-5 h-5 text-zinc-900" /></button>
              </div>
              <nav className="flex-1 p-3 space-y-1">
                {mainNav.map(item => <NavLink key={item.href} item={item} pathname={pathname} onClick={() => setIsOpen(false)} />)}
                <Feed close={() => setIsOpen(false)} pathname={pathname} />
                
                {isAdmin && (
                  <div className="mt-4 pt-4 border-t border-emerald-100 px-1">
                     <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-2 ml-2">Control Center</p>
                     <Link href="/admin" onClick={() => setIsOpen(false)}
                       className={`flex items-center gap-3 px-3 py-2.5 text-[13px] rounded-xl transition-all duration-300 ${
                         isAdminActive 
                           ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 font-bold" 
                           : "text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/80 hover:text-emerald-900 font-medium"
                       }`}>
                       <ShieldCheck className="w-4 h-4" />
                       Admin Panel
                     </Link>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-zinc-100 space-y-1">
                  {secondaryNav.map(item => <NavLink key={item.href} item={item} pathname={pathname} onClick={() => setIsOpen(false)} dense />)}
                </div>
              </nav>

              <div className="p-4 border-t border-zinc-100">
                <button 
                  onClick={() => signOut({ callbackUrl: "/" })} 
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-sm font-bold transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
              </div>
            </aside>
          </div>
        )}
      </SWRProvider>
    </div>
  );
}