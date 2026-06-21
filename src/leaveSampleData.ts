import { LeaveSubmission } from './types';

export const SAMPLE_LEAVE_SUBMISSIONS: LeaveSubmission[] = [
  {
    id: 'lv-01',
    namaStaff: 'Ahmad Faisal Sabaryanto',
    nomorPasport: 'P-A898234',
    jabatan: 'Senior IT Support & Sysadmin',
    keteranganPaspor: 'AMBIL PASPORT',
    statusCuti: 'CUTI INDONESIA',
    statusPersetujuan: 'APPROVED',
    tanggalPengajuan: '2026-06-15',
    cutiIndonesia: {
      dari: '2026-07-01',
      sampai: '2026-07-10',
      durasi: 10
    },
    cutiLokal: {
      dari: '',
      sampai: '',
      durasi: 0
    },
    cutiKerja: {
      dari: '',
      sampai: '',
      durasi: 0
    }
  },
  {
    id: 'lv-02',
    namaStaff: 'Dewi Lestari Ambarwati',
    nomorPasport: 'P-B129384',
    jabatan: 'Customer Experience Supervisor',
    keteranganPaspor: 'TIDAK AMBIL PASPORT',
    statusCuti: 'CUTI LOKAL',
    statusPersetujuan: 'PENDING',
    tanggalPengajuan: '2026-06-18',
    cutiIndonesia: {
      dari: '',
      sampai: '',
      durasi: 0
    },
    cutiLokal: {
      dari: '2026-06-25',
      sampai: '2026-06-27',
      durasi: 3
    },
    cutiKerja: {
      dari: '',
      sampai: '',
      durasi: 0
    }
  },
  {
    id: 'lv-03',
    namaStaff: 'Siti Rahmawati Putri',
    nomorPasport: 'P-D455921',
    jabatan: 'Finance & Payroll Administrator',
    keteranganPaspor: 'AMBIL PASPORT',
    statusCuti: 'CUTI KERJA',
    statusPersetujuan: 'APPROVED',
    tanggalPengajuan: '2026-06-10',
    cutiIndonesia: {
      dari: '',
      sampai: '',
      durasi: 0
    },
    cutiLokal: {
      dari: '',
      sampai: '',
      durasi: 0
    },
    cutiKerja: {
      dari: '2026-06-22',
      sampai: '2026-06-24',
      durasi: 3
    }
  },
  {
    id: 'lv-04',
    namaStaff: 'Michael Kevin Wijaya',
    nomorPasport: 'P-E773821',
    jabatan: 'Graphic Designer & Content Creator',
    keteranganPaspor: 'RESIGN',
    statusCuti: 'RESIGN',
    statusPersetujuan: 'REJECTED',
    tanggalPengajuan: '2026-06-12',
    cutiIndonesia: {
      dari: '2026-06-20',
      sampai: '2026-06-25',
      durasi: 6
    },
    cutiLokal: {
      dari: '',
      sampai: '',
      durasi: 0
    },
    cutiKerja: {
      dari: '',
      sampai: '',
      durasi: 0
    }
  }
];
