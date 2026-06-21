import React, { useState, useMemo } from 'react';
import { Staff, KesalahanLcRecord, sortByJabatan } from '../types';
import { 
  Search, 
  FileText, 
  CheckCircle,
  ExternalLink,
  Eye,
  Camera
} from 'lucide-react';

interface KesalahanLcViewProps {
  staffList: Staff[];
  kesalahanLcRecords: KesalahanLcRecord[];
}

export default function KesalahanLcView({
  staffList,
  kesalahanLcRecords
}: KesalahanLcViewProps) {
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('ALL');
  
  // Active Image Modal for zooming screenshot
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  // Helper to extract URLs from a string
  const extractUrls = (text: string): string[] => {
    if (!text) return [];
    const regex = /https?:\/\/[^\s|]+/g;
    const matches = text.match(regex);
    return matches ? matches.map(url => url.trim()) : [];
  };

  // Helper to render text with clickable URLs
  const renderTextWithLinks = (text: string) => {
    if (!text) return '-';
    
    const urlRegex = /(https?:\/\/[^\s|]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline break-all inline-flex items-center gap-0.5 font-semibold"
          >
            {part}
            <ExternalLink className="w-2.5 h-2.5 inline shrink-0" />
          </a>
        );
      }
      return part;
    });
  };

  // Helper to parse combined TANGGAL / SCREENSHOOT string
  const parseTanggalScreenshoot = (str: string) => {
    if (!str) return { date: '-', isPreviewImage: false, isLink: false, url: '', urls: [] as string[] };
    
    let datePart = '-';
    let urlPart = '';

    // Check if it contains '|' delimiter
    if (str.includes('|')) {
      const parts = str.split('|');
      datePart = parts[0].trim();
      urlPart = parts[1].trim();
    } else {
      // If it doesn't contain '|', check if there are URLs in the string
      const urls = extractUrls(str);
      if (urls.length > 0) {
        // Contains URLs, so date is '-' and URL part is the whole string
        datePart = '-';
        urlPart = str;
      } else {
        // No URLs, so it's just a date
        datePart = str;
        urlPart = '';
      }
    }

    const urls = extractUrls(urlPart);
    const hasUrls = urls.length > 0;

    // Check if there is exactly 1 URL and it is a direct image URL for preview
    const isPreviewImage = urls.length === 1 && (
      urls[0].startsWith('data:image/') ||
      /\.(png|jpe?g|gif|webp|bmp|svg)(\?.*)?$/i.test(urls[0])
    );

    return {
      date: datePart,
      isPreviewImage,
      isLink: hasUrls,
      url: urls.length === 1 ? urls[0] : urlPart,
      urls: urls
    };
  };

  const normalizeDateLabel = (value: string) => {
    const raw = (value || '').trim();
    if (!raw) return raw;

    const parsed = new Date(raw);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    }

    return raw.replace(/\s+/g, ' ');
  };

  const isDateHeaderRecord = (rec: KesalahanLcRecord, resolvedName: string) => {
    const rawTanggal = (rec.tanggalScreenshoot || '').trim();
    const rawName = (resolvedName || '').trim();
    const rawKet = (rec.keterangan || '').trim();
    const parsed = parseTanggalScreenshoot(rawTanggal);

    return Boolean(rawTanggal) && !rawName && !rawKet && !parsed.isLink && !parsed.isPreviewImage;
  };

  const getDatePrefix = (dateLabel: string) => {
    const label = (dateLabel || '').trim();
    const slashMatch = label.match(/^(\d{1,2})[\/\-]/);
    if (slashMatch) return String(Number(slashMatch[1]));

    const wordMatch = label.match(/^(\d{1,2})\s+/);
    if (wordMatch) return String(Number(wordMatch[1]));

    const parsed = new Date(label);
    if (!isNaN(parsed.getTime())) return String(parsed.getDate());

    return label;
  };

  const uniqueDates = useMemo(() => {
    const dates: string[] = [];
    let currentHeaderDate = '';
    
    for (const rec of kesalahanLcRecords) {
      const staff = staffList.find(s => s.id === rec.staffId);
      const resolvedName = (staff?.namaAllStaff || rec.namaStaff || '').trim();
      
      if (isDateHeaderRecord(rec, resolvedName)) {
        currentHeaderDate = normalizeDateLabel(rec.tanggalScreenshoot);
        if (currentHeaderDate && !dates.includes(currentHeaderDate)) {
          dates.push(currentHeaderDate);
        }
        continue;
      }
      
      const parsed = parseTanggalScreenshoot(rec.tanggalScreenshoot);
      const recordDate = currentHeaderDate || (parsed.date && parsed.date !== '-' ? normalizeDateLabel(parsed.date) : '');
      if (recordDate && recordDate !== '-' && !dates.includes(recordDate)) {
        dates.push(recordDate);
      }
    }
    return dates;
  }, [kesalahanLcRecords, staffList]);

  const displayRows = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const rows: Array<
      | { type: 'date'; key: string; label: string }
      | {
          type: 'record';
          key: string;
          nomor: string;
          rec: KesalahanLcRecord;
          displayName: string;
          displayPassport: string;
          parsed: ReturnType<typeof parseTanggalScreenshoot>;
        }
    > = [];

    let currentDateLabel = '';
    let currentDatePrefix = '';
    let runningIndex = 0;
    let renderedDateHeaderFor = '';

    for (const rec of kesalahanLcRecords) {
      const staff = staffList.find(s => s.id === rec.staffId);
      const resolvedName = (staff?.namaAllStaff || rec.namaStaff || '').trim();

      if (isDateHeaderRecord(rec, resolvedName)) {
        currentDateLabel = normalizeDateLabel(rec.tanggalScreenshoot);
        currentDatePrefix = getDatePrefix(currentDateLabel);
        runningIndex = 0;
        renderedDateHeaderFor = '';
        continue;
      }

      const displayName = resolvedName;
      const displayPassport = (staff?.nomorPasport || '').trim();
      const parsed = parseTanggalScreenshoot(rec.tanggalScreenshoot);

      const recordDate = currentDateLabel || (parsed.date && parsed.date !== '-' ? normalizeDateLabel(parsed.date) : '');

      // Filter by selected date
      if (selectedDateFilter !== 'ALL' && recordDate !== selectedDateFilter) {
        continue;
      }

      const searchableText = [
        displayName,
        displayPassport,
        rec.keterangan || '',
        rec.tanggalScreenshoot || ''
      ].join(' ').toLowerCase();

      if (q && !searchableText.includes(q)) {
        continue;
      }

      if (recordDate && renderedDateHeaderFor !== recordDate) {
        rows.push({
          type: 'date',
          key: `date-${recordDate}-${rows.length}`,
          label: recordDate
        });
        renderedDateHeaderFor = recordDate;
      }

      runningIndex += 1;
      rows.push({
        type: 'record',
        key: rec.id,
        nomor: currentDatePrefix ? `${currentDatePrefix}:${runningIndex}` : String(rows.filter(r => r.type === 'record').length + 1),
        rec,
        displayName: displayName || '-',
        displayPassport,
        parsed
      });
    }

    return rows;
  }, [kesalahanLcRecords, searchQuery, selectedDateFilter, staffList]);

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
              Halaman ini hanya menampilkan data kesalahan LC yang tersimpan di spreadsheet pada sheet `KESALAHAN LC`.
            </p>
          </div>
        </div>
      </div>

      {/* SEARCH AND BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-xs">
        <div className="flex flex-col sm:flex-row gap-2 flex-1 max-w-2xl">
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

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase font-mono shrink-0">Pilih Tanggal:</span>
            <select
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-pink-500 text-slate-700 cursor-pointer min-w-[150px]"
            >
              <option value="ALL">Semua Tanggal</option>
              {uniqueDates.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 font-mono">
          Menampilkan: {displayRows.filter(row => row.type === 'record').length} records dari Google Sheet KESALAHAN LC
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
                <th className="py-2.5 px-3 border-r border-slate-200/60 w-[240px] min-w-[240px] bg-slate-100 text-left">NAMA STAFF</th>
                <th className="py-2.5 px-3 border-r border-slate-200/60 text-center w-[200px] min-w-[200px]">TANGGAL / SCREENSHOOT</th>
                <th className="py-2.5 px-3 text-left">KETERANGAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayRows.filter(row => row.type === 'record').length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 font-sans">
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle className="w-8 h-8 text-emerald-400 animate-pulse" />
                      <p className="text-xs font-bold text-slate-600">Belum ada data kesalahan LC dari spreadsheet.</p>
                      <p className="text-[10px] text-slate-400">Pastikan sheet `KESALAHAN LC` sudah berisi data.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayRows.map((row) => {
                  if (row.type === 'date') {
                    return (
                      <tr key={row.key} className="bg-pink-50/60">
                        <td colSpan={4} className="py-2.5 px-3 font-bold text-pink-700 border-y border-pink-100 text-sm text-center">
                          {row.label}
                        </td>
                      </tr>
                    );
                  }

                  const { rec, parsed, displayName, displayPassport, nomor } = row;

                  return (
                    <tr key={row.key} className="hover:bg-slate-50/80 transition-colors text-xs font-sans group">
                      {/* NO */}
                      <td className="py-3 px-3 border-r border-slate-100/60 text-center font-mono text-slate-400 font-bold">
                        {nomor}
                      </td>

                      {/* NAMA STAFF */}
                      <td className="py-3 px-3 border-r border-slate-100/60 font-bold text-slate-950 w-[240px] min-w-[240px]">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-black text-[10px] shrink-0">
                            {(displayName || 'L').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="block text-slate-900 leading-tight whitespace-normal break-words">
                              {displayName}
                            </span>
                            {displayPassport ? (
                              <span className="block text-[9px] text-slate-400 font-mono whitespace-normal break-all">
                                {displayPassport}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      {/* TANGGAL / SCREENSHOOT */}
                      <td className="py-3 px-3 border-r border-slate-100/60 text-center w-[200px] min-w-[200px]">
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          {parsed.date && parsed.date !== '-' && (
                            <span className="text-xs font-mono font-bold text-slate-700">
                              {parsed.date}
                            </span>
                          )}
                          
                          {parsed.isPreviewImage ? (
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
                          ) : parsed.urls && parsed.urls.length > 0 ? (
                            <div className="flex flex-col gap-1 items-center">
                              {parsed.urls.map((urlStr, idx) => (
                                <a 
                                  key={idx}
                                  href={urlStr} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="inline-flex items-center gap-1 text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-200 hover:bg-sky-100 transition-colors font-semibold"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Link Bukti {parsed.urls.length > 1 ? idx + 1 : ''}
                                </a>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[9px] text-slate-400 font-mono italic">
                              Tidak Ada Bukti
                            </span>
                          )}
                        </div>
                      </td>

                      {/* KETERANGAN */}
                      <td className="py-3 px-3 text-slate-700 font-medium whitespace-pre-wrap leading-normal">
                        {renderTextWithLinks(rec.keterangan)}
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

    </div>
  );
}
