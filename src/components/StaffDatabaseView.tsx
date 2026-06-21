import React, { useState, useMemo, useRef } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  Eye, 
  EyeOff, 
  Download, 
  Upload, 
  RotateCcw, 
  X, 
  Calendar, 
  Home, 
  MapPin, 
  Mail, 
  ShieldAlert, 
  BookOpen, 
  Cake, 
  Clock, 
  Activity, 
  ChevronDown,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { Staff, calculateAge, getBirthdayInfo, calculateTenure, sortByJabatan } from '../types';

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

const getStatusBgClass = (status: string) => {
  const normStatus = (status || '').toUpperCase().trim();
  if (normStatus === 'KERJA' || normStatus === 'AKTIF') {
    return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
  }
  if (normStatus === 'DIRUMAHKAN' || normStatus === 'RESIGN' || normStatus === 'DIPULANGKAN') {
    return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
  }
  if (normStatus === 'CUTI' || normStatus === 'SEDANG CUTI INDO') {
    return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
  }
  return 'bg-white text-slate-700 border-slate-300';
};


interface StaffDatabaseViewProps {
  staffList: Staff[];
  setStaffList: React.Dispatch<React.SetStateAction<Staff[]>>;
  currentTime: Date;
  onOpenAddModal: () => void;
  onOpenEditModal: (staff: Staff) => void;
  onOpenViewModal: (staff: Staff) => void;
}

export default function StaffDatabaseView({
  staffList,
  setStaffList,
  currentTime,
  onOpenAddModal,
  onOpenEditModal,
  onOpenViewModal
}: StaffDatabaseViewProps) {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGender, setFilterGender] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterMess, setFilterMess] = useState('Semua');
  const [filterJabatan, setFilterJabatan] = useState('Semua');
  const [filterSeason, setFilterSeason] = useState('Semua');

  // Hidden/Visible Passport list
  const [revealedPassports, setRevealedPassports] = useState<Record<string, boolean>>({});

  // Confirmation state for deleting staff (bypassing sandboxed window.confirm iframe blocks)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState<string>('');

  // --- DERIVED LISTS FOR DROPDOWN FILTERS ---
  const uniquePositions = useMemo(() => {
    const positions = staffList.map(s => s.jabatanPosisi).filter(Boolean);
    return Array.from(new Set(positions)).sort();
  }, [staffList]);

  const uniqueMesses = useMemo(() => {
    const messes = staffList.map(s => s.messTinggal).filter(Boolean);
    return Array.from(new Set(messes)).sort();
  }, [staffList]);

  const uniqueSeasons = useMemo(() => {
    const seasons = staffList.map(s => s.seasonRumahIbadah).filter(Boolean);
    return Array.from(new Set(seasons)).sort();
  }, [staffList]);

  // --- FILTER & SEARCH IMPLEMENTATION ---
  const filteredStaff = useMemo(() => {
    const filtered = staffList.filter(staff => {
      const query = searchQuery.toLowerCase().trim();
      const matchSearch = !query || 
        staff.namaAllStaff.toLowerCase().includes(query) ||
        staff.nomorPasport.toLowerCase().includes(query) ||
        staff.asalKota.toLowerCase().includes(query) ||
        staff.jabatanPosisi.toLowerCase().includes(query) ||
        staff.idLine.toLowerCase().includes(query) ||
        staff.emailDrive.toLowerCase().includes(query) ||
        staff.emailBk.toLowerCase().includes(query);

      const matchGender = filterGender === 'Semua' || staff.jenisKelamin === filterGender;
      const matchStatus = filterStatus === 'Semua' || staff.status === filterStatus;
      const matchMess = filterMess === 'Semua' || staff.messTinggal === filterMess;
      const matchJabatan = filterJabatan === 'Semua' || staff.jabatanPosisi === filterJabatan;
      const matchSeason = filterSeason === 'Semua' || staff.seasonRumahIbadah === filterSeason;

      return matchSearch && matchGender && matchStatus && matchMess && matchJabatan && matchSeason;
    });
    return [...filtered].sort(sortByJabatan);
  }, [staffList, searchQuery, filterGender, filterStatus, filterMess, filterJabatan, filterSeason]);

  // Toggle mask
  const togglePassportMask = (id: string) => {
    setRevealedPassports(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleDeleteStaff = (id: string, name: string) => {
    setDeleteConfirmId(id);
    setDeleteConfirmName(name);
  };

  return (
    <div className="space-y-6">
      
      {/* --- FILTER & SEARCH SECTION --- */}
      <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="space-y-3">
          
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama, nomor pasport, asal kota, ID Line, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-sans"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2 self-center">
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-mono">
                Menampilkan <strong>{filteredStaff.length}</strong> dari <strong>{staffList.length}</strong> Staff
              </span>
              {(searchQuery || filterGender !== 'Semua' || filterStatus !== 'Semua' || filterMess !== 'Semua' || filterJabatan !== 'Semua' || filterSeason !== 'Semua') && (
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setFilterGender('Semua');
                    setFilterStatus('Semua');
                    setFilterMess('Semua');
                    setFilterJabatan('Semua');
                    setFilterSeason('Semua');
                  }}
                  className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Bersihkan Filter
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100">
            
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Jenis Kelamin</label>
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="w-full border border-slate-200 rounded-md py-1.5 px-2 bg-white text-xs font-medium focus:outline-none"
              >
                <option value="Semua">Semua Jenis Kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Status Staff</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`w-full border rounded-md py-1.5 px-2 text-xs font-bold focus:outline-none transition-all duration-150 ${getStatusBgClass(filterStatus)}`}
              >
                <option value="Semua" className="bg-white text-slate-800 font-normal">Semua Status</option>
                <option value="KERJA" className="bg-emerald-50 text-emerald-800 font-bold">KERJA</option>
                <option value="DIRUMAHKAN" className="bg-rose-50 text-rose-800 font-bold">DIRUMAHKAN</option>
                <option value="CUTI" className="bg-amber-50 text-amber-800 font-bold">CUTI</option>
                <option value="AKTIF" className="bg-emerald-50 text-emerald-800 font-bold">AKTIF</option>
                <option value="SEDANG CUTI INDO" className="bg-amber-50 text-amber-800 font-bold">SEDANG CUTI INDO</option>
                <option value="DIPULANGKAN" className="bg-rose-50 text-rose-800 font-bold">DIPULANGKAN</option>
                <option value="RESIGN" className="bg-rose-50 text-rose-800 font-bold">RESIGN</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Mess Tinggal</label>
              <select
                value={filterMess}
                onChange={(e) => setFilterMess(e.target.value)}
                className="w-full border border-slate-200 rounded-md py-1.5 px-2 bg-white text-xs font-medium focus:outline-none"
              >
                <option value="Semua">Semua Mess</option>
                {uniqueMesses.map(mess => (
                  <option key={mess} value={mess}>{mess}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Jabatan / Posisi</label>
              <select
                value={filterJabatan}
                onChange={(e) => setFilterJabatan(e.target.value)}
                className="w-full border border-slate-200 rounded-md py-1.5 px-2 bg-white text-xs font-medium focus:outline-none"
              >
                <option value="Semua">Semua Jabatan</option>
                {uniquePositions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1 col-span-2 sm:col-span-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Season Rumah Ibadah</label>
              <select
                value={filterSeason}
                onChange={(e) => setFilterSeason(e.target.value)}
                className="w-full border border-slate-200 rounded-md py-1.5 px-2 bg-white text-xs font-medium focus:outline-none"
              >
                <option value="Semua">Semua Season</option>
                {uniqueSeasons.map(sh => (
                  <option key={sh} value={sh}>{sh}</option>
                ))}
              </select>
            </div>

          </div>

        </div>
      </section>

      {/* --- MAIN OFFICE TABLE --- */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs bg-white">
            
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">
                <th className="py-3 px-4 text-center sticky left-0 bg-slate-50 z-10 w-[60px] min-w-[60px] max-w-[60px]" style={{ boxShadow: '1px 0 0 rgba(226,232,240,1)' }}>NO</th>
                <th className="py-3 px-4 text-center w-[240px] min-w-[240px] max-w-[240px] sticky left-[60px] bg-slate-50 z-10" style={{ boxShadow: '1px 0 0 rgba(226,232,240,1)' }}>NAMA ALL STAFF</th>
                <th className="py-3 px-4 text-center min-w-[140px]">NOMOR PASPORT</th>
                <th className="py-3 px-4 text-center min-w-[150px]">JABATAN (POSISI)</th>
                <th className="py-3 px-4 text-center min-w-[160px]">EMAIL DRIVE</th>
                <th className="py-3 px-4 text-center min-w-[160px]">EMAIL BK</th>
                <th className="py-3 px-4 text-center min-w-[90px]">STATUS</th>
                <th className="py-3 px-4 text-center min-w-[100px]">JENIS KELAMIN</th>
                <th className="py-3 px-4 text-center min-w-[150px]">MESS TINGGAL</th>
                <th className="py-3 px-4 text-center min-w-[90px]">NOMOR KAMAR</th>
                <th className="py-3 px-4 text-center min-w-[110px]">ASAL KOTA</th>
                <th className="py-3 px-4 text-center min-w-[100px]">ID LINE</th>
                <th className="py-3 px-4 text-center min-w-[150px]">SEASON RUMAH IBADAH</th>
                <th className="py-3 px-4 text-center min-w-[110px]">TANGGAL LAHIR</th>
                <th className="py-3 px-4 text-center min-w-[160px]">ULANG TAHUN</th>
                <th className="py-3 px-4 text-center min-w-[80px]" title="Dihitung otomatis">UMUR</th>
                <th className="py-3 px-4 text-center min-w-[220px]" title="Hitung start awal masa kerja - sampai sekarang">MASA KERJA (TENURE)</th>
                <th className="py-3 px-4 text-center sticky right-0 bg-slate-50 z-10 w-[120px]" style={{ boxShadow: '-1px 0 0 rgba(226,232,240,1)' }}>AKSI</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={18} className="py-12 text-center text-slate-400 bg-slate-50/20">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ShieldAlert className="w-8 h-8 text-slate-300" />
                      <span className="font-medium text-slate-500">Tidak ada data staff yang cocok</span>
                      <p className="text-xs text-slate-400">Silakan sesuaikan filter Anda atau bersihkan bilah pencarian.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff, index) => {
                  const isPassportVisible = !!revealedPassports[staff.id];
                  const maskedPassport = staff.nomorPasport 
                    ? `${staff.nomorPasport.substring(0, 3)}••••` 
                    : '-';

                  const birthDateVal = staff.tanggalLahir;
                  const age = calculateAge(birthDateVal, currentTime);
                  const bdInfo = getBirthdayInfo(birthDateVal, currentTime);
                  const tenure = calculateTenure(staff.tanggalMulaiKerja, currentTime);

                  return (
                    <tr 
                      key={staff.id} 
                      className={`group/row ${getStaffRowBgClass(staff.jabatanPosisi)}`}
                    >
                      <td className={`py-2 px-3 text-center font-mono font-medium text-slate-400 sticky left-0 z-10 w-[60px] min-w-[60px] max-w-[60px] transition-colors ${getStaffStickyBgClass(staff.jabatanPosisi)}`} style={{ boxShadow: '1px 0 0 rgba(226,232,240,1)' }}>
                        {index + 1}
                      </td>

                      <td className={`py-2 px-3 sticky left-[60px] z-10 w-[240px] min-w-[240px] max-w-[240px] font-bold transition-colors ${getStaffStickyBgClass(staff.jabatanPosisi)}`} style={{ boxShadow: '1px 0 0 rgba(226,232,240,1)' }}>
                        <div className="flex items-center gap-2.5">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-display shrink-0 ${staff.jenisKelamin === 'Laki-laki' ? 'bg-indigo-100 text-indigo-700' : 'bg-fuchsia-100 text-fuchsia-700'}`}>
                            {staff.namaAllStaff.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-slate-900 whitespace-normal break-words leading-tight" title={staff.namaAllStaff}>
                            {staff.namaAllStaff}
                          </span>
                        </div>
                      </td>

                      <td className="py-2 px-3 font-mono text-slate-700 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span>
                            {isPassportVisible ? staff.nomorPasport || '-' : maskedPassport}
                          </span>
                          {staff.nomorPasport && (
                            <button 
                              onClick={() => togglePassportMask(staff.id)}
                              className="text-slate-400 hover:text-slate-600 focus:outline-none shrink-0"
                              title={isPassportVisible ? "Sembunyikan Paspor" : "Tampilkan Paspor"}
                            >
                              {isPassportVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="py-2 px-3 whitespace-nowrap text-center">
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

                      <td className="py-2 px-3 font-mono text-slate-500 hover:text-blue-600 whitespace-nowrap text-center" title={staff.emailDrive}>
                        {staff.emailDrive ? (
                          <a href={`mailto:${staff.emailDrive}`} className="hover:underline flex items-center justify-center gap-1">
                            <Mail className="w-3 shrink-0" />
                            {staff.emailDrive}
                          </a>
                        ) : '-'}
                      </td>

                      <td className="py-2 px-3 font-mono text-slate-500 hover:text-blue-600 whitespace-nowrap text-center" title={staff.emailBk}>
                        {staff.emailBk ? (
                          <a href={`mailto:${staff.emailBk}`} className="hover:underline flex items-center justify-center gap-1">
                            <BookOpen className="w-3 text-amber-500 shrink-0" />
                            {staff.emailBk}
                          </a>
                        ) : '-'}
                      </td>

                      <td className="py-2 px-3 text-center whitespace-nowrap">
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
                              {staff.status || '-'}
                            </span>
                          );
                        })()}
                      </td>

                      <td className="py-2 px-3 text-slate-600 whitespace-nowrap text-center">
                        <span className="flex items-center justify-center gap-1">
                          <span className={staff.jenisKelamin === 'Laki-laki' ? 'text-indigo-600 font-bold' : 'text-fuchsia-600 font-bold'}>
                            {staff.jenisKelamin === 'Laki-laki' ? '♂' : '♀'}
                          </span>
                          {staff.jenisKelamin}
                        </span>
                      </td>

                      <td className="py-2 px-3 text-slate-700 whitespace-nowrap text-center" title={staff.messTinggal}>
                        <span className="flex items-center justify-center gap-1">
                          <Home className="w-3 h-3 text-slate-400 shrink-0" />
                          {staff.messTinggal || '-'}
                        </span>
                      </td>

                      <td className="py-2 px-3 font-mono text-slate-800 font-medium whitespace-nowrap text-center">
                        {staff.nomorKamar ? (
                          <span className="bg-white/80 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200">
                            {staff.nomorKamar}
                          </span>
                        ) : '-'}
                      </td>

                      <td className="py-2 px-3 text-slate-700 whitespace-nowrap text-center">
                        <span className="flex items-center justify-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          {staff.asalKota || '-'}
                        </span>
                      </td>

                      <td className="py-2 px-3 font-mono text-slate-600 whitespace-nowrap text-center">
                        {staff.idLine ? `@${staff.idLine}` : '-'}
                      </td>

                      <td className="py-2 px-3 text-slate-700 font-mono whitespace-nowrap text-center" title={staff.seasonRumahIbadah}>
                        {staff.seasonRumahIbadah || '-'}
                      </td>

                      <td className="py-2 px-3 text-slate-600 font-mono whitespace-nowrap text-center">
                        {staff.tanggalLahir ? (
                          <span className="flex items-center justify-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                            {staff.tanggalLahir}
                          </span>
                        ) : '-'}
                      </td>

                      <td className="py-2 px-3 text-slate-700 whitespace-nowrap text-center">
                        {staff.tanggalLahir ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="font-semibold">{bdInfo.formattedDayMonth}</span>
                            <span className={`text-[10px] px-1 py-0.5 rounded font-bold leading-none ${
                              bdInfo.daysRemaining === 0 
                                ? 'text-rose-700 bg-rose-100 border border-rose-300 animate-pulse' 
                                : bdInfo.daysRemaining <= 7 
                                  ? 'text-amber-700 bg-amber-100 border border-amber-300' 
                                  : 'text-slate-400 bg-slate-100'
                            }`}>
                              ({bdInfo.message})
                            </span>
                          </div>
                        ) : '-'}
                      </td>

                      <td className="py-2 px-3 text-center whitespace-nowrap">
                        {age > 0 ? (
                          <span className="bg-blue-100 text-blue-900 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border border-blue-300">
                            {age} Thn
                          </span>
                        ) : '-'}
                      </td>

                      <td className="py-2 px-3 font-mono text-slate-700 whitespace-nowrap text-center">
                        {staff.tanggalMulaiKerja ? (
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-[11px] font-bold text-slate-800 bg-white/90 rounded-md px-1.5 py-0.5 border border-slate-200">
                              {tenure.formattedDuration}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              (Mulai: {staff.tanggalMulaiKerja})
                            </span>
                          </div>
                        ) : '-'}
                      </td>

                      <td className={`py-2 px-3 sticky right-0 z-10 text-center transition-colors ${getStaffStickyBgClass(staff.jabatanPosisi)}`} style={{ boxShadow: '-1px 0 0 rgba(226,232,240,1)' }}>
                        <div className="flex items-center justify-center gap-1.5">

                          
                          <button
                            onClick={() => onOpenViewModal(staff)}
                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded cursor-pointer transition-colors"
                            title="Tampilkan Record Lengkap"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onOpenEditModal(staff)}
                            className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                            title="Ubah Data Staff"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteStaff(staff.id, staff.namaAllStaff)}
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded cursor-pointer transition-colors"
                            title="Hapus Staff"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        <div className="bg-slate-50 border-t border-slate-200 p-3 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Menampikan database staff lokal aktif dalam browser.</span>
          <span>Total Log: {filteredStaff.length} entri ditemukan</span>
        </div>

      </div>

      {/* --- CONFIRM DELETE MODAL --- */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-50 rounded-full border border-rose-100">
                <Trash2 className="w-5 h-5 animate-bounce" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider">Hapus Data Staff</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Apakah Anda yakin ingin menghapus data staff <strong className="text-slate-900">"{deleteConfirmName}"</strong> secara permanen dari sistem database?
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
                  setStaffList(prev => prev.filter(s => s.id !== deleteConfirmId));
                  setDeleteConfirmId(null);
                  setDeleteConfirmName('');
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs rounded-lg font-bold shadow-xs cursor-pointer transition-colors"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
