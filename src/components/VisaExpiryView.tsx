import React, { useState, useMemo } from 'react';
import { Staff, calculateVisaRemaining, sortByJabatan } from '../types';
import { 
  Search, 
  MapPin, 
  Tag, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  XOctagon, 
  ArrowUpDown, 
  SlidersHorizontal,
  Clock,
  ShieldCheck,
  User,
  Plane
} from 'lucide-react';

const getStaffRowBgClass = (jabatan: string) => {
  const normJabatan = (jabatan || '').toUpperCase().trim();
  if (normJabatan.includes('LEADER')) {
    return 'bg-violet-50/45 hover:bg-violet-100/60 text-slate-800 transition-colors duration-150';
  } else if (normJabatan.includes('KAPTEN KASIR')) {
    return 'bg-teal-50/45 hover:bg-teal-100/60 text-slate-800 transition-colors duration-150';
  } else if (normJabatan.includes('CS') || normJabatan.includes('CUSTOMER SERVICE')) {
    return 'bg-sky-50/45 hover:bg-sky-100/60 text-slate-800 transition-colors duration-150';
  } else if (normJabatan.includes('KASIR')) {
    return 'bg-amber-50/35 hover:bg-amber-100/55 text-slate-800 transition-colors duration-150';
  } else {
    return 'bg-white hover:bg-slate-50/80 transition-colors duration-150';
  }
};

const getStaffStickyBgClass = (jabatan: string) => {
  const normJabatan = (jabatan || '').toUpperCase().trim();
  if (normJabatan.includes('LEADER')) {
    return 'bg-violet-50/80 group-hover/row:bg-violet-100/95';
  } else if (normJabatan.includes('KAPTEN KASIR')) {
    return 'bg-teal-50/80 group-hover/row:bg-teal-100/95';
  } else if (normJabatan.includes('CS') || normJabatan.includes('CUSTOMER SERVICE')) {
    return 'bg-sky-50/80 group-hover/row:bg-sky-100/95';
  } else if (normJabatan.includes('KASIR')) {
    return 'bg-amber-50/70 group-hover/row:bg-amber-100/85';
  } else {
    return 'bg-white group-hover/row:bg-slate-50';
  }
};

interface VisaExpiryViewProps {
  staffList: Staff[];
  currentTime: Date;
  onOpenEditModal: (staff: Staff) => void;
}

export default function VisaExpiryView({ staffList, currentTime, onOpenEditModal }: VisaExpiryViewProps) {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'warning' | 'expired' | 'safe'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Highlight or format expiry date
  const formatDateIndo = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Get visa classification
  const getVisaRemainingDetails = (staff: Staff) => {
    const sisaHari = staff.expVisa ? calculateVisaRemaining(staff.expVisa, currentTime) : null;
    
    let label = 'Belum Ada';
    let colorClass = 'text-slate-400 bg-slate-100 border-slate-200';
    let category: 'none' | 'expired' | 'warning' | 'safe' = 'none';

    if (sisaHari !== null) {
      if (sisaHari < 0) {
        label = 'Expired ❌';
        colorClass = 'text-rose-700 bg-rose-100 border-rose-300 animate-pulse';
        category = 'expired';
      } else if (sisaHari <= 45) {
        label = `Warning (${sisaHari} Hari)`;
        colorClass = 'text-amber-700 bg-amber-100 border-amber-300 font-bold';
        category = 'warning';
      } else {
        label = `Aman (${sisaHari} Hari)`;
        colorClass = 'text-emerald-700 bg-emerald-100 border-emerald-300';
        category = 'safe';
      }
    }

    return { sisaHari, label, colorClass, category };
  };

  // Distinct visa types list
  const uniqueVisaTypes = useMemo(() => {
    const types = staffList.map(s => s.typeVisa).filter(Boolean) as string[];
    return ['all', ...Array.from(new Set(types))];
  }, [staffList]);

  // Main Calculations for Stats
  const stats = useMemo(() => {
    let totalRegistered = 0;
    let safeCount = 0;
    let warningCount = 0;
    let expiredCount = 0;

    staffList.forEach(s => {
      if (s.expVisa) {
        totalRegistered++;
        const sisa = calculateVisaRemaining(s.expVisa, currentTime);
        if (sisa < 0) {
          expiredCount++;
        } else if (sisa <= 45) {
          warningCount++;
        } else {
          safeCount++;
        }
      }
    });

    return { totalRegistered, safeCount, warningCount, expiredCount };
  }, [staffList, currentTime]);

  // Filter & Sort computation
  const processedVisas = useMemo(() => {
    return staffList
      .map(staff => {
        const visaDetails = getVisaRemainingDetails(staff);
        return {
          ...staff,
          remainingDays: visaDetails.sisaHari,
          category: visaDetails.category
        };
      })
      .filter(item => {
        // query match
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery = !query || 
          item.namaAllStaff.toLowerCase().includes(query) ||
          item.nomorPasport.toLowerCase().includes(query) ||
          (item.jabatanPosisi && item.jabatanPosisi.toLowerCase().includes(query));

        // status match
        let matchesStatus = true;
        if (statusFilter === 'warning') {
          matchesStatus = item.remainingDays !== null && item.remainingDays >= 0 && item.remainingDays <= 45;
        } else if (statusFilter === 'expired') {
          matchesStatus = item.remainingDays !== null && item.remainingDays < 0;
        } else if (statusFilter === 'safe') {
          matchesStatus = item.remainingDays !== null && item.remainingDays > 45;
        }

        // type match
        const matchesType = typeFilter === 'all' || item.typeVisa === typeFilter;

        return matchesQuery && matchesStatus && matchesType;
      })
      .sort((a, b) => {
        const jabSort = sortByJabatan(a, b);
        if (jabSort !== 0) return jabSort;

        const daysA = a.remainingDays === null ? 999999 : a.remainingDays;
        const daysB = b.remainingDays === null ? 999999 : b.remainingDays;
        
        if (sortOrder === 'asc') {
          return daysA - daysB;
        } else {
          return daysB - daysA;
        }
      });
  }, [staffList, searchQuery, statusFilter, typeFilter, sortOrder, currentTime]);

  return (
    <div className="space-y-6">
      
      {/* --- VISA CONTROL & STATISTICS CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Registered */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 shrink-0">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Visa Terdaftar</span>
            <span className="text-xl font-extrabold text-slate-900 font-mono leading-none block mt-1">
              {stats.totalRegistered} <span className="text-xs text-slate-500 font-normal">Staff</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">Dari {staffList.length} total roster</span>
          </div>
        </div>

        {/* Card 2: Safe */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Aktif Diatas 45 Hari</span>
            <span className="text-xl font-extrabold text-emerald-700 font-mono leading-none block mt-1">
              {stats.safeCount} <span className="text-xs text-slate-500 font-normal">Staff</span>
            </span>
            <span className="text-[10px] text-emerald-600 font-sans tracking-wide mt-0.5 block">Sisa Visa &gt; 45 Hari ✔</span>
          </div>
        </div>

        {/* Card 3: Warning */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg border border-amber-100 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Mendekati Kadaluarsa</span>
            <span className="text-xl font-extrabold text-amber-600 font-mono leading-none block mt-1">
              {stats.warningCount} <span className="text-xs text-slate-500 font-normal">Staff</span>
            </span>
            <span className="text-[10px] text-amber-500 font-sans tracking-wide mt-0.5 block">Sisa Visa ≤ 45 Hari ⏰</span>
          </div>
        </div>

        {/* Card 4: Expired */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg border border-rose-100 shrink-0">
            <XOctagon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Visa Kadaluarsa</span>
            <span className="text-xl font-extrabold text-rose-700 font-mono leading-none block mt-1">
              {stats.expiredCount} <span className="text-xs text-slate-500 font-normal">Staff</span>
            </span>
            <span className="text-[10px] text-rose-500 font-sans tracking-wide mt-0.5 block">Segera perpanjang visa! 🚨</span>
          </div>
        </div>

      </div>

      {/* --- SEARCH, FILTER & TOOLBARS --- */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        
        {/* Top Control Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Quick Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
            >
              Semua Visa ({staffList.filter(s => s.expVisa).length})
            </button>
            <button
              onClick={() => setStatusFilter('warning')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === 'warning' ? 'bg-amber-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-amber-600 hover:bg-amber-50/50'}`}
            >
              Peringatan ≤ 45 Hari ({stats.warningCount})
            </button>
            <button
              onClick={() => setStatusFilter('expired')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === 'expired' ? 'bg-rose-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-rose-600 hover:bg-rose-50/50'}`}
            >
              Kadaluarsa ({stats.expiredCount})
            </button>
            <button
              onClick={() => setStatusFilter('safe')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${statusFilter === 'safe' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-emerald-600 hover:bg-emerald-50/50'}`}
            >
              Aman &gt; 45 Hari ({stats.safeCount})
            </button>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto self-stretch">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari staff, paspor, atau jabatan..."
                className="w-full text-xs border border-slate-200 rounded-lg pl-9 pr-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400 font-sans"
              />
            </div>

            {/* Sorting trigger toggle */}
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-slate-200 bg-white hover:bg-slate-100 rounded-lg text-slate-700 transition-colors cursor-pointer"
              title={`Urutkan: Sisa Hari ${sortOrder === 'asc' ? 'Terkecil (Mendekati Expiry)' : 'Terbesar'}`}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Advanced filter strip */}
        <div className="p-3 border-b border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-white">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter Kategori:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span>Tipe Visa:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-slate-200 rounded font-medium px-2 py-0.5 text-xs focus:outline-none text-slate-800"
            >
              <option value="all">Semua Tipe</option>
              {uniqueVisaTypes.filter(t => t !== 'all').map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="ml-auto text-[11px] font-mono text-slate-400">
            Menampilkan {processedVisas.length} dari {staffList.length} staff
          </div>
        </div>

        {/* --- DATATABLE AREA --- */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider font-sans text-center">
                <th className="py-2.5 px-3 border-r border-slate-200/60 text-center w-12 min-w-[48px] max-w-[48px] shrink-0 sticky left-0 bg-slate-100 z-20" style={{ boxShadow: '1px 0 0 rgba(226,232,240,1)' }}>NO</th>
                <th className="py-2.5 px-3 border-r border-slate-200/60 w-[240px] min-w-[240px] max-w-[240px] sticky left-[48px] bg-slate-100 z-20 text-center" style={{ boxShadow: '1px 0 0 rgba(226,232,240,1)' }}>NAMA STAFF</th>
                <th className="py-2.5 px-3 border-r border-slate-200/60 font-mono text-center">NO PASPOR</th>
                <th className="py-2.5 px-3 border-r border-slate-200/60 text-center">JABATAN</th>
                <th className="py-2.5 px-3 border-r border-slate-200/60 text-center">EXP VISA</th>
                <th className="py-2.5 px-3 border-r border-slate-200/60 text-center">TYPE VISA</th>
                <th className="py-2.5 px-3 border-r border-slate-200/60 text-center">LOKASI SAAT INI</th>
                <th className="py-2.5 px-3 border-r border-slate-200/60 text-center text-blue-900 font-extrabold bg-blue-50/30">SISA AKTIF VISA</th>
                <th className="py-2.5 px-3 border-r border-slate-200/60 text-center">AKTIF DIATAS 45 HARI</th>
                <th className="py-2.5 px-3 text-center">LEAVEDAY / STATUS</th>
              </tr>
            </thead>
            <tbody>
              {processedVisas.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-sans">
                    <div className="flex flex-col items-center gap-2">
                       <AlertTriangle className="w-8 h-8 text-slate-300" />
                      <p className="text-xs font-semibold">Tidak ada data kecocokan visa staff ditemukan.</p>
                      <p className="text-[11px] text-slate-400">Gunakan filter di atas atau lengkapi data visa staff Anda di menu Database Staff.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                processedVisas.map((staff, index) => {
                  const hasVisa = !!staff.expVisa;
                  const daysRemaining = staff.remainingDays;
                  const isAbove45 = daysRemaining !== null && daysRemaining > 45;

                  const rowBg = getStaffRowBgClass(staff.jabatanPosisi);
                  const stickyBg = getStaffStickyBgClass(staff.jabatanPosisi);

                  return (
                    <tr key={staff.id} className={`${rowBg} border-b border-slate-100 font-sans text-xs group/row`}>
                      
                      {/* 1. NO */}
                      <td className={`py-2 px-3 border-r border-slate-100/60 text-center font-mono text-slate-400 font-bold sticky left-0 z-10 w-12 min-w-[48px] max-w-[48px] transition-colors ${stickyBg}`} style={{ boxShadow: '1px 0 0 rgba(226,232,240,1)' }}>
                        {index + 1}
                      </td>

                      {/* 2. NAMA STAFF */}
                      <td className={`py-2 px-3 border-r border-slate-100/60 sticky left-[48px] z-10 w-[240px] min-w-[240px] max-w-[240px] font-bold transition-colors ${stickyBg}`} style={{ boxShadow: '1px 0 0 rgba(226,232,240,1)' }}>
                        <div className="flex items-center gap-2.5">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-display shrink-0 ${staff.jenisKelamin === 'Laki-laki' ? 'bg-indigo-150 text-indigo-700' : 'bg-fuchsia-150 text-fuchsia-700'}`}>
                            {staff.namaAllStaff.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-slate-900 whitespace-normal break-words leading-tight" title={staff.namaAllStaff}>
                            {staff.namaAllStaff}
                          </span>
                        </div>
                      </td>

                      {/* 3. NO PASPOR */}
                      <td className="py-2 px-3 border-r border-slate-100/60 font-mono font-medium text-slate-700 whitespace-nowrap text-center">
                        {staff.nomorPasport || '-'}
                      </td>

                      {/* 4. JABATAN */}
                      <td className="py-2 px-3 border-r border-slate-100/60 text-center whitespace-nowrap">
                        {(() => {
                          const norm = (staff.jabatanPosisi || '').toUpperCase().trim();
                          let badgeStyle = 'bg-slate-100 text-slate-800 border border-slate-200';
                          if (norm.includes('LEADER')) {
                            badgeStyle = 'bg-violet-100 text-violet-800 border border-violet-300';
                          } else if (norm.includes('KAPTEN KASIR')) {
                            badgeStyle = 'bg-teal-100 text-teal-800 border border-teal-300';
                          } else if (norm.includes('CS') || norm.includes('CUSTOMER SERVICE')) {
                            badgeStyle = 'bg-sky-100 text-sky-800 border border-sky-300';
                          } else if (norm.includes('KASIR')) {
                            badgeStyle = 'bg-amber-100 text-amber-800 border border-amber-305';
                          }
                          return (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide shadow-2xs ${badgeStyle}`}>
                              {staff.jabatanPosisi || '-'}
                            </span>
                          );
                        })()}
                      </td>

                      {/* 5. EXP VISA */}
                      <td className="py-2 px-3 border-r border-slate-100/60 font-mono text-slate-700 whitespace-nowrap text-center">
                        {hasVisa ? (
                          <span className="flex items-center justify-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            {formatDateIndo(staff.expVisa)}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Belum diinput</span>
                        )}
                      </td>

                      {/* 6. TYPE VISA */}
                      <td className="py-2 px-3 border-r border-slate-100/60 font-mono font-bold text-slate-700 whitespace-nowrap text-center">
                        {staff.typeVisa ? (
                          <span className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200">
                            {staff.typeVisa}
                          </span>
                        ) : '-'}
                      </td>

                      {/* 7. LOKASI SAAT INI */}
                      <td className="py-2 px-3 border-r border-slate-100/60 text-slate-700 font-medium whitespace-nowrap text-center">
                        {staff.lokasiSaatIni ? (
                          <span className="flex items-center justify-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            {staff.lokasiSaatIni}
                          </span>
                        ) : '-'}
                      </td>

                      {/* 8. SISA AKTIF VISA */}
                      <td className="py-2 px-3 border-r border-slate-100/60 font-mono font-extrabold text-center whitespace-nowrap bg-blue-50/10">
                        {daysRemaining !== null ? (
                          daysRemaining < 0 ? (
                            <span className="text-red-650 bg-red-100 px-2 py-0.5 rounded border border-red-200 animate-pulse">
                              EXPIRED ({Math.abs(daysRemaining)} Lwt)
                            </span>
                          ) : daysRemaining <= 45 ? (
                            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">
                              {daysRemaining} Hari Lagi
                            </span>
                          ) : (
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {daysRemaining} Hari Lagi
                            </span>
                          )
                        ) : (
                          <span className="text-slate-400 font-normal italic">Belum diinput</span>
                        )}
                      </td>

                      {/* 9. AKTIF DIATAS 45 HARI */}
                      <td className="py-2 px-3 border-r border-slate-100/60 text-center whitespace-nowrap">
                        {daysRemaining !== null ? (
                          isAbove45 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <ShieldCheck className="w-3 h-3" /> YA (AMAN)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              <AlertTriangle className="w-3 h-3" /> TIDAK
                            </span>
                          )
                        ) : (
                          <span className="text-slate-400 italic font-mono">-</span>
                        )}
                      </td>

                      {/* 10. LEAVEDAY / STATUS */}
                      <td className="py-2 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {(() => {
                            const normStatus = (staff.status || '').toUpperCase().trim();
                            let badgeStyle = 'bg-slate-100 text-slate-800 border border-slate-300';
                            
                            if (normStatus === 'KERJA' || normStatus === 'AKTIF') {
                              badgeStyle = 'bg-emerald-100 text-emerald-800 border border-emerald-300';
                            } else if (normStatus === 'CUTI' || normStatus === 'SEDANG CUTI INDO') {
                              badgeStyle = 'bg-amber-100 text-amber-800 border border-amber-305';
                            } else if (normStatus === 'DIRUMAHKAN' || normStatus === 'RESIGN') {
                              badgeStyle = 'bg-rose-100 text-rose-800 border border-rose-300';
                            } else if (normStatus === 'DIPULANGKAN') {
                              badgeStyle = 'bg-blue-100 text-blue-800 border border-blue-300';
                            }

                            return (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black ${badgeStyle}`}>
                                {staff.status}
                              </span>
                            );
                          })()}
                          
                          <button
                            onClick={() => onOpenEditModal(staff)}
                            className="bg-white hover:bg-slate-100 border border-slate-200 p-1 rounded font-medium text-[10px] text-blue-600 transition-colors"
                            title="Lengkapi data visa"
                          >
                            Edit
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
