import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  PlusCircle, 
  Calendar, 
  Download, 
  RotateCcw, 
  X, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Staff, LeaveSubmission, calculateDurationDays, sortByJabatan } from '../types';

const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case 'CUTI INDONESIA':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'CUTI LOKAL':
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'CUTI KERJA':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'CUTI KERJA & LOKAL':
      return 'bg-purple-50 text-purple-700 border border-purple-200';
    case 'RESIGN':
      return 'bg-rose-100 text-rose-700 border border-rose-300 font-extrabold';
    case 'Disetujui':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'Ditolak':
      return 'bg-rose-50 text-rose-700 border border-rose-200';
    default:
      return 'bg-slate-100 text-slate-600 border border-slate-200';
  }
};

const getApprovalBadgeStyle = (status: string) => {
  switch (status) {
    case 'APPROVED':
    case 'APPROVED (DISETUJUI)':
    case 'Approved':
    case 'Disetujui':
      return 'bg-emerald-100 text-emerald-850 border border-emerald-300 font-extrabold';
    case 'REJECTED':
    case 'REJECTED (DITOLAK)':
    case 'Rejected':
    case 'Ditolak':
      return 'bg-rose-100 text-rose-850 border border-rose-300 font-extrabold';
    case 'PENDING':
    case 'PENDING (MENUNGGU)':
    case 'Pending':
    case 'Menunggu':
    default:
      return 'bg-amber-100 text-amber-850 border border-amber-300 font-extrabold';
  }
};

const getLeaveRowBgClass = (approval: string) => {
  const norm = (approval || 'PENDING').toUpperCase();
  if (norm === 'APPROVED' || norm === 'DISETUJUI') {
    return 'bg-emerald-50/20 hover:bg-emerald-100/35 transition-colors duration-150';
  }
  if (norm === 'REJECTED' || norm === 'DITOLAK') {
    return 'bg-rose-50/15 hover:bg-rose-100/25 transition-colors duration-150';
  }
  return 'bg-amber-50/20 hover:bg-amber-100/35 transition-colors duration-150';
};

const getLeaveStickyBgClass = (approval: string) => {
  const norm = (approval || 'PENDING').toUpperCase();
  if (norm === 'APPROVED' || norm === 'DISETUJUI') {
    return 'bg-emerald-50 group-hover/row:bg-emerald-100';
  }
  if (norm === 'REJECTED' || norm === 'DITOLAK') {
    return 'bg-rose-50 group-hover/row:bg-rose-100';
  }
  return 'bg-amber-50 group-hover/row:bg-amber-100';
};

const monthsList = [
  { value: 'Semua', name: 'SEMUA BULAN' },
  { value: '01', name: 'JANUARI' },
  { value: '02', name: 'FEBRUARI' },
  { value: '03', name: 'MARET' },
  { value: '04', name: 'APRIL' },
  { value: '05', name: 'MEI' },
  { value: '06', name: 'JUNI' },
  { value: '07', name: 'JULI' },
  { value: '08', name: 'AGUSTUS' },
  { value: '09', name: 'SEPTEMBER' },
  { value: '10', name: 'OKTOBER' },
  { value: '11', name: 'NOVEMBER' },
  { value: '12', name: 'DESEMBER' }
];

const getBulanTahunLabel = (bulan?: string, tahun?: string, tanggal?: string) => {
  if (bulan && tahun) {
    const monthObj = monthsList.find(m => m.value === bulan);
    const monthName = monthObj ? monthObj.name : bulan;
    return `${monthName} ${tahun}`;
  }
  if (!tanggal) return '-';
  const parts = tanggal.split('-');
  if (parts.length < 2) return '-';
  const year = parts[0];
  const monthCode = parts[1];
  const monthObj = monthsList.find(m => m.value === monthCode);
  return monthObj ? `${monthObj.name} ${year}` : `${monthCode}-${year}`;
};

interface CutiSubmissionViewProps {
  key?: any;
  staffList: Staff[];
  currentTime: Date;
  leaveList: LeaveSubmission[];
  setLeaveList: React.Dispatch<React.SetStateAction<LeaveSubmission[]>>;
}

export default function CutiSubmissionView({ staffList, currentTime, leaveList, setLeaveList }: CutiSubmissionViewProps) {
  // Form & Modals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState<LeaveSubmission | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState<string>('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterApproval, setFilterApproval] = useState('Semua');

  // Month & Year Filter States
  const [customYears, setCustomYears] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('custom_years_leaves');
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
    customYears.forEach(y => list.add(y));
    leaveList.forEach(l => {
      if (l.tanggalPengajuan) {
        const d = new Date(l.tanggalPengajuan);
        if (!isNaN(d.getFullYear())) {
          list.add(d.getFullYear());
        }
      }
    });
    return Array.from(list).sort((a, b) => a - b);
  }, [leaveList, customYears]);

  const [selectedYear, setSelectedYear] = useState<string>('Semua');
  const [selectedMonth, setSelectedMonth] = useState<string>('Semua');

  const handleYearChange = (val: string) => {
    if (val === "ADD_NEW_YEAR") {
      const input = prompt("Masukkan Tahun Baru yang ingin ditambahkan (misal: 2036):");
      if (input) {
        const yr = parseInt(input, 10);
        if (!isNaN(yr) && yr >= 2000 && yr <= 2100) {
          setCustomYears(prev => {
            const updated = [...new Set([...prev, yr])];
            localStorage.setItem('custom_years_leaves', JSON.stringify(updated));
            return updated;
          });
          setSelectedYear(String(yr));
        } else {
          alert("Masukkan tahun yang valid (2000 - 2100).");
        }
      }
    } else {
      setSelectedYear(val);
    }
  };

  // Form State Fields
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [customNamaStaff, setCustomNamaStaff] = useState('');
  const [nomorPasport, setNomorPasport] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [keteranganPaspor, setKeteranganPaspor] = useState('AMBIL PASPORT');
  const [statusCuti, setStatusCuti] = useState<string>('CUTI INDONESIA');
  const [statusPersetujuan, setStatusPersetujuan] = useState<string>('PENDING');
  const [tanggalPengajuan, setTanggalPengajuan] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [bulanCutiForm, setBulanCutiForm] = useState<string>(() => {
    return new Date().toISOString().split('-')[1] || '01';
  });
  const [tahunCutiForm, setTahunCutiForm] = useState<string>(() => {
    return String(new Date().getFullYear());
  });

  // Leave Sub-ranges
  const [indoDari, setIndoDari] = useState('');
  const [indoSampai, setIndoSampai] = useState('');
  const [lokalDari, setLokalDari] = useState('');
  const [lokalSampai, setLokalSampai] = useState('');
  const [kerjaDari, setKerjaDari] = useState('');
  const [kerjaSampai, setKerjaSampai] = useState('');

  // Auto-populate form when selecting a staff member
  const handleStaffSelectChange = (staffId: string) => {
    setSelectedStaffId(staffId);
    if (staffId === 'custom') {
      setCustomNamaStaff('');
      setNomorPasport('');
      setJabatan('');
      setKeteranganPaspor('AMBIL PASPORT');
    } else {
      const staffMember = staffList.find(s => s.id === staffId);
      if (staffMember) {
        setCustomNamaStaff(staffMember.namaAllStaff);
        setNomorPasport(staffMember.nomorPasport || '');
        setJabatan(staffMember.jabatanPosisi || '');
        setKeteranganPaspor('AMBIL PASPORT');
      }
    }
  };

  // Open creation modal
  const handleOpenAddModal = () => {
    setEditingLeave(null);
    setSelectedStaffId(staffList.length > 0 ? staffList[0].id : 'custom');
    if (staffList.length > 0) {
      const staffMember = staffList[0];
      setCustomNamaStaff(staffMember.namaAllStaff);
      setNomorPasport(staffMember.nomorPasport || '');
      setJabatan(staffMember.jabatanPosisi || '');
      setKeteranganPaspor('AMBIL PASPORT');
    } else {
      setCustomNamaStaff('');
      setNomorPasport('');
      setJabatan('');
      setKeteranganPaspor('AMBIL PASPORT');
    }
    setStatusCuti('CUTI INDONESIA');
    setStatusPersetujuan('PENDING');
    const today = new Date();
    setTanggalPengajuan(today.toISOString().split('T')[0]);
    setBulanCutiForm(today.toISOString().split('-')[1] || '01');
    setTahunCutiForm(String(today.getFullYear()));
    
    setIndoDari('');
    setIndoSampai('');
    setLokalDari('');
    setLokalSampai('');
    setKerjaDari('');
    setKerjaSampai('');
    
    setIsModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEditModal = (leave: LeaveSubmission) => {
    setEditingLeave(leave);
    // Find matching staff member if possible
    const match = staffList.find(s => s.namaAllStaff === leave.namaStaff);
    setSelectedStaffId(match ? match.id : 'custom');
    
    setCustomNamaStaff(leave.namaStaff);
    setNomorPasport(leave.nomorPasport);
    setJabatan(leave.jabatan);
    setKeteranganPaspor(leave.keteranganPaspor);
    setStatusCuti(leave.statusCuti);
    setStatusPersetujuan(leave.statusPersetujuan || 'PENDING');
    setTanggalPengajuan(leave.tanggalPengajuan);

    if (leave.bulanCuti) {
      setBulanCutiForm(leave.bulanCuti);
    } else if (leave.tanggalPengajuan) {
      setBulanCutiForm(leave.tanggalPengajuan.split('-')[1] || '01');
    } else {
      setBulanCutiForm('01');
    }

    if (leave.tahunCuti) {
      setTahunCutiForm(leave.tahunCuti);
    } else if (leave.tanggalPengajuan) {
      setTahunCutiForm(leave.tanggalPengajuan.split('-')[0] || String(new Date().getFullYear()));
    } else {
      setTahunCutiForm(String(new Date().getFullYear()));
    }

    setIndoDari(leave.cutiIndonesia.dari || '');
    setIndoSampai(leave.cutiIndonesia.sampai || '');
    setLokalDari(leave.cutiLokal.dari || '');
    setLokalSampai(leave.cutiLokal.sampai || '');
    setKerjaDari(leave.cutiKerja.dari || '');
    setKerjaSampai(leave.cutiKerja.sampai || '');

    setIsModalOpen(true);
  };

  // Delete submission
  const handleDeleteLeave = (id: string, name: string) => {
    setDeleteConfirmId(id);
    setDeleteConfirmName(name);
  };

  // Save changes
  const handleSaveLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNamaStaff.trim()) {
      alert('Nama Staff wajib dimasukkan!');
      return;
    }

    const cutiIndonesia = {
      dari: indoDari,
      sampai: indoSampai,
      durasi: calculateDurationDays(indoDari, indoSampai)
    };

    const cutiLokal = {
      dari: lokalDari,
      sampai: lokalSampai,
      durasi: calculateDurationDays(lokalDari, lokalSampai)
    };

    const cutiKerja = {
      dari: kerjaDari,
      sampai: kerjaSampai,
      durasi: calculateDurationDays(kerjaDari, kerjaSampai)
    };

    if (editingLeave) {
      // update
      setLeaveList(prev => prev.map(l => l.id === editingLeave.id ? {
        ...l,
        namaStaff: customNamaStaff,
        nomorPasport,
        jabatan,
        keteranganPaspor,
        statusCuti,
        statusPersetujuan,
        tanggalPengajuan,
        bulanCuti: bulanCutiForm,
        tahunCuti: tahunCutiForm,
        cutiIndonesia,
        cutiLokal,
        cutiKerja
      } : l));
    } else {
      // create new
      const newLeave: LeaveSubmission = {
        id: `lv-${Date.now()}`,
        namaStaff: customNamaStaff,
        nomorPasport,
        jabatan,
        keteranganPaspor,
        statusCuti,
        statusPersetujuan,
        tanggalPengajuan,
        bulanCuti: bulanCutiForm,
        tahunCuti: tahunCutiForm,
        cutiIndonesia,
        cutiLokal,
        cutiKerja
      };
      setLeaveList(prev => [newLeave, ...prev]);
    }

    setIsModalOpen(false);
  };

  // Import / Export tools
  const triggerResetDefault = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus/mengosongkan semua riwayat pengajuan cuti?')) {
      setLeaveList([]);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'No',
      'Nama Staff',
      'Nomor Pasport',
      'Jabatan',
      'Keterangan Paspor',
      'Status Cuti',
      'Status Persetujuan',
      'Tanggal Pengajuan',
      'Cuti Indonesia Dari',
      'Cuti Indonesia Sampai',
      'Cuti Indonesia Durasi',
      'Cuti Lokal Dari',
      'Cuti Lokal Sampai',
      'Cuti Lokal Durasi',
      'Cuti Kerja Dari',
      'Cuti Kerja Sampai',
      'Cuti Kerja Durasi'
    ];

    const rows = leaveList.map((l, index) => [
      index + 1,
      `"${l.namaStaff.replace(/"/g, '""')}"`,
      `"${l.nomorPasport}"`,
      `"${l.jabatan.replace(/"/g, '""')}"`,
      `"${l.keteranganPaspor.replace(/"/g, '""')}"`,
      `"${l.statusCuti}"`,
      `"${l.statusPersetujuan || 'PENDING'}"`,
      `"${l.tanggalPengajuan}"`,
      `"${l.cutiIndonesia.dari}"`,
      `"${l.cutiIndonesia.sampai}"`,
      l.cutiIndonesia.durasi,
      `"${l.cutiLokal.dari}"`,
      `"${l.cutiLokal.sampai}"`,
      l.cutiLokal.durasi,
      `"${l.cutiKerja.dari}"`,
      `"${l.cutiKerja.sampai}"`,
      l.cutiKerja.durasi
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_pengajuan_cuti_${currentTime.toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter application list
  const filteredLeaves = useMemo(() => {
    const sorted = leaveList.filter(l => {
      const matchSearch = !searchQuery.trim() || 
        l.namaStaff.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.nomorPasport.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.jabatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.keteranganPaspor.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchStatus = filterStatus === 'Semua' || l.statusCuti === filterStatus;
      
      // Separate status persetujuan filtering (supports mapping for older "Disetujui"/"Ditolak"/"Menunggu" values if any, but prefers precise uppercase strings)
      const currentApproval = l.statusPersetujuan || 'PENDING';
      let matchApproval = filterApproval === 'Semua';
      if (!matchApproval) {
        if (filterApproval === 'PENDING') {
          matchApproval = currentApproval === 'PENDING' || currentApproval === 'Menunggu';
        } else if (filterApproval === 'APPROVED') {
          matchApproval = currentApproval === 'APPROVED' || currentApproval === 'Disetujui';
        } else if (filterApproval === 'REJECTED') {
          matchApproval = currentApproval === 'REJECTED' || currentApproval === 'Ditolak';
        }
      }

      // Year Filter
      let matchYear = true;
      if (selectedYear !== 'Semua') {
        const leaveYear = l.tanggalPengajuan ? l.tanggalPengajuan.split('-')[0] : '';
        matchYear = leaveYear === selectedYear;
      }

      // Month Filter
      let matchMonth = true;
      if (selectedMonth !== 'Semua') {
        const leaveMonth = l.tanggalPengajuan ? l.tanggalPengajuan.split('-')[1] : '';
        const targetMonthCode = selectedMonth.padStart(2, '0');
        matchMonth = leaveMonth === targetMonthCode;
      }
      
      return matchSearch && matchStatus && matchApproval && matchYear && matchMonth;
    });
    return [...sorted].sort(sortByJabatan);
  }, [leaveList, searchQuery, filterStatus, filterApproval, selectedYear, selectedMonth]);

  return (
    <div className="space-y-6">
      
      {/* Visual Tab Header Description */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-display font-semibold text-slate-900 flex items-center gap-2 flex-wrap">
            PENGAJUAN CUTI WDBOS
            <span className="text-[10px] bg-blue-50 text-blue-700 font-sans font-extrabold px-3 py-1 rounded-full border border-blue-100 flex items-center gap-1 shrink-0">
              <Calendar className="w-3.5 h-3.5" />
              {selectedMonth === 'Semua' ? 'SEMUA BULAN' : monthsList.find(m => m.value === selectedMonth)?.name} - {selectedYear === 'Semua' ? 'SEMUA TAHUN' : selectedYear}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Sistem permohonan dinas, liburan, dan cuti kerja eksekutif untuk staff WDBOS. Menyediakan pembagian durasi otomatis untuk kategori Cuti Indonesia, Cuti Lokal, dan Cuti Kerja.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-xs transition-all shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Tambah Pengajuan Cuti (WDBOS)
          </button>
          
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded-lg font-medium text-xs transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Ekspor Rekap Cuti
          </button>

          <button
            onClick={triggerResetDefault}
            className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 px-2.5 py-2 rounded-lg font-medium text-xs transition-all cursor-pointer"
            title="Hapus semua data cuti"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
            Kosongkan Data
          </button>
        </div>
      </div>

      {/* --- FILTER & SEARCH CONTROL --- */}
      <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama staff, paspor, jabatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-semibold whitespace-nowrap uppercase">Bulan:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border border-slate-200 rounded-lg py-1.5 px-3 bg-white text-xs font-semibold focus:outline-none"
            >
              {monthsList.map(m => (
                <option key={m.value} value={m.value}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-semibold whitespace-nowrap uppercase">Tahun:</label>
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
              className="border border-slate-200 rounded-lg py-1.5 px-3 bg-white text-xs font-semibold focus:outline-none"
            >
              <option value="Semua">SEMUA TAHUN</option>
              {yearsList.map(y => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
              <option value="ADD_NEW_YEAR" className="text-blue-600 font-semibold">+ Tambah Tahun...</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-semibold whitespace-nowrap uppercase">Status Cuti:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-slate-200 rounded-lg py-1.5 px-3 bg-white text-xs font-semibold focus:outline-none"
            >
              <option value="Semua">Semua Cuti</option>
              <option value="CUTI INDONESIA">CUTI INDONESIA</option>
              <option value="CUTI LOKAL">CUTI LOKAL</option>
              <option value="CUTI KERJA">CUTI KERJA</option>
              <option value="CUTI KERJA & LOKAL">CUTI KERJA & LOKAL</option>
              <option value="RESIGN">RESIGN</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400 font-semibold whitespace-nowrap uppercase">Status Persetujuan:</label>
            <select
              value={filterApproval}
              onChange={(e) => setFilterApproval(e.target.value)}
              className="border border-slate-200 rounded-lg py-1.5 px-3 bg-white text-xs font-semibold focus:outline-none"
            >
              <option value="Semua">Semua Persetujuan</option>
              <option value="PENDING">PENDING</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
        </div>
      </section>

      {/* --- COMPLEX GRID MULTI-ROW TABLE VIEW --- */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs bg-white table-fixed min-w-[1300px]">
            
            {/* Header Columns Size */}
            <colgroup>
              <col className="w-[50px]" />
              <col className="w-[240px]" />
              <col className="w-[120px]" />
              <col className="w-[180px]" />
              <col className="w-[180px]" />
              <col className="w-[140px]" />
              <col className="w-[120px]" />
              <col className="w-[140px]" />
              <col className="w-[120px]" />
              <col className="w-[100px]" />
              <col className="w-[100px]" />
              <col className="w-[70px]" />
              <col className="w-[100px]" />
              <col className="w-[100px]" />
              <col className="w-[70px]" />
              <col className="w-[100px]" />
              <col className="w-[100px]" />
              <col className="w-[70px]" />
              <col className="w-[100px]" />
            </colgroup>

            {/* Header Row structure with Colspan & Rowspan */}
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase text-center vertical-middle">
                <th rowSpan={2} className="py-3 px-2 border-r border-slate-200 sticky left-0 bg-slate-50 z-10 text-center w-[50px] min-w-[50px] max-w-[50px]">NO</th>
                <th rowSpan={2} className="py-3 px-3 border-r border-slate-200 text-center sticky left-[50px] bg-slate-50 z-10 w-[240px] min-w-[240px] max-w-[240px]">NAMA STAFF</th>
                <th rowSpan={2} className="py-3 px-2 border-r border-slate-200 text-center">NOMOR PASPORT</th>
                <th rowSpan={2} className="py-3 px-2 border-r border-slate-200 text-center">JABATAN</th>
                <th rowSpan={2} className="py-3 px-2 border-r border-slate-200 text-center">KETERANGAN PASPOR</th>
                <th rowSpan={2} className="py-3 px-2 border-r border-slate-200 text-center">STATUS CUTI</th>
                <th rowSpan={2} className="py-3 px-2 border-r border-slate-200 text-center">BULAN TAHUN</th>
                <th rowSpan={2} className="py-3 px-2 border-r border-slate-200 text-center">STATUS PERSETUJUAN</th>
                <th rowSpan={2} className="py-3 px-2 border-r border-slate-200 text-center">TANGGAL PENGAJUAN</th>
                
                {/* HEAD SECTION 1 */}
                <th colSpan={3} className="py-2 px-1 border-r border-slate-200 bg-emerald-50 text-emerald-800 text-center font-extrabold tracking-widest">
                  CUTI INDONESIA
                </th>
                {/* HEAD SECTION 2 */}
                <th colSpan={3} className="py-2 px-1 border-r border-slate-200 bg-blue-50 text-blue-800 text-center font-extrabold tracking-widest">
                  CUTI LOKAL
                </th>
                {/* HEAD SECTION 3 */}
                <th colSpan={3} className="py-2 px-1 border-r border-slate-200 bg-amber-50 text-amber-800 text-center font-extrabold tracking-widest">
                  CUTI KERJA
                </th>
                
                <th rowSpan={2} className="py-3 px-2 text-center">AKSI</th>
              </tr>
              
              {/* SECONDARY MERGED ROW */}
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[9px] font-bold text-slate-500 uppercase text-center">
                {/* Cuti Indonesia Sub headers */}
                <th className="py-1.5 border-r border-slate-200 bg-emerald-50/30 text-center">DARI</th>
                <th className="py-1.5 border-r border-slate-200 bg-emerald-50/30 text-center">SAMPAI</th>
                <th className="py-1.5 border-r border-slate-200 bg-emerald-50/50 text-emerald-900 text-center">DURASI</th>

                {/* Cuti Lokal Sub headers */}
                <th className="py-1.5 border-r border-slate-200 bg-blue-50/30 text-center">DARI</th>
                <th className="py-1.5 border-r border-slate-200 bg-blue-50/30 text-center">SAMPAI</th>
                <th className="py-1.5 border-r border-slate-200 bg-blue-50/50 text-blue-900 text-center">DURASI</th>

                {/* Cuti Kerja Sub headers */}
                <th className="py-1.5 border-r border-slate-200 bg-amber-50/30 text-center">DARI</th>
                <th className="py-1.5 border-r border-slate-200 bg-amber-50/30 text-center">SAMPAI</th>
                <th className="py-1.5 border-r border-slate-200 bg-amber-50/50 text-amber-900 text-center">DURASI</th>
              </tr>
            </thead>

            {/* Table roster rows body */}
            <tbody className="divide-y divide-slate-100 divide-x-0">
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={19} className="py-12 text-center text-slate-400 bg-slate-50/10">
                    <div className="flex flex-col items-center justify-center space-y-2">
                       <AlertCircle className="w-8 h-8 text-slate-300" />
                      <span className="font-semibold text-slate-500">Belum ada pengajuan cuti terdaftar</span>
                      <p className="text-xs text-slate-400">Silakan registrasi atau perbarui filter pencarian Anda.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((leave, idx) => (
                  <tr key={leave.id} className={`group/row transition-all ${getLeaveRowBgClass(leave.statusPersetujuan || 'PENDING')}`}>
                    
                    {/* 1. NO */}
                    <td className={`py-3 px-2 border-r border-slate-100 text-center font-mono font-medium text-slate-400 sticky left-0 z-10 w-[50px] min-w-[50px] max-w-[50px] transition-colors ${getLeaveStickyBgClass(leave.statusPersetujuan || 'PENDING')}`}>
                      {idx + 1}
                    </td>

                    {/* 2. NAMA STAFF */}
                    <td className={`py-3 px-3 border-r border-slate-100 font-bold text-slate-900 sticky left-[50px] z-10 w-[240px] min-w-[240px] max-w-[240px] transition-colors ${getLeaveStickyBgClass(leave.statusPersetujuan || 'PENDING')}`} title={leave.namaStaff}>
                      <span className="whitespace-normal break-words leading-tight block">
                        {leave.namaStaff}
                      </span>
                    </td>

                    {/* 3. NOMOR PASPORT */}
                    <td className="py-3 px-2 border-r border-slate-100 font-mono text-slate-700 whitespace-nowrap" title={leave.nomorPasport}>
                      {leave.nomorPasport || '-'}
                    </td>

                    {/* 4. JABATAN */}
                    <td className="py-3 px-2 border-r border-slate-100 text-slate-600 whitespace-nowrap" title={leave.jabatan}>
                      {leave.jabatan || '-'}
                    </td>

                    {/* 5. KETERANGAN PASPOR */}
                    <td className="py-3 px-2 border-r border-slate-100 text-slate-500 whitespace-nowrap" title={leave.keteranganPaspor}>
                      {leave.keteranganPaspor || '-'}
                    </td>

                    {/* 6. STATUS CUTI */}
                    <td className="py-3 px-2 border-r border-slate-100 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold ${getStatusBadgeStyle(leave.statusCuti)}`}>
                        <Calendar className="w-2.5 h-2.5" />
                        {leave.statusCuti}
                      </span>
                    </td>

                    {/* BULAN TAHUN */}
                    <td className="py-3 px-2 border-r border-slate-100 text-center font-semibold text-slate-700 whitespace-nowrap uppercase">
                      {getBulanTahunLabel(leave.bulanCuti, leave.tahunCuti, leave.tanggalPengajuan)}
                    </td>

                    {/* 6b. STATUS PERSETUJUAN */}
                    <td className="py-3 px-2 border-r border-slate-100 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold ${getApprovalBadgeStyle(leave.statusPersetujuan || 'PENDING')}`}>
                        {(leave.statusPersetujuan === 'APPROVED' || leave.statusPersetujuan === 'Disetujui') && <CheckCircle className="w-2.5 h-2.5" />}
                        {(leave.statusPersetujuan === 'REJECTED' || leave.statusPersetujuan === 'Ditolak') && <XCircle className="w-2.5 h-2.5" />}
                        {(!leave.statusPersetujuan || leave.statusPersetujuan === 'PENDING' || leave.statusPersetujuan === 'Menunggu') && <AlertCircle className="w-2.5 h-2.5" />}
                        {leave.statusPersetujuan || 'PENDING'}
                      </span>
                    </td>

                    {/* 7. TANGGAL PENGAJUAN */}
                    <td className="py-3 px-2 border-r border-slate-100 text-center font-mono text-slate-600 whitespace-nowrap">
                      {leave.tanggalPengajuan || '-'}
                    </td>

                    {/* CUTI INDONESIA */}
                    <td className="py-3 px-2 border-r border-slate-100 bg-emerald-50/10 text-center font-mono text-slate-700 whitespace-nowrap">
                      {leave.cutiIndonesia.dari || '-'}
                    </td>
                    <td className="py-3 px-2 border-r border-slate-100 bg-emerald-50/10 text-center font-mono text-slate-700 whitespace-nowrap">
                      {leave.cutiIndonesia.sampai || '-'}
                    </td>
                    <td className="py-3 px-2 border-r border-slate-100 bg-emerald-50/20 text-center font-mono font-bold text-emerald-800 whitespace-nowrap">
                      {leave.cutiIndonesia.durasi > 0 ? `${leave.cutiIndonesia.durasi} Hari` : '-'}
                    </td>

                    {/* CUTI LOKAL */}
                    <td className="py-3 px-2 border-r border-slate-100 bg-blue-50/10 text-center font-mono text-slate-700 whitespace-nowrap">
                      {leave.cutiLokal.dari || '-'}
                    </td>
                    <td className="py-3 px-2 border-r border-slate-100 bg-blue-50/10 text-center font-mono text-slate-700 whitespace-nowrap">
                      {leave.cutiLokal.sampai || '-'}
                    </td>
                    <td className="py-3 px-2 border-r border-slate-100 bg-blue-50/20 text-center font-mono font-bold text-blue-850 whitespace-nowrap">
                      {leave.cutiLokal.durasi > 0 ? `${leave.cutiLokal.durasi} Hari` : '-'}
                    </td>

                    {/* CUTI KERJA */}
                    <td className="py-3 px-2 border-r border-slate-100 bg-amber-50/10 text-center font-mono text-slate-700 whitespace-nowrap">
                      {leave.cutiKerja.dari || '-'}
                    </td>
                    <td className="py-3 px-2 border-r border-slate-100 bg-amber-50/10 text-center font-mono text-slate-700 whitespace-nowrap">
                      {leave.cutiKerja.sampai || '-'}
                    </td>
                    <td className="py-3 px-2 border-r border-slate-100 bg-amber-50/20 text-center font-mono font-bold text-amber-800 whitespace-nowrap">
                      {leave.cutiKerja.durasi > 0 ? `${leave.cutiKerja.durasi} Hari` : '-'}
                    </td>

                    {/* ACTIONS */}
                    <td className={`py-3 px-2 text-center sticky right-0 z-10 transition-colors ${getLeaveStickyBgClass(leave.statusPersetujuan || 'PENDING')}`}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(leave)}
                          className="p-1 text-blue-600 hover:bg-blue-100/70 rounded transition-colors"
                          title="Ubah Rincian Cuti"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteLeave(leave.id, leave.namaStaff)}
                          className="p-1 text-rose-600 hover:bg-rose-100/70 rounded transition-colors"
                          title="Hapus Pengajuan Cuti"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>

          </table>
        </div>
      </div>

      {/* --- ADD / EDIT POPUP MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-tight">
                  {editingLeave ? `EDIT PENGAJUAN CUTI WDBOS` : 'PENGAJUAN CUTI BARU (WDBOS)'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scroll form */}
            <form onSubmit={handleSaveLeave} className="flex-1 overflow-y-auto p-6 space-y-5">
              
              {/* STAFF LINK & DETAILS */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h4 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-3">1. Informasi Personal Staff</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Select Member */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Hubungkan Ke Staff Database</label>
                    <select
                      value={selectedStaffId}
                      onChange={(e) => handleStaffSelectChange(e.target.value)}
                      className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none"
                    >
                      <option value="custom">-- Tulis Manual / Staff Luar --</option>
                      {[...staffList].sort(sortByJabatan).map(s => (
                        <option key={s.id} value={s.id}>{s.namaAllStaff} ({s.jabatanPosisi})</option>
                      ))}
                    </select>
                  </div>

                  {/* Nama Staff */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Nama Staff <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={customNamaStaff}
                      onChange={(e) => setCustomNamaStaff(e.target.value)}
                      placeholder="Masukkan nama staf"
                      className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none"
                      disabled={selectedStaffId !== 'custom'}
                    />
                  </div>

                  {/* Paspor & Jabatan */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Nomor Pasport</label>
                    <input
                      type="text"
                      value={nomorPasport}
                      onChange={(e) => setNomorPasport(e.target.value)}
                      placeholder="Misl: P-XXXXXXXX"
                      className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs font-mono bg-white focus:outline-none"
                      disabled={selectedStaffId !== 'custom'}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Jabatan Staff</label>
                    <input
                      type="text"
                      value={jabatan}
                      onChange={(e) => setJabatan(e.target.value)}
                      placeholder="Misl: Customer Service Officer"
                      className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none"
                      disabled={selectedStaffId !== 'custom'}
                    />
                  </div>

                  {/* Keterangan Paspor */}
                  <div className="col-span-1 md:col-span-2 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Keterangan Paspor <span className="text-rose-500">*</span></label>
                    <select
                      value={keteranganPaspor}
                      onChange={(e) => setKeteranganPaspor(e.target.value)}
                      className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none font-semibold text-slate-800"
                    >
                      <option value="AMBIL PASPORT">AMBIL PASPORT</option>
                      <option value="TIDAK AMBIL PASPORT">TIDAK AMBIL PASPORT</option>
                      <option value="RESIGN">RESIGN</option>
                    </select>
                  </div>

                </div>
              </div>

              {/* DATE RANGE SPLITTER */}
              <div className="border border-slate-100 p-4 rounded-lg space-y-4">
                <h4 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">2. Tanggal Pengajuan & Kategori Cuti</h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Tanggal Pengajuan */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block">Tanggal Pengajuan</label>
                    <input
                      type="date"
                      required
                      value={tanggalPengajuan}
                      onChange={(e) => setTanggalPengajuan(e.target.value)}
                      className="border border-slate-200 rounded px-2 py-1 text-xs outline-none bg-white font-mono w-full"
                    />
                  </div>

                  {/* Status Cuti */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block">Status Cuti <span className="text-rose-500">*</span></label>
                    <select
                      value={statusCuti}
                      onChange={(e) => setStatusCuti(e.target.value)}
                      className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs bg-white focus:outline-none font-semibold text-slate-800"
                    >
                      <option value="CUTI INDONESIA">CUTI INDONESIA</option>
                      <option value="CUTI LOKAL">CUTI LOKAL</option>
                      <option value="CUTI KERJA">CUTI KERJA</option>
                      <option value="CUTI KERJA & LOKAL">CUTI KERJA & LOKAL</option>
                      <option value="RESIGN">RESIGN</option>
                    </select>
                  </div>

                  {/* Status Persetujuan */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block">Status Persetujuan <span className="text-rose-500">*</span></label>
                    <select
                      value={statusPersetujuan}
                      onChange={(e) => setStatusPersetujuan(e.target.value)}
                      className="w-full border border-slate-200 rounded px-2 py-1.5 text-xs bg-white focus:outline-none font-semibold text-slate-800"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-dashed border-slate-100">
                  {/* Bulan Cuti */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block">Bulan Cuti <span className="text-rose-500">*</span></label>
                    <select
                      value={bulanCutiForm}
                      onChange={(e) => setBulanCutiForm(e.target.value)}
                      className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none font-semibold text-slate-800"
                    >
                      {monthsList.filter(m => m.value !== 'Semua').map(m => (
                        <option key={m.value} value={m.value}>{m.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tahun Cuti */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500 block">Tahun Cuti <span className="text-rose-500">*</span></label>
                    <select
                      value={tahunCutiForm}
                      onChange={(e) => setTahunCutiForm(e.target.value)}
                      className="w-full border border-slate-200 rounded px-2.5 py-1.5 text-xs bg-white focus:outline-none font-semibold text-slate-800"
                    >
                      {Array.from({ length: 15 }, (_, i) => 2024 + i).map(y => (
                        <option key={y} value={String(y)}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="border-t border-slate-100 my-4"></div>

                {/* Categories: Indonesia, Lokal, Kerja */}
                <div className="space-y-4">
                  
                  {/* Cuti Indonesia */}
                  <div className="p-3 bg-emerald-50/40 rounded-lg border border-emerald-100">
                    <div className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider mb-2">CUTI INDONESIA</div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase text-slate-400 font-bold">Dari</span>
                        <input
                          type="date"
                          value={indoDari}
                          onChange={(e) => setIndoDari(e.target.value)}
                          className="w-full border border-slate-200 rounded px-1.5 py-0.5 text-xs font-mono bg-white outline-none"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase text-slate-400 font-bold">Sampai</span>
                        <input
                          type="date"
                          value={indoSampai}
                          onChange={(e) => setIndoSampai(e.target.value)}
                          className="w-full border border-slate-200 rounded px-1.5 py-0.5 text-xs font-mono bg-white outline-none"
                        />
                      </div>
                      <div className="space-y-0.5 text-center flex flex-col justify-end">
                        <span className="text-[9px] uppercase text-slate-400 font-bold">Calculated</span>
                        <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100/50 py-1 rounded">
                          {calculateDurationDays(indoDari, indoSampai)} Hari
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cuti Lokal */}
                  <div className="p-3 bg-blue-50/40 rounded-lg border border-blue-100">
                    <div className="text-[10px] font-extrabold text-blue-800 uppercase tracking-wider mb-2">CUTI LOKAL</div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase text-slate-400 font-bold">Dari</span>
                        <input
                          type="date"
                          value={lokalDari}
                          onChange={(e) => setLokalDari(e.target.value)}
                          className="w-full border border-slate-200 rounded px-1.5 py-0.5 text-xs font-mono bg-white outline-none"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase text-slate-400 font-bold">Sampai</span>
                        <input
                          type="date"
                          value={lokalSampai}
                          onChange={(e) => setLokalSampai(e.target.value)}
                          className="w-full border border-slate-200 rounded px-1.5 py-0.5 text-xs font-mono bg-white outline-none"
                        />
                      </div>
                      <div className="space-y-0.5 text-center flex flex-col justify-end">
                        <span className="text-[9px] uppercase text-slate-400 font-bold">Calculated</span>
                        <span className="text-xs font-mono font-bold text-blue-800 bg-blue-100/50 py-1 rounded">
                          {calculateDurationDays(lokalDari, lokalSampai)} Hari
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cuti Kerja */}
                  <div className="p-3 bg-amber-50/40 rounded-lg border border-amber-100">
                    <div className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider mb-2">CUTI KERJA</div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase text-slate-400 font-bold">Dari</span>
                        <input
                          type="date"
                          value={kerjaDari}
                          onChange={(e) => setKerjaDari(e.target.value)}
                          className="w-full border border-slate-200 rounded px-1.5 py-0.5 text-xs font-mono bg-white outline-none"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase text-slate-400 font-bold">Sampai</span>
                        <input
                          type="date"
                          value={kerjaSampai}
                          onChange={(e) => setKerjaSampai(e.target.value)}
                          className="w-full border border-slate-200 rounded px-1.5 py-0.5 text-xs font-mono bg-white outline-none"
                        />
                      </div>
                      <div className="space-y-0.5 text-center flex flex-col justify-end">
                        <span className="text-[9px] uppercase text-slate-400 font-bold">Calculated</span>
                        <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100/50 py-1 rounded">
                          {calculateDurationDays(kerjaDari, kerjaSampai)} Hari
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Submit panel */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 bg-white font-semibold">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded text-xs font-medium shadow-xs cursor-pointer"
                >
                  Simpan Pengajuan Cuti
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* --- CONFIRM DELETE MODAL --- */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-50 rounded-full border border-rose-100">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider">Konfirmasi Hapus</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Apakah Anda yakin ingin menghapus pengajuan cuti staff <strong className="text-slate-900">"{deleteConfirmName}"</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmId(null);
                  setDeleteConfirmName('');
                }}
                className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs rounded-lg font-bold cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setLeaveList(prev => prev.filter(l => l.id !== deleteConfirmId));
                  setDeleteConfirmId(null);
                  setDeleteConfirmName('');
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs rounded-lg font-bold shadow-xs cursor-pointer transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
