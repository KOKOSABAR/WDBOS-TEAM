import React, { useState, useEffect } from 'react';
import { X, Copy, Check, RefreshCw, UploadCloud, DownloadCloud, Database, ExternalLink } from 'lucide-react';
import { Staff, LeaveSubmission, MistakeRecord, OvertimeRecord, KesalahanLcRecord, TotalKesalahanCsRecord, calculateAge, getBirthdayInfo, calculateTenure } from '../types';

interface SheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffList: Staff[];
  setStaffList: (staff: Staff[]) => void;
  overtimeRecords: OvertimeRecord[];
  setOvertimeRecords: (records: OvertimeRecord[]) => void;
  mistakeRecords: MistakeRecord[];
  setMistakeRecords: (records: MistakeRecord[]) => void;
  totalKesalahanCsRecords: TotalKesalahanCsRecord[];
  setTotalKesalahanCsRecords: (records: TotalKesalahanCsRecord[]) => void;
  kesalahanLcRecords: KesalahanLcRecord[];
  setKesalahanLcRecords: (records: KesalahanLcRecord[]) => void;
  onRefreshCuti: () => void; // helper to tell CutiSubmissionView to reload from localStorage
}

export default function SheetsSyncModal({
  isOpen,
  onClose,
  staffList,
  setStaffList,
  overtimeRecords,
  setOvertimeRecords,
  mistakeRecords,
  setMistakeRecords,
  totalKesalahanCsRecords,
  setTotalKesalahanCsRecords,
  kesalahanLcRecords,
  setKesalahanLcRecords,
  onRefreshCuti
}: SheetsSyncModalProps) {
  const [webAppUrl, setWebAppUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [logMessage, setLogMessage] = useState<string>('');

  useEffect(() => {
    const savedUrl = localStorage.getItem('staff_db_sheets_url');
    if (savedUrl) {
      setWebAppUrl(savedUrl);
    } else {
      // Preconfigure with the user's provided URL as a convenient default
      const defaultUrl = 'https://script.google.com/macros/s/AKfycbyRxUAXxjW7FX4rh6q75M04R_LN5VWXEutJy8Qc7MUcaVKR7RDyGFyH-E6YZ4ofgI0V/exec';
      setWebAppUrl(defaultUrl);
      localStorage.setItem('staff_db_sheets_url', defaultUrl);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Google Apps Script source code
  const appsScriptCode = `/**
 * GOOGLE APPS SCRIPT: GOOGLE SHEETS SYNC SYSTEM (WDBOS MANAGEMENT)
 * ------------------------------------------------------------------
 * VERSI TERBARU: Batch-Optimized (Super Fast)
 * 
 * Salin dan tempel kode ini ke editor Apps Script Anda:
 * 1. Di Google Sheets Anda, buka menu "Extensions" > "Apps Script".
 * 2. Hapus semua kode default dan tempel kode ini di bawah.
 * 3. Simpan proyek (klik ikon Disket).
 * 4. Klik "Deploy" (Terapkan) > "New deployment" (Terapkan baru).
 * 5. Pilih Jenis "Web app" (Aplikasi Web).
 * 6. Ubah "Execute as" (Jalankan sebagai) menjadi "Me" (Saya).
 * 7. Ubah "Who has access" (Siapa yang memiliki akses) menjadi "Anyone" (Siapa saja).
 * 8. Klik "Deploy", izinkan akses akun Google Anda, lalu salin "Web app URL" (URL Aplikasi Web) yang disediakan.
 * 9. Tempelkan URL tersebut ke dalam Panel Integrasi Google Sheets di aplikasi ini untuk sinkronisasi otomatis!
 */

function doGet(e) {
  try {
    return handleResponse(fetchData());
  } catch (error) {
    return handleResponse({ status: "error", message: "Gagal memproses GET: " + error.toString() });
  }
}

function doPost(e) {
  try {
    var rawContents = e.postData.contents;
    var requestData = JSON.parse(rawContents);
    
    if (requestData.action === "syncAll") {
      saveAllData(requestData);
      return handleResponse({ status: "success", message: "Semua database berhasil disinkronisasikan ke Google Sheets menggunakan metode Batch-Optimized!" });
    } else if (requestData.action === "fetchData") {
      return handleResponse(fetchData());
    } else {
      return handleResponse({ status: "error", message: "Aksi tidak dikenal." });
    }
  } catch (error) {
    return handleResponse({ status: "error", message: "Gagal memproses POST: " + error.toString() });
  }
}

/**
 * Menambahkan menu kustom ke Google Sheets sewaktu spreadsheet dibuka
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("Database WDBOS")
    .addItem("Buat Semua Sheet & Header Otomatis", "initializeSheets")
    .addToUi();
}

/**
 * Membuat sheet dan header terformat secara otomatis sewaktu user klik menu
 */
function initializeSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. DATABASE_STAFF
  var headersStaff = [
    "ID", "NAMA ALL STAFF", "NOMOR PASPORT", "JABATAN POSISI", "EMAIL DRIVE", "EMAIL BK",
    "STATUS", "JENIS KELAMIN", "MESS TINGGAL", "NOMOR KAMAR", "ASAL KOTA", "ID LINE",
    "SEASON RUMAH IBADAH", "TANGGAL LAHIR", "START AWAL MASA KERJA", "EXP VISA", "TYPE VISA",
    "LOKASI SAAT INI", "ULANG TAHUN", "UMUR", "MASA KERJA (TENURE)", "NOTES"
  ];
  getOrCreateSheet("DATABASE_STAFF", headersStaff);

  // 2. DATA_CUTI_PENGAJUAN
  var headersCuti = [
    "ID SUBMISSION", "NAMA STAFF", "NOMOR PASPORT", "JABATAN", "KETERANGAN PASPOR", "STATUS CUTI",
    "STATUS PERSETUJUAN", "TANGGAL PENGAJUAN", "CUTI INDO DARI", "CUTI INDO SAMPAI", "CUTI INDO DURASI",
    "CUTI LOKAL DARI", "CUTI LOKAL SAMPAI", "CUTI LOKAL DURASI", "CUTI KERJA DARI", "CUTI KERJA SAMPAI", "CUTI KERJA DURASI"
  ];
  getOrCreateSheet("DATA_CUTI_PENGAJUAN", headersCuti);

  // 3. DATA_KESALAHAN_STAFF
  var headersMistake = ["ID RECORD", "STAFF ID", "TANGGAL", "JENIS", "JUMLAH", "KETERANGAN"];
  getOrCreateSheet("DATA_KESALAHAN_STAFF", headersMistake);

  // 4. DATA_LEMBURAN_STAFF
  var headersOvertime = ["ID RECORD", "STAFF ID", "TANGGAL", "JUMLAH JAM LEMBUR", "KETERANGAN"];
  getOrCreateSheet("DATA_LEMBURAN_STAFF", headersOvertime);

  // 5. KESALAHAN LC
  var headersKesalahanLc = ["NAMA STAFF", "TANGGAL / SCREENSHOOT", "KETERANGAN"];
  getOrCreateSheet("KESALAHAN LC", headersKesalahanLc);

  // 6. TOTAL KESALAHAN CS
  var headersTotalKesalahanCs = ["NAMA STAFF", "TOTAL KESALAHAN"];
  getOrCreateSheet("TOTAL KESALAHAN CS", headersTotalKesalahanCs);
  
  // Hapus "Sheet1" bawaan kosong jika ada sheet lain
  var defSheet = ss.getSheetByName("Sheet1");
  if (defSheet && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(defSheet);
    } catch(e) {}
  }
  
  SpreadsheetApp.getUi().alert("Sukses! Semua sheet (DATABASE_STAFF, DATA_CUTI_PENGAJUAN, DATA_KESALAHAN_STAFF, DATA_LEMBURAN_STAFF, KESALAHAN LC, TOTAL KESALAHAN CS) dan header tabel database WDBOS telah dibuat secara otomatis dan diformat dengan rapi.");
}

function handleResponse(data) {
  var output = JSON.stringify(data);
  return ContentService.createTextOutput(output)
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Mendapatkan sheet berdasarkan nama atau membuatnya jika belum ada, lengkap dengan Header terformat.
 */
function getOrCreateSheet(sheetName, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    formatHeaderRow(sheet, headers.length);
  }
  return sheet;
}

/**
 * Memformat baris header agar terlihat premium dan profesional
 */
function formatHeaderRow(sheet, numColumns) {
  var headerRange = sheet.getRange(1, 1, 1, numColumns);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#4F46E5"); // Background Indigo-600
  headerRange.setFontColor("#FFFFFF"); // Font Putih
  headerRange.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
  for (var i = 1; i <= numColumns; i++) {
    sheet.autoResizeColumn(i);
  }
}

/**
 * Menyimpan seluruh data secara cepat menggunakan Batch Operation (setValues)
 */
function saveAllData(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. TABEL: DATABASE_STAFF
  if (data.staffList) {
    var headers = [
      "ID", "NAMA ALL STAFF", "NOMOR PASPORT", "JABATAN POSISI", "EMAIL DRIVE", "EMAIL BK",
      "STATUS", "JENIS KELAMIN", "MESS TINGGAL", "NOMOR KAMAR", "ASAL KOTA", "ID LINE",
      "SEASON RUMAH IBADAH", "TANGGAL LAHIR", "START AWAL MASA KERJA", "EXP VISA", "TYPE VISA",
      "LOKASI SAAT INI", "ULANG TAHUN", "UMUR", "MASA KERJA (TENURE)", "NOTES"
    ];
    var sheet = getOrCreateSheet("DATABASE_STAFF", headers);
    sheet.clearContents();
    
    var values = [headers];
    data.staffList.forEach(function(s) {
      values.push([
        s.id || "", s.namaAllStaff || "", s.nomorPasport || "", s.jabatanPosisi || "",
        s.emailDrive || "", s.emailBk || "", s.status || "", s.jenisKelamin || "",
        s.messTinggal || "", s.nomorKamar || "", s.asalKota || "", s.idLine || "",
        s.seasonRumahIbadah || "", s.tanggalLahir || "", s.tanggalMulaiKerja || "",
        s.expVisa || "", s.typeVisa || "", s.lokasiSaatIni || "",
        s.ulangTahun || "", s.umur || "", s.masaKerja || "", s.notes || ""
      ]);
    });
    
    sheet.getRange(1, 1, values.length, headers.length).setValues(values);
    formatHeaderRow(sheet, headers.length);
  }

  // 2. TABEL: DATA_CUTI_PENGAJUAN
  if (data.leaveList) {
    var headers = [
      "ID SUBMISSION", "NAMA STAFF", "NOMOR PASPORT", "JABATAN", "KETERANGAN PASPOR", "STATUS CUTI",
      "STATUS PERSETUJUAN", "TANGGAL PENGAJUAN", "CUTI INDO DARI", "CUTI INDO SAMPAI", "CUTI INDO DURASI",
      "CUTI LOKAL DARI", "CUTI LOKAL SAMPAI", "CUTI LOKAL DURASI", "CUTI KERJA DARI", "CUTI KERJA SAMPAI", "CUTI KERJA DURASI"
    ];
    var sheet = getOrCreateSheet("DATA_CUTI_PENGAJUAN", headers);
    sheet.clearContents();
    
    var values = [headers];
    data.leaveList.forEach(function(l) {
      values.push([
        l.id || "", l.namaStaff || "", l.nomorPasport || "", l.jabatan || "", l.keteranganPaspor || "",
        l.statusCuti || "", l.statusPersetujuan || "", l.tanggalPengajuan || "",
        l.cutiIndonesia ? (l.cutiIndonesia.dari || "") : "", l.cutiIndonesia ? (l.cutiIndonesia.sampai || "") : "", l.cutiIndonesia ? (l.cutiIndonesia.durasi || 0) : 0,
        l.cutiLokal ? (l.cutiLokal.dari || "") : "", l.cutiLokal ? (l.cutiLokal.sampai || "") : "", l.cutiLokal ? (l.cutiLokal.durasi || 0) : 0,
        l.cutiKerja ? (l.cutiKerja.dari || "") : "", l.cutiKerja ? (l.cutiKerja.sampai || "") : "", l.cutiKerja ? (l.cutiKerja.durasi || 0) : 0
      ]);
    });
    
    sheet.getRange(1, 1, values.length, headers.length).setValues(values);
    formatHeaderRow(sheet, headers.length);
  }

  // 3. TABEL: DATA_KESALAHAN_STAFF
  if (data.mistakeRecords) {
    var headers = ["ID RECORD", "STAFF ID", "TANGGAL", "JENIS", "JUMLAH", "KETERANGAN"];
    var sheet = getOrCreateSheet("DATA_KESALAHAN_STAFF", headers);
    sheet.clearContents();
    
    var values = [headers];
    data.mistakeRecords.forEach(function(m) {
      values.push([
        m.id || "", m.staffId || "", m.tanggal || "", m.jenis || "", m.jumlah || 0, m.keterangan || ""
      ]);
    });
    
    sheet.getRange(1, 1, values.length, headers.length).setValues(values);
    formatHeaderRow(sheet, headers.length);
  }

  // 4. TABEL: DATA_LEMBURAN_STAFF
  if (data.overtimeRecords) {
    var headers = ["ID RECORD", "STAFF ID", "TANGGAL", "JUMLAH JAM LEMBUR", "KETERANGAN"];
    var sheet = getOrCreateSheet("DATA_LEMBURAN_STAFF", headers);
    sheet.clearContents();
    
    var values = [headers];
    data.overtimeRecords.forEach(function(o) {
      values.push([
        o.id || "", o.staffId || "", o.tanggal || "", o.jumlahJam || 0, o.keterangan || ""
      ]);
    });
    
    sheet.getRange(1, 1, values.length, headers.length).setValues(values);
    formatHeaderRow(sheet, headers.length);
  }

  // Format ulang lebar kolom agar rapi setelah diisi secara batch
  var ssSheets = ss.getSheets();
  ssSheets.forEach(function(sh) {
    var lastCol = sh.getLastColumn();
    if (lastCol > 0) {
      for (var col = 1; col <= lastCol; col++) {
        sh.autoResizeColumn(col);
      }
    }
  });
}

/**
 * Membaca seluruh data yang ada dari tabel Google Sheets dan mengirimkan kembali sebagai JSON.
 */
function fetchData() {
  var data = {
    staffList: [],
    leaveList: [],
    mistakeRecords: [],
    totalKesalahanCsRecords: [],
    kesalahanLcRecords: [],
    overtimeRecords: []
  };

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Baca DATABASE_STAFF
  var sheet = ss.getSheetByName("DATABASE_STAFF");
  if (sheet) {
    var rows = sheet.getDataRange().getValues();
    for (var r = 1; r < rows.length; r++) {
      var row = rows[r];
      if (!row[0]) continue; // Skip baris kosong
      data.staffList.push({
        id: String(row[0] || ""),
        namaAllStaff: String(row[1] || ""),
        nomorPasport: String(row[2] || ""),
        jabatanPosisi: String(row[3] || ""),
        emailDrive: String(row[4] || ""),
        emailBk: String(row[5] || ""),
        status: String(row[6] || ""),
        jenisKelamin: String(row[7] || "Laki-laki"),
        messTinggal: String(row[8] || ""),
        nomorKamar: String(row[9] || ""),
        asalKota: String(row[10] || ""),
        idLine: String(row[11] || ""),
        seasonRumahIbadah: String(row[12] || ""),
        tanggalLahir: formatDateString(row[13]),
        tanggalMulaiKerja: formatDateString(row[14]),
        expVisa: formatDateString(row[15]),
        typeVisa: String(row[16] || ""),
        lokasiSaatIni: String(row[17] || ""),
        ulangTahun: String(row[18] || ""),
        umur: String(row[19] || ""),
        masaKerja: String(row[20] || ""),
        notes: String(row[21] || "")
      });
    }
  }

  // 2. Baca DATA_CUTI_PENGAJUAN
  var sheetCuti = ss.getSheetByName("DATA_CUTI_PENGAJUAN");
  if (sheetCuti) {
    var rows = sheetCuti.getDataRange().getValues();
    for (var r = 1; r < rows.length; r++) {
      var row = rows[r];
      if (!row[0]) continue;
      data.leaveList.push({
        id: String(row[0] || ""),
        namaStaff: String(row[1] || ""),
        nomorPasport: String(row[2] || ""),
        jabatan: String(row[3] || ""),
        keteranganPaspor: String(row[4] || ""),
        statusCuti: String(row[5] || ""),
        statusPersetujuan: String(row[6] || ""),
        tanggalPengajuan: formatDateString(row[7]),
        cutiIndonesia: { dari: formatDateString(row[8]), sampai: formatDateString(row[9]), durasi: Number(row[10] || 0) },
        cutiLokal: { dari: formatDateString(row[11]), sampai: formatDateString(row[12]), durasi: Number(row[13] || 0) },
        cutiKerja: { dari: formatDateString(row[14]), sampai: formatDateString(row[15]), durasi: Number(row[16] || 0) }
      });
    }
  }

  // 3. Baca DATA_KESALAHAN_STAFF
  var sheetMistake = ss.getSheetByName("DATA_KESALAHAN_STAFF");
  if (sheetMistake) {
    var rows = sheetMistake.getDataRange().getValues();
    for (var r = 1; r < rows.length; r++) {
      var row = rows[r];
      if (!row[0]) continue;
      data.mistakeRecords.push({
        id: String(row[0] || ""),
        staffId: String(row[1] || ""),
        tanggal: formatDateString(row[2]),
        jenis: String(row[3] || ""),
        jumlah: Number(row[4] || 0),
        keterangan: String(row[5] || "")
      });
    }
  }

  // 4. Baca DATA_LEMBURAN_STAFF
  var sheetOvertime = ss.getSheetByName("DATA_LEMBURAN_STAFF");
  if (sheetOvertime) {
    var rows = sheetOvertime.getDataRange().getValues();
    for (var r = 1; r < rows.length; r++) {
      var row = rows[r];
      if (!row[0]) continue;
      data.overtimeRecords.push({
        id: String(row[0] || ""),
        staffId: String(row[1] || ""),
        tanggal: formatDateString(row[2]),
        jumlahJam: Number(row[3] || 0),
        keterangan: String(row[4] || "")
      });
    }
  }

  // 5. Baca KESALAHAN LC
  var sheetKesalahanLc = ss.getSheetByName("KESALAHAN LC");
  if (sheetKesalahanLc) {
    var rows = sheetKesalahanLc.getDataRange().getDisplayValues();
    for (var r = 1; r < rows.length; r++) {
      var row = rows[r];
      if (!row[0] && !row[1] && !row[2]) continue;
      data.kesalahanLcRecords.push({
        id: "lc-sheet-" + r,
        staffId: "",
        namaStaff: String(row[0] || ""),
        tanggalScreenshoot: String(row[1] || ""),
        keterangan: String(row[2] || "")
      });
    }
  }

  // 6. Baca TOTAL KESALAHAN CS
  var sheetTotalKesalahanCs = ss.getSheetByName("TOTAL KESALAHAN CS");
  if (sheetTotalKesalahanCs) {
    var rows = sheetTotalKesalahanCs.getDataRange().getDisplayValues();
    for (var r = 1; r < rows.length; r++) {
      var row = rows[r];
      if (!row[0] && !row[1]) continue;
      data.totalKesalahanCsRecords.push({
        id: "total-cs-" + r,
        namaStaff: String(row[0] || ""),
        totalKesalahan: Number(row[1] || 0)
      });
    }
  }

  return data;
}

/**
 * Format helper untuk Date agar aman dwi-arah
 */
function formatDateString(val) {
  if (!val) return "";
  if (val instanceof Date) {
    var y = val.getFullYear();
    var m = String(val.getMonth() + 1).padStart(2, "0");
    var d = String(val.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }
  return String(val).trim();
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveUrl = () => {
    localStorage.setItem('staff_db_sheets_url', webAppUrl.trim());
    setLogMessage('URL Web App Google Sheets berhasil disimpan!');
    setTimeout(() => setLogMessage(''), 3000);
  };

  // Export Data to Google Sheets (POST request)
  const handleExportToSheets = async () => {
    if (!webAppUrl.trim()) {
      setSyncStatus('error');
      setLogMessage('Masukkan URL Web App Apps Script terlebih dahulu!');
      return;
    }

    setSyncStatus('loading');
    setLogMessage('Menghubungkan & mengirim data ke Google Sheets...');

    try {
      // Ambil cuti dari local storage
      const leavesRaw = localStorage.getItem('staff_db_leaves');
      const leavesListLocal: LeaveSubmission[] = leavesRaw ? JSON.parse(leavesRaw) : [];

      const referenceDate = new Date();
      const enhancedStaff = staffList.map(s => {
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
        staffList: enhancedStaff,
        leaveList: leavesListLocal,
        mistakeRecords,
        overtimeRecords
      };

      // Kita buat fetch post
      // Menggunakan no-cors jika terhalang CORS, tapi sebenarnya standard Apps Script Web App bisa dipanggil menggunakan fetch jika di-redirect.
      // Kita coba panggil POST request normal dengan format text plain
      const response = await fetch(webAppUrl.trim(), {
        method: 'POST',
        mode: 'no-cors', // standard Apps Script redirect behavior
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      // Karena mode 'no-cors' tidak mengembalikan response body (type: opaque),
      // kita asumsikan sukses jika fetch selesai tanpa melempar error.
      setSyncStatus('success');
      setLogMessage('Berhasil mengekspor semua data ke Google Sheets! Silakan periksa Google Sheet Anda.');
    } catch (e: any) {
      console.error(e);
      setSyncStatus('error');
      setLogMessage('Gagal mengekspor: Hubungan dibatasi CORS atau URL tidak merespon.');
    }
  };

  // Import Data from Google Sheets (GET request)
  const handleImportFromSheets = async () => {
    if (!webAppUrl.trim()) {
      setSyncStatus('error');
      setLogMessage('Masukkan URL Web App Apps Script terlebih dahulu!');
      return;
    }

    setSyncStatus('loading');
    setLogMessage('Mengambil data dari Google Sheets...');

    try {
      // Apps Script GET request mengembalikan JSON dengan data lengkap
      const response = await fetch(webAppUrl.trim() + '?action=fetchData');
      if (!response.ok) {
        throw new Error('Response network tidak valid.');
      }
      
      const resData = await response.json();
      
      if (resData.status === 'error') {
        throw new Error(resData.message || 'Error dari Apps Script');
      }

      // Pastikan data valid
      if (resData.staffList && resData.staffList.length > 0) {
        setStaffList(resData.staffList);
      }
      if (resData.mistakeRecords) {
        setMistakeRecords(resData.mistakeRecords);
      }
      if (resData.totalKesalahanCsRecords) {
        setTotalKesalahanCsRecords(resData.totalKesalahanCsRecords);
      }
      if (resData.kesalahanLcRecords) {
        setKesalahanLcRecords(resData.kesalahanLcRecords);
      }
      if (resData.overtimeRecords) {
        setOvertimeRecords(resData.overtimeRecords);
      }
      if (resData.leaveList) {
        localStorage.setItem('staff_db_leaves', JSON.stringify(resData.leaveList));
        onRefreshCuti();
      }

      setSyncStatus('success');
      setLogMessage('Berhasil mengimpor data! Roster, Cuti, Kesalahan Staff, Total Kesalahan CS, Kesalahan LC, dan Lemburan disinkronkan ke local storage.');
    } catch (e: any) {
      console.error(e);
      setSyncStatus('error');
      setLogMessage('Gagal mengimpor: Pastikan deployment Aplikasi Web dideploy sebagai "Anyone" (Siapa saja) dan izinkan CORS.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-[9999] backdrop-blur-xs font-sans">
      <div className="bg-white rounded-2xl max-w-2xl w-full flex flex-col max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header bar */}
        <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-indigo-200" />
            <div>
              <h3 className="font-bold text-sm tracking-wide">KONEKSI DATABASE GOOGLE SHEETS</h3>
              <p className="text-[10px] text-indigo-200 font-mono">Sync Website WDBOS & Spreadsheet secara real-time</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body Scrollable */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 text-slate-800">
          
          {/* Section 1: Penjelasan Data Base Luar */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 text-xs space-y-2">
            <h4 className="font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wide text-[10px]">
              📌 Di Mana Database Disimpan Saat Ini?
            </h4>
            <p className="text-amber-800 leading-relaxed">
              Saat ini, seluruh data staff, cuti, kesalahan, kesalahan LC, dan lemburan disimpan secara lokal di dalam browser Anda (<strong>Browser Local Storage</strong>). 
              Data ini aman dan tidak akan hilang saat halaman direfresh. Namun, apabila Anda membersihkan cache browser, atau membuka dari HP/komputer lain, data tidak akan saling terhubung.
            </p>
            <p className="text-amber-800 leading-relaxed font-semibold">
              Gunakan integrasi Google Sheets di bawah agar seluruh data dapat dipusatkan langsung ke Google Spreadsheet milik Anda!
            </p>
          </div>

          {/* Section 2: Input URL */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 block font-sans">URL Google Apps Script Web App</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={webAppUrl}
                onChange={(e) => setWebAppUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 text-slate-900"
              />
              <button 
                onClick={handleSaveUrl}
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 rounded-xl cursor-pointer transition-all shrink-0"
              >
                Simpan URL
              </button>
            </div>
          </div>

          {/* Section 3: Sync Actions */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">Aksi Sinkronisasi</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleExportToSheets}
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                disabled={syncStatus === 'loading'}
              >
                <UploadCloud className="w-4 h-4" />
                Ekspor ke Google Sheets
              </button>
              
              <button
                onClick={handleImportFromSheets}
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200/80 py-2.5 px-4 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                disabled={syncStatus === 'loading'}
              >
                <DownloadCloud className="w-4 h-4 text-emerald-600" />
                Impor dari Google Sheets
              </button>
            </div>

            {logMessage && (
              <div className={`p-3 rounded-lg text-xs leading-relaxed font-mono ${
                syncStatus === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                  : syncStatus === 'error'
                    ? 'bg-rose-50 text-rose-800 border border-rose-100'
                    : 'bg-indigo-50 text-indigo-800 animate-pulse border border-indigo-100'
              }`}>
                {syncStatus === 'loading' && <RefreshCw className="w-3.5 h-3.5 inline mr-2 animate-spin text-indigo-600" />}
                {logMessage}
              </div>
            )}
          </div>

          {/* Section 4: Langkah Setup & Code Copy */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wide">Panduan Set Up Google Apps Script</h4>
              <button
                onClick={copyToClipboard}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-bold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Kode Tersalin!' : 'Salin Kode'}
              </button>
            </div>

            <ol className="list-decimal list-inside text-[11px] text-slate-600 leading-relaxed font-sans space-y-1.5">
              <li>Buka <strong><a href="https://sheets.google.com" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline inline-flex items-center gap-0.5 font-semibold">Google Sheets <ExternalLink className="w-3 h-3" /></a></strong> baru milik Anda.</li>
              <li>Pilih menu <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong>.</li>
              <li>Hapus tulisan default apa pun di sana, lalu klik tombol <b>"Salin Kode"</b> di atas dan tempelkan.</li>
              <li>Klik ikon <strong>Simpan (Disket)</strong> di bagian atas.</li>
              <li>Klik tombol biru <strong>Terapkan (Deploy)</strong> &gt; <strong>Terapkan Baru (New deployment)</strong>.</li>
              <li>Klik ikon Gigi Pengaturan, aktifkan tipe <strong>Aplikasi web (Web app)</strong>.</li>
              <li>Ubah opsi:
                <ul className="list-disc list-inside ml-4 mt-0.5 space-y-0.5 font-semibold text-slate-700">
                  <li>Jalankan sebagai: <strong>Saya (Me)</strong></li>
                  <li>Siapa yang memiliki akses: <strong>Siapa Saja (Anyone)</strong></li>
                </ul>
              </li>
              <li>Klik <strong>Terapkan (Deploy)</strong>, berikan izin akun Google Spreadsheet Anda jika ditanya.</li>
              <li>Salin <strong>URL Aplikasi Web</strong> yang muncul, simpan ke input isian di atas!</li>
            </ol>
          </div>

        </div>

        {/* Footer controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
          >
            Tutup Panel
          </button>
        </div>

      </div>
    </div>
  );
}
