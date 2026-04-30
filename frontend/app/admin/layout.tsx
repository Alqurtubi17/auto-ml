import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Toaster } from "sonner"; // IMPORT TOASTER DI SINI

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Command Center | Larik AI",
  description: "Enterprise Administration Dashboard",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 selection:bg-emerald-100">
      
      <AdminSidebar />

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto">
        <div className="relative">
          {children}
        </div>
      </main>
      
      {/* PENAMPIL NOTIFIKASI (WAJIB ADA) */}
      <Toaster position="top-center" richColors />
      
    </div>
  );
}