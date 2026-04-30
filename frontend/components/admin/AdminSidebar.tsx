"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings, 
  LogOut 
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen shrink-0">
      <div className="p-8">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform">
            <Image src="/icon.png" alt="Larik AI Logo" width={40} height={40} className="object-contain" priority unoptimized />
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-800">
            LARIK <span className="text-emerald-600">AI</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        <SidebarItem href="/admin" icon={<LayoutDashboard size={20} />} label="Overview" active={pathname === "/admin"} />
        <SidebarItem href="/admin/users" icon={<Users size={20} />} label="Users" active={pathname.includes("/admin/users")} />
        <SidebarItem href="/admin/transactions" icon={<CreditCard size={20} />} label="Transactions" active={pathname.includes("/admin/transactions")} />
        <SidebarItem href="/admin/settings" icon={<Settings size={20} />} label="Settings" active={pathname.includes("/admin/settings")} />
      </nav>

      <div className="p-6 border-t border-slate-100">
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 w-full rounded-xl transition-colors"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

function SidebarItem({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link 
      href={href} 
      className={`
        flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold transition-all
        ${active 
          ? "bg-emerald-50 text-emerald-700 shadow-sm shadow-emerald-100/50" 
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
        }
      `}
    >
      <span className={active ? "text-emerald-600" : "text-slate-400"}>
        {icon}
      </span>
      {label}
    </Link>
  );
}