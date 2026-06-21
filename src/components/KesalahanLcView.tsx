import React, { useState, useMemo, useRef } from 'react';
import { Staff, KesalahanLcRecord, sortByJabatan } from '../types';
import { 
  Search, 
  Trash2, 
  PlusCircle, 
  FileText, 
  Calendar, 
  Layers, 
  Info,
  CheckCircle,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  Eye,
  Camera
} from 'lucide-react';

interface KesalahanLcViewProps {
  staffList: Staff[];
  kesalahanLcRecords: KesalahanLcRecord[];
  onAddRecord: (newRecord: Omit<KesalahanLcRecord, 'id'>) => void;
  onDeleteRecord: (id: string) => void;
  currentTime: Date;
}

export default function KesalahanLcView({
  staffList,
  kesalahanLcRecords,
  onAddRecord,
  onDeleteRecord,
  currentTime
}: KesalahanLcViewProps) {
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal / Add Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetStaffId, setTargetStaffId] = useState<string>(staffList[0]?.id || '');
  const [recordDate, setRecordDate] = useState<string>(currentTime.toISOString().split('T')[0]);
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [formError, setFormError] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Active Image Modal for zooming screenshot
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local image upload as base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setScreenshotUrl(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!targetStaffId) {
      setFormError('Silakan pilih staff terlebih dahulu.');
      return;
    }
    if (!recordDate) {
      setFormError('Silakan masukkan tanggal.');
      return;
    }
    if (!keterangan.trim()) {
      setFormError('Silakan isi keterangan kesalahan.');
      return;
    }

    // Combine Date and Screenshot URL into the required "TANGGAL / SCREENSHOOT" format
    // Format: YYYY-MM-DD | [URL or base64]
    const tanggalScreenshootCombined = screenshotUrl.trim() 
      ? `${recordDate} | ${screenshotUrl.trim()}`
      : `${recordDate} | NO_SCREENSHOT`;

    onAddRecord({
      staffId: targetStaffId,
      tanggalScreenshoot: tanggalScreenshootCombined,
      keterangan: keterangan.trim()
    });

    // Reset and close
    setScreenshotUrl('');
    setKeterangan('');
    setFormError('');
    setIsModalOpen(false);
  };

  const handleOpenAddModal = (staffId?: string) => {
    if (staffId) {
      setTargetStaffId(staffId);
    } else if (staffList.length > 0) {
      setTargetStaffId(staffList[0].id);
    }
    setRecordDate(currentTime.toISOString().split('T')[0]);
    setScreenshotUrl('');
    setKeterangan('');
    setFormError('');
    setIsModalOpen(true);
  };

  // Filter records based on search query
  const filteredRecords = useMemo(() => {
    return kesalahanLcRecords.filter(rec => {
      const staff = staffList.find(s => s.id === rec.staffId);
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        (staff?.namaAllStaff || '').toLowerCase().includes(q) ||
        rec.keterangan.toLowerCase().includes(q) ||
        rec.tanggalScreenshoot.toLowerCase().includes(q)
      );
    });
  }, [kesalahanLcRecords, staffList, searchQuery]);

  // Helper to parse combined TANGGAL / SCREENSHOOT string
  const parseTanggalScreenshoot = (str: string) => {
    if (!str) return { date: '-', isImage: false, url: '' };
    
    // Check if it contains '|' delimiter
    if (str.includes('|')) {
      const parts = str.split('|');
      const datePart = parts[0].trim();
      const urlPart = parts[1].trim();

      const isImage = urlPart !== 'NO_SCREENSHOT' && (
        urlPart.startsWith('data:image/') || 
        urlPart.startsWith('http://') || 
        urlPart.startsWith('https://')
      );

      return {
        date: datePart,
        isImage,
        url: urlPart !== 'NO_SCREENSHOT' ? urlPart : ''
      };
    }

    // Fallback if raw date or URL stored
    const isImage = str.startsWith('data:image/') || str.startsWith('http://') || str.startsWith('https://');
    return {
      date: isImage ? '-' : str,
      isImage,
      url: isImage ? str : ''
    };
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-pink-400 font-bold uppercase tracking-widest font-mono">
              DATABASE KHUSUS LC
            </span>
            <h2 className="text-xl font-extrabold tracking-tight font-display flex items-center gap-2">
              <Camera className="w-5 h-5 text-pink-500" />
              KESALAHAN LC
            </h2>
            <p className="text-xs text-slate-400 max-w-xl">
              Catatan khusus kesalahan Lady Companion (LC) lengkap dengan lampiran bukti screenshot dan keterangan kronologi.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => handleOpenAddModal()}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 active:bg-pink-850 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-md hover:shadow-pink-500/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Kesalahan LC</span>
            </button>
          </div>
        </div>
      </div>

      {/* SEARCH AND BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-xs">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama staff / keterangan kesalahan LC..."
            className="w-full text-xs border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-pink-500 placeholder-slate-400"
          />
        </div>

        <div className="text-[10px] text-slate-400 font-mono">
          Menampilkan: {filteredRecords.length} records dari Google Sheet KESALAHAN LC
        </div>
      </div>

      {/* TABLE DATA REPRESENTATION */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-pink-500" />
            Tabel Data Kesalahan LC
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider font-sans text-center">
                <th className="py-2.5 px-3 border-r border-slate-200/60 text-center w-12 min-w-[48px] max-w-[48px] bg-slate-100">NO</th>
                <th className="py-2.5 px-3 border-r border-slate-200/60 w-[240px] min-w-[240px] max-w-[240px] bg-slate-100 text-left">NAMA STAFF</th>
                <th className="py-2.5 px-3 border-r border-slate-200/60 text-center w-[200px] min-w-[200px]">TANGGAL / SCREENSHOOT</th>
                <th className="py-2.5 px-3 border-r border-slate-200/60 text-left">KETERANGAN</th>
                <th className="py-2.5 px-3 text-center w-20">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-sans">
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle className="w-8 h-8 text-emerald-400 animate-pulse" />
                      <p className="text-xs font-bold text-slate-600">Alhamdulillah, tidak ada data kesalahan LC.</p>
                      <p className="text-[10px] text-slate-400">Semua aman terkendali.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec, idx) => {
                  const staff = staffList.find(s => s.id === rec.staffId);
                  const parsed = parseTanggalScreenshoot(rec.tanggalScreenshoot);
                  
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors text-xs font-sans group">
                      {/* NO */}
                      <td className="py-3 px-3 border-r border-slate-100/60 text-center font-mono text-slate-400 font-bold">
                        {idx + 1}
                      </td>

                      {/* NAMA STAFF */}
                      <td className="py-3 px-3 border-r border-slate-100/60 font-bold text-slate-950 w-[240px] min-w-[240px] max-w-[240px]">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-black text-[10px] shrink-0">
                            {(staff?.namaAllStaff || 'L').charAt(0).toUpperCase()}
                          </div>
                          <div className="truncate">
                            <span className="block text-slate-900 leading-tight truncate">
                              {staff?.namaAllStaff || 'Nama Tidak Ditemukan'}
                            </span>
                            <span className="block text-[9px] text-slate-400 font-mono truncate">
                              {staff?.nomorPasport || '-'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* TANGGAL / SCREENSHOOT */}
                      <td className="py-3 px-3 border-r border-slate-100/60 text-center w-[200px] min-w-[200px]">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          {parsed.date && (
                            <span className="text-xs font-mono font-bold text-slate-700">
                              {parsed.date}
                            </span>
                          )}
                          
                          {parsed.isImage ? (
                            <div className="relative group/screenshot flex-shrink-0">
                              <img 
                                src={parsed.url} 
                                alt="Screenshoot bukti" 
                                className="w-16 h-12 object-cover rounded border border-slate-200 shadow-sm cursor-zoom-in hover:border-pink-500 transition-colors"
                                onClick={() => setZoomImage(parsed.url)}
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/screenshot:opacity-100 flex items-center justify-center rounded transition-opacity duration-150 pointer-events-none">
                                <Eye className="w-3.5 h-3.5 text-white" />
                              </div>
                            </div>
                          ) : parsed.url ? (
                            <a 
                              href={parsed.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="inline-flex items-center gap-1 text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-200 hover:bg-sky-100 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Link Bukti
                            </a>
                          ) : (
                            <span className="text-[9px] text-slate-400 font-mono italic">
                              Tidak Ada Bukti
                            </span>
                          )}
                        </div>
                      </td>

                      {/* KETERANGAN */}
                      <td className="py-3 px-3 border-r border-slate-100/60 text-slate-700 font-medium whitespace-pre-wrap leading-normal">
                        {rec.keterangan || '-'}
                      </td>

                      {/* AKSI */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => {
                            if (window.confirm('Apakah Anda yakin ingin menghapus catatan kesalahan LC ini?')) {
                              onDeleteRecord(rec.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded border border-slate-200 hover:border-red-200 transition-all cursor-pointer"
                          title="Hapus Catatan"
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

      {/* ZOOM IMAGE MODAL */}
      {zoomImage && (
        <div 
          onClick={() => setZoomImage(null)}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[99999] flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-lg shadow-2xl border border-slate-800">
            <img 
              src={zoomImage} 
              alt="Screenshot bukti diperbesar" 
              className="max-w-full max-h-[80vh] object-contain mx-auto"
              referrerPolicy="no-referrer"
            />
            <p className="text-center text-xs text-slate-400 font-mono mt-3">
              Klik di mana saja untuk menutup pratinjau
            </p>
          </div>
        </div>
      )}

      {/* ADD KESALAHAN LC MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
            
            <div className="bg-pink-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-pink-200" />
                <h3 className="text-sm font-bold tracking-wide uppercase">Input Catatan Kesalahan LC</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white transition-colors cursor-pointer text-sm font-black"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 font-sans text-slate-800">
              
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 font-medium font-sans">
                  {formError}
                </div>
              )}

              {/* Staff Selector */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pilih Nama Staff</label>
                <select
                  value={targetStaffId}
                  onChange={(e) => setTargetStaffId(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-200 rounded px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-pink-500 text-slate-900"
                >
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.namaAllStaff} ({s.nomorPasport})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tanggal Kejadian</label>
                <input
                  type="date"
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                  className="w-full text-xs font-mono border border-slate-200 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-pink-500 text-slate-900"
                  required
                />
              </div>

              {/* Screenshot / Upload / Attachment */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Proof Screenshoot (Bukti Gambar)</label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 text-[10px] text-pink-600 hover:text-pink-800 font-bold"
                  >
                    <Upload className="w-3 h-3" />
                    Upload File Screenshot
                  </button>
                </div>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <input
                  type="text"
                  value={screenshotUrl}
                  onChange={(e) => setScreenshotUrl(e.target.value)}
                  placeholder="Atau tempel Link URL Gambar di sini (https://...)"
                  className="w-full text-xs border border-slate-200 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-pink-500 text-slate-900 font-mono"
                />

                {screenshotUrl && (
                  <div className="relative mt-2 p-1 border border-slate-100 rounded bg-slate-50 flex items-center gap-3">
                    {screenshotUrl.startsWith('data:image/') || screenshotUrl.startsWith('http') ? (
                      <img 
                        src={screenshotUrl} 
                        alt="Preview" 
                        className="w-12 h-10 object-cover rounded border"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-400 shrink-0" />
                    )}
                    <span className="text-[10px] font-mono text-slate-500 truncate flex-1">
                      {screenshotUrl}
                    </span>
                    <button
                      type="button"
                      onClick={() => setScreenshotUrl('')}
                      className="text-slate-400 hover:text-red-500 font-bold text-[10px] px-1.5"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Keterangan Kesalahan</label>
                <textarea
                  rows={3}
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Sebutkan jenis kesalahan LC atau kronologi kejadian..."
                  className="w-full text-xs border border-slate-200 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-pink-500 text-slate-900 placeholder-slate-400"
                  required
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
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 active:bg-pink-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer select-none"
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
