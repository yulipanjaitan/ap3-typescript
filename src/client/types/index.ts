export interface UserAccount {
  id?: number;
  nama: string;
  email: string;
  pass: string;
  role: string;
  createdAt?: string;
}

export interface AuthSession {
  nama: string;
  email: string;
  role: string;
}

export interface PerkaraRecord {
  id?: number;
  NoLP_LP_1?: string;
  Tanggal_LP_LP_1?: string;
  Nomor_SBP?: string;
  Tanggal_SBP?: string;
  Jam_Kejadian?: string;
  Hari_SBP?: string;
  No_SPRIN_Indak?: string;
  Tanggal_SPRIN_Indak?: string;
  Asal_Perkara?: string;
  Jenis_Penindakan?: string;
  Jenis_Perkara?: string;
  Status_Penangkapan?: string;
  Jenis_Pelanggaran?: string;
  Pasal_Pelanggaran?: string;
  Modus_Operandi?: string;
  Kronologis?: string;
  Jenis_Pelanggaran_Pasal?: string;
  Lokasi_Penindakan?: string;
  Nama_Pelaku?: string;
  Umur_Pelaku?: string;
  Jenis_Kelamin_Pelaku?: string;
  TTL?: string;
  Nomor_Identitas?: string;
  Pekerjaan?: string;
  Alamat_Pelaku?: string;
  Nomor_Telepon?: string;
  Nomor_Rekening?: string;
  Pengulangan_Pelanggaran?: string;
  Komoditi?: string;
  Kerugian_Negara?: string;
  Uraian_Barang?: string;
  Detail_Barang_LPP?: string;
  Merek?: string;
  Tipe?: string;
  Kondisi?: string;
  Spesifikasi_Lain?: string;
  Jumlah_Koli?: string;
  Jenis_Koli?: string;
  Pengangkut?: string;
  No_Kontainer?: string;
  Ukuran_Kontainer?: string;
  Kantor?: string;
  Dokumen_Pemberitahuan?: string;
  Tanggal_Dokumen_Pemberitahuan?: string;
  Dokumen_Pelengkap?: string;
  Jenis_Dok_Pelengkap_Select?: string;
  Jenis_Dok_Pelengkap_Manual?: string;
  Nomor_Dok_Pelengkap?: string;
  Tanggal_Dok_Pelengkap?: string;
  Penyelesaian_Perkara?: string;
  No_LPP?: string;
  Tanggal_LPP?: string;
  No_LPF?: string;
  Tanggal_LPF?: string;
  Nomor_SPLIT?: string;
  Tanggal_SPLIT?: string;
  No_SPRIN_CACAH?: string;
  Tanggal_SPRIN_CACAH?: string;
  Nomor_BA?: string;
  Tanggal_BA?: string;
  Nomor_LHP?: string;
  Tanggal_LHP?: string;
  kabid?: string;
  nip_kabid?: string;
  gol_kabid?: string;
  nama_seksi?: string;
  nip_seksi?: string;
  jabatan_seksi?: string;
  gol_seksi?: string;
  ketua_tim?: string;
  nip_ketua_tim?: string;
  jabatan_ketua_tim?: string;
  gol_ketua_tim?: string;
  pembuat_lpp?: string;
  nip_pembuat_lpp?: string;
  jabatan_pembuat_lpp?: string;
  gol_pembuat_lpp?: string;
  petugas_lpf?: string;
  nip_petugas_lpf?: string;
  jabatan_petugas_lpf?: string;
  gol_petugas_lpf?: string;
  indak_1?: string;
  nip_indak_1?: string;
  jabatan_indak_1?: string;
  gol_indak_1?: string;
  indak_2?: string;
  nip_indak_2?: string;
  jabatan_indak_2?: string;
  gol_indak_2?: string;
  indak_lainnya?: string;
  nip_indak_lainnya?: string;
  jabatan_indak_lainnya?: string;
  gol_indak_lainnya?: string;
  statusAlur?: string;
  disposisiPetugas?: string;
  [key: string]: any;
}

export interface DisposisiRecord {
  id?: number;
  perkaraId?: number;
  tanggalDisposisi?: string;
  dari?: string;
  kepada?: string;
  instruksi?: string;
  catatan?: string;
  status?: string;
  [key: string]: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
