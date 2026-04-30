"use client";

import { useState, useMemo } from "react";
import { CreditCard, Search, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock } from "lucide-react";

export default function AdminTransactionsClient({ transactions }: { transactions: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredTx = useMemo(() => {
    return transactions.filter(tx => 
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.user?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (tx.user?.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, transactions]);

  const totalPages = Math.ceil(filteredTx.length / itemsPerPage);
  const currentTx = filteredTx.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="p-8 md:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-slate-800">
              <CreditCard className="w-8 h-8 text-emerald-600" />
              Transaction Ledger
            </h1>
            <p className="text-slate-500 mt-1 font-medium text-sm">Riwayat lengkap seluruh transaksi masuk dan keluar.</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari ID TRX, Nama, atau Email..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm"
            />
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">ID / Date</th>
                  <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                  <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                  <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentTx.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-all">
                    <td className="py-4 px-8">
                      <p className="font-mono text-xs text-slate-600 font-bold">{tx.id.slice(-8).toUpperCase()}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(tx.createdAt).toLocaleDateString("id-ID")}</p>
                    </td>
                    <td className="py-4 px-8">
                      <p className="text-sm font-bold text-slate-800">{tx.user?.name || "Anonim"}</p>
                      <p className="text-xs text-slate-500">{tx.user?.email}</p>
                    </td>
                    <td className="py-4 px-8 text-sm font-black text-slate-600">Rp {tx.amount.toLocaleString("id-ID")}</td>
                    <td className="py-4 px-8 text-right">
                      {tx.status === "SUCCESS" && <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg uppercase tracking-widest"><CheckCircle className="w-3 h-3"/> Success</span>}
                      {tx.status === "PENDING" && <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg uppercase tracking-widest"><Clock className="w-3 h-3"/> Pending</span>}
                      {tx.status === "REJECTED" && <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg uppercase tracking-widest"><XCircle className="w-3 h-3"/> Rejected</span>}
                    </td>
                  </tr>
                ))}
                {currentTx.length === 0 && (
                  <tr><td colSpan={4} className="py-12 text-center text-slate-500 font-medium">Transaksi tidak ditemukan.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="border-t border-slate-200 p-4 flex items-center justify-between bg-white">
               <p className="text-xs font-bold text-slate-400">
                Menampilkan <span className="text-slate-800">{((currentPage - 1) * itemsPerPage) + 1}</span> - <span className="text-slate-800">{Math.min(currentPage * itemsPerPage, filteredTx.length)}</span> dari <span className="text-slate-800">{filteredTx.length}</span> transaksi
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-50 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                <div className="text-xs font-black text-slate-700 px-2">Hal {currentPage} / {totalPages}</div>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-50 transition-colors"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}