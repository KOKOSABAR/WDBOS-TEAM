import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, 
  UserPlus, 
  Download, 
  Upload, 
  RotateCcw, 
  X, 
  Calendar, 
  Home, 
  MapPin, 
  Mail, 
  BookOpen, 
  Clock, 
  Activity, 
  ChevronDown,
  Menu,
  Plane,
  AlertTriangle,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Staff, calculateAge, getBirthdayInfo, calculateTenure, MistakeRecord, OvertimeRecord, LeaveSubmission, KesalahanLcRecord } from './types';
import { SAMPLE_STAFF, SAMPLE_MISTAKES, SAMPLE_OVERTIMES } from './sampleData';

// Modular Components
import StaffDatabaseView from './components/StaffDatabaseView';
import CutiSubmissionView from './components/CutiSubmissionView';
import VisaExpiryView from './components/VisaExpiryView';
import StaffMistakesView from './components/StaffMistakesView';
import StaffOvertimeView from './components/StaffOvertimeView';
import KesalahanLcView from './components/KesalahanLcView';
import SheetsSyncModal from './components/SheetsSyncModal';

const getStatusFormBgClass = (status: string) => {
  const normStatus = (status || '').toUpperCase().trim();
  if (normStatus === 'KERJA' || normStatus === 'AKTIF') {
    return 'bg-emerald-100 text-emerald-800 border-emerald-300';
  }
  if (normStatus === 'DIRUMAHKAN' || normStatus === 'RESIGN' || normStatus === 'DIPULANGKAN') {
    return 'bg-rose-100 text-rose-800 border-rose-300';
  }
  if (normStatus === 'CUTI' || normStatus === 'SEDANG CUTI INDO') {
    return 'bg-amber-100 text-amber-800 border-amber-300';
  }
  return 'bg-white text-slate-700 border-slate-300';
};

export default function App() {
  // --- LAYOUT NAVIGATION ---
  const [activeTab, setActiveTab] = useState<'staff_database' | 'cuti_submission' | 'visa_expiry' | 'staff_mistakes' | 'staff_overtime'>('staff_database');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [sheetsSyncKey, setSheetsSyncKey] = useState(0);

  // --- STATE ---
  const [staffList, setStateStaffList] = useState<Staff[]>(() => {
    const saved = localStorage.getItem('staff_db_roster');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const seen = new Set<string>();
          const deduped: Staff[] = [];
          for (const item of parsed) {
            if (item && item.id && !seen.has(item.id)) {
              seen.add(item.id);
              deduped.push(item);
            }
          }
          return deduped;
        }
      } catch (e) {
        console.error('Gagal memuat offline roster data:', e);
      }
    }
    const seen = new Set<string>();
    const deduped: Staff[] = [];
    for (const item of SAMPLE_STAFF) {
      if (item && item.id && !seen.has(item.id)) {
        seen.add(item.id);
        deduped.push(item);
      }
    }
    return deduped;
  });

  const setStaffList = (value: Staff[] | ((prev: Staff[]) => Staff[])) => {
    setStateStaffList((prev) => {
      const computed = typeof value === 'function' ? value(prev) : value;
      const seen = new Set<string>();
      const deduped: Staff[] = [];
      for (const item of computed) {
        if (item && item.id && !seen.has(item.id)) {
          seen.add(item.id);
          deduped.push(item);
        }
      }
      return deduped;
    });
  };

  // Persists roster to localStorage
  useEffect(() => {
    localStorage.setItem('staff_db_roster', JSON.stringify(staffList));
  }, [staffList]);

  // Mistakes List State
  const [mistakeRecords, setMistakeRecords] = useState<MistakeRecord[]>(() => {
    const saved = localStorage.getItem('staff_db_mistakes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Gagal memuat offline mistakes data:', e);
      }
    }
    return [];
  });

  // Persists mistake records to localStorage
  useEffect(() => {
    localStorage.setItem('staff_db_mistakes', JSON.stringify(mistakeRecords));
  }, [mistakeRecords]);

  // Leave List State (Moved from CutiSubmissionView)
  const [leaveList, setLeaveList] = useState<LeaveSubmission[]>(() => {
    const saved = localStorage.getItem('staff_db_leaves');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Gagal memuat offline leaves data:', e);
      }
    }
    return [];
  });

  // Persists leaves list to localStorage
  useEffect(() => {
    localStorage.setItem('staff_db_leaves', JSON.stringify(leaveList));
  }, [leaveList]);

  const handleAddMistake = (newMistake: Omit<MistakeRecord, 'id'>) => {
    const record: MistakeRecord = {
      id: `mist-${Date.now()}`,
      ...newMistake
    };
    setMistakeRecords(prev => [record, ...prev]);
  };

  const handleDeleteMistake = (id: string) => {
    setMistakeRecords(prev => prev.filter(m => m.id !== id));
  };

  // Overtime List State
  const [overtimeRecords, setOvertimeRecords] = useState<OvertimeRecord[]>(() => {
    const saved = localStorage.getItem('staff_db_overtimes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Gagal memuat offline overtimes data:', e);
      }
    }
    return [];
  });

  // Persists overtime records to localStorage
  useEffect(() => {
    localStorage.setItem('staff_db_overtimes', JSON.stringify(overtimeRecords));
  }, [overtimeRecords]);

  // Handler to set/update or insert overtime
  const handleAddOrUpdateOvertime = (staffId: string, tanggal: string, hours: number, note?: string) => {
    setOvertimeRecords(prev => {
      // If hours is 0, we treat it as delete/clear
      if (hours === 0) {
        return prev.filter(rec => !(rec.staffId === staffId && rec.tanggal === tanggal));
      }

      const existingIdx = prev.findIndex(rec => rec.staffId === staffId && rec.tanggal === tanggal);
      if (existingIdx > -1) {
        // Update existing
        const copy = [...prev];
        copy[existingIdx] = {
          ...copy[existingIdx],
          jumlahJam: hours,
          keterangan: note
        };
        return copy;
      } else {
        // Create new
        const newRecord: OvertimeRecord = {
          id: `ov-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          staffId,
          tanggal,
          jumlahJam: hours,
          keterangan: note
        };
          return [newRecord, ...prev];
        }
    });
  };

  const handleClearOvertime = (id: string) => {
    setOvertimeRecords(prev => prev.filter(rec => rec.id !== id));
  };

  // Modal Control
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [viewingStaff, setViewingStaff] = useState<Staff | null>(null);

  // File Upload Ref for Importing JSON
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Time tracker for dynamic greeting and header clock
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // update every minute
    return () => clearInterval(timer);
  }, []);

  // --- GOOGLE SHEETS AUTOMATIC SYNC SYSTEM ---
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccessNotify, setSyncSuccessNotify] = useState(false);
  const isInitialMount = useRef(true);
  const initialLoadTimer = useRef<any>(null);

  // Auto-fetch database on startup if active URL is set
  useEffect(() => {
    const savedUrl = localStorage.getItem('staff_db_sheets_url');
    const defaultUrl = 'https://script.google.com/macros/s/AKfycbyRxUAXxjW7FX4rh6q75M04R_LN5VWXEutJy8Qc7MUcaVKR7RDyGFyH-E6YZ4ofgI0V/exec';
    const urlToUse = savedUrl || defaultUrl;
    
    if (!savedUrl) {
      localStorage.setItem('staff_db_sheets_url', defaultUrl);
    }

    const autoFetchData = async () => {
      setIsSyncing(true);
      setSyncError(null);
      try {
        const response = await fetch(urlToUse.trim() + '?action=fetchData');
        if (!response.ok) {
          throw new Error('Gagal merespon jaringan.');
        }
        const resData = await response.json();
        
        if (resData.status === 'error') {
          throw new Error(resData.message || 'Error dari Apps Script');
        }

        // Sync data to state
        if (resData.staffList) setStaffList(resData.staffList);
        if (resData.mistakeRecords) setMistakeRecords(resData.mistakeRecords);
        if (resData.overtimeRecords) setOvertimeRecords(resData.overtimeRecords);
        if (resData.leaveList) setLeaveList(resData.leaveList);

        setSyncSuccessNotify(true);
        setTimeout(() => setSyncSuccessNotify(false), 4000);
      } catch (err: any) {
        console.warn('Gagal sinkron otomatis awal:', err);
        setSyncError('Koneksi Google Sheets gagal. Pasikan Web App dideploy dengan benar.');
      } finally {
        setIsSyncing(false);
        // Mark initial mount done
        initialLoadTimer.current = setTimeout(() => {
          isInitialMount.current = false;
        }, 1500);
      }
    };

    autoFetchData();

    return () => {
      if (initialLoadTimer.current) clearTimeout(initialLoadTimer.current);
    };
  }, []);

  // Auto-save changes back to Google Sheets (Debounced 1.5s)
  useEffect(() => {
    if (isSyncing || isInitialMount.current) return;

    const savedUrl = localStorage.getItem('staff_db_sheets_url');
    if (!savedUrl) return;

    const exportTimer = setTimeout(async () => {
      try {
        const payload = {
          action: 'syncAll',
          staffList,
          leaveList,
          mistakeRecords,
          overtimeRecords
        };

        await fetch(savedUrl.trim(), {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8'
          },
          body: JSON.stringify(payload)
        });
        console.log('Perubahan berhasil disimpan otomatis ke Google Sheets!');
        setSyncSuccessNotify(true);
        setTimeout(() => setSyncSuccessNotify(false), 2000);
      } catch (err) {
        console.warn('Gagal menyimpan otomatis:', err);
      }
    }, 1500);

    return () => clearTimeout(exportTimer);
  }, [staffList, leaveList, mistakeRecords, overtimeRecords, isSyncing]);

  // Form State
  const initialFormState: Omit<Staff, 'id'> = {
    namaAllStaff: '',
    nomorPasport: '',
    jabatanPosisi: '',
    emailDrive: '',
    emailBk: '',
    status: 'AKTIF',
    jenisKelamin: 'Laki-laki',
    messTinggal: '',
    nomorKamar: '',
    asalKota: '',
    idLine: '',
    seasonRumahIbadah: '',
    tanggalLahir: '',
    tanggalMulaiKerja: '',
    expVisa: '',
    typeVisa: '',
    lokasiSaatIni: '',
    notes: ''
  };
  const [formData, setFormData] = useState<Omit<Staff, 'id'>>(initialFormState);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // --- STATS CALCULATIONS ---
  const stats = useMemo(() => {
    const total = staffList.length;
    const active = staffList.filter(s => (s.status || '').toUpperCase() === 'AKTIF').length;
    
    // Average Age
    const validAges = staffList.map(s => calculateAge(s.tanggalLahir, currentTime)).filter(age => age > 0);
    const avgAge = validAges.length > 0 ? (validAges.reduce((sum, val) => sum + val, 0) / validAges.length).toFixed(1) : '0';

    return {
      total,
      active,
      avgAge
    };
  }, [staffList, currentTime]);

  // --- ACTIONS ---

  const handleLoadAndSyncToSheets = async () => {
    // 1. Set the main state to the parsed staff roster members
    setStaffList(SAMPLE_STAFF);

    // 2. Export / sync to Google Spreadsheet URL
    const savedUrl = localStorage.getItem('staff_db_sheets_url') || 'https://script.google.com/macros/s/AKfycbyRxUAXxjW7FX4rh6q75M04R_LN5VWXEutJy8Qc7MUcaVKR7RDyGFyH-E6YZ4ofgI0V/exec';

    setIsSyncing(true);
    setSyncError(null);
    setSyncSuccessNotify(false);

    try {
      const leavesRaw = localStorage.getItem('staff_db_leaves');
      const leavesListLocal = leavesRaw ? JSON.parse(leavesRaw) : [];

      const referenceDate = new Date();
      const enhancedSample = SAMPLE_STAFF.map(s => {
        const age = calculateAge(s.tanggalLahir, referenceDate);
        const bdInfo = getBirthdayInfo(s.tanggalLahir, referenceDate);
        const tenure = calculateTenure(s.tanggalMulaiKerja, referenceDate);
        return {
          ...s,
          ulangTahun: bdInfo.formattedDayMonth || '-',
          umur: age > 0 ? `${age} Tahun` : '-',
          masaKerja: tenure.formattedDuration || '-'
        };
      });

      const payload = {
        action: 'syncAll',
        staffList: enhancedSample,
        leaveList: leavesListLocal,
        mistakeRecords,
        overtimeRecords
      };

      await fetch(savedUrl.trim(), {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      setSyncSuccessNotify(true);
      setTimeout(() => setSyncSuccessNotify(false), 5000);
      alert('SUKSES: Seluruh Roster Staff berhasil dimuat ke Dashboard dan disinkronisasikan ke Google Spreadsheet Anda!');
    } catch (err: any) {
      console.error('Error Sync Roster Baru:', err);
      setSyncError('Koneksi Google Sheets gagal. Silakan periksa URL Apps Script Anda.');
      alert('Data Roster telah dimuat di Dashboard lokalan, namun gagal mengunggah ke Google Sheets. Silakan pastikan Google App / Web App URL diatur dengan benar di panel pengaturan.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResetToSampleData = () => {
    if (window.confirm('Apakah Anda yakin ingin memuat ulang seluruh Roster Staff Default (termasuk LEADER) ke dalam database lokal? Tindakan ini akan menimpa data staff saat ini.')) {
      setStaffList(SAMPLE_STAFF);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus / mengosongkan seluruh isi database lokal (Staff, Cuti, Overtime, Kesalahan)?')) {
      setStaffList([]);
      setMistakeRecords([]);
      setOvertimeRecords([]);
      setLeaveList([]);
    }
  };

  const handleDeleteStaff = (id: string, name: string) => {
    if (window.confirm(`Hapus data staff "${name}" dari sistem?`)) {
      setStaffList(prev => prev.filter(s => s.id !== id));
      if (viewingStaff?.id === id) setViewingStaff(null);
    }
  };

  const handleOpenAddModal = () => {
    setEditingStaff(null);
    setFormData(initialFormState);
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (staff: Staff) => {
    setEditingStaff(staff);
    setFormData({
      namaAllStaff: staff.namaAllStaff || '',
      nomorPasport: staff.nomorPasport || '',
      jabatanPosisi: staff.jabatanPosisi || '',
      emailDrive: staff.emailDrive || '',
      emailBk: staff.emailBk || '',
      status: staff.status || 'Aktif',
      jenisKelamin: staff.jenisKelamin || 'Laki-laki',
      messTinggal: staff.messTinggal || '',
      nomorKamar: staff.nomorKamar || '',
      asalKota: staff.asalKota || '',
      idLine: staff.idLine || '',
      seasonRumahIbadah: staff.seasonRumahIbadah || '',
      tanggalLahir: staff.tanggalLahir || '',
      tanggalMulaiKerja: staff.tanggalMulaiKerja || '',
      expVisa: staff.expVisa || '',
      typeVisa: staff.typeVisa || '',
      lokasiSaatIni: staff.lokasiSaatIni || '',
      notes: staff.notes || ''
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formData.namaAllStaff.trim()) errors.namaAllStaff = 'Nama Staff harus diisi';
    if (!formData.jabatanPosisi.trim()) {
      errors.jabatanPosisi = 'Jabatan / Posisi harus diisi';
    }
    if (!formData.jenisKelamin) errors.jenisKelamin = 'Pilih jenis kelamin';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingStaff) {
      setStaffList(prev => prev.map(s => s.id === editingStaff.id ? { ...s, ...formData } : s));
    } else {
      const newStaff: Staff = {
        id: `st-${Date.now()}`,
        ...formData
      };
      setStaffList(prev => [newStaff, ...prev]);
    }

    setIsFormModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = [
      'No', 'Nama All Staff', 'Nomor Pasport', 'Jabatan (Posisi)', 'Email Drive', 
      'Email BK', 'Status', 'Jenis Kelamin', 'Mess Tinggal', 'Nomor Kamar', 
      'Asal Kota', 'ID Line', 'Season Rumah Ibadah', 'Tanggal Lahir', 'Umur', 
      'Star Masa Kerja', 'Masa Kerja Sampai Sekarang'
    ];

    const rows = staffList.map((s, idx) => {
      const age = calculateAge(s.tanggalLahir, currentTime);
      const tenure = calculateTenure(s.tanggalMulaiKerja, currentTime).formattedDuration;
      return [
        idx + 1,
        `"${s.namaAllStaff.replace(/"/g, '""')}"`,
        `"${s.nomorPasport}"`,
        `"${s.jabatanPosisi.replace(/"/g, '""')}"`,
        `"${s.emailDrive}"`,
        `"${s.emailBk}"`,
        `"${s.status}"`,
        `"${s.jenisKelamin}"`,
        `"${s.messTinggal.replace(/"/g, '""')}"`,
        `"${s.nomorKamar}"`,
        `"${s.asalKota.replace(/"/g, '""')}"`,
        `"${s.idLine}"`,
        `"${s.seasonRumahIbadah.replace(/"/g, '""')}"`,
        `"${s.tanggalLahir}"`,
        age,
        `"${s.tanggalMulaiKerja}"`,
        `"${tenure.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_data_staff_${currentTime.toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedData)) {
          const isValid = importedData.every(item => item.namaAllStaff !== undefined && item.id !== undefined);
          if (isValid) {
            setStaffList(importedData);
            alert(`Berhasil mengimpor ${importedData.length} data staff.`);
          } else {
            alert('Format berkas salah.');
          }
        }
      } catch (err) {
        alert('Gagal mengurai file JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleJsonExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(staffList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `backup_data_staff_${currentTime.toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col md:flex-row">
      
      {/* --- SIDEBAR PANEL --- */}
      <aside className={`bg-slate-900 text-slate-300 w-full md:w-64 flex-shrink-0 flex flex-col transition-all border-r border-slate-800 ${isSidebarOpen ? 'block' : 'hidden md:flex md:w-20'}`}>
        
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="p-2 bg-blue-600 rounded-lg text-white font-extrabold text-sm tracking-wider flex-shrink-0 flex items-center justify-center w-9 h-9">
              WB
            </div>
            {isSidebarOpen && (
              <div className="leading-tight">
                <span className="font-bold text-slate-100 text-sm tracking-wide block">WDBOS</span>
                <span className="text-[10px] text-slate-400 font-mono">FUTURE</span>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="text-slate-400 hover:text-slate-100 md:block hidden cursor-pointer"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 p-3 space-y-1">
          {/* Link 1: Data Staff */}
          <button
            onClick={() => setActiveTab('staff_database')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${activeTab === 'staff_database' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-slate-100'}`}
          >
            <Users className="w-4 h-4 flex-shrink-0" />
            {isSidebarOpen && <span>Data Staff</span>}
          </button>

          {/* Link 2: Pengajuan Cuti WDBOS */}
          <button
            onClick={() => setActiveTab('cuti_submission')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${activeTab === 'cuti_submission' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-slate-100'}`}
          >
            <Calendar className="w-4 h-4 flex-shrink-0 text-amber-500" />
            {isSidebarOpen ? (
              <span className="text-left leading-normal">
                Pengajuan Cuti WDBOS
              </span>
            ) : null}
          </button>

          {/* Link 3: Masa Aktif Visa Staff */}
          <button
            onClick={() => setActiveTab('visa_expiry')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${activeTab === 'visa_expiry' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-slate-100'}`}
          >
            <Plane className="w-4 h-4 flex-shrink-0 text-sky-400" />
            {isSidebarOpen ? (
              <span className="text-left leading-normal hover:text-slate-100">
                Masa Aktif Visa Staff
              </span>
            ) : null}
          </button>

          {/* Link 4: DATA KESALAHAN */}
          <button
            onClick={() => setActiveTab('staff_mistakes')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${activeTab === 'staff_mistakes' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-slate-100'}`}
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            {isSidebarOpen ? (
              <span className="text-left leading-normal hover:text-slate-100">
                Data Kesalahan
              </span>
            ) : null}
          </button>

          {/* Link 5: LEMBURAN STAFF */}
          <button
            onClick={() => setActiveTab('staff_overtime')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${activeTab === 'staff_overtime' ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-800 hover:text-slate-100'}`}
          >
            <Clock className="w-4 h-4 flex-shrink-0 text-indigo-400" />
            {isSidebarOpen ? (
              <span className="text-left leading-normal hover:text-slate-100">
                Lemburan Staff
              </span>
            ) : null}
          </button>
        </nav>


      </aside>

      {/* --- CONTENT CONTAINER WRAPPER --- */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* --- TOP HEADER BAR --- */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded md:hidden"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-md md:text-lg font-bold text-slate-950 flex items-center gap-2 tracking-tight">
                  {activeTab === 'staff_database' 
                    ? 'DASHBOARD MANAGEMENT STAFF' 
                    : activeTab === 'cuti_submission' 
                      ? 'PENGAJUAN CUTI WDBOS' 
                      : activeTab === 'visa_expiry'
                        ? 'TRACKER MASA AKTIF VISA STAFF'
                        : activeTab === 'staff_mistakes'
                          ? 'SISTEM DATA KESALAHAN STAFF'
                          : 'SISTEM DATA LEMBURAN STAFF'}
                </h1>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5 leading-none">
                  {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            {/* Quick Actions Global */}
            <div className="flex items-center gap-2">
              {/* Google Sheets Conn Button */}
              <button
                onClick={() => setIsSheetsModalOpen(true)}
                className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer"
                title="Google Sheets Database Connection"
              >
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Google Sheets</span>
              </button>

              {activeTab === 'staff_database' && (
                <>
                  <button
                    onClick={handleOpenAddModal}
                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Tambah Staff
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded text-xs font-semibold transition-all"
                    title="Unduh CSV"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden md:inline">Unduh CSV</span>
                  </button>

                  <div className="relative group/backup">
                    <button className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer">
                      <Activity className="w-3.5 h-3.5 text-amber-500" />
                      <span className="hidden md:inline">Backup</span>
                      <ChevronDown className="w-3" />
                    </button>
                    
                    <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 hidden group-hover/backup:block z-40">
                      <button onClick={handleJsonExport} className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700">
                        <Download className="w-3.5 h-3.5" /> Export JSON
                      </button>
                      <button onClick={() => fileInputRef.current?.click()} className="w-full text-left px-4 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-700">
                        <Upload className="w-3.5 h-3.5" /> Import JSON
                      </button>
                      <button onClick={handleResetToSampleData} className="w-full text-left px-4 py-2 text-xs hover:bg-amber-50 text-amber-700 flex items-center gap-2">
                        <Database className="w-3.5 h-3.5" /> Muat Staff Default
                      </button>
                      <div className="border-t border-slate-100 my-1"></div>
                      <button onClick={handleResetToDefault} className="w-full text-left px-4 py-2 text-xs hover:bg-rose-50 text-rose-600 flex items-center gap-2">
                        <RotateCcw className="w-3.5 h-3.5" /> Kosongkan Database
                      </button>
                    </div>
                  </div>
                </>
              )}

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleJsonImport} 
                accept=".json" 
                className="hidden" 
              />
            </div>

          </div>
        </header>

        {/* --- MAIN CORE PANEL --- */}
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 space-y-6">


          {activeTab === 'staff_database' ? (
            <StaffDatabaseView 
              staffList={staffList} 
              setStaffList={setStaffList} 
              currentTime={currentTime} 
              onOpenAddModal={handleOpenAddModal}
              onOpenEditModal={handleOpenEditModal}
              onOpenViewModal={setViewingStaff}
            />
          ) : activeTab === 'cuti_submission' ? (
            <CutiSubmissionView 
              key={`cuti-view-${sheetsSyncKey}`}
              staffList={staffList.filter(s => s.jabatanPosisi?.trim().toUpperCase() !== 'LEADER')} 
              currentTime={currentTime} 
              leaveList={leaveList}
              setLeaveList={setLeaveList}
            />
          ) : activeTab === 'visa_expiry' ? (
            <VisaExpiryView 
              staffList={staffList.filter(s => s.jabatanPosisi?.trim().toUpperCase() !== 'LEADER')} 
              currentTime={currentTime} 
              onOpenEditModal={handleOpenEditModal}
            />
          ) : activeTab === 'staff_mistakes' ? (
            <StaffMistakesView
              staffList={staffList.filter(s => s.jabatanPosisi?.trim().toUpperCase() !== 'LEADER')}
              mistakeRecords={mistakeRecords}
              onAddMistake={handleAddMistake}
              onDeleteMistake={handleDeleteMistake}
              currentTime={currentTime}
            />
          ) : (
            <StaffOvertimeView
              staffList={staffList.filter(s => s.jabatanPosisi?.trim().toUpperCase() !== 'LEADER')}
              overtimeRecords={overtimeRecords}
              onAddOrUpdateOvertime={handleAddOrUpdateOvertime}
              onClearOvertime={handleClearOvertime}
              currentTime={currentTime}
            />
          )}
        </main>

      </div>

      {/* --- ADD / EDIT FORM MODAL --- */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-display font-semibold text-slate-900">
                    {editingStaff ? `Ubah Data Staff: ${editingStaff.namaAllStaff}` : 'Registrasi Data Staff Baru'}
                  </h3>
                </div>
                <button onClick={() => setIsFormModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
                <div className="space-y-6">
                  
                  {/* SEKSI Identitas */}
                  <div>
                    <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-widest pb-1 border-b border-slate-100 mb-3">
                      1. Identitas Personal & Kredensial
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="col-span-1 md:col-span-2 space-y-1">
                        <label className="text-[11px] font-medium text-slate-500">NAMA ALL STAFF <span className="text-rose-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={formData.namaAllStaff}
                          onChange={(e) => setFormData({ ...formData, namaAllStaff: e.target.value })}
                          placeholder="Masukkan nama lengkap staff"
                          className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-500">NOMOR PASPORT</label>
                        <input
                          type="text"
                          value={formData.nomorPasport}
                          onChange={(e) => setFormData({ ...formData, nomorPasport: e.target.value })}
                          placeholder="Contoh: P-A898129"
                          className="w-full text-xs font-mono border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-500">JENIS KELAMIN <span className="text-rose-500">*</span></label>
                        <select
                          required
                          value={formData.jenisKelamin}
                          onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value as 'Laki-laki' | 'Perempuan' })}
                          className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none"
                        >
                          <option value="Laki-laki">Laki-laki</option>
                          <option value="Perempuan">Perempuan</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-500">TANGGAL LAHIR</label>
                        <input
                          type="date"
                          value={formData.tanggalLahir}
                          onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                          className="w-full text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none animate-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-500">ASAL KOTA</label>
                        <input
                          type="text"
                          value={formData.asalKota}
                          onChange={(e) => setFormData({ ...formData, asalKota: e.target.value })}
                          placeholder="Kota domisili"
                          className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SEKSI Jabatan */}
                  <div>
                    <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-widest pb-1 border-b border-slate-100 mb-3">
                      2. Jabatan, Status, & Masa Kerja
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="col-span-1 md:col-span-2 space-y-1">
                        <label className="text-[11px] font-medium text-slate-500">JABATAN (POSISI) <span className="text-rose-500">*</span></label>
                        <input
                          type="text"
                          required
                          value={formData.jabatanPosisi}
                          onChange={(e) => setFormData({ ...formData, jabatanPosisi: e.target.value })}
                          placeholder="Posisi kerja"
                          className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-500">STATUS STAFF <span className="text-rose-500">*</span></label>
                        <select
                          required
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className={`w-full text-xs border rounded px-2.5 py-1.5 focus:outline-none font-bold transition-all duration-150 ${getStatusFormBgClass(formData.status)}`}
                        >
                          <option value="KERJA" className="bg-emerald-50 text-emerald-800 font-bold">KERJA (HIJAU)</option>
                          <option value="DIRUMAHKAN" className="bg-rose-50 text-rose-800 font-bold">DIRUMAHKAN (MERAH)</option>
                          <option value="CUTI" className="bg-amber-50 text-amber-800 font-bold">CUTI (KUNING)</option>
                          <option value="AKTIF" className="bg-emerald-50 text-emerald-800 font-bold">AKTIF (HIJAU)</option>
                          <option value="SEDANG CUTI INDO" className="bg-amber-50 text-amber-800 font-bold">SEDANG CUTI INDO (KUNING)</option>
                          <option value="DIPULANGKAN" className="bg-rose-50 text-rose-800 font-bold">DIPULANGKAN (MERAH)</option>
                          <option value="RESIGN" className="bg-rose-50 text-rose-800 font-bold">RESIGN (MERAH)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-500">START MULAI KERJA</label>
                        <input
                          type="date"
                          value={formData.tanggalMulaiKerja}
                          onChange={(e) => setFormData({ ...formData, tanggalMulaiKerja: e.target.value })}
                          className="w-full text-xs border border-slate-200 rounded px-2 py-1 focus:outline-none animate-none"
                        />
                      </div>

                      <div className="col-span-1 md:col-span-2 space-y-1">
                        <label className="text-[11px] font-medium text-slate-500">SEASON RUMAH IBADAH</label>
                        <input
                          type="text"
                          value={formData.seasonRumahIbadah}
                          onChange={(e) => setFormData({ ...formData, seasonRumahIbadah: e.target.value })}
                          placeholder="Misl: Jumatan, Kebaktian..."
                          className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SEKSI Kontak */}
                  <div>
                    <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-widest pb-1 border-b border-slate-100 mb-3">
                      3. Kontak, Akun, & Mess Tinggal
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-500">EMAIL DRIVE</label>
                        <input
                          type="email"
                          value={formData.emailDrive}
                          onChange={(e) => setFormData({ ...formData, emailDrive: e.target.value })}
                          className="w-full text-xs font-mono border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-500">EMAIL BK</label>
                        <input
                          type="email"
                          value={formData.emailBk}
                          onChange={(e) => setFormData({ ...formData, emailBk: e.target.value })}
                          className="w-full text-xs font-mono border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-500">ID LINE</label>
                        <input
                          type="text"
                          value={formData.idLine}
                          onChange={(e) => setFormData({ ...formData, idLine: e.target.value })}
                          className="w-full text-xs font-mono border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-slate-500">MESS TINGGAL</label>
                          <input
                            type="text"
                            value={formData.messTinggal}
                            onChange={(e) => setFormData({ ...formData, messTinggal: e.target.value })}
                            className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-medium text-slate-500">NOMOR KAMAR</label>
                          <input
                            type="text"
                            value={formData.nomorKamar}
                            onChange={(e) => setFormData({ ...formData, nomorKamar: e.target.value })}
                            className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SEKSI VISA & LOKASI */}
                  <div>
                    <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-widest pb-1 border-b border-slate-100 mb-3">
                      4. Masa Aktif & Dokumen Visa Staff
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-500">EXP VISA</label>
                        <input
                          type="date"
                          value={formData.expVisa || ''}
                          onChange={(e) => setFormData({ ...formData, expVisa: e.target.value })}
                          className="w-full text-xs font-mono border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-500">TYPE VISA</label>
                        <input
                          type="text"
                          value={formData.typeVisa || ''}
                          onChange={(e) => setFormData({ ...formData, typeVisa: e.target.value })}
                          placeholder="e.g. Working Visa, Tourist Visa"
                          className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-medium text-slate-500">LOKASI SAAT INI</label>
                        <input
                          type="text"
                          value={formData.lokasiSaatIni || ''}
                          onChange={(e) => setFormData({ ...formData, lokasiSaatIni: e.target.value })}
                          placeholder="Lokasi tempat tinggal sekarang"
                          className="w-full text-xs border border-slate-200 rounded px-2.5 py-1.5 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-widest pb-1 border-b border-slate-100 mb-2">
                      5. Catatan Khusus
                    </h4>
                    <textarea
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Info internal..."
                      className="w-full text-xs border border-slate-200 rounded p-2.5 focus:outline-none"
                    />
                  </div>

                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-2 bg-white sticky bottom-0">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    Simpan Perubahan
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- DETAIL PREVIEW SHEET MODAL --- */}
      <AnimatePresence>
        {viewingStaff && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden"
            >
              <div className={`h-2.5 ${viewingStaff.jenisKelamin === 'Laki-laki' ? 'bg-indigo-500' : 'bg-fuchsia-500'}`}></div>

              <div className="p-6">
                
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold font-display ${viewingStaff.jenisKelamin === 'Laki-laki' ? 'bg-indigo-50 text-indigo-700' : 'bg-fuchsia-50 text-fuchsia-700'}`}>
                      {viewingStaff.namaAllStaff.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-display font-semibold text-slate-900">{viewingStaff.namaAllStaff}</h3>
                      <p className="text-xs text-slate-500 font-medium font-sans">{viewingStaff.jabatanPosisi}</p>
                    </div>
                  </div>
                  <button onClick={() => setViewingStaff(null)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-6 space-y-4 border-t border-b border-slate-100 py-4">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Nomor Pasport</span>
                      <p className="text-sm font-mono font-medium text-slate-800">{viewingStaff.nomorPasport || '-'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Status Pekerjaan</span>
                      <p className="text-sm">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                          viewingStaff.status === 'Aktif' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {viewingStaff.status}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Mess & Kamar</span>
                      <p className="text-xs text-slate-800">
                        {viewingStaff.messTinggal || '-'} (Kamar {viewingStaff.nomorKamar || '-'})
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Asal Kota</span>
                      <p className="text-xs text-slate-800 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {viewingStaff.asalKota || '-'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Umur Lengkap</span>
                      <p className="text-xs text-slate-800">
                        {calculateAge(viewingStaff.tanggalLahir, currentTime)} Tahun ({viewingStaff.tanggalLahir || '-'})
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Masa Kerja (Hingga Hari Ini)</span>
                      <p className="text-xs font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                        {calculateTenure(viewingStaff.tanggalMulaiKerja, currentTime).formattedDuration}
                      </p>
                    </div>
                  </div>

                  {/* INFO VISA & LOKASI SAAT INI */}
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-150 grid grid-cols-2 gap-3 font-sans">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Tipe & Lokasi Visa</span>
                      <p className="text-xs font-bold text-slate-850 mt-1 whitespace-nowrap">
                        {viewingStaff.typeVisa ? `${viewingStaff.typeVisa}` : '-'} 
                        {viewingStaff.lokasiSaatIni ? ` (${viewingStaff.lokasiSaatIni})` : ''}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Tanggal Kadaluarsa (Exp)</span>
                      <p className="text-xs font-mono font-bold text-slate-850 mt-1">
                        {viewingStaff.expVisa ? viewingStaff.expVisa : <span className="text-slate-400 italic font-normal">Belum diinput</span>}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Kontak & Surat Menyurat</span>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2 font-mono text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>Drive: {viewingStaff.emailDrive || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-slate-600">
                        <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                        <span>BK: {viewingStaff.emailBk || '-'}</span>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="mt-6 flex justify-between gap-1">
                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    ID: {viewingStaff.id}
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        setViewingStaff(null);
                        handleOpenEditModal(viewingStaff);
                      }}
                      className="px-3.5 py-1.5 bg-blue-50 text-blue-700 rounded text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      Ubah Data
                    </button>
                    <button
                      onClick={() => setViewingStaff(null)}
                      className="px-3.5 py-1.5 bg-slate-900 text-white rounded text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SheetsSyncModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        staffList={staffList}
        setStaffList={setStaffList}
        overtimeRecords={overtimeRecords}
        setOvertimeRecords={setOvertimeRecords}
        mistakeRecords={mistakeRecords}
        setMistakeRecords={setMistakeRecords}
        onRefreshCuti={() => setSheetsSyncKey(prev => prev + 1)}
      />

      {/* Floating Google Sheets Sync Notification */}
      <AnimatePresence>
        {(isSyncing || syncSuccessNotify || syncError) && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2"
          >
            {isSyncing && (
              <div className="bg-slate-900 border border-slate-800 text-slate-100 text-xs font-semibold px-4.5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping shrink-0" />
                <span>Menghubungkan ke Google Sheets...</span>
              </div>
            )}
            
            {syncSuccessNotify && !isSyncing && (
              <div className="bg-emerald-900 text-emerald-50 text-xs font-semibold px-4.5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 border border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                <span>WDBOS & Google Sheets Tersinkronisasi!</span>
              </div>
            )}

            {syncError && !isSyncing && (
              <div className="bg-rose-950 border border-rose-800 text-rose-50 text-xs font-semibold px-4.5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                <span>{syncError}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
