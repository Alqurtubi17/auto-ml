"use client";

import { useState, useMemo, useTransition } from "react";
import { updateUser, deleteUser } from "@/lib/admin-action";
import { toast } from "sonner";
import { 
  Users, Search, ChevronLeft, ChevronRight, 
  ShieldAlert, UserCheck, Edit3, Trash2, Crown, User as UserIcon, AlertTriangle
} from "lucide-react";

export default function AdminUsersClient({ users }: { users: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Edit Modal State (Sekarang menggunakan "plan" bukan "role")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({ id: "", name: "", email: "", plan: "FREE" });

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      (user.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (user.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, users]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // ACTION: Edit
  const openEditModal = (user: any) => {
    const isEnterprise = user.transactions && user.transactions.length > 0;
    setEditData({ 
      id: user.id, 
      name: user.name || "", 
      email: user.email, 
      plan: isEnterprise ? "ENTERPRISE" : "FREE" 
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateUser(editData.id, editData);
      if (res.success) {
        toast.success("Profil dan Paket Langganan berhasil diperbarui!");
        setIsEditModalOpen(false);
      } else {
        toast.error("Gagal memperbarui pengguna.");
      }
    });
  };

  // ACTION: Delete
  const openDeleteModal = (user: any) => {
    setUserToDelete(user);
    setDeleteConfirmText("");
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSubmit = () => {
    if (!userToDelete) return;
    startTransition(async () => {
      const res = await deleteUser(userToDelete.id);
      if (res.success) {
        toast.success(`Pengguna ${userToDelete.name || "Anonim"} berhasil dihapus.`);
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
      } else {
        toast.error("Gagal menghapus! Pastikan pengguna tidak memiliki transaksi terikat.");
      }
    });
  };

  const expectedDeleteText = `HAPUS ${userToDelete?.name || "ANONIM"}`;

  return (
    <div className="p-8 md:p-12 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-slate-800">
              <Users className="w-8 h-8 text-emerald-600" />
              User Management
            </h1>
            <p className="text-slate-500 mt-1 font-medium text-sm">Kelola akses, peran, paket langganan, dan data pelanggan.</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari nama, email, atau ID..." 
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
                  <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Account Info</th>
                  <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
                  <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Plan</th>
                  <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentUsers.map((user) => {
                  const isEnterprise = user.transactions && user.transactions.length > 0;
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-all">
                      <td className="py-5 px-8">
                        <p className="text-sm font-bold text-slate-800">{user.name || "Anonim"}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
                        <p className="text-[10px] font-mono text-slate-400 mt-1">ID: {user.id.slice(-8).toUpperCase()}</p>
                      </td>
                      <td className="py-5 px-8">
                        {user.role === "ADMIN" ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-black bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg uppercase tracking-widest"><ShieldAlert className="w-3.5 h-3.5"/> Admin</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-black bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg uppercase tracking-widest"><UserCheck className="w-3.5 h-3.5"/> User</span>
                        )}
                      </td>
                      <td className="py-5 px-8">
                        {isEnterprise ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest"><Crown className="w-4 h-4" /> Enterprise</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><UserIcon className="w-4 h-4" /> Free Tier</span>
                        )}
                      </td>
                      <td className="py-5 px-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditModal(user)} className="p-2 bg-slate-100 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 rounded-xl transition-all">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => openDeleteModal(user)} className="p-2 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-xl transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {currentUsers.length === 0 && (
                  <tr><td colSpan={4} className="py-12 text-center text-slate-500 font-medium">Data pengguna tidak ditemukan.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="border-t border-slate-200 p-4 flex items-center justify-between bg-white">
              <p className="text-xs font-bold text-slate-400">
                Menampilkan <span className="text-slate-800">{((currentPage - 1) * itemsPerPage) + 1}</span> - <span className="text-slate-800">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> dari <span className="text-slate-800">{filteredUsers.length}</span>
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

      {/* ---------------- MODAL EDIT USER ---------------- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden border border-slate-100">
            <form onSubmit={handleEditSubmit} className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Edit3 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">Edit Pengguna</h3>
                  <p className="text-xs font-medium text-slate-500 mt-1">Perbarui profil & paket langganan.</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Lengkap</label>
                  <input type="text" required value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Utama</label>
                  <input type="email" required value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Paket Langganan</label>
                  <select value={editData.plan} onChange={e => setEditData({...editData, plan: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all">
                    <option value="FREE">Free Tier (Gratis)</option>
                    <option value="ENTERPRISE">Enterprise (Aktif)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Batal</button>
                <button type="submit" disabled={isPending} className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50">
                  {isPending ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL HAPUS USER (SAFEGUARD) ---------------- */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden border border-rose-100">
            <div className="p-8">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-800">Hapus Permanen?</h3>
                <p className="text-sm font-medium text-slate-500 mt-2 leading-relaxed">
                  Tindakan ini tidak dapat dibatalkan. Semua data, riwayat transaksi, dan akses lisensi untuk <strong>{userToDelete.name || userToDelete.email}</strong> akan musnah selamanya.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2 text-center">Ketik kalimat di bawah ini untuk konfirmasi:</label>
                <div className="text-center mb-3">
                  <span className="bg-rose-100 text-rose-800 font-mono font-bold text-xs px-3 py-1.5 rounded-lg select-all">{expectedDeleteText}</span>
                </div>
                <input 
                  type="text" 
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={expectedDeleteText}
                  className="w-full px-4 py-3 bg-white border border-rose-200 rounded-xl text-sm font-bold text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                />
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Batalkan</button>
                <button 
                  onClick={handleDeleteSubmit}
                  disabled={isPending || deleteConfirmText !== expectedDeleteText}
                  className="flex-1 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50 disabled:grayscale"
                >
                  {isPending ? "Menghapus..." : "Ya, Hapus!"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}