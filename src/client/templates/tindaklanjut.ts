import { store, savePerkaraToStorage } from '../state/store.js';
import { escText, getVal, tanggalKeTeks } from '../utils/formatters.js';
import { showToast } from '../modules/ui.js';
import { tteBadge, buildTableKv } from './laporan.js';

export function handleSingleValidationTL() {
  if ((typeof store.activeRecordIndex === 'undefined' || store.activeRecordIndex < 0) && store.databasePerkara.length > 0) {
    store.activeRecordIndex = 0;
  }

  if (typeof store.activeRecordIndex === 'undefined' || store.activeRecordIndex < 0 || !store.databasePerkara[store.activeRecordIndex]) {
    showToast("INFORMASI", "Belum ada data perkara/LHP yang tersedia untuk divalidasi.", "warning");
    return;
  }

  let activeRecord = store.databasePerkara[store.activeRecordIndex];
  let noLhp = activeRecord.Nomor_LHP || activeRecord.NoLP_LP_1 || '1';
  let tglLhp = activeRecord.Tanggal_LHP || activeRecord.Tanggal_LP_LP_1 || '';

  activeRecord.TL_Tanggal_Surat = activeRecord.TL_Tanggal_Surat || tglLhp;
  activeRecord.TL_Hari_BAST = activeRecord.TL_Hari_BAST || activeRecord.Hari_SBP || 'Selasa';
  activeRecord.TL_Tgl_Huruf_BAST = activeRecord.TL_Tgl_Huruf_BAST || tanggalKeTeks(tglLhp);
  activeRecord.TL_Nama_Pemilik = activeRecord.TL_Nama_Pemilik || activeRecord.Nama_Pelaku || '-';
  activeRecord.TL_NIK_Pemilik = activeRecord.TL_NIK_Pemilik || activeRecord.Nomor_Identitas || '-';
  activeRecord.TL_Alamat_Pemilik = activeRecord.TL_Alamat_Pemilik || activeRecord.Alamat_Pelaku || '-';
  
  activeRecord.KEP_Tanggal_ND = activeRecord.KEP_Tanggal_ND || tglLhp;
  activeRecord.KEP_Nomor_ND = activeRecord.KEP_Nomor_ND || `KEP-${noLhp}/KPU.2064/2026`;
  activeRecord.SPSA_Nomor = activeRecord.SPSA_Nomor || noLhp;
  activeRecord.SPSA_Tanggal = activeRecord.SPSA_Tanggal || tglLhp;
  activeRecord.Limpah_Tanggal = activeRecord.Limpah_Tanggal || tglLhp;

  savePerkaraToStorage();

  let bannerBox = document.getElementById('tlValidatorBanner');
  if (bannerBox) bannerBox.style.display = 'flex';
  
  let statusLabel = document.getElementById('tlActiveStatusLabel');
  if (statusLabel) {
    let lhpLabel = activeRecord.Nomor_LHP ? `LHP-${activeRecord.Nomor_LHP}` : `LP-${activeRecord.NoLP_LP_1}`;
    statusLabel.textContent = `TERVALIDASI: ${lhpLabel} (Pelaku: ${escText(activeRecord.Nama_Pelaku)})`;
  }

  let existingToast = document.getElementById('customToastNotification');
  if (!existingToast) {
    let toastDiv = document.createElement('div');
    toastDiv.id = 'customToastNotification';
    toastDiv.innerHTML = `<i class="fi fi-rr-check-circle" style="color: #22c55e; margin-right: 8px;"></i><span id="toastMessage">Data Tindak Lanjut berhasil divalidasi & disinkronkan dari LHP!</span>`;
    toastDiv.style.cssText = "position: fixed; bottom: 20px; right: 20px; background: #0f172a; color: #ffffff; padding: 12px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); display: flex; align-items: center; z-index: 9999; font-size: 14px; opacity: 0; transition: opacity 0.3s ease, transform 0.3s ease; transform: translateY(20px); border-left: 4px solid #10b981;";
    document.body.appendChild(toastDiv);
    existingToast = toastDiv;
  } else {
    document.getElementById('toastMessage').innerText = "Data Tindak Lanjut berhasil divalidasi & disinkronkan dari LHP!";
  }

  setTimeout(() => {
    existingToast.style.opacity = '1';
    existingToast.style.transform = 'translateY(0)';
  }, 10);

  setTimeout(() => {
    existingToast.style.opacity = '0';
    existingToast.style.transform = 'translateY(20px)';
  }, 3000);

  if (typeof window.refreshTLTableUI === 'function') {
    window.refreshTLTableUI();
  }
}

export function getTLNumFormat(type) {
  if (store.activeRecordIndex < 0) return '-';
  let rec = store.databasePerkara[store.activeRecordIndex];
  let num = rec.Nomor_LHP || rec.NoLP_LP_1 || '338';
  
  if (type === 'BAST_PEMILIK') return `BAST-${num}/KPU.2064/2026`;
  if (type === 'BAST_LIMPAH') return `BAST-${num}/LIMPAH/KPU.2064/2026`;
  if (type === 'BA_SEGEL') return `BA-${num}-BUKASEGEL/KPU.2064/2026`;
  if (type === 'SPSA') return `SPSA-${num}/KPU.2/2026`;
  if (type === 'KEP_BDN') return `KEP-${num}/KPU.2064/2026`;
  return '-';
}

export function closeTLReportTag(customSignHTML, tglStr) {
  let t = tglStr || '28 September 2026';
  return `<div style="page-break-inside: avoid !important; margin-top:16px; font-family:Arial, sans-serif; font-size:10pt;">
    <div style="text-align:right; margin-bottom:8px;">Batam, ${t}</div>
    ${customSignHTML}
  </div></div>`;
}

export function BAST_PEMILIK() {
  if (store.activeRecordIndex < 0) return `<div class="report"><p>Data belum dipilih.</p></div>`;
  let rec = store.databasePerkara[store.activeRecordIndex];
  let num = getTLNumFormat('BAST_PEMILIK');
  let hari = escText(rec.TL_Hari_BAST || 'Selasa');
  let tglHuruf = escText(rec.TL_Tgl_Huruf_BAST || 'dua puluh satu Oktober tahun dua ribu dua puluh enam');
  let tglSurat = escText(rec.TL_Tanggal_Surat || '21 Oktober 2026');
  let sarkut = escText(rec.TL_No_Reg_Sarkut || rec.Pengangkut || '-');
  let barang = escText(rec.TL_Uraian_Barang || rec.Uraian_Barang || '-');
  let dokumen = escText(rec.TL_Dokumen_Pemberitahuan || 'EKS PPFZT-01 nomor 345 tanggal 09 September 2026');
  let namaPenerima = escText(rec.TL_Nama_Pemilik || rec.Nama_Pelaku || '-');
  let nikPenerima = escText(rec.TL_NIK_Pemilik || rec.Nomor_Identitas || '-');
  let alamatPenerima = escText(rec.TL_Alamat_Pemilik || rec.Alamat_Pelaku || '-');
  let ptPenerima = escText(rec.TL_Atas_Nama_Pt || '');
  let p1 = escText(rec.TL_Petugas_Bast_1 || rec.ketua_tim || 'Petugas Penyerah 1');
  let p2 = escText(rec.TL_Petugas_Bast_2 || '');

  let ttdBast = `
    <div class="sign" style="display:flex; justify-content:space-between; margin-top:14px;">
      <div style="width:45%; text-align:left; font-size:10pt;">
        Penerima,<br>Pemilik / Kuasa / Yang Menguasai
        <div class="signature" style="height:55px;"></div>
        ${tteBadge()}
        <b>${namaPenerima}</b><br>${ptPenerima ? 'PT. ' + ptPenerima : ''}
      </div>
      <div style="width:45%; text-align:left; font-size:10pt;">
        Yang menyerahkan,<br>Pejabat Bea dan Cukai
        <div class="signature" style="height:55px;"></div>
        ${tteBadge()}
        <b>${p1}</b>
      </div>
    </div>
  `;

  return `<div class="report" style="font-family:Arial, sans-serif; font-size:10pt; line-height:1.35;">
    <div style="font-weight:bold; font-size:9.5pt; line-height:1.2;">
      KEMENTERIAN KEUANGAN REPUBLIK INDONESIA<br>
      DIREKTORAT JENDERAL BEA DAN CUKAI<br>
      KANTOR PELAYANAN UTAMA BEA DAN CUKAI TIPE B BATAM
    </div>
    <div style="text-align:center; font-weight:bold; font-size:11pt; margin:16px 0 3px 0;">BERITA ACARA SERAH TERIMA BARANG BUKTI</div>
    <div style="text-align:center; margin-bottom:12px; font-size:10pt;">Nomor : ${num}</div>
    <p style="text-align:justify; margin-bottom:6px;">Pada hari ini ${hari} tanggal ${tglHuruf}, kami yang bertanda tangan di bawah ini berdasarkan penanganan perkara kepabeanan telah melakukan serah terima barang bukti kepada pemilik atau kuasanya:</p>
    
    ${buildTableKv([
      ['Sarana Pengangkut', 'Jenis / No. Reg', sarkut],
      ['Barang Bukti', 'Uraian Barang', barang],
      ['Dokumen', 'Jenis & Nomor', dokumen],
      ['Penerima', 'Nama / NIK', `${namaPenerima} (NIK: ${nikPenerima})`],
      ['Alamat Penerima', 'Alamat Lengkap', alamatPenerima],
      ['Petugas Penyerah', 'Nama Petugas', `${p1} ${p2 ? 'dan ' + p2 : ''}`]
    ])}
    <p style="margin-top:10px; margin-bottom:0; text-align:justify;">Demikian Berita Acara Serah Terima ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.</p>
    ${closeTLReportTag(ttdBast, tglSurat)}
  </div>`;
}

export function BA_SEGEL() {
  if (store.activeRecordIndex < 0) return `<div class="report"><p>Data belum dipilih.</p></div>`;
  let rec = store.databasePerkara[store.activeRecordIndex];
  let num = getTLNumFormat('BA_SEGEL');
  let hari = escText(rec.TL_Segel_Hari || 'Selasa');
  let tglHuruf = escText(rec.TL_Segel_Tgl_Huruf || 'dua puluh satu Oktober tahun dua ribu dua puluh enam');
  let tglSurat = escText(rec.TL_Tanggal_Surat || '21 Oktober 2026');
  let noSpli = escText(rec.TL_Segel_No_SPLI || '-');
  let tglSpli = escText(rec.TL_Segel_Tgl_SPLI || '-');
  let namaSarkut = escText(rec.TL_Segel_Nama_Sarkut || rec.Pengangkut || '-');
  let regSarkut = escText(rec.TL_Segel_Reg_Sarkut || '-');
  let bendera = escText(rec.TL_Segel_Bendera || 'INDONESIA');
  let nahkoda = escText(rec.TL_Segel_Nahkoda || rec.Nama_Pelaku || '-');
  let nikNahkoda = escText(rec.TL_Segel_Nik_Nahkoda || '-');
  let namaSaksi = escText(rec.TL_Nama_Pemilik || 'DENI YASMAN');
  let nikSaksi = escText(rec.TL_NIK_Pemilik || '1312011404930001');
  let alamatSaksi = escText(rec.TL_Alamat_Pemilik || 'Perum Griya Sagulung Permai Blok A No. 59, Batam');
  let pkrSaksi = escText(rec.TL_Segel_Pekerjaan || 'Karyawan Swasta');
  let p1 = escText(rec.TL_Segel_P1 || rec.ketua_tim || 'Petugas BA Buka Segel 1');
  let p2 = escText(rec.TL_Segel_P2 || 'Petugas BA Buka Segel 2');

  let ttdPemilik = `
    <div class="sign" style="display:flex; justify-content:space-between; margin-top:14px;">
      <div style="width:45%; text-align:left; font-size:10pt;">
        Pemilik/Kuasanya/Saksi*
        <div class="signature" style="height:55px;"></div>
        ${tteBadge()}
        <b>${namaSaksi}</b><br>Alamat: ${alamatSaksi}
      </div>
      <div style="width:45%; text-align:left; font-size:10pt;">
        Pejabat yang melakukan pembukaan segel,
        <div class="signature" style="height:55px;"></div>
        ${tteBadge()}
        <b>${p1} ${p2 ? '& ' + p2 : ''}</b>
      </div>
    </div>
  `;

  return `<div class="report" style="font-family:Arial, sans-serif; font-size:10pt; line-height:1.35;">
    <div style="font-weight:bold; font-size:9.5pt; line-height:1.2;">
      KEMENTERIAN KEUANGAN REPUBLIK INDONESIA<br>
      DIREKTORAT JENDERAL BEA DAN CUKAI<br>
      KANTOR PELAYANAN UTAMA BEA DAN CUKAI TIPE B BATAM
    </div>
    <div style="text-align:center; font-weight:bold; font-size:11pt; margin:16px 0 3px 0;">BERITA ACARA PEMBUKAAN SEGEL</div>
    <div style="text-align:center; margin-bottom:12px; font-size:10pt;">Nomor : ${num}</div>
    <p style="text-align:justify; margin-bottom:6px;">Pada hari ini, ${hari} tanggal ${tglHuruf}. Berdasarkan Surat Perintah Penelitian Kepala Bidang Penindakan dan Penyidikan KPU BC Tipe B Batam Nomor ${noSpli} tanggal ${tglSpli}. Kami yang bertanda tangan di bawah ini telah melakukan pembukaan segel atas:</p>
    
    ${buildTableKv([
      ['Sarana Pengangkut', 'Nama & Jenis Sarkut', namaSarkut],
      ['', 'No. Register', regSarkut],
      ['', 'Bendera', bendera],
      ['', 'Nahkoda/Pilot/Pengemudi*', nahkoda],
      ['', 'Nomor Identitas', nikNahkoda],
      ['Saksi / Penghadap', 'Nama', namaSaksi],
      ['', 'Alamat', alamatSaksi],
      ['', 'Pekerjaan', pkrSaksi],
      ['', 'Identitas (KTP/SIM/Paspor*)', nikSaksi]
    ])}
    <p style="margin-top:10px; margin-bottom:0; text-align:justify;">Demikian Berita Acara ini dibuat dengan sebenarnya.</p>
    ${closeTLReportTag(ttdPemilik, tglSurat)}
  </div>`;
}

export function KEP_BDN() {
  if (store.activeRecordIndex < 0) return `<div class="report"><p>Data belum dipilih.</p></div>`;
  let rec = store.databasePerkara[store.activeRecordIndex];
  let num = getTLNumFormat('KEP_BDN');
  let noSBP = rec.Nomor_SBP ? `SBP-${rec.Nomor_SBP}/MANDIRI/PATLA/KPU.2/2026` : 'SBP-338/MANDIRI/PATLA/KPU.2/2026';
  let noLP = rec.NoLP_LP_1 ? `LP-${rec.NoLP_LP_1}/PATLA/KPU.206/2026` : 'LP-338/PATLA/KPU.206/2026';

  let listBarang = rec.KEP_List_Barang || [
    { jumlah: '98 (sembilan puluh delapan) koli', uraian: 'Tepung Terigu merk “Segitiga Biru” 25 Kg', kondisi: 'Kurang Baik', asal: 'Tidak Teridentifikasi', ket: '-' },
    { jumlah: '189 (seratus delapan puluh sembilan) koli', uraian: 'Beras merek “Harumas” 25 Kg', kondisi: 'Kurang Baik', asal: 'Tidak Teridentifikasi', ket: '-' }
  ];

  let rowsLampiranHtml = listBarang.map((item, idx) => `
    <tr>
      <td style="border:1px solid #000; padding:5px; text-align:center;">${idx + 1}.</td>
      <td style="border:1px solid #000; padding:5px; text-align:center;">${escText(item.jumlah)}</td>
      <td style="border:1px solid #000; padding:5px; text-align:left;">${escText(item.uraian)}</td>
      <td style="border:1px solid #000; padding:5px; text-align:center;">${escText(item.kondisi)}</td>
      <td style="border:1px solid #000; padding:5px; text-align:center;">${escText(item.asal)}</td>
      <td style="border:1px solid #000; padding:5px; text-align:center;">${escText(item.ket)}</td>
    </tr>
  `).join('');

  let ttdKepalaKantor = `
    <div style="page-break-inside: avoid !important; display:flex; justify-content:flex-end; margin-top:16px;">
      <div style="text-align:left; width:45%; font-size:10pt;">
        KEPALA KANTOR PELAYANAN UTAMA BEA DAN CUKAI TIPE B BATAM,
        <div class="signature" style="height:55px;"></div>
        ${tteBadge()}
        <b>${escText(getVal('form_kabid') || 'ZAKY FIRMANSYAH')}</b>
      </div>
    </div>
  `;

  let lampiranTabelBDN = `
    <div class="report" style="font-family:Arial, sans-serif; font-size:10pt; line-height:1.35;">
      <div style="font-weight:bold; font-size:9.5pt; text-align:left; line-height:1.3;">
        LAMPIRAN<br>
        KEPUTUSAN KEPALA KANTOR PELAYANAN UTAMA BEA DAN CUKAI TIPE B BATAM<br>
        NOMOR : ${rec.KEP_Nomor_ND || num}<br>
        TENTANG PENETAPAN BARANG IMPOR SEBAGAI BARANG YANG DIKUASAI NEGARA ATAS ${noSBP} TANGGAL ${rec.Tanggal_SBP || '28 September 2026'}
      </div>
      <div style="font-weight:bold; margin-top:14px; text-align:center; font-size:10.5pt;">DAFTAR BARANG YANG DIKUASAI NEGARA</div>
      <table class="rtable" style="width:100%; border-collapse:collapse; margin-top:10px; border:1px solid #000; font-size:9.5pt;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="border:1px solid #000; padding:5px; text-align:center; width:5%;">No</th>
            <th style="border:1px solid #000; padding:5px; text-align:center; width:22%;">Jumlah Barang</th>
            <th style="border:1px solid #000; padding:5px; text-align:left; width:35%;">Uraian Barang</th>
            <th style="border:1px solid #000; padding:5px; text-align:center; width:13%;">Kondisi</th>
            <th style="border:1px solid #000; padding:5px; text-align:center; width:15%;">Negara Asal</th>
            <th style="border:1px solid #000; padding:5px; text-align:center; width:10%;">Ket</th>
          </tr>
        </thead>
        <tbody>
          ${rowsLampiranHtml}
        </tbody>
      </table>
      ${ttdKepalaKantor}
    </div>
  `;

  let lembarSatu = `<div class="report" style="font-family:Arial, sans-serif; font-size:10pt; line-height:1.35;">
    <div style="text-align:center; font-weight:bold; font-size:10.5pt; line-height:1.3;">
      KEPUTUSAN KEPALA KANTOR PELAYANAN UTAMA BEA DAN CUKAI TIPE B BATAM<br>
      NOMOR ${rec.KEP_Nomor_ND || num}<br><br>
      TENTANG<br><br>
      PENETAPAN BARANG IMPOR SEBAGAI BARANG YANG DIKUASAI NEGARA ATAS ${noSBP} TANGGAL ${rec.KEP_Tanggal_ND || '28 September 2026'}<br><br>
      KEPALA KANTOR PELAYANAN UTAMA BEA DAN CUKAI TIPE B BATAM,
    </div>
    
    <p style="margin-top:12px; margin-bottom:4px; text-align:justify;"><b>Menimbang :</b></p>
    <table style="width:100%; border-collapse:collapse; font-size:10pt; line-height:1.3; margin-bottom:8px;">
      <tr><td style="width:25px; vertical-align:top;">a.</td><td style="text-align:justify; vertical-align:top;">bahwa pada Kantor Pelayanan Utama Bea dan Cukai Tipe B Batam terdapat barang hasil penegahan oleh Pejabat Bea dan Cukai di ${escText(rec.Lokasi_Penindakan || 'lokasi penindakan')} atas modus operandi yang dilakukan oleh ${escText(rec.Nama_Pelaku || 'pelaku')} sesuai dengan Surat Bukti Penindakan nomor ${noSBP} dan Laporan Pelanggaran nomor ${noLP};</td></tr>
      <tr><td style="vertical-align:top;">b.</td><td style="text-align:justify; vertical-align:top;">bahwa berdasarkan ketentuan Pasal 68 ayat (1) huruf a dan b Undang-Undang Nomor 10 Tahun 1995 tentang Kepabeanan sebagaimana telah diubah dengan Undang-Undang Nomor 17 Tahun 2006;</td></tr>
      <tr><td style="vertical-align:top;">c.</td><td style="text-align:justify; vertical-align:top;">bahwa berdasarkan ketentuan Pasal 71 ayat (2) Peraturan Pemerintah Nomor 41 Tahun 2021 tentang Penyelenggaraan Kawasan Perdagangan Bebas dan Pelabuhan Bebas;</td></tr>
      <tr><td style="vertical-align:top;">d.</td><td style="text-align:justify; vertical-align:top;">bahwa berdasarkan pertimbangan tersebut, dipandang perlu menetapkan barang sebagai Barang Dikuasai Negara.</td></tr>
    </table>

    <p style="margin-bottom:4px; text-align:justify;"><b>Mengingat :</b></p>
    <table style="width:100%; border-collapse:collapse; font-size:10pt; line-height:1.3; margin-bottom:8px;">
      <tr><td style="width:25px; vertical-align:top;">1.</td><td style="text-align:justify; vertical-align:top;">Undang-Undang Nomor 10 Tahun 1995 tentang Kepabeanan sebagaimana telah diubah dengan Undang-Undang Nomor 17 Tahun 2006;</td></tr>
      <tr><td style="vertical-align:top;">2.</td><td style="text-align:justify; vertical-align:top;">Peraturan Pemerintah Nomor 41 Tahun 2021 tentang Penyelenggaraan Kawasan Perdagangan Bebas dan Pelabuhan Bebas;</td></tr>
      <tr><td style="vertical-align:top;">3.</td><td style="text-align:justify; vertical-align:top;">Peraturan Menteri Keuangan Nomor 178/PMK.04/2019;</td></tr>
      <tr><td style="vertical-align:top;">4.</td><td style="text-align:justify; vertical-align:top;">Peraturan Direktur Jenderal Bea dan Cukai nomor PER-8/BC/2024.</td></tr>
    </table>

    <div style="text-align:center; font-weight:bold; margin:10px 0;">MEMUTUSKAN:</div>
    <table style="width:100%; border-collapse:collapse; font-size:10pt; line-height:1.3; margin-bottom:8px;">
      <tr><td style="width:100px; vertical-align:top;"><b>Menetapkan</b></td><td style="width:15px; vertical-align:top;">:</td><td style="text-align:justify; vertical-align:top;">KEPUTUSAN KEPALA KANTOR PELAYANAN UTAMA BEA DAN CUKAI TIPE B BATAM TENTANG PENETAPAN BARANG SEBAGAI BARANG YANG DIKUASAI NEGARA ATAS ${noSBP} TANGGAL ${rec.Tanggal_SBP || '-'}.</td></tr>
      <tr><td style="vertical-align:top;"><b>KESATU</b></td><td style="vertical-align:top;">:</td><td style="text-align:justify; vertical-align:top;">Barang-barang sebagaimana terlampir merupakan hasil penegahan oleh Pejabat Bea dan Cukai di ${escText(rec.Lokasi_Penindakan || '-')} atas modus operandi yang dilakukan oleh ${escText(rec.Nama_Pelaku || '-')} sesuai dengan Surat Bukti Penindakan nomor ${noSBP} dan Laporan Pelanggaran nomor ${noLP}.</td></tr>
      <tr><td style="vertical-align:top;"><b>KEDUA</b></td><td style="vertical-align:top;">:</td><td style="text-align:justify; vertical-align:top;">Sesuai dengan ketentuan Pasal 68 ayat (1) huruf a dan b Undang-Undang Nomor 10 Tahun 1995 tentang Kepabeanan sebagaimana telah diubah dengan Undang-Undang Nomor 17 Tahun 2006, barang-barang sebagaimana dimaksud dalam Diktum KESATU ditetapkan sebagai Barang yang Dikuasai Negara.</td></tr>
      <tr><td style="vertical-align:top;"><b>KETIGA</b></td><td style="vertical-align:top;">:</td><td style="text-align:justify; vertical-align:top;">Barang yang Dikuasai Negara sebagaimana dimaksud dalam Diktum KESATU disimpan di Gudang Penindakan dan Penyidikan Batu Ampar dan/atau Tanjung Uncang di bawah pengawasan Kantor Pelayanan Utama Bea Dan Cukai Tipe B Batam.</td></tr>
      <tr><td style="vertical-align:top;"><b>KEEMPAT</b></td><td style="vertical-align:top;">:</td><td style="text-align:justify; vertical-align:top;">Keputusan ini mulai berlaku pada tanggal ditetapkan, dengan ketentuan apabila dikemudian hari terdapat kekeliruan akan diadakan pembetulan seperlunya.</td></tr>
    </table>

    <div style="font-size:8.5pt; line-height:1.2; margin-top:8px;">
      Salinan disampaikan kepada:<br>
      1. Menteri Keuangan;<br>
      2. Direktur Jenderal Bea dan Cukai;<br>
      3. Inspektorat Jenderal;<br>
      4. Direktur Teknis Kepabeanan, Direktorat Jenderal Bea dan Cukai;<br>
      5. Direktur Penindakan dan Penyidikan;<br>
      6. Pemilik/Kuasa a.n ${escText(rec.Nama_Pelaku || '-')}
    </div>
    ${closeTLReportTag(ttdKepalaKantor, rec.KEP_Tanggal_ND || '28 September 2026')}
  `;

  return `${lembarSatu}<div class="pagebreak"></div>${lampiranTabelBDN}`;
}

export function SPSA() {
  if (store.activeRecordIndex < 0) return `<div class="report"><p>Data belum dipilih.</p></div>`;
  let rec = store.databasePerkara[store.activeRecordIndex];

  let ttdSPSA = `
    <div style="page-break-inside: avoid !important; display:flex; justify-content:flex-end; margin-top:16px;">
      <div style="text-align:left; width:45%; font-size:10pt;">
        Kepala Kantor,
        <div class="signature" style="height:55px;"></div>
        ${tteBadge()}
        <b>${escText(getVal('form_kabid') || 'Zaky Firmansyah')}</b>
      </div>
    </div>
  `;

  return `<div class="report" style="font-family:Arial, sans-serif; font-size:10pt; line-height:1.35;">
    <div style="font-weight:bold; font-size:9.5pt; text-align:left; line-height:1.2;">
      KEMENTERIAN KEUANGAN REPUBLIK INDONESIA<br>
      DIREKTORAT JENDERAL BEA DAN CUKAI<br>
      KANTOR PELAYANAN UTAMA BEA DAN CUKAI TIPE B BATAM
    </div>
    <div style="text-align:center; font-weight:bold; font-size:11pt; margin:16px 0 8px 0;">SURAT PENETAPAN SANKSI ADMINISTRASI (SPSA)</div>
    <table style="width:100%; border-collapse:collapse; margin-bottom:12px; font-size:10pt;">
      <tr><td style="width:80px;">Nomor</td><td style="width:15px; text-align:center;">:</td><td>SPSA-${escText(rec.SPSA_Nomor || '01')}</td></tr>
      <tr><td>Tanggal</td><td style="text-align:center;">:</td><td>${escText(rec.SPSA_Tanggal || '09 September 2026')}</td></tr>
    </table>
    
    <div style="margin-bottom:10px; font-size:10pt; line-height:1.3;">
      <b>Kepada Yth.</b><br>
      Nama : ${escText(rec.TL_Nama_Pemilik || rec.Nama_Pelaku || '-')}<br>
      No KTP : ${escText(rec.TL_NIK_Pemilik || rec.Nomor_Identitas || '-')}<br>
      Alamat : ${escText(rec.TL_Alamat_Pemilik || rec.Alamat_Pelaku || '-')}
    </div>
    
    <p style="text-align:justify; margin-bottom:8px;">Berdasarkan ketentuan pada pasal pelanggaran spsa (${escText(rec.SPSA_Pasal_Pelanggaran || '9A ayat (1) Undang-Undang Nomor 10 Tahun 1995 tentang Kepabeanan sebagaimana telah diubah dengan Undang-Undang Nomor 17 Tahun 2006 dan pasal 34 ayat (5) Peraturan Pemerintah nomor 41 tahun 2021 tentang Penyelenggaraan Kawasan Perdagangan Bebas')}), dengan ini ditetapkan sanksi administrasi berupa denda sebesar <b>${escText(rec.SPSA_Denda || 'Rp 10.000.000,- (sepuluh juta rupiah)')}</b> dengan alasan penetapan (${escText(rec.SPSA_Alasan || 'tidak menyerahkan pemberitahuan pabean atas barang yang diangkutnya sebelum keberangkatan sarana pengangkut')}) sebagaimana dimaksud pada pasal dasar denda (${escText(rec.SPSA_Pasal_Denda || '9A ayat (3) Undang-Undang Nomor 10 Tahun 1995 tentang Kepabeanan sebagaimana telah diubah dengan Undang-Undang Nomor 17 Tahun 2006')}).</p>
    
    <p style="text-align:justify; margin-bottom:8px;">Saudara wajib melunasi sanksi administrasi berupa denda tersebut paling lambat tanggal ${escText(rec.SPSA_Jatuh_Tempo || '18 Januari 2026')} dan bukti pelunasan agar disampaikan kepada Kepala Kantor Pelayanan Utama Bea dan Cukai Tipe B Batam.</p>
    <p style="text-align:justify; margin-bottom:8px;">Apabila tagihan tidak dilunasi atau tidak diajukan keberatan sampai dengan tanggal ${escText(rec.SPSA_Jatuh_Tempo || '18 Januari 2026')}, dikenakan bunga yang terutang sebesar 2% (dua persen) setiap bulan untuk paling lama 24 (dua puluh empat) bulan dari jumlah yang terutang, bagian bulan dihitung satu bulan penuh.</p>
    <p style="text-align:justify; margin-bottom:8px;">Keberatan atas penetapan ini hanya dapat diajukan secara tertulis kepada Direktur Jenderal Bea dan Cukai melalui Kantor Pelayanan Utama Bea dan Cukai Tipe B Batam sesuai dengan ketentuan tentang keberatan, paling lambat pada tanggal ${escText(rec.SPSA_Jatuh_Tempo || '18 Januari 2026')}.</p>
    
    ${closeTLReportTag(ttdSPSA, escText(rec.SPSA_Tanggal || '09 September 2026'))}
    <div style="font-size:8.5pt; margin-top:12px; line-height:1.2;">
      SPSA ini dibuat rangkap 2 (dua):<br>
      - Rangkap ke-1 untuk ${escText(rec.TL_Nama_Pemilik || rec.Nama_Pelaku || '-')}<br>
      - Rangkap ke-2 untuk Kepala KPU Bea dan Cukai Tipe B Batam
    </div>
  </div>`;
}

export function BAST_LIMPAH() {
  if (store.activeRecordIndex < 0) return `<div class="report"><p>Data belum dipilih.</p></div>`;
  let rec = store.databasePerkara[store.activeRecordIndex];
  let num = getTLNumFormat('BAST_LIMPAH');
  let hari = escText(rec.Limpah_Hari || 'Kamis');
  let tglHuruf = escText(rec.Limpah_Tgl_Huruf || 'dua belas Desember tahun dua ribu dua puluh enam');
  let tglSurat = escText(rec.Limpah_Tanggal || '12 Desember 2026');
  let sarkut = escText(rec.Limpah_Sarkut || rec.Pengangkut || '-');
  let barang = escText(rec.Limpah_Barang || rec.Uraian_Barang || '±1250 batang balok kayu');
  let dokumen = escText(rec.Limpah_Dokumen || 'Dokumen Kapal, KTP, dan dokumen lainnya');
  let namaOrang = escText(rec.TL_Nama_Pemilik || rec.Nama_Pelaku || 'RAJA DOLI SIREGAR');
  let nikOrang = escText(rec.TL_NIK_Pemilik || rec.Nomor_Identitas || '2102081511890006');
  let pejabatPenerima = escText(rec.Limpah_Pejabat_Penerima || 'Pejabat Instansi');
  let nipPenerima = escText(rec.Limpah_NIP_Penerima || '-');
  let instansi = escText(rec.Instansi_Penerima || 'Dinas Lingkungan Hidup dan Kehutanan (DLHK) Provinsi Kepri');
  let petugas1 = escText(rec.Limpah_Petugas_1 || rec.ketua_tim || 'Petugas Pelimpah 1');
  let nip1 = escText(rec.Limpah_NIP_1 || '-');

  let ttdLimpah = `
    <div class="sign" style="display:flex; justify-content:space-between; margin-top:14px;">
      <div style="width:45%; text-align:left; font-size:10pt;">
        Yang menerima,<br>Instansi Penerima (${instansi})
        <div class="signature" style="height:55px;"></div>
        ${tteBadge()}
        <b>${pejabatPenerima}</b><br>NIP. ${nipPenerima}
      </div>
      <div style="width:45%; text-align:left; font-size:10pt;">
        Yang menyerahkan,<br>Petugas Pelimpah
        <div class="signature" style="height:55px;"></div>
        ${tteBadge()}
        <b>${petugas1}</b><br>NIP. ${nip1}
      </div>
    </div>
  `;

  return `<div class="report" style="font-family:Arial, sans-serif; font-size:10pt; line-height:1.35;">
    <div style="font-weight:bold; font-size:9.5pt; line-height:1.2;">
      KEMENTERIAN KEUANGAN REPUBLIK INDONESIA<br>
      DIREKTORAT JENDERAL BEA DAN CUKAI<br>
      KANTOR PELAYANAN UTAMA BEA DAN CUKAI TIPE B BATAM
    </div>
    <div style="text-align:center; font-weight:bold; font-size:11pt; margin:16px 0 3px 0;">BERITA ACARA SERAH TERIMA</div>
    <div style="text-align:center; margin-bottom:12px; font-size:10pt;">Nomor : ${num}</div>
    <p style="text-align:justify; margin-bottom:6px;">Pada hari ini, ${hari} tanggal ${tglHuruf}. Kami yang bertanda tangan di bawah ini bertindak untuk/atas nama Kantor Pelayanan Utama Bea dan Cukai Tipe B Batam, telah menyerahkan:</p>
    
    ${buildTableKv([
      ['Sarana Pengangkut', 'Jenis Sarana Pengangkut', sarkut],
      ['Barang', 'Jml/No. Peti Kemas/Kemasan/ Jumlah/Jenis Barang', barang],
      ['Dokumen', 'Jenis/No. dan Tgl. Dokumen', dokumen],
      ['Orang', 'Nama & No. Identitas', `${namaOrang} (No. Identitas: ${nikOrang})`],
      ['Diserahkan kepada', 'Nama / NIP / Alamat', `${pejabatPenerima} (NIP: ${nipPenerima})`],
      ['Instansi Penerima', 'Menerima atas nama', instansi],
      ['Maksud Penyerahan', 'Rangka Kegiatan', 'Pelimpahan Penanganan Perkara Penindakan oleh KPU Bea dan Cukai Tipe B Batam agar ditindaklanjuti oleh pihak berwenang.']
    ])}
    <p style="margin-top:10px; margin-bottom:0; text-align:justify;">Demikian Berita Acara ini dibuat dengan sebenarnya.</p>
    ${closeTLReportTag(ttdLimpah, tglSurat)}
  </div>`;
}
