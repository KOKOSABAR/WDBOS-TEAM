import React, { useMemo, useState } from 'react';
import { TotalKesalahanCsRecord } from '../types';
import { Search, ShieldCheck, CheckCircle, FileText } from 'lucide-react';

interface TotalKesalahanCsViewProps {
  totalKesalahanCsRecords: TotalKesalahanCsRecord[];
}

export default function TotalKesalahanCsView({
  totalKesalahanCsRecords
}: TotalKesalahanCsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecords = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const records = totalKesalahanCsRecords.filter(record => {
      if (!q) return true;
      return (record.namaStaff || '').toLowerCase().includes(q);
    });

    return [...records].sort((a, b) => {
      if (b.totalKesalahan !== a.totalKesalahan) {
        return b.totalKesalahan - a.totalKesalahan;
      }
      return a.namaStaff.localeCompare(b.namaStaff, 'id');
    });
  }, [totalKesalahanCsRecords, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs border border-slate-800">
        <div className="space-y-1">
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-mono">
            DATABASE TOTAL CS
          </span>
          <h2 className="text-xl font-extrabold tracking-tight font-display flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            TOTAL KESALAHAN CS
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Halaman ini hanya menampilkan data dari spreadsheet pada sheet `TOTAL KESALAHAN CS`.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-xs">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama staff..."
            className="w-full text-xs border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder-slate-400"
          />
        </div>

        <div className="text-[10px] text-slate-400 font-mono">
          Menampilkan: {filteredRecords.length} records dari Google Sheet TOTAL KESALAHAN CS
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-500" />
            Tabel Total Kesalahan CS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/60 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                <th className="py-3 px-4 w-12 text-center">NO</th>
                <th className="py-3 px-4 text-left">NAMA STAFF</th>
                <th className="py-3 px-4 text-center">TOTAL KESALAHAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-1.5">
                      <CheckCircle className="w-7 h-7 text-emerald-400" />
                      <p className="font-semibold text-xs">Belum ada data total kesalahan CS.</p>
                      <p className="text-[11px] text-slate-400">Pastikan sheet `TOTAL KESALAHAN CS` sudah berisi header `NAMA STAFF` dan `TOTAL KESALAHAN`.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec, idx) => (
                  <tr key={rec.id} className="hover:bg-slate-100/50 transition-colors font-sans leading-normal">
                    <td className="py-3 px-4 font-mono font-bold text-center text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-normal break-words leading-tight">
                      {rec.namaStaff || '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center min-w-14 bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full font-mono font-extrabold">
                        {rec.totalKesalahan}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
