"use client";

import { useState } from "react";
import { updateSystemSettings } from "@/lib/admin-action"; 
import { toast } from "sonner";
import { Settings, Save, ShieldCheck, Mail, Smartphone, Globe, MapPin, AlertTriangle } from "lucide-react";

export default function SettingsClient({ initialSettings }: { initialSettings: any }) {
  const [loading, setLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [formData, setFormData] = useState({
    APP_NAME: initialSettings.APP_NAME || "Larik AI",
    ENTERPRISE_PRICE: initialSettings.ENTERPRISE_PRICE || "99000",
    ADMIN_EMAIL: initialSettings.ADMIN_EMAIL || "solutionist1226@gmail.com",
    ADMIN_WA: initialSettings.ADMIN_WA || "6285123700712",
    APP_URL: initialSettings.APP_URL || "https://larikai.id",
    COMPANY_ADDRESS: initialSettings.COMPANY_ADDRESS || "Surabaya, Indonesia" 
  });

  // Saat tombol disubmit, buka modal dulu, jangan langsung simpan
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmOpen(true);
  };

  // Fungsi yang benar-benar menyimpan ke database
  const executeSave = async () => {
    setIsConfirmOpen(false);
    setLoading(true);
    
    try {
      const res = await updateSystemSettings(formData);
      if (res.success) {
        toast.success("Konfigurasi sistem berhasil diperbarui!");
      } else {
        toast.error("Gagal menyimpan ke database.");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan teknis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 md:p-12 relative">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-slate-800">
            <Settings className="w-8 h-8 text-emerald-600" />
            System Config
          </h1>
          <p className="text-slate-500 mt-1 font-medium text-sm">Kontrol seluruh variabel aplikasi Larik AI secara dinamis.</p>
        </div>
        
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Branding Card */}
          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Branding & URL
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">App Name</label>
                <input type="text" value={formData.APP_NAME} onChange={e => setFormData({...formData, APP_NAME: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">App Production URL</label>
                <input type="text" value={formData.APP_URL} onChange={e => setFormData({...formData, APP_URL: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" />
              </div>
            </div>
          </div>

          {/* Pricing & Contact Card */}
          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Billing & Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Enterprise Price (Rp)</label>
                <input type="number" value={formData.ENTERPRISE_PRICE} onChange={e => setFormData({...formData, ENTERPRISE_PRICE: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Admin WhatsApp (International Format)</label>
                <div className="relative">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" value={formData.ADMIN_WA} onChange={e => setFormData({...formData, ADMIN_WA: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Admin Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" value={formData.ADMIN_EMAIL} onChange={e => setFormData({...formData, ADMIN_EMAIL: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" />
                </div>
              </div>

              {/* INPUT LOKASI / ALAMAT */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Company Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" value={formData.COMPANY_ADDRESS} onChange={e => setFormData({...formData, COMPANY_ADDRESS: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-widest py-4 px-10 rounded-2xl transition-all shadow-lg shadow-emerald-200 flex items-center gap-3 active:scale-95 disabled:opacity-50">
              <Save className="w-4 h-4" /> {loading ? "Saving..." : "Apply Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* MODAL KONFIRMASI SIMPAN */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-8">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4 border border-emerald-100">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-800">Terapkan Perubahan?</h3>
                <p className="text-sm font-medium text-slate-500 mt-2 leading-relaxed">
                  Perubahan harga, nama aplikasi, kontak, dan tautan akan langsung diterapkan di seluruh Landing Page dan halaman Checkout secara real-time.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => setIsConfirmOpen(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">
                  Batal
                </button>
                <button onClick={executeSave} className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center transition-all shadow-lg shadow-emerald-600/20">
                  Ya, Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}