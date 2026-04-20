"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { SWRProvider } from "@/components/SWRProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutGrid, Archive, Settings, HelpCircle, 
  Menu, X, Blocks, Cpu, Sparkles, Database, Shield
} from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { MLProject } from "@/types";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const nav = [
    { label: "Studio Center", href: "/", icon: LayoutGrid },
    { label: "Active Deployments", href: "/deployments", icon: Blocks },
    { label: "Experiment Archive", href: "/history", icon: Archive },
  ];

  const Feed = ({ close }: { close: () => void }) => {
    const { data } = useSWR<{ builds: MLProject[] }>("/api/v1/builds", fetcher as any);
    const active = data?.builds?.filter(b => b.status === "done").slice(0, 3) || [];
    if (active.length === 0) return null;
    return (
      <div className="mt-8 px-4">
        <p className="text-label mb-3 ml-2">Live Nodes</p>
        <div className="space-y-1">
          {active.map(m => (
            <Link key={m.id} href={`/build/${m.id}`} onClick={close}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                pathname === `/build/${m.id}` 
                  ? "bg-[#61e786] text-[#48435c] shadow-sm font-bold" 
                  : "text-[#48435c]/60 hover:text-[#48435c] hover:bg-[#61e786]/50 font-medium"
              } text-sm`}>
              <div className={`w-1.5 h-1.5 rounded-full ${pathname === `/build/${m.id}` ? "bg-[#9792e3] animate-pulse" : "bg-[#48435c]/20"}`} />
              <span className="truncate">{m.projectName}</span>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased font-sans">
        <SWRProvider>
          <Toaster position="top-center" richColors />
          <div className="flex min-h-screen">
            {/* Elegant Sidebar */}
            <aside className="hidden lg:flex w-64 flex-col bg-[var(--color-teal)]/10 border-r border-[var(--color-teal)]/10 fixed inset-y-0 left-0 z-50">
              <div className="p-8">
                <Link href="/" className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-xl bg-[#48435c] flex items-center justify-center text-[#61e786] shadow-xl group-hover:scale-105 transition-all">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-base font-black text-[#48435c] block leading-tight tracking-tighter">AutoML</span>
                    <span className="text-[10px] font-black text-[#9792e3] uppercase tracking-[0.2em] mt-0.5">Studio Hub</span>
                  </div>
                </Link>
              </div>

              <nav className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar space-y-1">
                <div className="space-y-1">
                  {nav.map(item => {
                    const active = pathname === item.href;
                    return (
                      <Link key={item.href} href={item.href}
                        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                          active 
                            ? "bg-[#48435c] text-[#61e786] shadow-lg font-bold" 
                            : "text-[#48435c]/60 hover:text-[#48435c] hover:bg-[#61e786]/40 font-medium"
                        } text-[13px]`}>
                        <item.icon className={`w-4.5 h-4.5 ${active ? "text-[#9792e3]" : "text-[#48435c]/30"}`} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
                
                <Feed close={() => setIsOpen(false)} />

                <div className="mt-10 pt-6 border-t border-[#48435c]/5 px-2 space-y-1">
                  <Link href="/settings" className={`flex items-center gap-4 px-4 py-2 rounded-xl text-xs font-bold transition-all ${pathname === '/settings' ? "text-[#5a5766]" : "text-[#48435c]/40 hover:text-[#5a5766]"}`}>
                    <Settings className="w-4 h-4" /> Settings
                  </Link>
                  <Link href="/docs" className={`flex items-center gap-4 px-4 py-2 rounded-xl text-xs font-bold transition-all ${pathname === '/docs' ? "text-[#5a5766]" : "text-[#48435c]/40 hover:text-[#5a5766]"}`}>
                    <HelpCircle className="w-4 h-4" /> Help Center
                  </Link>
                </div>
              </nav>

              <div className="p-6">
                <div className="p-4 rounded-2xl bg-white border border-[#48435c]/5 flex items-center gap-3 shadow-sm group hover:border-[#9792e3]/30 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-[#48435c] flex items-center justify-center text-xs font-black text-[#61e786]">AQ</div>
                  <div className="overflow-hidden">
                    <p className="text-[13px] font-black text-[#48435c] truncate">Alqurtubi</p>
                    <p className="text-[10px] text-[#9792e3] font-black uppercase tracking-tighter">Pro Engineer</p>
                  </div>
                </div>
              </div>
            </aside>

            <main className="flex-1 lg:pl-64 w-full min-h-screen relative bg-[var(--bg-app)]">
              {/* Header Mobile */}
              <div className="lg:hidden p-4 flex items-center justify-between bg-white border-b border-[#48435c]/10 sticky top-0 z-40">
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#48435c] rounded-lg flex items-center justify-center text-[#61e786]">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <span className="font-black text-[#48435c] text-xs tracking-tight uppercase">AutoML Studio</span>
                </Link>
                <button onClick={() => setIsOpen(true)} className="p-2 rounded-lg bg-[#61e786]/50">
                  <Menu className="w-5 h-5 text-[#48435c]" />
                </button>
              </div>

              <div className="relative z-10 p-4 md:p-6">
                <div className="max-w-5xl mx-auto">
                   {children}
                </div>
              </div>
            </main>
          </div>

          {/* Overlay Mobile */}
          {isOpen && (
            <div className="fixed inset-0 z-[100] lg:hidden flex">
              <div className="fixed inset-0 bg-[#48435c]/20 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />
              <aside className="relative w-64 bg-[var(--bg-app)] h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
                <div className="p-8 flex items-center justify-between border-b border-[#48435c]/5">
                  <span className="font-black text-[#48435c] text-xs uppercase tracking-[0.2em]">AutoML Studio</span>
                  <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl bg-[#61e786]"><X className="w-6 h-6 text-[#48435c]" /></button>
                </div>
                <nav className="flex-1 p-6 space-y-2">
                  {nav.map(item => (
                    <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${
                        pathname === item.href ? "bg-[#48435c] text-[#61e786] font-bold" : "text-[#48435c]/60"
                      } text-sm`}>
                      <item.icon className="w-5 h-5" />{item.label}
                    </Link>
                  ))}
                </nav>
              </aside>
            </div>
          )}
        </SWRProvider>
      </body>
    </html>
  );
}