"use client";

import { useState, useTransition } from "react";
import { approveTransaction, rejectTransaction } from "@/lib/admin-action";
import { toast } from "sonner";
import { 
  CheckCircle, ExternalLink, ShieldCheck, 
  Users, Banknote, Hourglass, BarChart3, MessageCircle,
  XCircle, ChevronLeft, ChevronRight, AlertTriangle
} from "lucide-react";

const REJECT_TEMPLATES = [
  "Bukti transfer buram atau tidak dapat dibaca.",
  "Nominal transfer tidak sesuai dengan tagihan (Rp 99.000).",
  "Bukti transfer terindikasi tidak valid atau kadaluarsa.",
  "Nama pengirim tidak cocok dengan data transaksi."
];

export default function AdminClient({ transactions, stats }: any) {
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  
  const currentTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  // Reject Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState(REJECT_TEMPLATES[0]);
  const [customReason, setCustomReason] = useState("");

  const handleApprove = (id: string, userName: string) => {
    setLoadingId(id);
    startTransition(async () => {
      const res = await approveTransaction(id);
      
      if (res.success) {
        toast.success("Berhasil disetujui! Membuka WhatsApp...");
        const userPhone = "6281234567890"; // Ganti dengan tx.user.phone jika ada
        const waMessage = encodeURIComponent(`Halo ${userName},\n\nPembayaran untuk lisensi Larik AI Enterprise Anda telah kami terima dan sistem sudah diaktifkan. Invoice juga sudah dikirim ke email Anda. Selamat menggunakan Larik AI!`);
        window.open(`https://wa.me/${userPhone}?text=${waMessage}`, "_blank");
      } else {
        toast.error("Gagal menyetujui transaksi.");
      }
      setLoadingId(null);
    });
  };

  const openRejectModal = (tx: any) => {
    setSelectedTx(tx);
    setRejectReason(REJECT_TEMPLATES[0]);
    setCustomReason("");
    setIsRejectModalOpen(true);
  };

  const handleRejectConfirm = () => {
    if (!selectedTx) return;
    
    const finalReason = rejectReason === "Custom" ? customReason : rejectReason;
    if (!finalReason) return toast.error("Alasan penolakan wajib diisi!");

    setLoadingId(selectedTx.id);
    setIsRejectModalOpen(false);

    startTransition(async () => {
      const res = await rejectTransaction(selectedTx.id, finalReason);
      
      if (res.success) {
        toast.success("Transaksi ditolak! Membuka WhatsApp...");
        const userPhone = "6281234567890"; // Ganti dengan tx.user.phone jika ada
        const waMessage = encodeURIComponent(`Halo ${selectedTx.user.name || "Pelanggan"},\n\nMohon maaf, pembayaran untuk lisensi Larik AI Enterprise Anda gagal kami verifikasi dengan alasan:\n\n*_${finalReason}_*\n\nSilakan unggah ulang bukti transfer yang benar. Terima kasih!`);
        window.open(`https://wa.me/${userPhone}?text=${waMessage}`, "_blank");
      } else {
        toast.error("Gagal menolak transaksi.");
      }
      setLoadingId(null);
      setSelectedTx(null);
    });
  };

  return (
    <div className="p-8 md:p-12 relative">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-slate-800">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
              Command Center
            </h1>
            <p className="text-slate-500 mt-1 font-medium text-sm">Real-time revenue and user management dashboard.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatCard title="Total Revenue" value={`Rp ${stats.totalRevenue.toLocaleString("id-ID")}`} icon={<Banknote className="text-emerald-600" />} />
          <StatCard title="Total Accounts" value={stats.totalUsers} icon={<Users className="text-emerald-600" />} />
          <StatCard title="Pending Review" value={stats.pendingTransactions} icon={<Hourglass className="text-amber-500" />} />
          <StatCard title="Success Rate" value={`${stats.successTransactions > 0 ? Math.round((stats.successTransactions / transactions.length) * 100) : 0}%`} icon={<BarChart3 className="text-emerald-600" />} />
        </div>

        {/* Transactions Table */}
        <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
                  <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                  <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                  <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Receipt</th>
                  <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentTransactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="py-5 px-8">
                      <p className="text-xs font-mono text-slate-500">{tx.id.slice(-8).toUpperCase()}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(tx.createdAt).toLocaleString("id-ID")}</p>
                    </td>
                    <td className="py-5 px-8">
                      <p className="text-sm font-bold text-slate-800">{tx.user.name || "Anonim"}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{tx.user.email}</p>
                    </td>
                    <td className="py-5 px-8 text-emerald-600 font-black text-sm">
                      Rp {tx.amount.toLocaleString("id-ID")}
                    </td>
                    <td className="py-5 px-8">
                      {tx.proofUrl ? (
                        <a href={tx.proofUrl} target="_blank" className="inline-flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-emerald-600 bg-slate-100 hover:bg-emerald-50 px-3 py-2 rounded-lg transition-all">
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 uppercase">None</span>
                      )}
                    </td>
                    <td className="py-5 px-8 text-right">
                      {tx.status === "PENDING" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openRejectModal(tx)}
                            disabled={isPending && loadingId === tx.id}
                            className="bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                          <button 
                            onClick={() => handleApprove(tx.id, tx.user.name || "Pelanggan")}
                            disabled={isPending && loadingId === tx.id}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest py-3 px-5 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                        </div>
                      ) : tx.status === "SUCCESS" ? (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-2 rounded-lg">
                          <CheckCircle className="w-3 h-3" /> Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-3 py-2 rounded-lg">
                          <XCircle className="w-3 h-3" /> Rejected
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 font-medium text-sm">
                      Belum ada data transaksi.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="border-t border-slate-200 p-4 flex items-center justify-between bg-white">
              <p className="text-xs font-bold text-slate-400">
                Menampilkan <span className="text-slate-800">{((currentPage - 1) * itemsPerPage) + 1}</span> - <span className="text-slate-800">{Math.min(currentPage * itemsPerPage, transactions.length)}</span> dari <span className="text-slate-800">{transactions.length}</span>
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-xs font-black text-slate-700 px-2">
                  Halaman {currentPage} dari {totalPages}
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* MODAL PENOLAKAN TRANSAKSI */}
      {isRejectModalOpen && selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">Tolak Transaksi</h3>
                  <p className="text-xs font-medium text-slate-500 mt-1">ID: {selectedTx.id.slice(-8).toUpperCase()} • {selectedTx.user.name}</p>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pilih Alasan Penolakan</label>
                <div className="flex flex-col gap-2">
                  {REJECT_TEMPLATES.map((template, idx) => (
                    <label key={idx} className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${rejectReason === template ? "border-rose-500 bg-rose-50" : "border-slate-200 hover:border-slate-300 bg-white"}`}>
                      <input 
                        type="radio" 
                        name="rejectReason" 
                        className="mt-0.5 w-4 h-4 text-rose-600 focus:ring-rose-500"
                        checked={rejectReason === template}
                        onChange={() => setRejectReason(template)}
                      />
                      <span className={`text-sm font-medium ${rejectReason === template ? "text-rose-900" : "text-slate-600"}`}>
                        {template}
                      </span>
                    </label>
                  ))}
                  <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${rejectReason === "Custom" ? "border-rose-500 bg-rose-50" : "border-slate-200 hover:border-slate-300 bg-white"}`}>
                    <input 
                      type="radio" 
                      name="rejectReason" 
                      className="mt-0.5 w-4 h-4 text-rose-600 focus:ring-rose-500"
                      checked={rejectReason === "Custom"}
                      onChange={() => setRejectReason("Custom")}
                    />
                    <div className="flex-1">
                      <span className={`text-sm font-medium ${rejectReason === "Custom" ? "text-rose-900" : "text-slate-600"}`}>Alasan Lainnya</span>
                      {rejectReason === "Custom" && (
                        <textarea 
                          className="mt-3 w-full p-3 text-sm bg-white border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                          rows={3}
                          placeholder="Ketik alasan spesifik di sini..."
                          value={customReason}
                          onChange={(e) => setCustomReason(e.target.value)}
                          autoFocus
                        />
                      )}
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsRejectModalOpen(false)}
                  className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleRejectConfirm}
                  className="flex-1 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/20"
                >
                  <MessageCircle className="w-4 h-4" /> Tolak & Kirim WA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="bg-white border border-slate-200 p-6 rounded-[1.5rem] flex items-center justify-between shadow-sm">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{title}</p>
        <p className="text-2xl font-black text-slate-800">{value}</p>
      </div>
      <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center">
        {icon}
      </div>
    </div>
  );
}