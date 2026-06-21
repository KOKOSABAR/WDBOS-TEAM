/**
 * Structure of a Staff Member Record based on requested headers.
 */
export interface Staff {
  id: string; // Unique ID
  namaAllStaff: string; // NAMA ALL STAFF
  nomorPasport: string; // NOMOR PASPORT
  jabatanPosisi: string; // JABATAN (POSISI)
  emailDrive: string; // EMAIL DRIVE
  emailBk: string; // EMAIL BK
  status: string; // STATUS (e.g., Aktif, Non-Aktif, Training, Cuti, Resign)
  jenisKelamin: 'Laki-laki' | 'Perempuan'; // JENIS KELAMIN
  messTinggal: string; // MESS TINGGAL
  nomorKamar: string; // NOMOR KAMAR
  asalKota: string; // ASAL KOTA
  idLine: string; // ID LINE
  seasonRumahIbadah: string; // SEASON RUMAH IBADAH
  tanggalLahir: string; // TANGGAL LAHIR (YYYY-MM-DD)
  tanggalMulaiKerja: string; // START AWAL MASA KERJA (YYYY-MM-DD)
  expVisa?: string; // EXP VISA (YYYY-MM-DD)
  typeVisa?: string; // TYPE VISA
  lokasiSaatIni?: string; // LOKASI SAAT INI
  notes?: string; // Additional optional notes
}

/**
 * Calculates Age (Umur) from a birth date string (YYYY-MM-DD) relative to a reference date.
 */
export function calculateAge(birthDateString: string, referenceDate: Date = new Date()): number {
  if (!birthDateString) return 0;
  const birthDate = new Date(birthDateString);
  if (isNaN(birthDate.getTime())) return 0;

  let age = referenceDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = referenceDate.getMonth() - birthDate.getMonth();
  const dayDiff = referenceDate.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }
  return age >= 0 ? age : 0;
}

/**
 * Calculates countdown details for the next Birthday (Ulang Tahun).
 * Returns birth date formatted (e.g. "25 Okt") and a helper text indicating when the birthday occurs.
 */
export interface BirthdayInfo {
  formattedDayMonth: string;
  daysRemaining: number;
  message: string;
}

export function getBirthdayInfo(birthDateString: string, referenceDate: Date = new Date()): BirthdayInfo {
  if (!birthDateString) {
    return { formattedDayMonth: '-', daysRemaining: -1, message: '-' };
  }

  const birthDate = new Date(birthDateString);
  if (isNaN(birthDate.getTime())) {
    return { formattedDayMonth: '-', daysRemaining: -1, message: '-' };
  }

  // Indonesian Months
  const INDO_MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const birthMonth = birthDate.getMonth();
  const birthDay = birthDate.getDate();
  const monthlyName = INDO_MONTHS[birthMonth];
  const formattedDayMonth = `${birthDay} ${monthlyName}`;

  // Current year birthday
  const currentYear = referenceDate.getFullYear();
  const nextBd = new Date(currentYear, birthMonth, birthDay);

  // If birthday has already passed this year, look at next year
  // Set to midnight for proper day comparisons
  const refMidnight = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  if (nextBd < refMidnight) {
    nextBd.setFullYear(currentYear + 1);
  }

  const diffTime = nextBd.getTime() - refMidnight.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  let message = '';
  if (daysRemaining === 0) {
    message = 'Hari ini! 🎉 🎂';
  } else if (daysRemaining === 1) {
    message = 'Besok! 🎁';
  } else if (daysRemaining <= 7) {
    message = `${daysRemaining} hari lagi 🎈`;
  } else if (daysRemaining <= 30) {
    message = `${daysRemaining} hari lagi`;
  } else {
    const monthWait = Math.floor(daysRemaining / 30.4);
    if (monthWait === 1) {
      message = 'Bulan depan';
    } else {
      message = `${monthWait} bulan lagi`;
    }
  }

  return {
    formattedDayMonth,
    daysRemaining,
    message
  };
}

/**
 * Calculates tenure (Masa Kerja) from start date to current date.
 * Returns structured object and formatted Indonesian string: "X Tahun, Y Bulan, Z Hari"
 */
export interface TenureInfo {
  years: number;
  months: number;
  days: number;
  formattedDuration: string;
}

export function calculateTenure(startDateString: string, referenceDate: Date = new Date()): TenureInfo {
  if (!startDateString) {
    return { years: 0, months: 0, days: 0, formattedDuration: '-' };
  }

  const startDate = new Date(startDateString);
  if (isNaN(startDate.getTime())) {
    return { years: 0, months: 0, days: 0, formattedDuration: '-' };
  }

  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth();
  const startDay = startDate.getDate();

  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth();
  const refDay = referenceDate.getDate();

  // If start date is in the future
  if (startDate > referenceDate) {
    return { years: 0, months: 0, days: 0, formattedDuration: 'Belum mulai kerja' };
  }

  let years = refYear - startYear;
  let months = refMonth - startMonth;
  let days = refDay - startDay;

  if (days < 0) {
    // Borrow days from previous month
    const prevMonthDate = new Date(refYear, refMonth, 0); // last day of previous month
    days += prevMonthDate.getDate();
    months--;
  }

  if (months < 0) {
    months += 12;
    years--;
  }

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} Tahun`);
  if (months > 0) parts.push(`${months} Bulan`);
  if (days > 0 || parts.length === 0) parts.push(`${days} Hari`);

  return {
    years,
    months,
    days,
    formattedDuration: parts.join(', ')
  };
}

/**
 * Leaving Date Range structure.
 */
export interface LeaveRange {
  dari: string; // YYYY-MM-DD
  sampai: string; // YYYY-MM-DD
  durasi: number; // calculated day difference
}

/**
 * Structure of a Leave Submission based on WDBOS layout.
 */
export interface LeaveSubmission {
  id: string;
  namaStaff: string;
  nomorPasport: string;
  jabatan: string;
  keteranganPaspor: string; // KETERANGAN PASPOR
  statusCuti: string; // STATUS CUTI
  statusPersetujuan: string; // STATUS PERSETUJUAN
  tanggalPengajuan: string; // TANGGAL PENGAJUAN (YYYY-MM-DD)
  bulanCuti?: string; // BULAN CUTI (e.g. "01" - "12")
  tahunCuti?: string; // TAHUN CUTI (e.g. "2026")
  cutiIndonesia: LeaveRange;
  cutiLokal: LeaveRange;
  cutiKerja: LeaveRange;
}

/**
 * Calculates leave duration in days inclusive.
 */
export function calculateDurationDays(dari: string, sampai: string): number {
  if (!dari || !sampai) return 0;
  const start = new Date(dari);
  const end = new Date(sampai);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  const diffTime = end.getTime() - start.getTime();
  if (diffTime < 0) return 0;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Calculates remaining days for dynamic Visa Expiration display.
 */
export function calculateVisaRemaining(expVisaString: string, referenceDate: Date = new Date()): number {
  if (!expVisaString) return 0;
  const expDate = new Date(expVisaString);
  if (isNaN(expDate.getTime())) return 0;

  // set to midnight for proper day-by-day count
  const refMidnight = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const expMidnight = new Date(expDate.getFullYear(), expDate.getMonth(), expDate.getDate());

  const diffTime = expMidnight.getTime() - refMidnight.getTime();
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return days;
}

/**
 * Types & Interfaces for DATA KESALAHAN (Mistakes Tracker)
 */
export interface MistakeRecord {
  id: string;
  staffId: string;
  tanggal: string; // YYYY-MM-DD
  jenis: 'kesalahanWd' | 'kesalahanDepo' | 'telatDiBawahSop' | 'telatDiAtasSop';
  jumlah: number;
  keterangan: string;
}

/**
 * Get period details from YYYY-MM-DD string.
 */
export function getPeriodeFromDate(dateString: string): { periode: number; year: number; label: string } {
  if (!dateString) return { periode: 1, year: 2026, label: 'Periode 1' };
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return { periode: 1, year: 2026, label: 'Periode 1' };
  
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-based index: 0 is Jan, 11 is Dec
  
  // Periode 1: 0, 1, 2 (Jan, Feb, Mar)
  // Periode 2: 3, 4, 5 (Apr, Mei, Jun)
  // Periode 3: 6, 7, 8 (Jul, Agt, Sep)
  // Periode 4: 9, 10, 11 (Okt, Nov, Des)
  const periode = Math.floor(month / 3) + 1;
  const labels = [
    'PERIODE 1 (Januari, Februari, Maret)',
    'PERIODE 2 (April, Mei, Juni)',
    'PERIODE 3 (Juli, Agustus, September)',
    'PERIODE 4 (Oktober, November, Desember)'
  ];
  
  return {
    periode,
    year,
    label: `${labels[periode - 1]} ${year}`
  };
}

/**
 * Types & Interfaces for LEMBURAN STAFF (Overtime Tracker)
 */
export interface OvertimeRecord {
  id: string;
  staffId: string;
  tanggal: string; // YYYY-MM-DD
  jumlahJam: number; // Jumlah jam lembur (e.g., 2, 3)
  keterangan?: string;
}

export const getJabatanRank = (jabatan?: string): number => {
  if (!jabatan) return 999;
  const jab = jabatan.trim().toUpperCase();
  if (jab === 'LEADER') return 1;
  if (jab === 'CS LINE' || jab === 'CS') return 2;
  if (jab === 'CS LC') return 3;
  if (jab === 'KAPTEN KASIR') return 4;
  if (jab === 'KASIR') return 5;
  return 99;
};

export const sortByJabatan = <T extends { jabatanPosisi?: string; jabatan?: string }>(a: T, b: T): number => {
  const roleA = a.jabatanPosisi || a.jabatan || '';
  const roleB = b.jabatanPosisi || b.jabatan || '';
  
  const rankA = getJabatanRank(roleA);
  const rankB = getJabatanRank(roleB);
  
  if (rankA !== rankB) {
    return rankA - rankB;
  }
  
  const nameA = (a as any).namaAllStaff || (a as any).namaStaff || '';
  const nameB = (b as any).namaAllStaff || (b as any).namaStaff || '';
  return nameA.localeCompare(nameB, 'id');
};

/**
 * Types & Interfaces for KESALAHAN LC
 */
export interface KesalahanLcRecord {
  id: string;
  staffId: string;
  namaStaff?: string; // Cache or fallback
  tanggalScreenshoot: string; // TANGGAL / SCREENSHOOT (e.g., date, URL, or combined)
  keterangan: string;
}



