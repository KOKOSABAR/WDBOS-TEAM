import React, { useState, useMemo } from 'react';
import { Staff, MistakeRecord, getPeriodeFromDate, sortByJabatan } from '../types';
import { 
  Search, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  XOctagon, 
  ArrowUpDown, 
  SlidersHorizontal,
  Clock,
  ShieldCheck,
  User,
  Trash2,
  PlusCircle,
  FileText,
  Calendar,
  Layers,
  ChevronDown,
  Info,
  ChevronRight
} from 'lucide-react';

interface StaffMistakesViewProps {
  staffList: Staff[];
  mistakeRecords: MistakeRecord[];
  onAddMistake: (newMistake: Omit<MistakeRecord, 'id'>) => void;
  onDeleteMistake: (id: string) => void;
  currentTime: Date;
}

export default function StaffMistakesView({ 
  staffList, 
  mistakeRecords, 
  onAddMistake, 
  onDeleteMistake,
  currentTime 
}: StaffMistakesViewProps) {
  
  // Periode Filter States
  const currentDetails = useMemo(() => getPeriodeFromDate(currentTime.toISOString().split('T')[0]), [currentTime]);
  
  const [customYears, setCustomYears] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('custom_years_mistakes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const yearsList = useMemo(() => {
    const list = new Set<number>();
    const startY = 2024;
    const endY = Math.max(new Date().getFullYear() + 10, 2035);
    for (let y = startY; y <= endY; y++) {
      list.add(y);
    }
    // Add custom years
    customYears.forEach(y => list.add(y));
    // Add any years present in mistakes
    mistakeRecords.forEach(m => {
      if (m.tanggal) {
        const d = new Date(m.tanggal);
        if (!isNaN(d.getFullYear())) {
          list.add(d.getFullYear());
        }
      }
    });
    return Array.from(list).sort((a, b) => a - b);
  }, [mistakeRecords, customYears]);

  const [selectedYear, setSelectedYear] = useState<number>(currentDetails.year);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(currentDetails.periode);

  const handleYearChange = (val: string) => {
    if (val === "ADD_NEW_YEAR") {
      const input = prompt("Masukkan Tahun Baru yang ingin ditambahkan (misal: 2036):");
      if (input) {
        const yr = parseInt(input, 10);
        if (!isNaN(yr) && yr >= 2000 && yr <= 2100) {
          setCustomYears(prev => {
            const updated = [...new Set([...prev, yr])];
            localStorage.setItem('custom_years_mistakes', JSON.stringify(updated));
            return updated;
          });
          setSelectedYear(yr);
        } else {
          alert("Masukkan tahun yang valid (2000 - 2100).");
        }
      }
    } else {
      setSelectedYear(Number(val));
    }
  };
  
  // Search & Filter state for the Table
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal / Add Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetStaffId, setTargetStaffId] = useState<string>(staffList[0]?.id || '');
  const [mistakeDate, setMistakeDate] = useState<string>(currentTime.toISOString().split('T')[0]);
  const [mistakeType, setMistakeType] = useState<MistakeRecord['jenis']>('kesalahanWd');
  const [mistakeNote, setMistakeNote] = useState('');
  const [mistakeCount, setMistakeCount] = useState<number>(1);
  const [formError, setFormError] = useState('');

  // Tab State for Mistakes Dashboard
  const [subView, setSubView] = useState<'summary' | 'audit_log'>('summary');

  // Filter mistakes that fall strictly into the selected period & year
  const mistakesInSelectedPeriod = useMemo(() => {
    return mistakeRecords.filter(m => {
      const periodInfo = getPeriodeFromDate(m.tanggal);
      return periodInfo.year === selectedYear && periodInfo.periode === selectedPeriod;
    });
  }, [mistakeRecords, selectedYear, selectedPeriod]);

  // Aggregate mistakes by Staff
  const staffMistakesSummaryMap = useMemo(() => {
    const summary: Record<string, {
      kesalahanWd: number;
      kesalahanDepo: number;
      telatDiBawahSop: number;
      telatDiAtasSop: number;
      total: number;
    }> = {};

    // Initialize all staff with 0
    staffList.forEach(s => {
      summary[s.id] = {
        kesalahanWd: 0,
        kesalahanDepo: 0,
        telatDiBawahSop: 0,
        telatDiAtasSop: 0,
        total: 0
      };
    });

    // Sum matching period mistakes
    mistakesInSelectedPeriod.forEach(m => {
      if (summary[m.staffId]) {
        const item = summary[m.staffId];
        const val = m.jumlah || 1;
        if (m.jenis === 'kesalahanWd') item.kesalahanWd += val;
        else if (m.jenis === 'kesalahanDepo') item.kesalahanDepo += val;
        else if (m.jenis === 'telatDiBawahSop') item.telatDiBawahSop += val;
        else if (m.jenis === 'telatDiAtasSop') item.telatDiAtasSop += val;
        
        item.total += val;
      }
    });

    return summary;
  }, [staffList, mistakesInSelectedPeriod]);

  // Combined Staff & aggregated mistake structure
  const staffWithMistakes = useMemo(() => {
    return staffList.map(staff => {
      const aggregate = staffMistakesSummaryMap[staff.id] || {
        kesalahanWd: 0,
        kesalahanDepo: 0,
        telatDiBawahSop: 0,
        telatDiAtasSop: 0,
        total: 0
      };

      return {
        ...staff,
        ...aggregate
      };
    });
  }, [staffList, staffMistakesSummaryMap]);

  // Filter & Search Staff
  const filteredStaffList = useMemo(() => {
    const sorted = staffWithMistakes.filter(staff => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        staff.namaAllStaff.toLowerCase().includes(q) ||
        staff.nomorPasport.toLowerCase().includes(q) ||
        (staff.jabatanPosisi && staff.jabatanPosisi.toLowerCase().includes(q))
      );
    });
    return [...sorted].sort(sortByJabatan);
  }, [staffWithMistakes, searchQuery]);

  // Overall Totals for Stats Card
  const totalPeriodStats = useMemo(() => {
    let wd = 0;
    let depo = 0;
    let telatBawah = 0;
    let telatAtas = 0;
    let grandTotal = 0;

    mistakesInSelectedPeriod.forEach(m => {
      const val = m.jumlah || 1;
      if (m.jenis === 'kesalahanWd') wd += val;
      else if (m.jenis === 'kesalahanDepo') depo += val;
      else if (m.jenis === 'telatDiBawahSop') telatBawah += val;
      else if (m.jenis === 'telatDiAtasSop') telatAtas += val;
      grandTotal += val;
    });

    const staffWithInfractions = Object.keys(staffMistakesSummaryMap).filter(
      id => staffMistakesSummaryMap[id].total > 0
    ).length;

    return { wd, depo, telatBawah, telatAtas, grandTotal, staffWithInfractions };
  }, [mistakesInSelectedPeriod, staffMistakesSummaryMap]);

  const handleOpenAddModal = (staffId?: string) => {
    if (staffId) setTargetStaffId(staffId);
    else if (staffList.length > 0) setTargetStaffId(staffList[0].id);
    
    setMistakeDate(currentTime.toISOString().split('T')[0]);
    setMistakeNote('');
    setMistakeCount(1);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!targetStaffId) {
      setFormError('Silakan pilih staff terlebih dahulu.');
      return;
    }
    if (!mistakeDate) {
      setFormError('Silakan pilih tanggal kesalahan.');
      return;
    }
    if (mistakeCount <= 0) {
      setFormError('Jumlah kesalahan harus minimal 1.');
      return;
    }

    onAddMistake({
      staffId: targetStaffId,
      tanggal: mistakeDate,
      jenis: mistakeType,
      jumlah: mistakeCount,
      keterangan: mistakeNote.trim() || 'Diinput manual'
    });

    setIsModalOpen(false);
  };

  // Label Formatter for Mistake Types
  const formatMistakeTypeLabel = (type: MistakeRecord['jenis']) => {
    switch (type) {
      case 'kesalahanWd': return 'Kesalahan WD';
      case 'kesalahanDepo': return 'Kesalahan Depo';
      case 'telatDiBawahSop': return 'Telat < SOP';
      case 'telatDiAtasSop': return 'Telat > SOP';
      default: return type;
    }
  };

  const getPeriodLabelName = (p: number) => {
    switch (p) {
      case 1: return 'PERIODE 1 (Jan - Mar)';
      case 2: return 'PERIODE 2 (Apr - Jun)';
      case 3: return 'PERIODE 3 (Jul - Sep)';
      case 4: return 'PERIODE 4 (Okt - Des)';
      default: return `Periode ${p}`;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION METRIC LOGS */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest font-mono">
              SISTEM MONITORING PENALTY
            </span>
            <h2 className="text-xl font-extrabold tracking-tight font-display flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-500" />
              REKAP DATA KESALAHAN STAFF
            </h2>
            <p className="text-xs text-slate-400 max-w-xl">
              Melacak kesalahan Withdrawal (WD), Deposit (Depo), dan keterlambatan di bawah/atas SOP kerja per periode 3 bulan secara akurat.
            </p>
          </div>

          {/* PERIOD SELECTION CONTROLS */}
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 font-bold uppercase">PILIH TAHUN:</span>
              <select
                value={selectedYear}
                onChange={(e) => handleYearChange(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono font-bold text-white focus:outline-none cursor-pointer"
              >
                {yearsList.map(y => (
                  <option key={y} value={y}>TAHUN {y}</option>
                ))}
                <option value="ADD_NEW_YEAR" className="text-blue-400 font-bold font-sans">+ Tambah Tahun...</option>
              </select>
            </div>

            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 font-bold uppercase">PILIH PERIODE:</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono font-bold text-white focus:outline-none cursor-pointer"
              >
                <option value={1}>PERIODE 1 (JAN, FEB, MAR)</option>
                <option value={2}>PERIODE 2 (APR, MEI, JUN)</option>
                <option value={3}>PERIODE 3 (JUL, AGT, SEP)</option>
                <option value={4}>PERIODE 4 (OKT, NOV, DES)</option>
              </select>
            </div>
          </div>
        </div>

        {/* STATS COUNT GRID */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-800">
          
          <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Kesalahan WD</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-xl font-extrabold text-blue-400 font-mono">{totalPeriodStats.wd}</span>
              <span className="text-[10px] text-slate-400 font-mono">kasus</span>
            </div>
            <div className="text-[9px] text-blue-500 font-sans mt-1">Kesalahan admin WD member</div>
          </div>

          <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Kesalahan DEPO</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-xl font-extrabold text-amber-500 font-mono">{totalPeriodStats.depo}</span>
              <span className="text-[10px] text-slate-400 font-mono">kasus</span>
            </div>
            <div className="text-[9px] text-amber-500 font-sans mt-1">Kesalahan proses deposit</div>
          </div>

          <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Telat Di Bawah SOP</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-xl font-extrabold text-teal-400 font-mono">{totalPeriodStats.telatBawah}</span>
              <span className="text-[10px] text-slate-400 font-mono">kali</span>
            </div>
            <div className="text-[9px] text-teal-550 font-sans mt-1">Terlambat ringan &lt; batas</div>
          </div>

          <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Telat Di Atas SOP</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-xl font-extrabold text-rose-400 font-mono">{totalPeriodStats.telatAtas}</span>
              <span className="text-[10px] text-slate-400 font-mono">kali</span>
            </div>
            <div className="text-[9px] text-rose-500 font-sans mt-1">Terlambat fatal &gt; batas</div>
          </div>

          <div className="col-span-2 md:col-span-1 bg-blue-950/80 p-3.5 rounded-xl border border-blue-900/60 flex flex-col justify-between">
            <span className="text-[9px] font-bold text-blue-300 uppercase tracking-wider block">Total Penalty</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-2xl font-extrabold text-white font-mono">{totalPeriodStats.grandTotal}</span>
              <span className="text-[10px] text-blue-300 font-sans font-bold">TERCATAT</span>
            </div>
            <div className="text-[9px] text-blue-200 font-mono mt-1 font-semibold">
              Oleh {totalPeriodStats.staffWithInfractions} staff aktif/resign
            </div>
          </div>

        </div>
      </div>

      {/* VIEW TOGGLES & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-xs">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg self-start">
          <button
            onClick={() => setSubView('summary')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subView === 'summary' 
                ? 'bg-white text-slate-950 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Ringkasan Matrix Staff
          </button>
          
          <button
            onClick={() => setSubView('audit_log')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subView === 'audit_log' 
                ? 'bg-white text-slate-950 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Audit Log Detail ({mistakesInSelectedPeriod.length})
          </button>
        </div>

        {/* Toolbar Right */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {subView === 'summary' && (
            <div className="relative flex-1 sm:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari staff..."
                className="w-full text-xs border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400"
              />
            </div>
          )}

          <button
            onClick={() => handleOpenAddModal()}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 select-none text-center"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Catatan Kesalahan</span>
          </button>
        </div>

      </div>

      {subView === 'summary' ? (
        /* --- VIEW 1: SUMMARY MATRIX MATRIX --- */
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-500" />
              Tabel Matrix Pelanggaran: {getPeriodLabelName(selectedPeriod)} TAHUN {selectedYear}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Urutan: Kasus Terbanyak
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider font-sans text-center">
                  <th className="py-2.5 px-3 border-r border-slate-200/60 text-center w-12 min-w-[48px] max-w-[48px] sticky left-0 bg-slate-100 z-20" style={{ boxShadow: '1px 0 0 rgba(226,232,240,1)' }}>NO</th>
                  <th className="py-2.5 px-3 border-r border-slate-200/60 w-[240px] min-w-[240px] max-w-[240px] sticky left-[48px] bg-slate-100 z-20 text-center" style={{ boxShadow: '1px 0 0 rgba(226,232,240,1)' }}>NAMA STAFF</th>
                  <th className="py-2.5 px-3 border-r border-slate-200/60 font-mono text-center">NO PASPOR</th>
                  <th className="py-2.5 px-3 border-r border-slate-200/60 text-center">JABATAN</th>
                  <th className="py-2.5 px-3 border-r border-slate-200/60 text-center bg-blue-50/20 text-blue-900 font-bold">KESALAHAN WD</th>
                  <th className="py-2.5 px-3 border-r border-slate-200/60 text-center bg-amber-50/20 text-amber-900 font-bold">KESALAHAN DEPO</th>
                  <th className="py-2.5 px-3 border-r border-slate-200/60 text-center bg-teal-50/20 text-teal-950 font-bold">TELAT DI BAWAH SOP</th>
                  <th className="py-2.5 px-3 border-r border-slate-200/60 text-center bg-rose-50/20 text-rose-950 font-bold">TELAT DI ATAS SOP</th>
                  <th className="py-2.5 px-3 border-r border-slate-200/60 text-center bg-slate-900 text-white font-bold">TOTAL KESELURUHAN KESALAHAN</th>
                  <th className="py-2.5 px-3 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaffList.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400 font-sans">
                      <div className="flex flex-col items-center gap-2">
                        <AlertTriangle className="w-8 h-8 text-slate-300" />
                        <p className="text-xs font-semibold">Tidak ada staff atau data kesalahan ditemukan.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStaffList.map((staff, idx) => {
                    
                    const rowBgClass = staff.total > 0 
                      ? 'bg-rose-50/5 hover:bg-slate-50/80' 
                      : 'hover:bg-slate-50/80';
                    
                    const stickyBg = staff.total > 0
                      ? 'bg-[#fffcfc] group-hover:bg-[#ffebeb]'
                      : 'bg-white group-hover:bg-slate-50';
                      
                    return (
                      <tr key={staff.id} className={`${rowBgClass} group transition-colors text-xs font-sans`}>
                        
                        {/* 1. NO */}
                        <td className={`py-2.5 px-3 border-r border-slate-100/60 text-center font-mono text-slate-400 font-bold sticky left-0 z-10 w-12 min-w-[48px] max-w-[48px] transition-colors ${stickyBg}`} style={{ boxShadow: '1px 0 0 rgba(226,232,240,1)' }}>
                          {idx + 1}
                        </td>

                        {/* 2. NAMA STAFF */}
                        <td className={`py-2.5 px-3 border-r border-slate-100/60 sticky left-[48px] z-10 w-[240px] min-w-[240px] max-w-[240px] font-bold text-slate-900 transition-colors ${stickyBg}`} style={{ boxShadow: '1px 0 0 rgba(226,232,240,1)' }}>
                          <div className="flex items-center gap-2.5">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                              staff.jenisKelamin === 'Laki-laki' ? 'bg-indigo-100 text-indigo-700' : 'bg-fuchsia-100 text-fuchsia-700'
                            }`}>
                              {staff.namaAllStaff.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-slate-900 whitespace-normal break-words leading-tight" title={staff.namaAllStaff}>
                              {staff.namaAllStaff}
                            </span>
                            {staff.status && (
                              <span className={`px-1 py-0.2 text-[8px] rounded font-mono ${
                                staff.status.toUpperCase() === 'AKTIF' 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                  : staff.status.toUpperCase() === 'SEDANG CUTI INDO'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                    : 'bg-rose-50 text-rose-700 border border-rose-100'
                              }`}>
                                {staff.status}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 3. NO PASPOR */}
                        <td className="py-2.5 px-3 border-r border-slate-100/60 font-mono font-medium text-slate-700 whitespace-nowrap text-center">
                          {staff.nomorPasport || '-'}
                        </td>

                        {/* 4. JABATAN */}
                        <td className="py-2.5 px-3 border-r border-slate-100/60 text-slate-600 font-medium truncate max-w-[130px] text-center" title={staff.jabatanPosisi}>
                          {staff.jabatanPosisi || '-'}
                        </td>

                        {/* 5. KESALAHAN WD */}
                        <td className="py-2.5 px-3 border-r border-slate-100/60 text-center font-mono font-bold bg-blue-50/10">
                          {staff.kesalahanWd > 0 ? (
                            <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {staff.kesalahanWd}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* 6. KESALAHAN DEPO */}
                        <td className="py-2.5 px-3 border-r border-slate-100/60 text-center font-mono font-bold bg-amber-50/10">
                          {staff.kesalahanDepo > 0 ? (
                            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              {staff.kesalahanDepo}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* 7. TELAT DI BAWAH SOP */}
                        <td className="py-2.5 px-3 border-r border-slate-100/60 text-center font-mono font-bold bg-teal-50/10">
                          {staff.telatDiBawahSop > 0 ? (
                            <span className="text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                              {staff.telatDiBawahSop}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* 8. TELAT DI ATAS SOP */}
                        <td className="py-2.5 px-3 border-r border-slate-100/60 text-center font-mono font-bold bg-rose-50/10 whitespace-nowrap">
                          {staff.telatDiAtasSop > 0 ? (
                            <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-extrabold">
                              {staff.telatDiAtasSop}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* 9. TOTAL KESELURUHAN KESALAHAN */}
                        <td className="py-2.5 px-3 border-r border-slate-100/60 text-center font-mono font-extrabold bg-slate-900 text-white whitespace-nowrap">
                          {staff.total > 0 ? (
                            <span className="bg-rose-600 text-white px-2.5 py-0.5 rounded-full text-xs font-bold">
                              {staff.total} KASUS
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">0 Aman ✔</span>
                          )}
                        </td>

                        {/* 10. AKSI */}
                        <td className="py-2.5 px-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleOpenAddModal(staff.id)}
                            className="bg-blue-50 text-blue-750 hover:bg-blue-100 px-2.5 py-1 rounded-md text-[10px] font-bold border border-blue-200 transition-colors cursor-pointer flex items-center gap-1 mx-auto"
                          >
                            <PlusCircle className="w-3 h-3" />
                            Input Kasus
                          </button>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      ) : (
        /* --- VIEW 2: AUDIT LOG TIMELINE LOGS --- */
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Riwayat Input Kronologis Kasus ({getPeriodLabelName(selectedPeriod)} / {selectedYear})</span>
            <span className="text-[10px] font-medium text-slate-400">Total: {mistakesInSelectedPeriod.length} baris riwayat</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/60 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                  <th className="py-3 px-4 w-12 text-center">NO</th>
                  <th className="py-3 px-4 text-center">TANGGAL</th>
                  <th className="py-3 px-4 text-center">NAMA STAFF</th>
                  <th className="py-3 px-4 text-center">JENIS PELANGGARAN</th>
                  <th className="py-3 px-4 text-center">JUMLAH</th>
                  <th className="py-3 px-4 text-center">KETERANGAN / KRONOLOGI</th>
                  <th className="py-3 px-4 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mistakesInSelectedPeriod.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-1.5">
                        <CheckCircle className="w-7 h-7 text-emerald-400" />
                        <p className="font-semibold text-xs">Bersih dari pelanggaran!</p>
                        <p className="text-[11px] text-slate-400">Tidak ada riwayat pelanggaran tercatat di periode ini.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  mistakesInSelectedPeriod.map((rec, idx) => {
                    const staff = staffList.find(s => s.id === rec.staffId);
                    
                    let badgeColor = 'bg-slate-150 text-slate-800 border-slate-300';
                    if (rec.jenis === 'kesalahanWd') badgeColor = 'bg-blue-100 text-blue-800 border border-blue-200';
                    else if (rec.jenis === 'kesalahanDepo') badgeColor = 'bg-amber-100 text-amber-800 border border-amber-200';
                    else if (rec.jenis === 'telatDiBawahSop') badgeColor = 'bg-teal-100 text-teal-800 border border-teal-200';
                    else if (rec.jenis === 'telatDiAtasSop') badgeColor = 'bg-rose-100 text-rose-800 border border-rose-200';

                    return (
                      <tr key={rec.id} className="hover:bg-slate-100/50 transition-colors font-sans leading-normal">
                        <td className="py-3 px-4 font-mono font-bold text-center text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap">
                          {new Date(rec.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 whitespace-normal break-words leading-tight">
                          {staff?.namaAllStaff || 'Deleted Staff'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className={`${badgeColor} text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full`}>
                            {formatMistakeTypeLabel(rec.jenis)}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-extrabold text-center text-slate-900">{rec.jumlah || 1}x</td>
                        <td className="py-3 px-4 text-slate-650 max-w-sm truncate" title={rec.keterangan}>
                          {rec.keterangan || '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              if (window.confirm('Hapus log kesalahan ini dari database? Tindakan ini tidak bisa dibatalkan.')) {
                                onDeleteMistake(rec.id);
                              }
                            }}
                            className="bg-white hover:bg-rose-50 hover:text-rose-700 text-slate-400 p-1.5 rounded-md border border-slate-200 hover:border-rose-300 transition-colors cursor-pointer mx-auto"
                            title="Hapus Log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT MISTAKE MODAL DIALOG --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
            
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold tracking-tight">Catat Pelanggaran / Kesalahan Baru</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 font-sans">
              
              {formError && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200 font-medium">
                  {formError}
                </div>
              )}

              {/* Staff Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pilih Staff Terkait</label>
                <select
                  value={targetStaffId}
                  onChange={(e) => setTargetStaffId(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-200 rounded px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
                >
                  {[...staffList].sort(sortByJabatan).map(s => (
                    <option key={s.id} value={s.id}>
                      {s.namaAllStaff} ({s.nomorPasport})
                    </option>
                  ))}
                </select>
              </div>

              {/* Two Column details: Date & Type */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tanggal Kejadian</label>
                  <input
                    type="date"
                    value={mistakeDate}
                    onChange={(e) => setMistakeDate(e.target.value)}
                    className="w-full text-xs font-mono border border-slate-200 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Jumlah Kesalahan</label>
                  <input
                    type="number"
                    min={1}
                    value={mistakeCount}
                    onChange={(e) => setMistakeCount(Number(e.target.value))}
                    className="w-full text-xs font-mono border border-slate-200 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
                  />
                </div>
              </div>

              {/* Infraction Category */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Jenis Pelanggaran</label>
                <select
                  value={mistakeType}
                  onChange={(e) => setMistakeType(e.target.value as MistakeRecord['jenis'])}
                  className="w-full text-xs border border-slate-200 rounded px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 font-bold"
                >
                  <option value="kesalahanWd">KESALAHAN WD (WITHDRAWAL)</option>
                  <option value="kesalahanDepo">KESALAHAN DEPOSIT</option>
                  <option value="telatDiBawahSop">TELAT DI BAWAH SOP (CRITICAL LATE)</option>
                  <option value="telatDiAtasSop">TELAT DI ATAS SOP (FATAL LATE)</option>
                </select>
              </div>

              {/* Notes chronological */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Keterangan Kronologi Kejadian</label>
                <textarea
                  rows={3}
                  value={mistakeNote}
                  onChange={(e) => setMistakeNote(e.target.value)}
                  placeholder="Ceritakan detail kronologis kejadian agar terdokumentasi..."
                  className="w-full text-xs border border-slate-200 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 placeholder-slate-400"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer select-none"
                >
                  Simpan Catatan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
