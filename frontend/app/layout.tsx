"use client";

import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SWRProvider } from "@/components/SWRProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Database, LayoutGrid, Archive, Settings, HelpCircle, Menu, X } from "lucide-react";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Inisialisasi", href: "/", icon: LayoutGrid },
    { label: "Arsip Model", href: "/history", icon: Archive },
  ];

  const secondaryItems = [
    { label: "Pengaturan", href: "#", icon: Settings },
    { label: "Bantuan", href: "#", icon: HelpCircle },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                isActive 
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                  : "text-emerald-800/60 hover:text-emerald-700 hover:bg-emerald-50"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
      
      <div className="px-4 py-6 border-t border-emerald-50 space-y-1">
        {secondaryItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-emerald-800/40 hover:text-emerald-700 hover:bg-emerald-50 transition-all"
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <html lang="id">
      <body className={`${inter.variable} ${mono.variable} font-sans antialiased bg-emerald-50/20 text-emerald-950 min-h-screen flex flex-col`}>
        <SWRProvider>
          
          {/* TOP NAVBAR */}
          <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-emerald-100/60 h-16 flex items-center shrink-0">
            <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-emerald-50 text-emerald-700"
                >
                  {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
                <Link href="/" className="flex items-center gap-3 group">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
                    <Database className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-extrabold text-emerald-950 tracking-tight text-lg">
                    AutoML<span className="text-emerald-600">Studio</span>
                  </span>
                </Link>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end mr-2">
                  <span className="text-[11px] font-bold text-emerald-800/40 uppercase tracking-widest">Administrator</span>
                  <span className="text-xs font-bold text-emerald-900">Alqurtubi</span>
                </div>
                <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-sm">
                  AL
                </div>
              </div>
            </div>
          </nav>

          <div className="flex flex-1 overflow-hidden max-w-[1600px] w-full mx-auto">
            {/* DESKTOP SIDEBAR */}
            <aside className="hidden lg:block w-64 shrink-0 border-r border-emerald-100/60 bg-white">
              <SidebarContent />
            </aside>

            {/* MOBILE SIDEBAR OVERLAY */}
            {isMobileMenuOpen && (
              <div className="fixed inset-0 z-40 lg:hidden">
                <div className="fixed inset-0 bg-emerald-950/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                <aside className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl z-50 pt-16">
                  <SidebarContent />
                </aside>
              </div>
            )}

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 overflow-y-auto relative bg-emerald-50/20 p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </div>

        </SWRProvider>
      </body>
    </html>
  );
}