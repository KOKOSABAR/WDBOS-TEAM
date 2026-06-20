import React, { useState, useMemo } from 'react';
import { Staff, OvertimeRecord, sortByJabatan } from '../types';
import { 
  PlusCircle, 
  Search, 
  Clock, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Info,
  Layers,
  Sparkles,
  Trash2,
  FileSpreadsheet
} from 'lucide-react';

interface StaffOvertimeViewProps {
  staffList: Staff[];
  overtimeRecords: OvertimeRecord[];
  onAddOrUpdateOvertime: (staffId: string, tanggal: string, hours: number, note?: string) => void;
  onClearOvertime: (id: string) => void;
  currentTime: Date;
}

export default function StaffOvertimeView({
  staffList,
  overtimeRecords,
  onAddOrUpdateOvertime,
  onClearOvertime,
  currentTime
}: StaffOvertimeViewProps) {
  
  // Year & Month Navigation State
  const [customYears, setCustomYears] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('custom_years_overtimes');
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
    // Add any years present in overtime records
    overtimeRecords.forEach(r => {
      if (r.tanggal) {
        const d = new Date(r.tanggal);
        if (!isNaN(d.getFullYear())) {
          list.add(d.getFullYear());
        }
      }
    });
    return Array.from(list).sort((a, b) => a - b);
  }, [overtimeRecords, customYears]);

  const [selectedYear, setSelectedYear] = useState<number>(() => currentTime.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(() => currentTime.getMonth()); // 0-based index

  const handleYearChange = (val: string) => {
    if (val === "ADD_NEW_YEAR") {
      const input = prompt("Masukkan Tahun Baru yang ingin ditambahkan (misal: 2036):");
      if (input) {
        const yr = parseInt(input, 10);
        if (!isNaN(yr) && yr >= 2000 && yr <= 2100) {
          setCustomYears(prev => {
            const updated = [...new Set([...prev, yr])];
            localStorage.setItem('custom_years_overtimes', JSON.stringify(updated));
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

  // Search input for filtering list of staff
  const [searchQuery, setSearchQuery] = useState('');

  // Cell Editor Modal State
  const [editingCell, setEditingCell] = useState<{
    staff: Staff;
    tanggal: string; // YYYY-MM-DD
    currentRecord?: OvertimeRecord;
  } | null>(null);

  // Form values in modal
  const [inputHours, setInputHours] = useState<string>('2');
  const [inputNote, setInputNote] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');

  // Month names for dropdown & label formatting
  const monthsList = [
    { value: 0, name: 'Januari' },
    { value: 1, name: 'Februari' },
    { value: 2, name: 'Maret' },
    { value: 3, name: 'April' },
    { value: 4, name: 'Mei' },
    { value: 5, name: 'Juni' },
    { value: 6, name: 'Juli' },
    { value: 7, name: 'Agustus' },
    { value: 8, name: 'September' },
    { value: 9, name: 'Oktober' },
    { value: 10, name: 'November' },
    { value: 11, name: 'Desember' }
  ];

  // Helper to get number of days in selected month
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedYear, selectedMonth]);

  // Generate an array [1, 2, ..., daysInMonth]
  const daysArray = useMemo(() => {
    const arr = [];
    for (let i = 1; i <= daysInMonth; i++) {
      arr.push(i);
    }
    return arr;
  }, [daysInMonth]);

  // Memoize overtime records keyed by staffId and day of currently filtered month
  // Key format: `{staffId}-{day}`
  const overtimeMap = useMemo(() => {
    const map: Record<string, OvertimeRecord> = {};
    overtimeRecords.forEach(rec => {
      const recDate = new Date(rec.tanggal);
      if (
        recDate.getFullYear() === selectedYear &&
        recDate.getMonth() === selectedMonth
      ) {
        const day = recDate.getDate();
        map[`${rec.staffId}-${day}`] = rec;
      }
    });
    return map;
  }, [overtimeRecords, selectedYear, selectedMonth]);

  // Aggregate total OT hours per staff for the currently selected month
  const staffMonthlyTotalMap = useMemo(() => {
    const map: Record<string, number> = {};
    staffList.forEach(s => {
      map[s.id] = 0;
    });

    overtimeRecords.forEach(rec => {
      const recDate = new Date(rec.tanggal);
      if (
        recDate.getFullYear() === selectedYear &&
        recDate.getMonth() === selectedMonth
      ) {
        const hours = Number(rec.jumlahJam) || 0;
        map[rec.staffId] = (map[rec.staffId] || 0) + hours;
      }
    });
    return map;
  }, [staffList, overtimeRecords, selectedYear, selectedMonth]);

  // Filter staff by search query
  const filteredStaff = useMemo(() => {
    const filtered = staffList.filter(s => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        s.namaAllStaff.toLowerCase().includes(q) ||
        s.nomorPasport.toLowerCase().includes(q) ||
        (s.jabatanPosisi && s.jabatanPosisi.toLowerCase().includes(q))
      );
    });
    return [...filtered].sort(sortByJabatan);
  }, [staffList, searchQuery]);

  // Handle cell click to trigger Overtime input modal
  const handleCellClick = (staff: Staff, dayNum: number) => {
    // format day to double digit
    const formattedDay = String(dayNum).padStart(2, '0');
    const formattedMonth = String(selectedMonth + 1).padStart(2, '0');
    const dateStr = `${selectedYear}-${formattedMonth}-${formattedDay}`;

    const record = overtimeMap[`${staff.id}-${dayNum}`];

    setEditingCell({
      staff,
      tanggal: dateStr,
      currentRecord: record
    });

    setInputHours(record ? String(record.jumlahJam) : '2');
    setInputNote(record?.keterangan || '');
    setPassword('');
    setPasswordError('');
  };

  const handleModalSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCell) return;

    if (password !== 'wdbos88') {
      setPasswordError('Password salah atau tidak sah!');
      return;
    }

    const parsedHours = parseFloat(inputHours);
    if (isNaN(parsedHours) || parsedHours < 0) {
      alert('Jumlah jam lembur tidak valid.');
      return;
    }

    onAddOrUpdateOvertime(
      editingCell.staff.id,
      editingCell.tanggal,
      parsedHours,
      inputNote.trim()
    );

    setEditingCell(null);
  };

  const handleClearOvertimeCell = () => {
    if (!editingCell?.currentRecord) return;

    if (password !== 'wdbos88') {
      setPasswordError('Password salah atau tidak sah!');
      return;
    }

    onClearOvertime(editingCell.currentRecord.id);
    setEditingCell(null);
  };

  // Switch month helper buttons
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(y => y - 1);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(y => y + 1);
    } else {
      setSelectedMonth(m => m + 1);
    }
  };

  // Get active cell color level e.g. level of hours
  const getCellBgClass = (hours: number | undefined) => {
    if (!hours || hours === 0) return 'text-slate-350 hover:bg-slate-100/80 hover:text-slate-900 cursor-pointer transition-colors';
    if (hours < 3) return 'bg-blue-50 text-blue-700 hover:bg-blue-100 font-extrabold cursor-pointer border border-blue-100 transition-colors shadow-xs';
    if (hours < 6) return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-150 font-extrabold cursor-pointer border border-indigo-200 transition-colors shadow-xs';
    return 'bg-purple-100 text-purple-800 hover:bg-purple-150 font-extrabold cursor-pointer border border-purple-200 transition-colors shadow-xs';
  };

  // Monthly stats
  const monthlyStatsSum = useMemo(() => {
    let totalHours = 0;
    let occurrences = 0;
    const staffWithOT = new Set<string>();

    overtimeRecords.forEach(rec => {
      const recDate = new Date(rec.tanggal);
      if (
        recDate.getFullYear() === selectedYear &&
        recDate.getMonth() === selectedMonth
      ) {
        totalHours += Number(rec.jumlahJam) || 0;
        occurrences += 1;
        staffWithOT.add(rec.staffId);
      }
    });

    return {
      totalHours,
      avgHours: occurrences > 0 ? (totalHours / occurrences).toFixed(1) : '0',
      occurrences,
      staffCount: staffWithOT.size
    };
  }, [overtimeRecords, selectedYear, selectedMonth]);

  return (
    <div className="space-y-6">
      
      {/* 1. OVERTIME DASHBOARD HEADER STATS COOP */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest font-mono">
              SISTEM LEMBURAN HARIAN WDBOS
            </span>
            <h2 className="text-xl font-extrabold tracking-tight font-display flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              MONITORING LEMBURAN STAFF
            </h2>
            <p className="text-xs text-slate-400 max-w-xl">
              Pencatatan jam kerja lembur (overtime) staff secara presisi dari tanggal 1 sampai 31 untuk setiap bulannya secara real-time.
            </p>
          </div>

          {/* Month/Year selector buttons */}
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex items-center justify-between gap-4 self-stretch md:self-auto min-w-[280px]">
            <button
              onClick={handlePrevMonth}
              className="p-1 px-2 hover:bg-slate-700 rounded text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="text-center font-mono font-bold text-xs flex flex-col items-center">
              <span className="text-[10px] text-indigo-400 uppercase tracking-wider font-semibold">PERIODE BULANAN</span>
              <span className="text-white tracking-wide text-xs">
                {monthsList.find(m => m.value === selectedMonth)?.name.toUpperCase()} {selectedYear}
              </span>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-1 px-2 hover:bg-slate-700 rounded text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* METRICS OF SELECTED MONTH */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800">
          
          <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Jam Lembur</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-2xl font-extrabold text-indigo-400 font-mono">{monthlyStatsSum.totalHours}</span>
              <span className="text-[10px] text-slate-400 font-mono">JAM</span>
            </div>
            <div className="text-[9px] text-indigo-500 font-sans mt-1">Total seluruh akumulasi jam</div>
          </div>

          <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Staff Berlembur</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-2xl font-extrabold text-blue-400 font-mono">{monthlyStatsSum.staffCount}</span>
              <span className="text-[10px] text-slate-400 font-mono">orang</span>
            </div>
            <div className="text-[9px] text-blue-500 font-sans mt-1">Dari total {staffList.length} staff database</div>
          </div>

          <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Frekuensi Lembur</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-2xl font-extrabold text-teal-400 font-mono">{monthlyStatsSum.occurrences}</span>
              <span className="text-[10px] text-slate-400 font-mono">kehadiran</span>
            </div>
            <div className="text-[9px] text-teal-555 font-sans mt-1">Log entri lembur bulan ini</div>
          </div>

          <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 flex flex-col justify-between">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Rata-rata Lembur</span>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-2xl font-extrabold text-purple-400 font-mono">{monthlyStatsSum.avgHours}</span>
              <span className="text-[10px] text-slate-400 font-mono">jam/kasus</span>
            </div>
            <div className="text-[9px] text-purple-500 font-sans mt-1">Estimasi rata-rata per entri</div>
          </div>

        </div>
      </div>

      {/* 2. CONTROLS BAR: SEARCH, DROPDOWN MON / YEAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 border border-slate-200 rounded-xl shadow-xs">
        
        <div className="relative flex-1 sm:max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari staff berdasarkan nama, paspor, atau posisi..."
            className="w-full text-xs border border-slate-200 rounded-lg pl-9 pr-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-400"
          />
        </div>

        {/* Manual Select Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200/50">
            <Calendar className="w-3.5 h-3.5 text-slate-550" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent font-sans text-xs font-bold border-none text-slate-700 py-1 focus:outline-none cursor-pointer"
            >
              {monthsList.map(m => (
                <option key={m.value} value={m.value}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200/50">
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className="bg-transparent font-sans text-xs font-bold border-none text-slate-700 py-1 focus:outline-none cursor-pointer"
            >
              {yearsList.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
              <option value="ADD_NEW_YEAR" className="text-blue-500 font-bold font-sans">+ Tambah Tahun...</option>
            </select>
          </div>
        </div>

      </div>

      {/* 3. SCROLLABLE TIMELINE MATRIX */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 leading-none">
            <Info className="w-4 h-4 text-indigo-500" />
            Matrix Lemburan Staff ({monthsList[selectedMonth].name} {selectedYear})
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] text-slate-500 flex items-center gap-1 font-medium bg-white px-2 py-0.5 border border-slate-200 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> 1-2 Jam
            </span>
            <span className="text-[9px] text-slate-500 flex items-center gap-1 font-medium bg-white px-2 py-0.5 border border-slate-200 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> 3-5 Jam
            </span>
            <span className="text-[9px] text-slate-500 flex items-center gap-1 font-medium bg-white px-2 py-0.5 border border-slate-200 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> 6+ Jam
            </span>
            <span className="text-[9px] text-slate-400 font-mono italic">
              *Klik pada sel kotak tanggal lapor untuk mengisi/mengubah jam lembur
            </span>
          </div>
        </div>

        {/* Matrix Table Overflow container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse select-none">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-555 uppercase tracking-wider text-center">
                <th className="py-2.5 px-3 text-center border-r border-slate-200/80 w-12 min-w-[48px] max-w-[48px] shrink-0 sticky left-0 bg-slate-100 z-20" style={{ boxShadow: '1.5px 0 0 rgba(226,232,240,1)' }}>NO</th>
                
                {/* STICKY COLUMN FOR NAME */}
                <th className="py-2.5 px-3.5 border-r border-slate-200/80 w-[240px] min-w-[240px] max-w-[240px] sticky left-[48px] bg-slate-100 z-20 text-center" style={{ boxShadow: '1.5px 0 0 rgba(226,232,240,1)' }}>
                  NAMA STAFF
                </th>
                
                <th className="py-2.5 px-3 border-r border-slate-200/80 min-w-[100px] font-mono text-center">NO PASPOR</th>
                <th className="py-2.5 px-3 border-r border-slate-200/80 min-w-[125px] text-center">JABATAN</th>
                
                {/* DAYS COLUMNS 1 TO 31 */}
                {daysArray.map(dayNum => (
                  <th 
                    key={dayNum} 
                    className="py-2 px-1 text-center border-r border-slate-200/80 min-w-[56px] text-[10px] font-mono font-bold bg-slate-50 text-slate-700 whitespace-nowrap"
                  >
                    Tgl {dayNum}
                  </th>
                ))}
                
                <th className="py-2.5 px-3 text-center bg-slate-900 text-white font-extrabold min-w-[100px] font-sans">
                  TOTAL BULAN INI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={4 + daysInMonth + 1} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-1.5">
                      <Layers className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-xs text-slate-500">Tidak ada data staff atau pencarian kosong.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff, sIdx) => {
                  const totalOtHours = staffMonthlyTotalMap[staff.id] || 0;
                  
                  return (
                    <tr key={staff.id} className="group hover:bg-slate-50/40 transition-colors text-xs text-slate-800">
                      
                      {/* NO */}
                      <td className="py-2 px-3 border-r border-slate-100/80 text-center font-mono text-slate-400 font-bold shrink-0 w-12 min-w-[48px] max-w-[48px] sticky left-0 z-10 bg-white group-hover:bg-slate-50" style={{ boxShadow: '1.5px 0 0 rgba(226,232,240,1)' }}>
                        {sIdx + 1}
                      </td>

                      {/* STICKY COLUMN FOR NAME */}
                      <td className="py-2 px-3.5 border-r border-slate-100/80 w-[240px] min-w-[240px] max-w-[240px] sticky left-[48px] bg-white font-bold text-slate-900 group-hover:bg-slate-50 z-10" style={{ boxShadow: '1.5px 0 0 rgba(226,232,240,1)' }}>
                        <div className="flex items-center gap-2 max-w-[225px]">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                            staff.jenisKelamin === 'Laki-laki' ? 'bg-indigo-50 text-indigo-700' : 'bg-fuchsia-50 text-fuchsia-700'
                          }`}>
                            {staff.namaAllStaff.charAt(0).toUpperCase()}
                          </div>
                          <span className="whitespace-normal break-words leading-tight" title={staff.namaAllStaff}>
                            {staff.namaAllStaff}
                          </span>
                        </div>
                      </td>

                      {/* NO PASPORT */}
                      <td className="py-2 px-3 border-r border-slate-100/80 font-mono text-slate-650 tracking-tight select-all">
                        {staff.nomorPasport || '-'}
                      </td>

                      {/* JABATAN */}
                      <td className="py-2 px-3 border-r border-slate-100/80 text-slate-600 font-medium truncate max-w-[110px] text-center" title={staff.jabatanPosisi}>
                        {staff.jabatanPosisi || '-'}
                      </td>

                      {/* OVERTIMES GRID 1 TO 31 */}
                      {daysArray.map(dayNum => {
                        const cellKey = `${staff.id}-${dayNum}`;
                        const record = overtimeMap[cellKey];
                        const hours = record ? record.jumlahJam : 0;

                        return (
                          <td 
                            key={dayNum}
                            onClick={() => handleCellClick(staff, dayNum)}
                            className={`py-2 px-1 text-center font-mono font-bold border-r border-slate-100/80 ${getCellBgClass(hours)}`}
                            title={record ? `${staff.namaAllStaff}\nTanggal: ${dayNum}\nLembur: ${hours} Jam\nMemo: ${record.keterangan || '-'}` : 'Klik untuk isi lemburan'}
                          >
                            {hours > 0 ? `${hours}h` : '-'}
                          </td>
                        );
                      })}

                      {/* TOTAL ACCUMULATION */}
                      <td className="py-2 px-3 text-center bg-slate-900 text-white font-extrabold whitespace-nowrap">
                        {totalOtHours > 0 ? (
                          <span className="bg-indigo-650 text-white px-2 py-0.5 rounded-full text-[11px] font-extrabold font-mono shadow-xs">
                            {totalOtHours} JAM
                          </span>
                        ) : (
                          <span className="text-slate-500 font-normal text-[10px]">-</span>
                        )}
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* 4. MODAL CELL OVERTIME EDITOR */}
      {editingCell && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
            
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold tracking-tight">Pencatatan Jam Lembur</h3>
              </div>
              <button 
                onClick={() => setEditingCell(null)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleModalSave} className="p-5 space-y-4 font-sans">
              
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Staff Terkait</div>
                <div className="text-xs font-extrabold text-slate-800 font-sans">{editingCell.staff.namaAllStaff}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{editingCell.staff.nomorPasport} • {editingCell.staff.jabatanPosisi}</div>
                
                <div className="text-[10px] text-slate-400 uppercase font-bold mt-2.5">Tanggal Lapor</div>
                <div className="text-xs font-bold text-slate-800 font-mono flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  {new Date(editingCell.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>

              {/* Overtime Hours */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Lama Jam Lemburu (Jam)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    required
                    value={inputHours}
                    onChange={(e) => setInputHours(e.target.value)}
                    className="w-full text-xs font-mono font-bold border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-505 bg-white text-slate-900"
                    placeholder="Contoh: 2 atau 1.5"
                  />
                  <span className="text-xs text-slate-500 font-bold font-mono">JAM</span>
                </div>
              </div>

              {/* Brief memo */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Memo / Keterangan Lembur</label>
                <input
                  type="text"
                  value={inputNote}
                  onChange={(e) => setInputNote(e.target.value)}
                  placeholder="Bantu backup server, lembur closing depo harian..."
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-505 bg-white text-slate-900 placeholder-slate-400"
                />
              </div>

              {/* Password Authorization */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block font-sans">Password Otorisasi (Wajib)</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                  }}
                  placeholder="Masukkan password admin..."
                  className={`w-full text-xs border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 bg-white text-slate-900 placeholder-slate-400 ${
                    passwordError ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 focus:ring-indigo-500'
                  }`}
                />
                {passwordError && (
                  <span className="text-[10px] text-rose-500 font-bold block mt-0.5">{passwordError}</span>
                )}
              </div>

              {/* Modal footer controls */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {editingCell.currentRecord ? (
                  <button
                    type="button"
                    onClick={handleClearOvertimeCell}
                    className="px-3.5 py-1.8 bg-rose-50 text-rose-700 hover:bg-rose-100 text-[11px] font-bold rounded-lg border border-rose-200 transition-all cursor-pointer flex items-center gap-1 select-none"
                    title="Nolkan / Hapus lemburan di hari ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Hapus
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCell(null)}
                    className="px-3.5 py-1.8 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.8 bg-indigo-600 hover:bg-indigo-750 text-white text-xs font-bold rounded-lg leading-normal transition-colors cursor-pointer shadow-xs"
                  >
                    Simpan Jam
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
