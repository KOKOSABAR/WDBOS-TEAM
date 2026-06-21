/**
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
 * Format helper untuk Date agar aman dibaca dwi-arah
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
}
