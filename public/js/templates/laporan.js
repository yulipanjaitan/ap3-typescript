import { store, savePerkaraToStorage } from '../state/store.js';
import { escText, getVal, formatDate, formatDateIndo, formatModusVerb } from '../utils/formatters.js';
import { showToast } from '../modules/ui.js';
export function getDocNum(id) {
    let el = document.getElementById(id);
    return el ? el.value.trim() : '';
}
export function fmtLP() {
    let val = getDocNum('No_LPP') || getVal('NoLP_LP_1');
    return (val && val !== '-') ? `LPP-${val}/KPU.206/2026` : 'LPP-/KPU.206/2026';
}
export function fmtLPF() {
    let val = getDocNum('No_LPF') || getVal('NoLP_LP_1');
    return (val && val !== '-') ? `LPF-${val}/KPU.206/2026` : 'LPF-/KPU.206/2026';
}
export function fmtSBP() {
    let val = getVal('Nomor_SBP');
    let status = getVal('Status_Penangkapan');
    let tipe = status.toUpperCase().includes('LIMPAHAN') ? 'LIMPAH' : 'MANDIRI';
    return (val && val !== '-') ? `SBP-${val}/${tipe}/KPU.2/2026` : `SBP-/${tipe}/KPU.2/2026`;
}
export function fmtSprinIndak() {
    let val = getVal('No_SPRIN_Indak');
    let tgl = formatDate('Tanggal_SPRIN_Indak');
    if (val && val !== '-') {
        let sprinPad = val.length < 2 ? String(val).padStart(2, '0') : val;
        let noFormatted = `SPRIN-${sprinPad}/KPU.206/2026`;
        return tgl !== '-' ? `${noFormatted} tanggal ${tgl}` : noFormatted;
    }
    return '-';
}
export function fmtPrintCacah() {
    let val = getDocNum('No_SPRIN_CACAH');
    return (val && val !== '-') ? `PRIN-${val}/KPU.206/CACAH/2026` : 'PRIN-/KPU.206/CACAH/2026';
}
export function fmtSplit() {
    let val = getDocNum('Nomor_SPLIT');
    return (val && val !== '-') ? `SPLIT-${val}/KPU.206/2026` : 'SPLIT-/KPU.206/2026';
}
export function fmtBA() {
    let val = getDocNum('Nomor_BA');
    return (val && val !== '-') ? `BA-${val}/KPU.206/CACAH/2026` : 'BA-/KPU.206/CACAH/2026';
}
export function fmtLHP() {
    let val = getDocNum('Nomor_LHP');
    return (val && val !== '-') ? `LHP-${val}/KPU.206/2026` : 'LHP-/KPU.206/2026';
}
export function syncLPToDocs(val) {
    let noLpp = document.getElementById('No_LPP');
    let noLpf = document.getElementById('No_LPF');
    if (noLpp && !noLpp.value)
        noLpp.value = val;
    if (noLpf && !noLpf.value)
        noLpf.value = val;
    if (typeof window.refreshReportTableUI === 'function')
        window.refreshReportTableUI();
    if (typeof window.updateReportLive === 'function')
        window.updateReportLive();
}
export function officeHeader(isBA = false) {
    return `<div class="office-left" style="font-family: Arial, Helvetica, sans-serif !important; font-weight: bold; font-size: 10pt; line-height: 1.3;">KEMENTERIAN KEUANGAN REPUBLIK INDONESIA<br>DIREKTORAT JENDERAL BEA DAN CUKAI<br>KANTOR PELAYANAN UTAMA BEA DAN CUKAI TIPE B BATAM</div>`;
}
export function tteBadge() {
    return `<div class="tte-badge" style="font-size:8.5pt; color:#9ca3af !important; margin:3px 0 2px 0; font-style:normal; font-weight:normal; text-align:left; letter-spacing:0.01em;">Ditandatangani secara elektronik</div>`;
}
export function baseReport(title, no, isBA = false) {
    return `<div class="report" style="font-family: Arial, Helvetica, sans-serif !important; font-size: 10pt; color: #000 !important; line-height: 1.3;">
    ${officeHeader(isBA)}
    <div class="title-center" style="font-family: Arial, Helvetica, sans-serif; text-align:center; font-weight:bold; font-size:11.5pt; margin:14px 0 4px 0;">${title}</div>
    <div class="nomor-center" style="font-family: Arial, Helvetica, sans-serif; text-align:center; margin-bottom:16px;">Nomor : ${no}</div>`;
}
export function buildTableKv(rows) {
    return `<table class="rtable" style="width:100%; border-collapse:collapse; font-family:Arial, sans-serif;">${rows.map(r => {
        if (r.length === 3) {
            return `<tr>
        <td style="width:4%; vertical-align:top;">${r[0]}</td>
        <td style="width:28%; vertical-align:top;">${r[1]}</td>
        <td style="width:3%; text-align:center; vertical-align:top;">${r[1] ? ':' : ''}</td>
        <td style="text-align:justify; vertical-align:top;">${r[2] || '-'}</td>
      </tr>`;
        }
        else {
            return `<tr>
        <td style="width:32%; vertical-align:top;">${r[0]}</td>
        <td style="width:3%; text-align:center; vertical-align:top;">:</td>
        <td style="text-align:justify; vertical-align:top;">${r[1] || '-'}</td>
      </tr>`;
        }
    }).join('')}</table>`;
}
export function handleSingleValidation() {
    if ((typeof store.activeRecordIndex === 'undefined' || store.activeRecordIndex < 0) && store.databasePerkara.length > 0) {
        store.activeRecordIndex = 0;
    }
    if (typeof store.activeRecordIndex === 'undefined' || store.activeRecordIndex < 0 || !store.databasePerkara[store.activeRecordIndex]) {
        showToast("INFORMASI", "Belum ada data perkara untuk divalidasi.", "warning");
        return;
    }
    let activeRecord = store.databasePerkara[store.activeRecordIndex];
    let noLp = activeRecord.NoLP_LP_1 || '';
    let docTypes = ['LPP', 'LPF', 'SPLIT', 'SPRIN_CACAH', 'BA', 'LHP'];
    docTypes.forEach(type => {
        if (type === 'LPP') {
            activeRecord.No_LPP = noLp.replace(/^LP/i, 'LPP');
            activeRecord.Tanggal_LPP = activeRecord.Tanggal_LPP || activeRecord.Tanggal_LP_LP_1;
        }
        else if (type === 'LPF') {
            activeRecord.No_LPF = noLp.replace(/^LP/i, 'LPF');
            activeRecord.Tanggal_LPF = activeRecord.Tanggal_LPF || activeRecord.Tanggal_LP_LP_1;
        }
        else if (type === 'SPLIT') {
            activeRecord.Nomor_SPLIT = noLp.replace(/^LP/i, 'SPLIT');
            activeRecord.Tanggal_SPLIT = activeRecord.Tanggal_SPLIT || activeRecord.Tanggal_LP_LP_1;
        }
        else if (type === 'SPRIN_CACAH' && !activeRecord.No_SPRIN_CACAH) {
            activeRecord.No_SPRIN_CACAH = noLp;
            activeRecord.Tanggal_SPRIN_CACAH = activeRecord.Tanggal_SBP || activeRecord.Tanggal_LP_LP_1;
        }
        else if (type === 'BA' && !activeRecord.Nomor_BA) {
            activeRecord.Nomor_BA = noLp;
            activeRecord.Tanggal_BA = activeRecord.Tanggal_SBP || activeRecord.Tanggal_LP_LP_1;
        }
        else if (type === 'LHP') {
            activeRecord.No_LHP = noLp.replace(/^LP/i, 'LHP');
            activeRecord.Tanggal_LHP = activeRecord.Tanggal_LHP || activeRecord.Tanggal_LP_LP_1;
        }
    });
    savePerkaraToStorage();
    let existingToast = document.getElementById('customToastNotification');
    if (!existingToast) {
        let toastDiv = document.createElement('div');
        toastDiv.id = 'customToastNotification';
        toastDiv.innerHTML = `<i class="fi fi-rr-check-circle" style="color: #22c55e; margin-right: 8px;"></i><span id="toastMessage">Sudah divalidasi dan disinkronkan!</span>`;
        toastDiv.style.cssText = "position: fixed; bottom: 20px; right: 20px; background: #0f172a; color: #ffffff; padding: 12px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); display: flex; align-items: center; z-index: 9999; font-size: 14px; opacity: 0; transition: opacity 0.3s ease, transform 0.3s ease; transform: translateY(20px); border-left: 4px solid #10b981;";
        document.body.appendChild(toastDiv);
        existingToast = toastDiv;
    }
    else {
        let msgEl = document.getElementById('toastMessage');
        if (msgEl)
            msgEl.innerText = "Sudah divalidasi dan disinkronkan!";
    }
    setTimeout(() => {
        existingToast.style.opacity = '1';
        existingToast.style.transform = 'translateY(0)';
    }, 10);
    setTimeout(() => {
        existingToast.style.opacity = '0';
        existingToast.style.transform = 'translateY(20px)';
    }, 3000);
    if (typeof window.refreshReportTableUI === 'function') {
        window.refreshReportTableUI();
    }
}
export function LPP() {
    let tglLPP = formatDate('Tanggal_LPP') !== '-' ? formatDate('Tanggal_LPP') : formatDate('Tanggal_LP_LP_1');
    let rawJam = document.getElementById('Jam_Kejadian')?.value.trim() || '';
    let jamFormatted = rawJam ? rawJam.replace(':', '.') + ' WIB' : '-';
    let umurVal = getVal('Umur_Pelaku');
    let umurFormatted = (umurVal !== '-' && umurVal !== '') ? umurVal + ' tahun' : '-';
    let tglDokPab = formatDate('Tanggal_Dokumen_Pemberitahuan');
    let dokPabVal = getVal('Dokumen_Pemberitahuan');
    let dokPabDisplay = 'Tanpa Dokumen';
    if (!dokPabVal.toLowerCase().includes('tanpa dokumen') && dokPabVal && dokPabVal !== '-') {
        let selJenis = document.getElementById('Jenis_Dok_Pemberitahuan_Select')?.value || '';
        let jenisDok = selJenis === 'LAINNYA'
            ? (document.getElementById('Jenis_Dok_Pemberitahuan_Manual')?.value.trim() || '')
            : (selJenis !== '-' ? selJenis : '');
        let nomorDok = document.getElementById('Nomor_Dok_Pemberitahuan')?.value.trim() || '';
        let rawString = (jenisDok ? jenisDok + ' ' : '') + (nomorDok ? nomorDok : dokPabVal);
        rawString = rawString.trim().replace(/^nomor\s+/i, '').replace(/^no\.?\s+/i, '');
        let matchBC = rawString.match(/^(BC\s*\d+(?:\.\d+)?|[A-Z]{2,10})\s*(?:nomor\s+|no\.?\s+)?(.*)$/i);
        let finalDokText = '';
        if (matchBC && matchBC[2].trim()) {
            let jns = matchBC[1].trim();
            let no = matchBC[2].trim();
            finalDokText = `${escText(jns)} nomor ${escText(no)}`;
        }
        else if (rawString.toLowerCase().includes('nomor')) {
            finalDokText = escText(rawString);
        }
        else {
            finalDokText = `nomor ${escText(rawString)}`;
        }
        if (tglDokPab && tglDokPab !== '-') {
            finalDokText += ` tanggal ${tglDokPab}`;
        }
        dokPabDisplay = finalDokText;
    }
    return baseReport('LEMBAR PENERIMAAN PERKARA (LPP)', fmtLP(), false) +
        `<!-- HEADER ATAS -->
  <table class="rtable" style="width:100%; border-collapse:collapse; margin-bottom:12px; font-family:Arial, sans-serif; font-size:10pt; line-height:1.35; table-layout:fixed;">
    <colgroup>
      <col style="width:115px;">
      <col style="width:15px;">
      <col style="width:auto;">
      <col style="width:60px;">
      <col style="width:15px;">
      <col style="width:150px;">
    </colgroup>
    <tr>
      <td style="vertical-align:top;">LP/ Surat Nomor</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="vertical-align:top;">${fmtLP()}</td>
      <td style="vertical-align:top;">Tanggal</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="vertical-align:top; white-space:nowrap;">${tglLPP}</td>
    </tr>
    <tr>
      <td style="vertical-align:top;">SBP Nomor</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="vertical-align:top;">${fmtSBP()}</td>
      <td style="vertical-align:top;">Tanggal</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="vertical-align:top; white-space:nowrap;">${formatDate('Tanggal_SBP')}</td>
    </tr>
  </table>

  <!-- TABEL UTAMA BADAN LPP -->
  <table class="rtable" style="width:100%; border-collapse:collapse; font-family:Arial, sans-serif; font-size:10pt; line-height:1.35; table-layout:fixed;">
    <colgroup>
      <col style="width:24px;">
      <col style="width:20px;">
      <col style="width:145px;">
      <col style="width:15px;">
      <col style="width:auto;">
    </colgroup>
    
    <tr>
      <td style="width:24px; vertical-align:top; padding-top:4px;"><b>A.</b></td>
      <td style="width:165px; vertical-align:top; padding-top:4px;" colspan="2"><b>Asal Perkara</b></td>
      <td style="width:15px; text-align:center; vertical-align:top; padding-top:4px;">:</td>
      <td style="vertical-align:top; padding-top:4px; text-align:justify;">${escText(getVal('Asal_Perkara'))}</td>
    </tr>
    <tr>
      <td style="vertical-align:top; padding-top:4px;"><b>B.</b></td>
      <td style="vertical-align:top; padding-top:4px;" colspan="2"><b>Jenis Penindakan</b></td>
      <td style="text-align:center; vertical-align:top; padding-top:4px;">:</td>
      <td style="vertical-align:top; padding-top:4px; text-align:justify;">${escText(getVal('Jenis_Penindakan'))}</td>
    </tr>
    <tr>
      <td style="vertical-align:top; padding-top:4px;"><b>C.</b></td>
      <td style="vertical-align:top; padding-top:4px;" colspan="2"><b>Jenis Perkara</b></td>
      <td style="text-align:center; vertical-align:top; padding-top:4px;">:</td>
      <td style="vertical-align:top; padding-top:4px; text-align:justify;">${escText(getVal('Jenis_Perkara'))}</td>
    </tr>
    <tr>
      <td style="vertical-align:top; padding-top:4px;"><b>D.</b></td>
      <td style="vertical-align:top; padding-top:4px;" colspan="2"><b>Status Penangkapan</b></td>
      <td style="text-align:center; vertical-align:top; padding-top:4px;">:</td>
      <td style="vertical-align:top; padding-top:4px; text-align:justify;">${escText(getVal('Status_Penangkapan'))}</td>
    </tr>

    <tr>
      <td style="vertical-align:top; padding-top:6px;"><b>E.</b></td>
      <td colspan="4" style="vertical-align:top; padding-top:6px;"><b>Uraian Pelanggaran</b></td>
    </tr>
    <tr>
      <td></td>
      <td style="vertical-align:top;">1.</td>
      <td style="vertical-align:top;">Jenis Pelanggaran/Pasal</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Jenis_Pelanggaran'))} / ${escText(getVal('Pasal_Pelanggaran'))}</td>
    </tr>
    <tr>
      <td></td>
      <td style="vertical-align:top;">2.</td>
      <td style="vertical-align:top;">Modus Operandi</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Modus_Operandi'))}</td>
    </tr>
    <tr>
      <td></td>
      <td style="vertical-align:top;">3.</td>
      <td colspan="3" style="vertical-align:top;">Lokasi</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td style="vertical-align:top;">a. Tempat</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Lokasi_Penindakan'))}</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td style="vertical-align:top;">b. Tanggal dan waktu</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${formatDate('Tanggal_SBP')} / ${jamFormatted}</td>
    </tr>
    <tr>
      <td></td>
      <td style="vertical-align:top;">4.</td>
      <td colspan="3" style="vertical-align:top;">Pelaku Pelanggaran</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td style="vertical-align:top;">a. Nama</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Nama_Pelaku'))}</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td style="vertical-align:top;">b. Umur</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${umurFormatted}</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td style="vertical-align:top;">c. Jenis Kelamin</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Jenis_Kelamin_Pelaku'))}</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td style="vertical-align:top;">d. Alamat</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Alamat_Pelaku'))}</td>
    </tr>

    <tr>
      <td style="vertical-align:top; padding-top:6px;"><b>F.</b></td>
      <td colspan="4" style="vertical-align:top; padding-top:6px;"><b>Barang Hasil Penindakan</b></td>
    </tr>
    <tr>
      <td></td>
      <td style="vertical-align:top;">1.</td>
      <td style="vertical-align:top;">Komoditi</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Komoditi'))}</td>
    </tr>
    <tr>
      <td></td>
      <td style="vertical-align:top;">2.</td>
      <td style="vertical-align:top;">Jumlah Koli / Jenis Koli</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${getVal('Jumlah_Koli')} / ${escText(getVal('Jenis_Koli'))}</td>
    </tr>
    <tr>
      <td></td>
      <td style="vertical-align:top;">3.</td>
      <td style="vertical-align:top;">Pengangkut / Nopol-voy-flight</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Pengangkut'))}</td>
    </tr>
    <tr>
      <td></td>
      <td style="vertical-align:top;">4.</td>
      <td style="vertical-align:top;">No Container / Ukuran</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('No_Kontainer'))} / ${escText(getVal('Ukuran_Kontainer'))}</td>
    </tr>
    <tr>
      <td></td>
      <td style="vertical-align:top;">5.</td>
      <td style="vertical-align:top;">Detail Uraian Barang</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Detail_Barang_LPP') !== '-' ? getVal('Detail_Barang_LPP') : getVal('Uraian_Barang'))}</td>
    </tr>

    <tr>
      <td style="vertical-align:top; padding-top:6px;"><b>G.</b></td>
      <td style="vertical-align:top; padding-top:6px;" colspan="2"><b>Dokumen Barang</b></td>
      <td style="text-align:center; vertical-align:top; padding-top:6px;">:</td>
      <td style="text-align:justify; vertical-align:top; padding-top:6px;">${dokPabDisplay}</td>
    </tr>
    <tr>
      <td style="vertical-align:top; padding-top:4px;"><b>H.</b></td>
      <td style="vertical-align:top; padding-top:4px;" colspan="2"><b>Catatan Atasan Pembuat LPP</b></td>
      <td style="text-align:center; vertical-align:top; padding-top:4px;">:</td>
      <td style="text-align:justify; vertical-align:top; padding-top:4px;">${escText(getVal('Catatan_LPP') || '-')}</td>
    </tr>
  </table>

  <!-- BLOK TANDA TANGAN -->
  <div style="page-break-inside: avoid !important; margin-top:20px; font-family:Arial, sans-serif; font-size:10pt;">
    <div style="display:flex; justify-content:flex-end;">
      <div style="width:40%; text-align:left;">Batam, ${tglLPP}</div>
    </div>
    <div style="display:flex; justify-content:space-between; margin-top:8px;">
      <div style="width:42%; text-align:left;">
        ${escText(getVal('form_jabatan_seksi') !== '-' ? getVal('form_jabatan_seksi') : 'Kepala Seksi Penyidikan')},
        <div class="signature" style="height:55px;"></div>
        ${tteBadge()}
        <b>${escText(getVal('form_nama_seksi'))}</b><br>NIP. ${escText(getVal('form_nip_seksi'))}
      </div>
      <div style="width:40%; text-align:left;">
        Yang membuat LPP,<br>Pelaksana
        <div class="signature" style="height:55px;"></div>
        ${tteBadge()}
        <b>${escText(getVal('form_pembuat_lpp'))}</b><br>NIP. ${escText(getVal('form_nip_pembuat_lpp'))}
      </div>
    </div>
    <div style="display:flex; justify-content:center; margin-top:16px;">
      <div style="width:45%; text-align:left;">
        Mengetahui,<br>Kepala Bidang Penindakan dan Penyidikan
        <div class="signature" style="height:55px;"></div>
        ${tteBadge()}
        <b>${escText(getVal('form_kabid'))}</b><br>NIP. ${escText(getVal('form_nip_kabid'))}
      </div>
    </div>
  </div></div>`;
}
export function LPF() {
    let tglLPF = formatDate('Tanggal_LPF') !== '-' ? formatDate('Tanggal_LPF') : formatDate('Tanggal_LP_LP_1');
    let rawJam = document.getElementById('Jam_Kejadian')?.value.trim() || '';
    let jamFormatted = rawJam ? rawJam.replace(':', '.') : '-';
    let umurVal = getVal('Umur_Pelaku');
    let umurFormatted = (umurVal !== '-' && umurVal !== '') ? umurVal + ' tahun' : '-';
    let dokPabVal = getVal('Dokumen_Pemberitahuan');
    let selJenis = document.getElementById('Jenis_Dok_Pemberitahuan_Select')?.value || '';
    let jenisDokManual = document.getElementById('Jenis_Dok_Pemberitahuan_Manual')?.value.trim() || '';
    let nomorDok = document.getElementById('Nomor_Dok_Pemberitahuan')?.value.trim() || '';
    let jenisDokPabeanDisplay = '-';
    let nomorDokPabeanDisplay = '-';
    if (dokPabVal.toLowerCase().includes('tanpa dokumen') || selJenis === 'Tanpa Dokumen' || !dokPabVal || dokPabVal === '-') {
        jenisDokPabeanDisplay = 'Tanpa Dokumen';
        nomorDokPabeanDisplay = '-';
    }
    else {
        jenisDokPabeanDisplay = selJenis === 'LAINNYA' ? (jenisDokManual || 'Lainnya') : (selJenis !== '-' ? selJenis : 'BC 2.0');
        if (nomorDok) {
            nomorDokPabeanDisplay = escText(nomorDok);
        }
        else {
            let rawClean = dokPabVal.replace(/^(BC\s*\d+(?:\.\d+)?|[A-Z]{2,10})/i, '').replace(/^nomor\s+/i, '').replace(/^no\.?\s+/i, '').trim();
            nomorDokPabeanDisplay = escText(rawClean || '-');
        }
    }
    return baseReport('LEMBAR PENELITIAN FORMAL (LPF)', fmtLPF(), false) +
        `<table class="rtable" style="width:100%; border-collapse:collapse; font-family:Arial, sans-serif; font-size:10pt; line-height:1.35; table-layout:fixed;">
    <colgroup>
      <col style="width:24px;">
      <col style="width:20px;">
      <col style="width:145px;">
      <col style="width:15px;">
      <col style="width:auto;">
    </colgroup>
    
    <tr>
      <td style="vertical-align:top;"><b>A.</b></td>
      <td colspan="4" style="vertical-align:top;"><b>Uraian Pelanggaran</b></td>
    </tr>
    <tr>
      <td></td>
      <td style="vertical-align:top;">1.</td>
      <td style="vertical-align:top;">Jenis Pelanggaran / Pasal</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Jenis_Pelanggaran'))} / ${escText(getVal('Pasal_Pelanggaran'))}</td>
    </tr>
    <tr>
      <td></td>
      <td style="vertical-align:top;">2.</td>
      <td style="vertical-align:top;">Tempat (Locus)</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Lokasi_Penindakan'))}</td>
    </tr>
    <tr>
      <td></td>
      <td style="vertical-align:top;">3.</td>
      <td style="vertical-align:top;">Waktu (Tempus)</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${formatDate('Tanggal_SBP')} / ${jamFormatted} WIB</td>
    </tr>
    <tr>
      <td></td>
      <td style="vertical-align:top;">4.</td>
      <td colspan="3" style="vertical-align:top;">Pelaku</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td style="vertical-align:top;">Nama</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Nama_Pelaku'))}</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td style="vertical-align:top;">Jenis Kelamin</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Jenis_Kelamin_Pelaku'))}</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td style="vertical-align:top;">Umur</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${umurFormatted}</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td style="vertical-align:top;">Alamat</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Alamat_Pelaku'))}</td>
    </tr>
    <tr>
      <td></td>
      <td style="vertical-align:top;">5.</td>
      <td style="vertical-align:top;">Status Penangkapan</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Status_Penangkapan'))}</td>
    </tr>

    <tr>
      <td style="vertical-align:top; padding-top:6px;"><b>B.</b></td>
      <td colspan="4" style="vertical-align:top; padding-top:6px;"><b>Kelengkapan Dokumen Penindakan</b></td>
    </tr>
    <tr>
      <td></td>
      <td style="vertical-align:top;">1.</td>
      <td style="vertical-align:top;">No. Surat Perintah/Tugas</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${fmtSprinIndak()}</td>
    </tr>
    <tr>
      <td></td>
      <td style="vertical-align:top;">2.</td>
      <td style="vertical-align:top;">No. SBP</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${fmtSBP()} tanggal ${formatDate('Tanggal_SBP')}</td>
    </tr>
    <tr>
      <td></td>
      <td style="vertical-align:top;">3.</td>
      <td style="vertical-align:top;">No. LP/LK/Lap. Polisi</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${fmtLP()} tanggal ${formatDate('Tanggal_LP_LP_1')}</td>
    </tr>
    <tr>
      <td></td>
      <td style="vertical-align:top;">4.</td>
      <td style="vertical-align:top;">BAP Saksi atas nama</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">-</td>
    </tr>
    <tr>
      <td></td>
      <td style="vertical-align:top;">5.</td>
      <td style="vertical-align:top;">BAP Tersangka atas nama</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">-</td>
    </tr>
    <tr>
      <td></td>
      <td style="vertical-align:top;">6.</td>
      <td style="vertical-align:top;">Resume Perkara</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">-</td>
    </tr>
    <tr>
      <td></td>
      <td style="vertical-align:top;">7.</td>
      <td style="vertical-align:top;">Dokumen Lain</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">LPTP<br>LPHP</td>
    </tr>

    <tr>
      <td style="vertical-align:top; padding-top:6px;"><b>C.</b></td>
      <td colspan="4" style="vertical-align:top; padding-top:6px;"><b>Barang Hasil Penindakan</b></td>
    </tr>
    <tr>
      <td></td>
      <td style="vertical-align:top;">1.</td>
      <td style="vertical-align:top;">Komoditi</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Komoditi'))}</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td style="vertical-align:top;">Uraian Barang</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Uraian_Barang'))}</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td style="vertical-align:top;">Merek</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Merek'))}</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td style="vertical-align:top;">Kondisi</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Kondisi'))}</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td style="vertical-align:top;">Tipe</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Tipe'))}</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td style="vertical-align:top;">Spesifikasi Lain</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Spesifikasi_Lain'))}</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td style="vertical-align:top;">Jumlah Koli</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Jumlah_Koli'))}</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td style="vertical-align:top;">Jenis Koli</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Jenis_Koli'))}</td>
    </tr>
    
    <tr>
      <td></td>
      <td style="vertical-align:top;">2.</td>
      <td style="vertical-align:top;">Dokumen Pab/Cukai Asal</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(jenisDokPabeanDisplay)}</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td style="vertical-align:top;">Kantor Pendaftaran</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Kantor'))}</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td style="vertical-align:top;">Nomor</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${nomorDokPabeanDisplay}</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td style="vertical-align:top;">Tanggal</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${formatDate('Tanggal_Dokumen_Pemberitahuan')}</td>
    </tr>

    <tr>
      <td></td>
      <td style="vertical-align:top;">3.</td>
      <td style="vertical-align:top;">Pengangkut</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Pengangkut'))}</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td style="vertical-align:top;">No. Voyage/ No. Polisi</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">-</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td style="vertical-align:top;">Kontainer No</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('No_Kontainer'))}</td>
    </tr>
    <tr>
      <td></td>
      <td></td>
      <td style="vertical-align:top;">Ukuran</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Ukuran_Kontainer'))}</td>
    </tr>

    <tr>
      <td style="width:25px; vertical-align:top; padding-top:6px;"><b>D.</b></td>
      <td style="width:20px;"></td>
      <td style="width:145px; vertical-align:top; padding-top:6px;"><b>Kesimpulan</b></td>
      <td style="width:15px; text-align:center; vertical-align:top; padding-top:6px;">:</td>
      <td style="vertical-align:top; padding-top:6px; text-align:justify;">${escText(getVal('Jenis_Pelanggaran_Pasal'))}</td>
    </tr>
    <tr>
      <td style="width:25px; vertical-align:top; padding-top:4px;"><b>E.</b></td>
      <td style="width:20px;"></td>
      <td style="width:145px; vertical-align:top; padding-top:4px;"><b>Usulan</b></td>
      <td style="width:15px; text-align:center; vertical-align:top; padding-top:4px;">:</td>
      <td style="vertical-align:top; padding-top:4px; text-align:justify;">Perlu dilakukan penelitian atas dugaan pelanggaran administrasi</td>
    </tr>
    <tr>
      <td style="width:25px; vertical-align:top; padding-top:4px;"><b>F.</b></td>
      <td style="width:20px;"></td>
      <td style="width:145px; vertical-align:top; padding-top:4px;"><b>Catatan/Disposisi Atasan</b></td>
      <td style="width:15px; text-align:center; vertical-align:top; padding-top:4px;">:</td>
      <td style="vertical-align:top; padding-top:4px; text-align:justify;">${escText(getVal('Catatan_LPF') || '-')}</td>
    </tr>
  </table>

  <div style="page-break-inside: avoid !important; margin-top:20px; font-family:Arial, sans-serif;">
    <div style="display:flex; justify-content:flex-end;">
      <div style="width:40%; text-align:left;">Batam, ${tglLPF}</div>
    </div>
    <div style="display:flex; justify-content:space-between; margin-top:8px;">
      <div style="width:42%; text-align:left;">
        ${escText(getVal('form_jabatan_seksi') !== '-' ? getVal('form_jabatan_seksi') : 'Kepala Seksi Penyidikan')},
        <div class="signature" style="height:55px;"></div>
        ${tteBadge()}
        <b>${escText(getVal('form_nama_seksi'))}</b><br>NIP. ${escText(getVal('form_nip_seksi'))}
      </div>
      <div style="width:40%; text-align:left;">
        Tim Peneliti,
        <div class="signature" style="height:55px;"></div>
        ${tteBadge()}
        <b>${escText(getVal('form_petugas_lpf'))}</b><br>NIP. ${escText(getVal('form_nip_petugas_lpf'))}
      </div>
    </div>
    <div style="display:flex; justify-content:center; margin-top:16px;">
      <div style="width:45%; text-align:left;">
        Mengetahui,<br>Kepala Bidang Penindakan dan Penyidikan
        <div class="signature" style="height:55px;"></div>
        ${tteBadge()}
        <b>${escText(getVal('form_kabid'))}</b><br>NIP. ${escText(getVal('form_nip_kabid'))}
      </div>
    </div>
  </div></div>`;
}
export function SPLIT() {
    let tglSplit = formatDate('Tanggal_SPLIT') !== '-' ? formatDate('Tanggal_SPLIT') : formatDate('Tanggal_LP_LP_1');
    let hari = getVal('Hari_SBP');
    let tglIndo = formatDate('Tanggal_SBP');
    let rawJam = document.getElementById('Jam_Kejadian')?.value.trim() || '';
    let jamFormatted = rawJam ? rawJam.replace(':', '.') + ' WIB' : '-';
    let lokasi = getVal('Lokasi_Penindakan');
    let rawModus = getVal('Modus_Operandi');
    let modusVerb = formatModusVerb(rawModus);
    let uraianPerkaraSplit = `Pada hari ${hari}, tanggal ${tglIndo} sekitar pukul ${jamFormatted} di ${lokasi} yang dilakukan penindakan oleh Petugas Bea Cukai Batam yang ${modusVerb}`;
    let pegawai = [
        { nama: getVal('form_ketua_tim'), nip: getVal('form_nip_ketua_tim'), pkt: getVal('form_gol_ketua_tim'), jab: getVal('form_jabatan_ketua_tim') || 'Ketua Tim Peneliti' },
        { nama: getVal('form_pembuat_lpp'), nip: getVal('form_nip_pembuat_lpp'), pkt: getVal('form_gol_pembuat_lpp'), jab: getVal('form_jabatan_pembuat_lpp') || 'Anggota Tim Peneliti' },
        { nama: getVal('form_petugas_lpf'), nip: getVal('form_nip_petugas_lpf'), pkt: getVal('form_gol_petugas_lpf'), jab: getVal('form_jabatan_petugas_lpf') || 'Anggota Tim Peneliti' },
        { nama: getVal('form_indak_1'), nip: getVal('form_nip_indak_1'), pkt: getVal('form_gol_indak_1'), jab: getVal('form_jabatan_indak_1') || 'Anggota Tim Peneliti' }
    ];
    let pegawaiHtml = pegawai.map((p, i) => `
    <table style="width:100%; border:none; margin-bottom:3px; border-collapse:collapse; font-size:10pt;">
      <tr><td style="width:25px; vertical-align:top;">${i + 1}.</td><td style="width:110px; vertical-align:top;">Nama</td><td style="width:15px; text-align:center; vertical-align:top;">:</td><td style="vertical-align:top;"><b>${escText(p.nama)}</b></td></tr>
      <tr><td></td><td style="vertical-align:top;">NIP</td><td style="text-align:center; vertical-align:top;">:</td><td style="vertical-align:top;">${escText(p.nip)}</td></tr>
      <tr><td></td><td style="vertical-align:top;">Pangkat / Gol.</td><td style="text-align:center; vertical-align:top;">:</td><td style="vertical-align:top;">${escText(p.pkt)}</td></tr>
      <tr><td></td><td style="vertical-align:top;">Jabatan</td><td style="text-align:center; vertical-align:top;">:</td><td style="vertical-align:top;">${escText(p.jab)}</td></tr>
    </table>
  `).join('');
    return baseReport('SURAT PERINTAH PENELITIAN (SPLIT)', fmtSplit(), false) +
        `<table class="rtable" style="width:100%; border-collapse:collapse; font-size:10pt; line-height:1.3;">
    <tr>
      <td style="width:110px; vertical-align:top;"><b>Dasar</b></td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top; padding:0;">
        <table style="width:100%; border-collapse:collapse; font-size:10pt;">
          <tr><td style="width:20px; vertical-align:top;">1.</td><td style="text-align:justify; vertical-align:top;">Undang-undang nomor 10 tahun 1995 tentang Kepabeanan sebagaimana telah diubah dengan Undang-undang nomor 17 tahun 2006 dan/atau Undang-undang nomor 11 tahun 1995 tentang Cukai sebagaimana telah diubah dengan Undang-undang nomor 39 tahun 2007;</td></tr>
          <tr><td style="vertical-align:top;">2.</td><td style="text-align:justify; vertical-align:top;">Peraturan Pemerintah nomor 41 tahun 2021 tentang Penyelenggaraan Kawasan Perdagangan Bebas dan Pelabuhan Bebas;</td></tr>
          <tr><td style="vertical-align:top;">3.</td><td style="text-align:justify; vertical-align:top;">Peraturan Menteri Keuangan nomor 183/PMK.01/2020 tentang perubahan atas Peraturan Menteri Keuangan nomor 188/PMK.01/2016 tentang Organisasi dan Tata Kerja Instansi Vertikal Direktorat Jenderal Bea dan Cukai;</td></tr>
          <tr><td style="vertical-align:top;">4.</td><td style="text-align:justify; vertical-align:top;">Laporan Pelanggaran Nomor ${fmtLP()} tanggal ${formatDate('Tanggal_LP_LP_1')}.</td></tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="vertical-align:top; padding-top:4px;"><b>Pertimbangan</b></td>
      <td style="text-align:center; vertical-align:top; padding-top:4px;">:</td>
      <td style="text-align:justify; vertical-align:top; padding-top:4px;">
        <table style="width:100%; border-collapse:collapse; font-size:10pt;">
          <tr><td style="width:20px; vertical-align:top;">a.</td><td style="text-align:justify; vertical-align:top;">Bahwa dengan adanya Laporan Pelanggaran Kepabeanan, maka dipandang perlu untuk mengumpulkan bahan keterangan dan menemukan bukti permulaan yang cukup akan adanya tindak pelanggaran di bidang kepabeanan dan/atau cukai;</td></tr>
          <tr><td style="vertical-align:top;">b.</td><td style="text-align:justify; vertical-align:top;">Bahwa untuk maksud tersebut perlu dikeluarkan Surat Perintah Penelitian.</td></tr>
        </table>
      </td>
    </tr>
  </table>
  
  <div style="text-align:center; margin:10px 0 6px; letter-spacing:0.1em; font-weight:bold; font-size:11pt;">D I P E R I N T A H K A N</div>
  
  <table class="rtable" style="width:100%; border-collapse:collapse; font-size:10pt; line-height:1.3;">
    <tr>
      <td style="width:110px; vertical-align:top;"><b>Kepada</b></td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="vertical-align:top; padding:0;">
        ${pegawaiHtml}
      </td>
    </tr>
    <tr>
      <td style="vertical-align:top; padding-top:4px;"><b>Untuk</b></td>
      <td style="width:15px; text-align:center; vertical-align:top; padding-top:4px;">:</td>
      <td style="text-align:justify; vertical-align:top; padding-top:4px;">
        <table style="width:100%; border-collapse:collapse; font-size:10pt;">
          <tr><td style="width:20px; vertical-align:top;">1.</td><td style="text-align:justify; vertical-align:top;">Melakukan tugas penelitian berupa mencari, mengumpulkan bahan keterangan, dan menemukan bukti permulaan yang cukup atas perkara ${uraianPerkaraSplit} yang diduga dilakukan oleh:</td></tr>
          <tr><td></td><td style="padding:2px 0;">
            <table style="width:100%; border:none; border-collapse:collapse; font-size:10pt;">
              <tr><td style="width:110px; vertical-align:top;">Nama</td><td style="width:15px; text-align:center; vertical-align:top;">:</td><td style="vertical-align:top;"><b>${escText(getVal('Nama_Pelaku'))}</b></td></tr>
              <tr><td style="vertical-align:top;">Pekerjaan</td><td style="text-align:center; vertical-align:top;">:</td><td style="vertical-align:top;">${escText(getVal('Pekerjaan'))}</td></tr>
              <tr><td style="vertical-align:top;">Tempat/Tgl Lahir</td><td style="text-align:center; vertical-align:top;">:</td><td style="vertical-align:top;">${escText(getVal('TTL'))}</td></tr>
              <tr><td style="vertical-align:top;">Alamat</td><td style="text-align:center; vertical-align:top;">:</td><td style="text-align:justify; vertical-align:top;">${escText(getVal('Alamat_Pelaku'))}</td></tr>
            </table>
          </td></tr>
          <tr><td style="vertical-align:top;">2.</td><td style="text-align:justify; vertical-align:top;">Setelah melaksanakan Surat Perintah ini agar melaporkan kepada yang memberi perintah.</td></tr>
        </table>
      </td>
    </tr>
  </table>
  <p style="margin-top:8px; margin-bottom:0; text-align:justify; font-size:10pt;">Demikian surat perintah ini dibuat untuk dilaksanakan dengan penuh tanggung jawab.</p>
  
  <div style="page-break-inside: avoid !important; display:flex; justify-content:flex-end; margin-top:14px;">
    <div style="width:45%; text-align:left; font-size:10pt;">
      Dikeluarkan di : Batam<br>
      Pada tanggal : ${tglSplit}<br><br>
      <div style="text-align:left;">
        Kepala Bidang Penindakan dan Penyidikan
        <div class="signature" style="height:55px;"></div>
        ${tteBadge()}
        <b>${escText(getVal('form_kabid'))}</b><br>NIP. ${escText(getVal('form_nip_kabid'))}
      </div>
    </div>
  </div></div>`;
}
export function SPRIN_CACAH() {
    let tglSprin = formatDate('Tanggal_Sprin_Cacah') !== '-' ? formatDate('Tanggal_Sprin_Cacah') : formatDate('Tanggal_SBP');
    let listPegawai = JSON.parse(localStorage.getItem('sprinPegawaiList') || '[]');
    if (listPegawai.length === 0) {
        listPegawai = [
            { nama: getVal('form_ketua_tim'), nip: getVal('form_nip_ketua_tim'), pangkat: getVal('form_gol_ketua_tim'), jabatan: getVal('form_jabatan_ketua_tim') || 'Ketua Tim Peneliti' },
            { nama: getVal('form_pembuat_lpp'), nip: getVal('form_nip_pembuat_lpp'), pangkat: getVal('form_gol_pembuat_lpp'), jabatan: getVal('form_jabatan_pembuat_lpp') || 'Petugas LPP' },
            { nama: getVal('form_petugas_lpf'), nip: getVal('form_nip_petugas_lpf'), pangkat: getVal('form_gol_petugas_lpf'), jabatan: getVal('form_jabatan_petugas_lpf') || 'Petugas LPF' },
            { nama: getVal('form_indak_1'), nip: getVal('form_nip_indak_1'), pangkat: getVal('form_gol_indak_1'), jabatan: getVal('form_jabatan_indak_1') || 'Petugas Penindakan 1' }
        ];
    }
    let pegawaiHtml = listPegawai.map((p, i) => `
    <table style="width:100%; border:none; margin-bottom:3px; border-collapse:collapse; font-size:10pt;">
      <tr><td style="width:25px; vertical-align:top;">${i + 1}.</td><td style="width:110px; vertical-align:top;">Nama</td><td style="width:15px; text-align:center; vertical-align:top;">:</td><td style="vertical-align:top;"><b>${escText(p.nama)}</b></td></tr>
      <tr><td></td><td style="vertical-align:top;">NIP</td><td style="text-align:center; vertical-align:top;">:</td><td style="vertical-align:top;">${escText(p.nip)}</td></tr>
      <tr><td></td><td style="vertical-align:top;">Pangkat / Gol.</td><td style="text-align:center; vertical-align:top;">:</td><td style="vertical-align:top;">${escText(p.pangkat || p.pkt || '-')}</td></tr>
      <tr><td></td><td style="vertical-align:top;">Jabatan</td><td style="text-align:center; vertical-align:top;">:</td><td style="vertical-align:top;">${escText(p.jabatan || p.jab || '-')}</td></tr>
    </table>
  `).join('');
    return baseReport('SURAT PERINTAH PENCACAHAN BARANG HASIL PENINDAKAN', fmtPrintCacah(), false) +
        `<table class="rtable" style="width:100%; border-collapse:collapse; font-size:10pt; line-height:1.3;">
    <tr>
      <td style="width:110px; vertical-align:top;"><b>Dasar</b></td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top; padding:0;">
        <table style="width:100%; border-collapse:collapse; font-size:10pt;">
          <tr><td style="width:20px; vertical-align:top;">1.</td><td style="text-align:justify; vertical-align:top;">Undang-undang nomor 10 tahun 1995 tentang Kepabeanan sebagaimana telah diubah dengan Undang-undang nomor 17 tahun 2006 dan/atau Undang-undang nomor 11 tahun 1995 tentang Cukai sebagaimana telah diubah dengan Undang-undang nomor 39 tahun 2007;</td></tr>
          <tr><td style="vertical-align:top;">2.</td><td style="text-align:justify; vertical-align:top;">Peraturan Pemerintah nomor 41 Tahun 2021 tentang Penyelenggaraan Kawasan Perdagangan Bebas dan Pelabuhan Bebas;</td></tr>
          <tr><td style="vertical-align:top;">3.</td><td style="text-align:justify; vertical-align:top;">Pasal 95 ayat 1 Peraturan Direktur Jenderal Bea dan Cukai Nomor P-8/BC/2025 tentang Tata Laksana Pengawasan di Bidang Kepabeanan dan Cukai;</td></tr>
          <tr><td style="vertical-align:top;">4.</td><td style="text-align:justify; vertical-align:top;">Laporan Pelanggaran nomor ${fmtLP()} tanggal ${formatDate('Tanggal_LP_LP_1')}.</td></tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="vertical-align:top; padding-top:4px;"><b>Pertimbangan</b></td>
      <td style="text-align:center; vertical-align:top; padding-top:4px;">:</td>
      <td style="text-align:justify; vertical-align:top; padding-top:4px;">Dalam rangka penelitian dan penyelidikan, perlu untuk melakukan tindakan pencacahan barang hasil penindakan.</td>
    </tr>
  </table>

  <div style="text-align:center; margin:10px 0 6px; letter-spacing:0.1em; font-weight:bold; font-size:11pt;">D I P E R I N T A H K A N</div>

  <table class="rtable" style="width:100%; border-collapse:collapse; font-size:10pt; line-height:1.3;">
    <tr>
      <td style="width:110px; vertical-align:top;"><b>Kepada</b></td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="vertical-align:top; padding:0;">
        ${pegawaiHtml}
      </td>
    </tr>
    <tr>
      <td style="vertical-align:top; padding-top:4px;"><b>Untuk</b></td>
      <td style="width:15px; text-align:center; vertical-align:top; padding-top:4px;">:</td>
      <td style="text-align:justify; vertical-align:top; padding-top:4px;">
        <table style="width:100%; border-collapse:collapse; font-size:10pt;">
          <tr><td style="width:20px; vertical-align:top;">1.</td><td style="text-align:justify; vertical-align:top;">Melakukan pencacahan atas Laporan Pelanggaran nomor ${fmtLP()} tanggal ${formatDate('Tanggal_LP_LP_1')};</td></tr>
          <tr><td style="vertical-align:top;">2.</td><td style="text-align:justify; vertical-align:top;">Setelah melaksanakan Surat Perintah ini agar melaporkan kepada yang memberi perintah;</td></tr>
          <tr><td style="vertical-align:top;">3.</td><td style="text-align:justify; vertical-align:top;">Surat Perintah ini berlaku dari tanggal ${formatDate('Tanggal_LP_LP_1')} sampai dengan selesai.</td></tr>
        </table>
      </td>
    </tr>
  </table>
  <p style="margin-top:8px; margin-bottom:0; text-align:justify; font-size:10pt;">Demikian surat perintah ini dibuat untuk dilaksanakan dengan penuh tanggung jawab.</p>
  
  <div style="page-break-inside: avoid !important; display:flex; justify-content:flex-end; margin-top:14px;">
    <div style="width:45%; text-align:left; font-size:10pt;">
      Dikeluarkan di : Batam<br>
      Pada tanggal : ${tglSprin}<br><br>
      <div style="text-align:left;">
        Kepala Bidang Penindakan dan Penyidikan
        <div class="signature" style="height:55px;"></div>
        ${tteBadge()}
        <b>${escText(getVal('form_kabid'))}</b><br>NIP. ${escText(getVal('form_nip_kabid'))}
      </div>
    </div>
  </div></div>`;
}
export function BA() {
    let paperLandscapeClass = store.selectedPaperSize === 'A4' ? 'report landscape paper-a4' : 'report landscape';
    let items = JSON.parse(localStorage.getItem('cacahItems') || '[]');
    let hariCacah = (getVal('Hari_Cacah') || '-').toLowerCase();
    let teksTgl = (getVal('TeksTanggal') || '-').toLowerCase();
    let tglSprin = formatDate('Tanggal_Sprin_Cacah') !== '-' ? formatDate('Tanggal_Sprin_Cacah') : formatDate('Tanggal_SBP');
    let noSprin = fmtPrintCacah();
    let noSBP = fmtSBP();
    let lokasi = escText(getVal('Lokasi_Penindakan'));
    let tglBA = formatDate('Tanggal_BA') !== '-' ? formatDate('Tanggal_BA') : formatDate('Tanggal_SBP');
    let noBA = fmtBA();
    let listPegawai = JSON.parse(localStorage.getItem('sprinPegawaiList') || '[]');
    let p1, p2, p3, p4, p5, p6;
    if (listPegawai.length >= 6) {
        p1 = { nama: listPegawai[0].nama, nip: listPegawai[0].nip, pkt: listPegawai[0].pangkat || listPegawai[0].pkt, jab: listPegawai[0].jabatan || listPegawai[0].jab };
        p2 = { nama: listPegawai[1].nama, nip: listPegawai[1].nip, pkt: listPegawai[1].pangkat || listPegawai[1].pkt, jab: listPegawai[1].jabatan || listPegawai[1].jab };
        p3 = { nama: listPegawai[2].nama, nip: listPegawai[2].nip, pkt: listPegawai[2].pangkat || listPegawai[2].pkt, jab: listPegawai[2].jabatan || listPegawai[2].jab };
        p4 = { nama: listPegawai[3].nama, nip: listPegawai[3].nip, pkt: listPegawai[3].pangkat || listPegawai[3].pkt, jab: listPegawai[3].jabatan || listPegawai[3].jab };
        p5 = { nama: listPegawai[4].nama, nip: listPegawai[4].nip, pkt: listPegawai[4].pangkat || listPegawai[4].pkt, jab: listPegawai[4].jabatan || listPegawai[4].jab };
        p6 = { nama: listPegawai[5].nama, nip: listPegawai[5].nip, pkt: listPegawai[5].pangkat || listPegawai[5].pkt, jab: listPegawai[5].jabatan || listPegawai[5].jab };
    }
    else {
        p1 = { nama: getVal('form_ketua_tim'), nip: getVal('form_nip_ketua_tim'), pkt: getVal('form_gol_ketua_tim'), jab: getVal('form_jabatan_ketua_tim') || 'Ketua Tim Peneliti' };
        p2 = { nama: getVal('form_pembuat_lpp'), nip: getVal('form_nip_pembuat_lpp'), pkt: getVal('form_gol_pembuat_lpp'), jab: getVal('form_jabatan_pembuat_lpp') || 'Petugas LPP' };
        p3 = { nama: getVal('form_petugas_lpf'), nip: getVal('form_nip_petugas_lpf'), pkt: getVal('form_gol_petugas_lpf'), jab: getVal('form_jabatan_petugas_lpf') || 'Petugas LPF' };
        p4 = { nama: getVal('form_indak_1'), nip: getVal('form_nip_indak_1'), pkt: getVal('form_gol_indak_1'), jab: getVal('form_jabatan_indak_1') || 'Petugas Penindakan 1' };
        p5 = { nama: getVal('form_indak_2'), nip: getVal('form_nip_indak_2'), pkt: getVal('form_gol_indak_2'), jab: getVal('form_jabatan_indak_2') || 'Petugas Penindakan 2' };
        p6 = { nama: getVal('form_indak_lainnya'), nip: getVal('form_nip_indak_lainnya'), pkt: getVal('form_gol_indak_lainnya'), jab: getVal('form_jabatan_indak_lainnya') || 'Petugas Penindakan 3' };
    }
    let timPeneliti = [p1, p2, p3];
    let timPenindakan = [p4, p5, p6];
    let allPetugas = [p1, p2, p3, p4, p5, p6];
    let renderTabelPegawai = (list) => list.map((p, idx) => `
    <table style="width:100%; border-collapse:collapse; margin-bottom:4px; font-family:Arial, sans-serif;">
      <tr>
        <td style="width:5%; text-align:right; padding-right:12px; vertical-align:top;">${idx + 1}.</td>
        <td style="width:16%; vertical-align:top;">Nama</td>
        <td style="width:3%; text-align:center; vertical-align:top;">:</td>
        <td style="vertical-align:top;"><b>${escText(p.nama)}</b></td>
      </tr>
      <tr>
        <td></td>
        <td style="vertical-align:top;">NIP</td>
        <td style="text-align:center; vertical-align:top;">:</td>
        <td style="vertical-align:top;">${escText(p.nip)}</td>
      </tr>
      <tr>
        <td></td>
        <td style="vertical-align:top;">Pangkat</td>
        <td style="text-align:center; vertical-align:top;">:</td>
        <td style="vertical-align:top;">${escText(p.pkt)}</td>
      </tr>
      <tr>
        <td></td>
        <td style="vertical-align:top;">Jabatan</td>
        <td style="text-align:center; vertical-align:top;">:</td>
        <td style="vertical-align:top;">${escText(p.jab)}</td>
      </tr>
    </table>
  `).join('');
    let renderSignaturesBA_P1 = () => `
    <div style="page-break-inside: avoid !important; margin-top:20px; font-family:Arial, sans-serif;">
      <div style="text-align:left; margin-bottom:12px; font-weight:normal;">
        Yang Melakukan Pencacahan,
      </div>
      <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:15px; text-align:left;">
        ${allPetugas.map((p) => `
          <div>
            <div style="font-size:9.5pt;">${escText(p.jab)},</div>
            <div class="signature"></div>
            ${tteBadge()}
            <b>${escText(p.nama)}</b><br>NIP.${escText(p.nip)}
          </div>
        `).join('')}
      </div>
    </div>
  `;
    let renderSignaturesBA_Landscape = () => `
    <div style="page-break-inside: avoid !important; margin-top:20px; font-family:Arial, sans-serif;">
      <div style="text-align:left; margin-bottom:8px; font-weight:normal;">
        Yang Melakukan Pencacahan,
      </div>
      <div style="display:grid; grid-template-columns: repeat(6, 1fr); gap:10px; text-align:left;">
        ${allPetugas.map((p) => `
          <div>
            <div style="font-size:8pt; line-height:1.2; min-height:24px;">${escText(p.jab)},</div>
            <div class="signature" style="height:50px;"></div>
            ${tteBadge()}
            <b style="font-size:8.5pt;">${escText(p.nama)}</b><br><span style="font-size:8pt;">NIP. ${escText(p.nip)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
    let page1 = baseReport('BERITA ACARA PENCACAHAN', noBA, true) +
        `<p style="text-align:justify; font-family:Arial, sans-serif; line-height:1.4; margin-bottom:6px;">
    --------- Pada hari ini ${hariCacah} tanggal ${teksTgl} di Tempat Penimbunan Pabean Kantor Pelayanan Utama Bea Cukai Tipe B Batam, berdasarkan Surat Perintah Pencacahan Barang Hasil Penindakan (SPPBHP) Kepala Bidang Penindakan dan Penyidikan nomor ${noSprin} tanggal ${tglSprin}, kami: ----------
  </p>` +
        renderTabelPegawai(timPeneliti) +
        `<div style="margin:6px 0 6px 0; font-family:Arial, sans-serif;">
    bersama-sama dengan: -----------------------------------------------------------------------------------------
  </div>` +
        renderTabelPegawai(timPenindakan) +
        `<p style="text-align:justify; font-family:Arial, sans-serif; line-height:1.4; margin-top:6px; margin-bottom:6px;">
    telah melakukan pencacahan terhadap Barang Hasil Penindakan yang berasal dari penindakan di ${lokasi} sesuai dengan Surat Bukti Penindakan Nomor ${noSBP}, dengan hasil pencacahan sebagaimana terlampir. ------------------------------------
  </p>
  <p style="text-align:justify; font-family:Arial, sans-serif; line-height:1.4; margin-bottom:6px;">
    Atas Barang Hasil Penindakan tersebut di atas kemudian dilakukan penyimpanan di Tempat Penimbunan Pabean Kantor Pelayanan Utama Bea Cukai Tipe B Batam.--------------------------------------------------
  </p>
  <p style="text-align:justify; font-family:Arial, sans-serif; line-height:1.4; margin-bottom:6px;">
    Demikian Berita Acara ini dibuat dengan sebenarnya dan ditandatangani pada tempat dan waktu tersebut di atas. ------------------------------------------------------------------------------------------------
  </p>` +
        renderSignaturesBA_P1() + `</div>`;
    let page2 = `<div class="pagebreak"></div>
  <div class="${paperLandscapeClass}">
    <div style="display:flex; justify-content:flex-end; margin-bottom:12px;">
      <div style="width:30%; text-align:justify;">
        <div style="margin-bottom:4px; font-size:10.5pt; font-weight:bold;">Lampiran Berita Acara Pencacahan</div>
        <table style="border:none; width:100%; border-collapse:collapse; font-size:9.5pt;">
          <tr><td style="width:25%; vertical-align:top;">Nomor</td><td style="width:4%; text-align:center; vertical-align:top;">:</td><td style="vertical-align:top;">${noBA}</td></tr>
          <tr><td style="vertical-align:top;">Tanggal</td><td style="text-align:center; vertical-align:top;">:</td><td style="vertical-align:top;">${tglBA}</td></tr>
        </table>
      </div>
    </div>
    
    <table class="rtable" style="font-size:9pt; width:100%; border-collapse:collapse; border:1px solid #000; text-align:center;">
      <thead>
        <tr>
          <th rowspan="3" style="text-align:center; width:4%; border:1px solid #000; padding:6px; vertical-align:middle;">No.</th>
          <th rowspan="3" style="text-align:center; width:12%; border:1px solid #000; padding:6px; vertical-align:middle;">Kode Komoditi</th>
          <th rowspan="3" style="text-align:center; width:20%; border:1px solid #000; padding:6px; vertical-align:middle;">Jenis / Uraian Barang</th>
          <th colspan="6" style="text-align:center; border:1px solid #000; padding:5px;">Data Fisik & Pabean</th>
          <th rowspan="3" style="text-align:center; width:18%; border:1px solid #000; padding:6px; vertical-align:middle;">Keterangan</th>
        </tr>
        <tr>
          <th colspan="2" style="text-align:center; border:1px solid #000; padding:4px;">Ciri Khusus</th>
          <th rowspan="2" style="text-align:center; width:8%; border:1px solid #000; padding:4px; vertical-align:middle;">Jumlah</th>
          <th rowspan="2" style="text-align:center; width:7%; border:1px solid #000; padding:4px; vertical-align:middle;">Satuan</th>
          <th rowspan="2" style="text-align:center; width:8%; border:1px solid #000; padding:4px; vertical-align:middle;">Neg. Asal</th>
          <th rowspan="2" style="text-align:center; width:9%; border:1px solid #000; padding:4px; vertical-align:middle;">Kondisi</th>
        </tr>
        <tr>
          <th style="text-align:center; border:1px solid #000; font-size:8pt; padding:3px; width:7%;">Merk</th>
          <th style="text-align:center; border:1px solid #000; font-size:8pt; padding:3px; width:7%;">Tipe</th>
        </tr>
      </thead>
      <tbody>
        ${items.length === 0 ? `
          <tr>
            <td colspan="10" style="text-align:center; border:1px solid #000; padding:24px 14px; background:#fafafa;">
              <div style="font-weight:bold; color:#b45309; font-size:10pt; margin-bottom:4px; display:flex; align-items:center; justify-content:center; gap:6px;">
                <i class="fi fi-rr-exclamation"></i> Data Rincian Barang Hasil Pencacahan Belum Diisi
              </div>
              <div style="font-size:8.5pt; color:#64748b;">Silakan pilih filter dokumen <b>BA Cacah</b> di atas, lalu klik tombol <b>+ Tambah Barang Cacah</b> untuk memasukkan uraian barang agar muncul di baris tabel ini.</div>
            </td>
          </tr>` :
        items.map((x, i) => `<tr>
            <td style="text-align:center; border:1px solid #000; vertical-align:top; padding:6px;">${i + 1}</td>
            <td style="text-align:center; border:1px solid #000; vertical-align:top; padding:6px;">${escText(x.komoditi || getVal('Komoditi'))}</td>
            <td style="text-align:left; border:1px solid #000; vertical-align:top; padding:6px;">${escText(x.uraian)}</td>
            <td style="text-align:center; border:1px solid #000; vertical-align:top; padding:6px;">${escText(x.merek || (getVal('Merek') !== '-' ? getVal('Merek') : '-'))}</td>
            <td style="text-align:center; border:1px solid #000; vertical-align:top; padding:6px;">${escText(x.tipe || (getVal('Tipe') !== '-' ? getVal('Tipe') : '-'))}</td>
            <td style="text-align:center; border:1px solid #000; vertical-align:top; padding:6px;">${escText(x.jumlah)}</td>
            <td style="text-align:center; border:1px solid #000; vertical-align:top; padding:6px;">${escText(getVal('Jenis_Koli'))}</td>
            <td style="text-align:center; border:1px solid #000; vertical-align:top; padding:6px;">${escText(x.asal || '-')}</td>
            <td style="text-align:center; border:1px solid #000; vertical-align:top; padding:6px;">${escText(x.kondisi)}</td>
            <td style="text-align:left; border:1px solid #000; vertical-align:top; padding:6px;">${escText(x.keterangan || '-')}</td>
          </tr>`).join('')}
      </tbody>
    </table>
    ${renderSignaturesBA_Landscape()}
  </div>`;
    return page1 + page2;
}
export function LHP() {
    let tglLHP = formatDate('Tanggal_LHP') !== '-' ? formatDate('Tanggal_LHP') : formatDate('Tanggal_LP_LP_1');
    let rawJam = document.getElementById('Jam_Kejadian')?.value.trim() || '';
    let jamFormatted = rawJam ? rawJam.replace(':', '.') + ' WIB' : '-';
    let tglDokPab = formatDate('Tanggal_Dokumen_Pemberitahuan');
    let dokPabVal = getVal('Dokumen_Pemberitahuan');
    let selJenis = document.getElementById('Jenis_Dok_Pemberitahuan_Select')?.value || '';
    let jenisDok = selJenis === 'LAINNYA'
        ? (document.getElementById('Jenis_Dok_Pemberitahuan_Manual')?.value.trim() || '')
        : (selJenis !== '-' ? selJenis : '');
    let nomorDok = document.getElementById('Nomor_Dok_Pemberitahuan')?.value.trim() || '';
    let jenisDokPabeanDisplay = '-';
    let nomorTglPabeanDisplay = '-';
    if (dokPabVal.toLowerCase().includes('tanpa dokumen') || selJenis === 'Tanpa Dokumen' || !dokPabVal || dokPabVal === '-') {
        jenisDokPabeanDisplay = 'Tanpa Dokumen';
        nomorTglPabeanDisplay = '-';
    }
    else {
        let rawString = (jenisDok ? jenisDok + ' ' : '') + (nomorDok ? nomorDok : dokPabVal);
        rawString = rawString.trim().replace(/^nomor\s+/i, '').replace(/^no\.?\s+/i, '');
        let matchBC = rawString.match(/^(BC\s*\d+(?:\.\d+)?|[A-Z]{2,10})\s*(?:nomor\s+|no\.?\s+)?(.*)$/i);
        let nomorSaja = '';
        if (matchBC) {
            jenisDokPabeanDisplay = escText(matchBC[1].trim());
            nomorSaja = matchBC[2].trim();
        }
        else {
            jenisDokPabeanDisplay = escText(jenisDok || 'BC 2.0');
            nomorSaja = rawString;
        }
        nomorSaja = nomorSaja.replace(/^nomor\s+/i, '').replace(/^no\.?\s+/i, '').trim();
        let partsNomorTgl = [];
        if (nomorSaja) {
            partsNomorTgl.push(escText(nomorSaja));
        }
        if (tglDokPab && tglDokPab !== '-') {
            partsNomorTgl.push(`tanggal ${tglDokPab}`);
        }
        nomorTglPabeanDisplay = partsNomorTgl.length > 0 ? partsNomorTgl.join(' ') : '-';
    }
    let activeIdx = store.activeRecordIndex;
    let rec = (activeIdx >= 0 && store.databasePerkara[activeIdx]) ? store.databasePerkara[activeIdx] : {};
    let selPelengkap = document.getElementById('Jenis_Dok_Pelengkap_Select')?.value || (rec.Jenis_Dok_Pelengkap_Select || '-');
    let manualPelengkap = document.getElementById('Jenis_Dok_Pelengkap_Manual')?.value.trim() || (rec.Jenis_Dok_Pelengkap_Manual || '');
    let nomorPelengkap = document.getElementById('Nomor_Dok_Pelengkap')?.value.trim() || (rec.Nomor_Dok_Pelengkap || '');
    let rawTglPelengkap = document.getElementById('Tanggal_Dok_Pelengkap')?.value || (rec.Tanggal_Dok_Pelengkap || '');
    let tglPelengkapIndo = rawTglPelengkap ? formatDateIndo(rawTglPelengkap) : '';
    let jenisPelengkapDisplay = '-';
    let nomorTglPelengkapDisplay = '-';
    if (selPelengkap !== '-' && selPelengkap !== '') {
        jenisPelengkapDisplay = selPelengkap === 'LAINNYA' ? (manualPelengkap || 'Lainnya') : selPelengkap;
        let partsPelengkap = [];
        if (nomorPelengkap) {
            partsPelengkap.push(escText(nomorPelengkap));
        }
        if (tglPelengkapIndo && tglPelengkapIndo !== '-') {
            partsPelengkap.push(`tanggal ${tglPelengkapIndo}`);
        }
        nomorTglPelengkapDisplay = partsPelengkap.length > 0 ? partsPelengkap.join(' ') : '-';
    }
    let rawModus = getVal('Modus_Operandi');
    let modusVerb = formatModusVerb(rawModus);
    let modusClean = modusVerb.endsWith(';') ? modusVerb.slice(0, -1) : modusVerb;
    let tglSplitDisplay = formatDate('Tanggal_SPLIT') !== '-' ? formatDate('Tanggal_SPLIT') : formatDate('Tanggal_LP_LP_1');
    return baseReport('LEMBAR HASIL PENELITIAN (LHP)', fmtLHP(), false) +
        `<!-- HEADER ATAS -->
  <table class="rtable" style="margin-bottom:12px; width:100%; border-collapse:collapse; font-family:Arial, sans-serif; font-size:10pt; line-height:1.35; table-layout:fixed;">
    <colgroup>
      <col style="width:105px;">
      <col style="width:15px;">
      <col style="width:auto;">
      <col style="width:65px;">
      <col style="width:15px;">
      <col style="width:160px;">
    </colgroup>
    <tr>
      <td style="vertical-align:top; white-space:nowrap;">Nomor LP/LP-1</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="vertical-align:top;">${fmtLP()}</td>
      <td style="vertical-align:top; white-space:nowrap;">Tgl LP</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="vertical-align:top; white-space:nowrap;">${formatDate('Tanggal_LP_LP_1')}</td>
    </tr>
    <tr>
      <td style="vertical-align:top; white-space:nowrap;">Nomor SPLIT</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="vertical-align:top;">${fmtSplit()}</td>
      <td style="vertical-align:top; white-space:nowrap;">Tgl SPLIT</td>
      <td style="text-align:center; vertical-align:top;">:</td>
      <td style="vertical-align:top; white-space:nowrap;">${tglSplitDisplay}</td>
    </tr>
  </table>
  
  <!-- TABEL UTAMA BADAN LHP -->
  <table class="rtable" style="width:100%; border-collapse:collapse; font-family:Arial, sans-serif; font-size:10pt; line-height:1.35; table-layout:fixed;">
    <colgroup>
      <col style="width:25px;">
      <col style="width:170px;">
      <col style="width:15px;">
      <col style="width:auto;">
    </colgroup>

    <tr>
      <td colspan="4" style="vertical-align:top; padding-bottom:4px;"><b>A. URAIAN PELANGGARAN</b></td>
    </tr>
    <tr>
      <td style="width:25px;"></td>
      <td style="width:170px; vertical-align:top;">Jenis Pelanggaran</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Jenis_Pelanggaran'))}</td>
    </tr>
    <tr>
      <td style="width:25px;"></td>
      <td style="width:170px; vertical-align:top;">Locus</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Lokasi_Penindakan'))}</td>
    </tr>
    <tr>
      <td style="width:25px;"></td>
      <td colspan="3" style="vertical-align:top; padding-top:2px;">Tempus</td>
    </tr>
    <tr>
      <td style="width:25px;"></td>
      <td style="width:170px; vertical-align:top; padding-left:12px;">a. Hari/Tanggal</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Hari_SBP'))} / ${formatDate('Tanggal_SBP')}</td>
    </tr>
    <tr>
      <td style="width:25px;"></td>
      <td style="width:170px; vertical-align:top; padding-left:12px;">b. Waktu</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${jamFormatted}</td>
    </tr>
    
    <tr>
      <td colspan="4" style="vertical-align:top; padding-top:8px; padding-bottom:2px;"><b>PELAKU PELANGGARAN</b></td>
    </tr>
    <tr>
      <td style="width:25px; vertical-align:top;">a.</td>
      <td colspan="3" style="vertical-align:top;">Pelanggaran Administrasi</td>
    </tr>
    <tr>
      <td style="width:25px;"></td>
      <td style="width:170px; vertical-align:top;">Nama Pelanggar</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Nama_Pelaku'))}</td>
    </tr>
    <tr>
      <td style="width:25px;"></td>
      <td style="width:170px; vertical-align:top;">Tempat/Tanggal Lahir</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('TTL'))}</td>
    </tr>
    <tr>
      <td style="width:25px;"></td>
      <td style="width:170px; vertical-align:top;">NIK/No.Passport</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Nomor_Identitas'))}</td>
    </tr>
    <tr>
      <td style="width:25px;"></td>
      <td style="width:170px; vertical-align:top;">NPWP</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Nomor_Identitas'))}</td>
    </tr>
    <tr>
      <td style="width:25px;"></td>
      <td style="width:170px; vertical-align:top;">Nomor Telepon</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Nomor_Telepon'))}</td>
    </tr>
    <tr>
      <td style="width:25px;"></td>
      <td style="width:170px; vertical-align:top;">Nomor Rekening</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Nomor_Rekening'))}</td>
    </tr>
    <tr>
      <td style="width:25px;"></td>
      <td style="width:170px; vertical-align:top;">Jenis Kelamin</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Jenis_Kelamin_Pelaku'))}</td>
    </tr>
    <tr>
      <td style="width:25px;"></td>
      <td style="width:170px; vertical-align:top;">Alamat</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Alamat_Pelaku'))}</td>
    </tr>
    <tr>
      <td style="width:25px;"></td>
      <td style="width:170px; vertical-align:top;">Pengulangan Pelanggaran</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Pengulangan_Pelanggaran'))}</td>
    </tr>

    <tr>
      <td style="width:25px; vertical-align:top; padding-top:4px;">b.</td>
      <td colspan="3" style="vertical-align:top; padding-top:4px;">Pelanggaran Pidana Dengan Pelaku Tidak Dikenal</td>
    </tr>
    <tr>
      <td style="width:25px;"></td>
      <td colspan="3" style="vertical-align:top;">Saksi-saksi</td>
    </tr>
    <tr>
      <td style="width:25px;"></td>
      <td style="width:170px; vertical-align:top; padding-left:12px;">a) Nama</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">-</td>
    </tr>
    <tr>
      <td style="width:25px;"></td>
      <td style="width:170px; vertical-align:top; padding-left:12px;">NIK/No. Passport</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">-</td>
    </tr>
    <tr>
      <td style="width:25px;"></td>
      <td style="width:170px; vertical-align:top; padding-left:12px;">Nomor Telepon</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">-</td>
    </tr>
    <tr>
      <td style="width:25px;"></td>
      <td style="width:170px; vertical-align:top; padding-left:12px;">Jenis Kelamin</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">-</td>
    </tr>
    <tr>
      <td style="width:25px;"></td>
      <td style="width:170px; vertical-align:top; padding-left:12px;">Alamat</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">-</td>
    </tr>

    <tr>
      <td colspan="4" style="vertical-align:top; padding-top:8px; padding-bottom:2px;"><b>URAIAN BARANG</b></td>
    </tr>
    <tr>
      <td style="width:25px; vertical-align:top;">a.</td>
      <td style="width:170px; vertical-align:top;">Komoditas</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Komoditi'))}</td>
    </tr>
    <tr>
      <td style="width:25px; vertical-align:top;">b.</td>
      <td style="width:170px; vertical-align:top;">Uraian Barang</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Uraian_Barang'))}</td>
    </tr>
    <tr>
      <td style="width:25px; vertical-align:top;">c.</td>
      <td style="width:170px; vertical-align:top;">Merk/type</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Merek'))}</td>
    </tr>
    <tr>
      <td style="width:25px; vertical-align:top;">d.</td>
      <td style="width:170px; vertical-align:top;">Kondisi</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Kondisi'))}</td>
    </tr>
    <tr>
      <td style="width:25px; vertical-align:top;">e.</td>
      <td style="width:170px; vertical-align:top;">Kemasan</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">-</td>
    </tr>

    <tr>
      <td colspan="4" style="vertical-align:top; padding-top:8px; padding-bottom:2px;"><b>SARANA PENGANGKUT</b></td>
    </tr>
    <tr>
      <td style="width:25px; vertical-align:top;">a.</td>
      <td style="width:170px; vertical-align:top;">Pengangkut</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">-</td>
    </tr>
    <tr>
      <td style="width:25px; vertical-align:top;">b.</td>
      <td style="width:170px; vertical-align:top;">Jenis Sarana Pengangkut</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">-</td>
    </tr>
    <tr>
      <td style="width:25px; vertical-align:top;">c.</td>
      <td style="width:170px; vertical-align:top;">Nomor Polisi/Nomor Voyage</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">-</td>
    </tr>
    <tr>
      <td style="width:25px; vertical-align:top;">d.</td>
      <td style="width:170px; vertical-align:top;">Bukti Kepemilikan</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">-</td>
    </tr>
    <tr>
      <td style="width:25px; vertical-align:top;">e.</td>
      <td style="width:170px; vertical-align:top;">Nomor Kontainer</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('No_Kontainer'))} / ${escText(getVal('Ukuran_Kontainer'))}</td>
    </tr>
    <tr>
      <td style="width:25px; vertical-align:top;">f.</td>
      <td style="width:170px; vertical-align:top;">Surat Jalan</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">-</td>
    </tr>

    <tr>
      <td colspan="4" style="vertical-align:top; padding-top:8px; padding-bottom:2px;"><b>DOKUMEN-DOKUMEN</b></td>
    </tr>
    <tr>
      <td style="width:25px; vertical-align:top;">a.</td>
      <td style="width:170px; vertical-align:top;">• Dokumen Pabean/Cukai</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${jenisDokPabeanDisplay}</td>
    </tr>
    <tr>
      <td style="width:25px;"></td>
      <td style="width:170px; vertical-align:top; padding-left:10px;">• Nomor/Tanggal</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${nomorTglPabeanDisplay}</td>
    </tr>
    <tr>
      <td style="width:25px;"></td>
      <td style="width:170px; vertical-align:top; padding-left:10px;">• Masa Berlaku</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">-</td>
    </tr>
    <tr>
      <td style="width:25px; vertical-align:top;">b.</td>
      <td style="width:170px; vertical-align:top;">• Dokumen pelengkap</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(jenisPelengkapDisplay)}</td>
    </tr>
    <tr>
      <td style="width:25px;"></td>
      <td style="width:170px; vertical-align:top; padding-left:10px;">• Nomor/Tanggal</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${nomorTglPelengkapDisplay}</td>
    </tr>
    <tr>
      <td style="width:25px;"></td>
      <td style="width:170px; vertical-align:top; padding-left:10px;">• Masa Berlaku</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">-</td>
    </tr>
    <tr>
      <td style="width:25px; vertical-align:top;">c.</td>
      <td style="width:170px; vertical-align:top;">Kantor Pendaftaran</td>
      <td style="width:15px; text-align:center; vertical-align:top;">:</td>
      <td style="text-align:justify; vertical-align:top;">${escText(getVal('Kantor'))}</td>
    </tr>
  </table>

  <!-- BAGIAN B s.d. G -->
  <div style="page-break-inside: avoid !important; margin-top:10px; font-family:Arial, sans-serif; font-size:10pt;">
    <div style="margin-bottom:3px; font-weight:bold;"><b>B. MODUS PELANGGARAN</b></div>
    <div style="border:1px solid #000; padding:6px 8px; text-align:justify; line-height:1.35;">
      Pada hari ${getVal('Hari_SBP')}, tanggal ${formatDate('Tanggal_SBP')} sekitar pukul ${jamFormatted} di ${escText(getVal('Lokasi_Penindakan'))} Petugas ${escText(getVal('Kantor'))} telah melakukan Penindakan Terhadap ${escText(getVal('Nama_Pelaku'))} yang diduga ${modusClean} sesuai dengan Surat Bukti Penindakan nomor ${fmtSBP()} tanggal ${formatDate('Tanggal_SBP')}, hal tersebut Diduga Melanggar Ketentuan ${escText(getVal('Pasal_Pelanggaran'))}.
    </div>
  </div>

  <div style="page-break-inside: avoid !important; margin-top:10px; font-family:Arial, sans-serif; font-size:10pt;">
    <div style="margin-bottom:3px; font-weight:bold;"><b>C. PEMENUHAN UNSUR PASAL</b></div>
    <div style="border:1px solid #000; padding:6px 8px; text-align:justify; line-height:1.35;">
      ${escText(getVal('Pasal_Pelanggaran')) !== '-' ? escText(getVal('Pasal_Pelanggaran')) : escText(getVal('Jenis_Pelanggaran_Pasal'))}
    </div>
  </div>

  <div style="page-break-inside: avoid !important; margin-top:10px; font-family:Arial, sans-serif; font-size:10pt;">
    <div style="margin-bottom:3px; font-weight:bold;"><b>D. KESIMPULAN</b></div>
    <div style="border:1px solid #000; padding:6px 8px; text-align:justify; line-height:1.35;">
      ${escText(getVal('Jenis_Pelanggaran_Pasal'))}
    </div>
  </div>

  <div style="page-break-inside: avoid !important; margin-top:10px; font-family:Arial, sans-serif; font-size:10pt;">
    <div style="margin-bottom:3px; font-weight:bold;"><b>E. ALTERNATIF PENYELESAIAN PERKARA</b></div>
    <div style="border:1px solid #000; padding:6px 8px; text-align:justify; line-height:1.35;">
      ${escText(getVal('Penyelesaian_Perkara'))}
    </div>
  </div>

  <div style="page-break-inside: avoid !important; margin-top:10px; font-family:Arial, sans-serif; font-size:10pt;">
    <div style="margin-bottom:3px; font-weight:bold;"><b>F. INFORMASI LAINNYA</b></div>
    <div style="border:1px solid #000; padding:6px 8px; text-align:justify; line-height:1.35;">
      -
    </div>
  </div>

  <div style="page-break-inside: avoid !important; margin-top:10px; font-family:Arial, sans-serif; font-size:10pt;">
    <div style="margin-bottom:3px; font-weight:bold;"><b>G. CATATAN ATASAN</b></div>
    <div style="border:1px solid #000; padding:6px 8px; text-align:justify; line-height:1.35;">
      -
    </div>
  </div>

  <p style="margin-top:16px; margin-bottom:0; text-align:justify; font-family:Arial, sans-serif; font-size:10pt;">Demikian lembar hasil penelitian ini dibuat dengan kekuatan sumpah jabatan.</p>
  
  <div style="page-break-inside: avoid !important; margin-top:20px; font-family:Arial, sans-serif; font-size:10pt;">
    <div style="display:flex; justify-content:flex-end;">
      <div style="width:40%; text-align:left;">
        Batam, ${tglLHP}
      </div>
    </div>
    <div style="display:flex; justify-content:space-between; margin-top:8px;">
      <div style="width:42%; text-align:left;">
        ${escText(getVal('form_jabatan_seksi') !== '-' ? getVal('form_jabatan_seksi') : 'Kepala Seksi Penyidikan')},
        <div class="signature" style="height:55px;"></div>
        ${tteBadge()}
        <b>${escText(getVal('form_nama_seksi'))}</b><br>NIP. ${escText(getVal('form_nip_seksi'))}
      </div>
      <div style="width:40%; text-align:left;">
        Ketua Tim Peneliti,
        <div class="signature" style="height:55px;"></div>
        ${tteBadge()}
        <b>${escText(getVal('form_ketua_tim'))}</b><br>NIP. ${escText(getVal('form_nip_ketua_tim'))}
      </div>
    </div>
    <div style="display:flex; justify-content:center; margin-top:16px;">
      <div style="width:45%; text-align:left;">
        Mengetahui,<br>Kepala Bidang Penindakan dan Penyidikan
        <div class="signature" style="height:55px;"></div>
        ${tteBadge()}
        <b>${escText(getVal('form_kabid'))}</b><br>NIP. ${escText(getVal('form_nip_kabid'))}
      </div>
    </div>
  </div></div>`;
}
