import { store, savePerkaraToStorage } from '../state/store.js';
import { escText, getVal, formatDate, formatDateIndo, autoIsiTeksBA } from '../utils/formatters.js';
import { autoPaginateReports, applyPageNumbers, navigatePreviewPage, updatePreviewHeaderUI, updateTLPreviewHeaderUI, renderPageSelector } from './ui.js';
import { getDocNum, fmtLP, fmtLPF, fmtSplit, fmtPrintCacah, fmtBA, fmtLHP, LPP, LPF, SPLIT, SPRIN_CACAH, BA, LHP } from '../templates/laporan.js';
import { getTLNumFormat, BAST_PEMILIK, BA_SEGEL, KEP_BDN, SPSA, BAST_LIMPAH } from '../templates/tindaklanjut.js';

export function saveDynamicVal(id: string, val: string): void {
  let el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement;
  if (el) el.value = val;
  if (store.activeRecordIndex >= 0 && store.databasePerkara[store.activeRecordIndex]) {
    (store.databasePerkara[store.activeRecordIndex] as any)[id] = val;
    savePerkaraToStorage();
  }
  updateReportLive();
}

export function saveDynamicValTL(key: string, val: string): void {
  if (store.activeRecordIndex >= 0 && store.databasePerkara[store.activeRecordIndex]) {
    (store.databasePerkara[store.activeRecordIndex] as any)[key] = val;
    savePerkaraToStorage();
    refreshTLTableUI();
  }
}

export function refreshReportTableUI(): void {
  let elNumLPP = document.getElementById('table_num_LPP');
  if (elNumLPP) elNumLPP.textContent = fmtLP();
  let elNumLPF = document.getElementById('table_num_LPF');
  if (elNumLPF) elNumLPF.textContent = fmtLPF();
  let elNumSPLIT = document.getElementById('table_num_SPLIT');
  if (elNumSPLIT) elNumSPLIT.textContent = fmtSplit();
  let elNumSPRIN = document.getElementById('table_num_SPRIN_CACAH');
  if (elNumSPRIN) elNumSPRIN.textContent = fmtPrintCacah();
  let elNumBA = document.getElementById('table_num_BA');
  if (elNumBA) elNumBA.textContent = fmtBA();
  let elNumLHP = document.getElementById('table_num_LHP');
  if (elNumLHP) elNumLHP.textContent = fmtLHP();

  let elDateLPP = document.getElementById('table_date_LPP');
  if (elDateLPP) elDateLPP.textContent = formatDate('Tanggal_LPP') !== '-' ? formatDate('Tanggal_LPP') : formatDate('Tanggal_LP_LP_1');
  let elDateLPF = document.getElementById('table_date_LPF');
  if (elDateLPF) elDateLPF.textContent = formatDate('Tanggal_LPF') !== '-' ? formatDate('Tanggal_LPF') : formatDate('Tanggal_LP_LP_1');
  let elDateSPLIT = document.getElementById('table_date_SPLIT');
  if (elDateSPLIT) elDateSPLIT.textContent = formatDate('Tanggal_SPLIT') !== '-' ? formatDate('Tanggal_SPLIT') : formatDate('Tanggal_LP_LP_1');
  let elDateSPRIN = document.getElementById('table_date_SPRIN_CACAH');
  if (elDateSPRIN) elDateSPRIN.textContent = formatDate('Tanggal_Sprin_Cacah') !== '-' ? formatDate('Tanggal_Sprin_Cacah') : formatDate('Tanggal_SBP');
  let elDateBA = document.getElementById('table_date_BA');
  if (elDateBA) elDateBA.textContent = formatDate('Tanggal_BA') !== '-' ? formatDate('Tanggal_BA') : formatDate('Tanggal_SBP');
  let elDateLHP = document.getElementById('table_date_LHP');
  if (elDateLHP) elDateLHP.textContent = formatDate('Tanggal_LHP') !== '-' ? formatDate('Tanggal_LHP') : formatDate('Tanggal_LP_LP_1');

  updateDocumentStatuses();
}

export function updateDocumentStatuses(): void {
  let docs = [
    { type: 'LPP', num: getDocNum('No_LPP'), date: getVal('Tanggal_LPP'), extra: getVal('Catatan_LPP') },
    { type: 'LPF', num: getDocNum('No_LPF'), date: getVal('Tanggal_LPF'), extra: getVal('Catatan_LPF') },
    { type: 'SPLIT', num: getDocNum('Nomor_SPLIT'), date: getVal('Tanggal_SPLIT'), extra: getVal('Dasar_SPLIT') },
    { type: 'SPRIN_CACAH', num: getDocNum('No_SPRIN_CACAH'), date: getVal('Tanggal_Sprin_Cacah'), extra: getVal('Komoditi') },
    { type: 'BA', num: getDocNum('Nomor_BA'), date: getVal('Tanggal_BA'), extra: getVal('Hari_Cacah') },
    { type: 'LHP', num: getDocNum('Nomor_LHP'), date: getVal('Tanggal_LHP'), extra: getVal('Jenis_Pelanggaran_Pasal') }
  ];

  docs.forEach(d => {
    let el = document.getElementById(`badge_status_${d.type}`);
    if (!el) return;
    
    let isComplete = d.num && d.num !== '-' && d.date && d.date !== '-' && d.extra && d.extra !== '-';
    if (isComplete) {
      el.className = 'badge-status badge-ready';
      el.textContent = 'SIAP CETAK';
    } else {
      el.className = 'badge-status badge-warning';
      el.textContent = 'BELUM LENGKAP';
    }
  });
}

export function refreshTLTableUI(): void {
  if (store.activeRecordIndex < 0) return;
  let rec: any = store.databasePerkara[store.activeRecordIndex];
  
  let b1 = document.getElementById('tl_table_num_BAST_PEMILIK');
  if (b1) b1.textContent = getTLNumFormat('BAST_PEMILIK');
  let bd1 = document.getElementById('tl_table_date_BAST_PEMILIK');
  if (bd1) bd1.textContent = formatDateIndo(rec.TL_Tanggal_Surat || rec.Tanggal_LP_LP_1);

  let b2 = document.getElementById('tl_table_num_BA_SEGEL');
  if (b2) b2.textContent = getTLNumFormat('BA_SEGEL');
  let bd2 = document.getElementById('tl_table_date_BA_SEGEL');
  if (bd2) bd2.textContent = formatDateIndo(rec.TL_Tanggal_Surat || rec.Tanggal_LP_LP_1);

  let b3 = document.getElementById('tl_table_num_KEP_BDN');
  if (b3) b3.textContent = getTLNumFormat('KEP_BDN');
  let bd3 = document.getElementById('tl_table_date_KEP_BDN');
  if (bd3) bd3.textContent = formatDateIndo(rec.KEP_Tanggal_ND || rec.Tanggal_LP_LP_1);

  let b4 = document.getElementById('tl_table_num_SPSA');
  if (b4) b4.textContent = getTLNumFormat('SPSA');
  let bd4 = document.getElementById('tl_table_date_SPSA');
  if (bd4) bd4.textContent = formatDateIndo(rec.SPSA_Tanggal || rec.Tanggal_LP_LP_1);

  let b5 = document.getElementById('tl_table_num_BAST_LIMPAH');
  if (b5) b5.textContent = getTLNumFormat('BAST_LIMPAH');
  let bd5 = document.getElementById('tl_table_date_BAST_LIMPAH');
  if (bd5) bd5.textContent = formatDateIndo(rec.Limpah_Tanggal || rec.Tanggal_LP_LP_1);

  updateTLDocumentStatuses();
  renderTLFormSection(store.currentTLDoc);
  showTLReportView(store.currentTLDoc);
}

export function updateTLDocumentStatuses(): void {
  if (store.activeRecordIndex < 0 || !store.databasePerkara[store.activeRecordIndex]) return;
  let rec: any = store.databasePerkara[store.activeRecordIndex];

  let docsTL = [
    {
      type: 'BAST_PEMILIK',
      num: getTLNumFormat('BAST_PEMILIK'),
      date: rec.TL_Tanggal_Surat || rec.Tanggal_LP_LP_1,
      extra: rec.TL_Hari_BAST && rec.TL_Tgl_Huruf_BAST
    },
    {
      type: 'BA_SEGEL',
      num: getTLNumFormat('BA_SEGEL'),
      date: rec.TL_Tanggal_Surat || rec.Tanggal_LP_LP_1,
      extra: rec.TL_Segel_No_SPLI && rec.TL_Segel_Hari
    },
    {
      type: 'KEP_BDN',
      num: getTLNumFormat('KEP_BDN'),
      date: rec.KEP_Tanggal_ND || rec.Tanggal_LP_LP_1,
      extra: rec.KEP_Nomor_ND && rec.Kepala_Kantor
    },
    {
      type: 'SPSA',
      num: getTLNumFormat('SPSA'),
      date: rec.SPSA_Tanggal || rec.Tanggal_LP_LP_1,
      extra: rec.SPSA_Denda && rec.SPSA_Pasal_Pelanggaran
    },
    {
      type: 'BAST_LIMPAH',
      num: getTLNumFormat('BAST_LIMPAH'),
      date: rec.Limpah_Tanggal || rec.Tanggal_LP_LP_1,
      extra: rec.Instansi_Penerima && rec.Limpah_Pejabat_Penerima
    }
  ];

  docsTL.forEach(d => {
    let el = document.getElementById(`badge_status_${d.type}`);
    if (!el) return;

    let isComplete = d.num && d.num !== '-' && d.date && d.date !== '-' && d.extra && d.extra !== '-';
    if (isComplete) {
      el.className = 'badge-status badge-ready';
      el.textContent = 'SIAP CETAK';
    } else {
      el.className = 'badge-status badge-warning';
      el.textContent = 'BELUM LENGKAP';
    }
  });
}

export function switchDocTab(type: string): void {
  store.currentDoc = type;
  let sel = document.getElementById('docFilterSelect') as HTMLSelectElement;
  if (sel) sel.value = type;

  let tlContainer = document.getElementById('tl_reports');
  if (tlContainer) tlContainer.innerHTML = '';

  renderDynamicInputs(type);
  showReportView(type);
  refreshReportTableUI();
}

export function switchTLDocTab(type: string): void {
  store.currentTLDoc = type;
  let sel = document.getElementById('tlDocFilterSelect') as HTMLSelectElement;
  if (sel) sel.value = type;

  let repContainer = document.getElementById('reports');
  if (repContainer) repContainer.innerHTML = '';

  updateTLPreviewHeaderUI(type);
  renderTLFormSection(type);
  showTLReportView(type);
}

export function updateReportLive(): void {
  let sel = document.getElementById('docFilterSelect') as HTMLSelectElement;
  let activeType = sel ? sel.value : (store.currentDoc || 'LPP');
  refreshReportTableUI();
  showReportView(activeType);
}

export function showReportView(type: string): void {
  let el = document.getElementById('reports');
  if (!el) return;

  if (typeof updatePreviewHeaderUI === 'function') updatePreviewHeaderUI(type);

  if (store.activeRecordIndex < 0) {
    el.innerHTML = `<div class="report"><p>Data Perkara belum divalidasi. Klik "Validasi Data Perkara" untuk mulai mencetak.</p></div>`;
    renderPageSelector(0, 'pageSelectorContainer', 'reports');
    return;
  }

  if (type === 'ALL') {
    el.innerHTML = [LPP(), LPF(), SPLIT(), SPRIN_CACAH(), BA(), LHP()].join('<div class="pagebreak"></div>');
  } else {
    let f = ({ LPP, LPF, SPLIT, SPRIN_CACAH, BA, LHP } as any)[type];
    if (f) el.innerHTML = f();
  }

  autoPaginateReports('reports');
  applyPageNumbers('reports');
  navigatePreviewPage(0, 'reports');
}

export function showTLReportView(type: string): void {
  let el = document.getElementById('tl_reports');
  if (!el) return;

  if (typeof updateTLPreviewHeaderUI === 'function') updateTLPreviewHeaderUI(type);

  if (store.activeRecordIndex < 0) {
    el.innerHTML = `<div class="report"><p>Silakan validasi SBP & LP untuk mencetak Dokumen Tindak Lanjut.</p></div>`;
    renderPageSelector(0, 'tlPageSelectorContainer', 'tl_reports');
    return;
  }

  if (type === 'ALL') {
    el.innerHTML = [BAST_PEMILIK(), BA_SEGEL(), KEP_BDN(), SPSA(), BAST_LIMPAH()].join('<div class="pagebreak"></div>');
  } else {
    let f = ({ BAST_PEMILIK, BA_SEGEL, KEP_BDN, SPSA, BAST_LIMPAH } as any)[type];
    if (f) el.innerHTML = f();
  }

  autoPaginateReports('tl_reports');
  applyPageNumbers('tl_reports');
  navigatePreviewPage(0, 'tl_reports');
}

export function renderDynamicInputs(type: string): void {
  let container = document.getElementById('modalDynamicInputBody');
  if (!container) return;

  let recordOptions = store.databasePerkara.map((rec: any, idx: number) => 
    `<option value="${idx}" ${idx === store.activeRecordIndex ? 'selected' : ''}>LP-${escText(rec.NoLP_LP_1 || '-')} / SBP-${escText(rec.Nomor_SBP || '-')} (${escText(rec.Nama_Pelaku || 'Tanpa Nama')})</option>`
  ).join('');

  let recordSelectorHtml = `
    <div style="background:#1e293b; border:1px solid var(--border-color); padding:10px; border-radius:6px; margin-bottom:14px;">
      <label style="color:var(--primary); margin-bottom:4px; font-weight:700;"><i class="fi fi-rr-folder"></i> Pilih Perkara Aktif (LP & SBP)</label>
      <select id="modalRecordSelector" onchange="store.activeRecordIndex = parseInt((this as HTMLSelectElement).value); renderDynamicInputs('${type}'); refreshReportTableUI(); updateReportLive();" style="width:100%; padding:8px; background:#0f172a; color:#fff; border:1px solid var(--border-color); border-radius:4px; font-size:12px; font-weight:600; cursor:pointer;">
        <option value="-1">- Pilih Perkara Aktif -</option>
        ${recordOptions}
      </select>
    </div>
  `;

  if (store.activeRecordIndex < 0) {
    container.innerHTML = recordSelectorHtml + `<p class="small" style="color:#ef4444; text-align:center; padding:10px;">Silakan pilih data perkara terlebih dahulu dari dropdown di atas.</p>`;
    return;
  }

  let autoInfoBanner = `
    <div style="background:#eff6ff; border-left:3px solid #3b82f6; padding:8px 12px; border-radius:4px; margin-bottom:12px; font-size:12px; color:#1e40af; line-height:1.4;">
      <i class="fi fi-rr-info" style="margin-right:4px;"></i> 
      Nomor & tanggal terisi otomatis dari data perkara. Anda tetap dapat mengubahnya secara fleksibel jika diperlukan.
    </div>
  `;

  if (type === 'LPP') {
    let catLpp = getVal('Catatan_LPP');
    let detBarang = getVal('Detail_Barang_LPP') !== '-' ? getVal('Detail_Barang_LPP') : getVal('Uraian_Barang');
    if (!catLpp || catLpp === '-' || catLpp === '') {
      catLpp = "Laporan penerimaan perkara diterima, segera lanjutkan dengan penelitian formal dan pengumpulan bahan keterangan lebih lanjut.";
    }
    if (!detBarang || detBarang === '') detBarang = '-';

    let tglLpEl = document.getElementById('Tanggal_LP_LP_1') as HTMLInputElement;
    let defaultTglLpp = getVal('Tanggal_LPP') !== '-' ? getVal('Tanggal_LPP') : (tglLpEl ? tglLpEl.value : '');

    container.innerHTML = recordSelectorHtml + autoInfoBanner + `
      <div class="grid" style="margin-bottom:10px;">
        <div>
          <label>Nomor LPP (Cukup Angka)</label>
          <input id="input_No_LPP" value="${escText(getDocNum('No_LPP') || getVal('NoLP_LP_1'))}" oninput="saveDynamicVal('No_LPP', (this as HTMLInputElement).value); refreshReportTableUI();">
        </div>
        <div>
          <label>Tanggal LPP</label>
          <input type="date" id="input_Tgl_LPP" value="${defaultTglLpp}" onchange="saveDynamicVal('Tanggal_LPP', (this as HTMLInputElement).value); refreshReportTableUI();">
        </div>
      </div>
      <div style="margin-bottom:10px;">
        <label>Catatan Atasan Pembuat LPP</label>
        <textarea id="Catatan_LPP" oninput="saveDynamicVal('Catatan_LPP', (this as HTMLTextAreaElement).value)">${escText(catLpp)}</textarea>
      </div>
      <div>
        <label>Detail Uraian Barang LPP</label>
        <textarea id="Detail_Barang_LPP" oninput="saveDynamicVal('Detail_Barang_LPP', (this as HTMLTextAreaElement).value)">${escText(detBarang)}</textarea>
      </div>
    `;
  } else if (type === 'LPF') {
    let catLpf = getVal('Catatan_LPF');
    if (!catLpf || catLpf === '-' || catLpf === '') {
      catLpf = "Setuju dengan usulan tim peneliti, segera tindak lanjuti proses penyusunan administrasi penanganan perkara sesuai ketentuan yang berlaku.";
    }

    let tglLpEl = document.getElementById('Tanggal_LP_LP_1') as HTMLInputElement;
    let defaultTglLpf = getVal('Tanggal_LPF') !== '-' ? getVal('Tanggal_LPF') : (tglLpEl ? tglLpEl.value : '');

    container.innerHTML = recordSelectorHtml + autoInfoBanner + `
      <div class="grid" style="margin-bottom:10px;">
        <div>
          <label>Nomor LPF (Cukup Angka)</label>
          <input id="input_No_LPF" value="${escText(getDocNum('No_LPF') || getVal('NoLP_LP_1'))}" oninput="saveDynamicVal('No_LPF', (this as HTMLInputElement).value); refreshReportTableUI();">
        </div>
        <div>
          <label>Tanggal LPF</label>
          <input type="date" id="input_Tgl_LPF" value="${defaultTglLpf}" onchange="saveDynamicVal('Tanggal_LPF', (this as HTMLInputElement).value); refreshReportTableUI();">
        </div>
      </div>
      <div>
        <label>Catatan / Disposisi Atasan LPF</label>
        <textarea id="Catatan_LPF" oninput="saveDynamicVal('Catatan_LPF', (this as HTMLTextAreaElement).value)">${escText(catLpf)}</textarea>
      </div>
    `;
  } else if (type === 'SPLIT') {
    let dasarSplit = getVal('Dasar_SPLIT');
    if (!dasarSplit || dasarSplit === '') dasarSplit = '-';

    let tglLpEl = document.getElementById('Tanggal_LP_LP_1') as HTMLInputElement;
    let defaultTglSplit = getVal('Tanggal_SPLIT') !== '-' ? getVal('Tanggal_SPLIT') : (tglLpEl ? tglLpEl.value : '');

    container.innerHTML = recordSelectorHtml + autoInfoBanner + `
      <div class="grid" style="margin-bottom:10px;">
        <div>
          <label>Nomor SPLIT (Cukup Angka)</label>
          <input id="input_Nomor_SPLIT" value="${escText(getDocNum('Nomor_SPLIT') || getVal('NoLP_LP_1'))}" oninput="saveDynamicVal('Nomor_SPLIT', (this as HTMLInputElement).value); refreshReportTableUI();">
        </div>
        <div>
          <label>Tanggal SPLIT</label>
          <input type="date" id="input_Tgl_SPLIT" value="${defaultTglSplit}" onchange="saveDynamicVal('Tanggal_SPLIT', (this as HTMLInputElement).value); refreshReportTableUI();">
        </div>
      </div>
      <div>
        <label>Dasar Tambahan / Catatan SPLIT</label>
        <textarea id="Dasar_SPLIT" oninput="saveDynamicVal('Dasar_SPLIT', (this as HTMLTextAreaElement).value)">${escText(dasarSplit)}</textarea>
      </div>
      <h4 style="font-size:11px; margin-top:14px; color:var(--primary);">Daftar Pegawai Khusus Dokumen SPLIT:</h4>
      <div id="splitPegawaiContainer"></div>
      <button type="button" class="btn primary" onclick="addSplitPegawai()" style="margin-top:8px;">
        <i class="fi fi-rr-plus"></i> Tambah Pegawai Ke SPLIT
      </button>
    `;
    renderSplitPegawaiList();
  } else if (type === 'SPRIN_CACAH') {
    let tglSbpEl = document.getElementById('Tanggal_SBP') as HTMLInputElement;
    let defaultTglSprin = getVal('Tanggal_Sprin_Cacah') !== '-' ? getVal('Tanggal_Sprin_Cacah') : (tglSbpEl ? tglSbpEl.value : '');

    container.innerHTML = recordSelectorHtml + `
      <div class="grid" style="margin-bottom:10px;">
        <div>
          <label>Nomor SPRIN CACAH (Cukup Angka)</label>
          <input id="input_No_SPRIN" value="${escText(getDocNum('No_SPRIN_CACAH'))}" oninput="saveDynamicVal('No_SPRIN_CACAH', (this as HTMLInputElement).value); refreshReportTableUI();">
        </div>
        <div>
          <label>Tanggal SPRIN CACAH</label>
          <input type="date" id="input_Tgl_SPRIN" value="${defaultTglSprin}" onchange="saveDynamicVal('Tanggal_Sprin_Cacah', (this as HTMLInputElement).value); refreshReportTableUI();">
        </div>
      </div>
      <p class="small" style="margin-top:0;">Daftar petugas pelaksana pencacahan barang hasil penindakan:</p>
      <div id="sprinPegawaiContainer"></div>
      <button type="button" class="btn primary" onclick="addSprinPegawai()" style="margin-top:8px;">
        <i class="fi fi-rr-plus"></i> Tambah Pegawai Ke SPRIN CACAH
      </button>
    `;
    renderSprinPegawaiList();
  } else if (type === 'BA') {
    let items = JSON.parse(localStorage.getItem('cacahItems') || '[]');
    let tglSbpEl = document.getElementById('Tanggal_SBP') as HTMLInputElement;
    let defaultTglBa = getVal('Tanggal_BA') !== '-' ? getVal('Tanggal_BA') : (tglSbpEl ? tglSbpEl.value : '');

    container.innerHTML = recordSelectorHtml + `
      <div class="grid3" style="margin-bottom:10px;">
        <div>
          <label>Nomor BA (Cukup Angka)</label>
          <input id="input_Nomor_BA" value="${escText(getDocNum('Nomor_BA'))}" oninput="saveDynamicVal('Nomor_BA', (this as HTMLInputElement).value); refreshReportTableUI();">
        </div>
        <div>
          <label>Tanggal BA Cacah</label>
          <input type="date" id="input_Tgl_BA" value="${defaultTglBa}" onchange="saveDynamicVal('Tanggal_BA', (this as HTMLInputElement).value); autoIsiTeksBA(this.value); refreshReportTableUI();">
        </div>
        <div>
          <label>Hari Cacah (Huruf Kecil)</label>
          <input id="Hari_Cacah" class="lowercase-input" value="${escText(getVal('Hari_Cacah') || '')}" oninput="saveDynamicVal('Hari_Cacah', (this as HTMLInputElement).value.toLowerCase());">
        </div>
      </div>
      <div style="margin-bottom:10px;">
        <label>Teks Tanggal Lengkap (Huruf Kecil)</label>
        <input id="TeksTanggal" class="lowercase-input" value="${escText(getVal('TeksTanggal') || '')}" oninput="saveDynamicVal('TeksTanggal', (this as HTMLInputElement).value.toLowerCase());">
      </div>
      <h4>Isian Tambahan Barang Hasil Pencacahan (BA)</h4>
      <div id="items"></div>
      <button type="button" class="btn secondary" onclick="addItem()" style="margin-top:6px;">
        <i class="fi fi-rr-plus"></i> Tambah Barang Cacah
      </button>
    `;
    renderItems(items);
  } else if (type === 'LHP') {
    let tglLpEl = document.getElementById('Tanggal_LP_LP_1') as HTMLInputElement;
    let defaultTglLhp = getVal('Tanggal_LHP') !== '-' ? getVal('Tanggal_LHP') : (tglLpEl ? tglLpEl.value : '');

    container.innerHTML = recordSelectorHtml + `
      <div class="grid" style="margin-bottom:10px;">
        <div>
          <label>Nomor LHP (Cukup Angka)</label>
          <input id="input_Nomor_LHP" value="${escText(getDocNum('Nomor_LHP'))}" oninput="saveDynamicVal('Nomor_LHP', (this as HTMLInputElement).value); refreshReportTableUI();">
        </div>
        <div>
          <label>Tanggal LHP</label>
          <input type="date" id="input_Tgl_LHP" value="${defaultTglLhp}" onchange="saveDynamicVal('Tanggal_LHP', (this as HTMLInputElement).value); refreshReportTableUI();">
        </div>
      </div>
    `;
  }
}

export function renderItems(items: any[]): void {
  let c = document.getElementById('items');
  if (!c) return;
  c.innerHTML = items.map((x: any, i: number) => `
    <div class="item">
      <div class="grid5">
        <div><label>Komoditi</label><input value="${escText(x.komoditi || '')}" data-i="${i}" data-k="komoditi"></div>
        <div><label>Uraian Barang</label><input value="${escText(x.uraian || '')}" data-i="${i}" data-k="uraian"></div>
        <div><label>Jumlah</label><input value="${escText(x.jumlah || '')}" data-i="${i}" data-k="jumlah"></div>
        <div><label>Kondisi</label><input value="${escText(x.kondisi || '')}" data-i="${i}" data-k="kondisi"></div>
        <div><label>Keterangan</label><input value="${escText(x.keterangan || '')}" data-i="${i}" data-k="keterangan"></div>
      </div>
      <button type="button" class="btn danger" onclick="delItem(${i})" style="margin-top:6px;">
        <i class="fi fi-rr-trash"></i> Hapus Barang
      </button>
    </div>
  `).join('');

  c.querySelectorAll('input[data-i]').forEach(inp => {
    (inp as HTMLInputElement).oninput = () => {
      let arr = JSON.parse(localStorage.getItem('cacahItems') || '[]');
      let index = Number((inp as HTMLElement).dataset.i);
      let key = (inp as HTMLElement).dataset.k;
      if (arr[index] && key) {
        arr[index][key] = (inp as HTMLInputElement).value;
        localStorage.setItem('cacahItems', JSON.stringify(arr));
        updateReportLive();
      }
    };
  });
}

export function addItem(): void {
  let items = JSON.parse(localStorage.getItem('cacahItems') || '[]');
  items.push({ komoditi: '', uraian: '', jumlah: '', kondisi: '', keterangan: '', asal: '-' });
  localStorage.setItem('cacahItems', JSON.stringify(items));
  renderItems(items);
  updateReportLive();
}

export function delItem(i: number): void {
  let items = JSON.parse(localStorage.getItem('cacahItems') || '[]');
  items.splice(i, 1);
  localStorage.setItem('cacahItems', JSON.stringify(items));
  renderItems(items);
  updateReportLive();
}

export function addSplitPegawai(): void {
  let list = JSON.parse(localStorage.getItem('splitPegawaiList') || '[]');
  if (list.length === 0) {
    list = [
      { nama: getVal('form_nama_seksi'), nip: getVal('form_nip_seksi'), jabatan: getVal('form_jabatan_seksi') || 'Kepala Seksi Penyidikan' },
      { nama: getVal('form_ketua_tim'), nip: getVal('form_nip_ketua_tim'), jabatan: getVal('form_jabatan_ketua_tim') || 'Ketua Tim Peneliti' },
      { nama: getVal('form_petugas_lpf'), nip: getVal('form_nip_petugas_lpf'), jabatan: getVal('form_jabatan_petugas_lpf') || 'Petugas LPF' },
      { nama: getVal('form_pembuat_lpp'), nip: getVal('form_nip_pembuat_lpp'), jabatan: getVal('form_jabatan_pembuat_lpp') || 'Petugas LPP' }
    ];
  }
  list.push({ nama: '', nip: '', jabatan: '' });
  localStorage.setItem('splitPegawaiList', JSON.stringify(list));
  
  if (store.activeRecordIndex >= 0 && store.databasePerkara[store.activeRecordIndex]) {
    (store.databasePerkara[store.activeRecordIndex] as any).splitPegawaiList = list;
    savePerkaraToStorage();
  }

  renderSplitPegawaiList();
  updateReportLive();
}

export function renderSplitPegawaiList(): void {
  let container = document.getElementById('splitPegawaiContainer');
  if (!container) return;

  let list = JSON.parse(localStorage.getItem('splitPegawaiList') || '[]');
  if (list.length === 0) {
    list = [
      { nama: getVal('form_nama_seksi'), nip: getVal('form_nip_seksi'), jabatan: getVal('form_jabatan_seksi') || 'Kepala Seksi Penyidikan' },
      { nama: getVal('form_ketua_tim'), nip: getVal('form_nip_ketua_tim'), jabatan: getVal('form_jabatan_ketua_tim') || 'Ketua Tim Peneliti' },
      { nama: getVal('form_petugas_lpf'), nip: getVal('form_nip_petugas_lpf'), jabatan: getVal('form_jabatan_petugas_lpf') || 'Petugas LPF' },
      { nama: getVal('form_pembuat_lpp'), nip: getVal('form_nip_pembuat_lpp'), jabatan: getVal('form_jabatan_pembuat_lpp') || 'Petugas LPP' }
    ];
  }

  container.innerHTML = list.map((p: any, i: number) => `
    <div class="item">
      <div class="grid3">
        <div><label>Nama Pegawai #${i+1}</label><input value="${escText(p.nama || '')}" data-pi="${i}" data-pk="nama"></div>
        <div><label>NIP Pegawai #${i+1}</label><input value="${escText(p.nip || '')}" data-pi="${i}" data-pk="nip"></div>
        <div><label>Jabatan Pegawai #${i+1}</label><input value="${escText(p.jabatan || '')}" data-pi="${i}" data-pk="jabatan"></div>
      </div>
      <button type="button" class="btn danger" onclick="delSplitPegawai(${i})" style="margin-top:8px;">
        <i class="fi fi-rr-trash"></i> HAPUS PEGAWAI
      </button>
    </div>
  `).join('');

  container.querySelectorAll('input[data-pi]').forEach(inp => {
    (inp as HTMLInputElement).oninput = () => {
      let arr = JSON.parse(localStorage.getItem('splitPegawaiList') || '[]');
      if (arr.length === 0) {
        arr = [
          { nama: getVal('form_nama_seksi'), nip: getVal('form_nip_seksi'), jabatan: getVal('form_jabatan_seksi') || 'Kepala Seksi Penyidikan' },
          { nama: getVal('form_ketua_tim'), nip: getVal('form_nip_ketua_tim'), jabatan: getVal('form_jabatan_ketua_tim') || 'Ketua Tim Peneliti' },
          { nama: getVal('form_petugas_lpf'), nip: getVal('form_nip_petugas_lpf'), jabatan: getVal('form_jabatan_petugas_lpf') || 'Petugas LPF' },
          { nama: getVal('form_pembuat_lpp'), nip: getVal('form_nip_pembuat_lpp'), jabatan: getVal('form_jabatan_pembuat_lpp') || 'Petugas LPP' }
        ];
      }
      let index = Number((inp as HTMLElement).dataset.pi);
      let key = (inp as HTMLElement).dataset.pk;
      if (arr[index] && key) {
        arr[index][key] = (inp as HTMLInputElement).value;
        localStorage.setItem('splitPegawaiList', JSON.stringify(arr));

        if (store.activeRecordIndex >= 0 && store.databasePerkara[store.activeRecordIndex]) {
          (store.databasePerkara[store.activeRecordIndex] as any).splitPegawaiList = arr;
          savePerkaraToStorage();
        }

        updateReportLive();
      }
    };
  });
}

export function delSplitPegawai(i: number): void {
  let list = JSON.parse(localStorage.getItem('splitPegawaiList') || '[]');
  list.splice(i, 1);
  localStorage.setItem('splitPegawaiList', JSON.stringify(list));

  if (store.activeRecordIndex >= 0 && store.databasePerkara[store.activeRecordIndex]) {
    (store.databasePerkara[store.activeRecordIndex] as any).splitPegawaiList = list;
    savePerkaraToStorage();
  }

  renderSplitPegawaiList();
  updateReportLive();
}

export function addSprinPegawai(): void {
  let list = JSON.parse(localStorage.getItem('sprinPegawaiList') || '[]');
  if (list.length === 0) {
    list = [
      { nama: getVal('form_ketua_tim'), nip: getVal('form_nip_ketua_tim'), pangkat: getVal('form_gol_ketua_tim'), jabatan: getVal('form_jabatan_ketua_tim') || 'Ketua Tim Peneliti' },
      { nama: getVal('form_pembuat_lpp'), nip: getVal('form_nip_pembuat_lpp'), pangkat: getVal('form_gol_pembuat_lpp'), jabatan: getVal('form_jabatan_pembuat_lpp') || 'Petugas LPP' },
      { nama: getVal('form_petugas_lpf'), nip: getVal('form_nip_petugas_lpf'), pangkat: getVal('form_gol_petugas_lpf'), jabatan: getVal('form_jabatan_petugas_lpf') || 'Petugas LPF' },
      { nama: getVal('form_indak_1'), nip: getVal('form_nip_indak_1'), pangkat: getVal('form_gol_indak_1'), jabatan: getVal('form_jabatan_indak_1') || 'Petugas Penindakan 1' },
      { nama: getVal('form_indak_2'), nip: getVal('form_nip_indak_2'), pangkat: getVal('form_gol_indak_2'), jabatan: getVal('form_jabatan_indak_2') || 'Petugas Penindakan 2' },
      { nama: getVal('form_indak_lainnya'), nip: getVal('form_nip_indak_lainnya'), pangkat: getVal('form_gol_indak_lainnya'), jabatan: getVal('form_jabatan_indak_lainnya') || 'Petugas Penindakan 3' }
    ];
  }
  list.push({ nama: '', nip: '', pangkat: '', jabatan: '' });
  localStorage.setItem('sprinPegawaiList', JSON.stringify(list));

  if (store.activeRecordIndex >= 0 && store.databasePerkara[store.activeRecordIndex]) {
    (store.databasePerkara[store.activeRecordIndex] as any).sprinPegawaiList = list;
    savePerkaraToStorage();
  }

  renderSprinPegawaiList();
  updateReportLive();
}

export function renderSprinPegawaiList(): void {
  let container = document.getElementById('sprinPegawaiContainer');
  if (!container) return;

  let list = JSON.parse(localStorage.getItem('sprinPegawaiList') || '[]');
  if (list.length === 0) {
    list = [
      { nama: getVal('form_ketua_tim'), nip: getVal('form_nip_ketua_tim'), pangkat: getVal('form_gol_ketua_tim'), jabatan: getVal('form_jabatan_ketua_tim') || 'Ketua Tim Peneliti' },
      { nama: getVal('form_pembuat_lpp'), nip: getVal('form_nip_pembuat_lpp'), pangkat: getVal('form_gol_pembuat_lpp'), jabatan: getVal('form_jabatan_pembuat_lpp') || 'Petugas LPP' },
      { nama: getVal('form_petugas_lpf'), nip: getVal('form_nip_petugas_lpf'), pangkat: getVal('form_gol_petugas_lpf'), jabatan: getVal('form_jabatan_petugas_lpf') || 'Petugas LPF' },
      { nama: getVal('form_indak_1'), nip: getVal('form_nip_indak_1'), pangkat: getVal('form_gol_indak_1'), jabatan: getVal('form_jabatan_indak_1') || 'Petugas Penindakan 1' },
      { nama: getVal('form_indak_2'), nip: getVal('form_nip_indak_2'), pangkat: getVal('form_gol_indak_2'), jabatan: getVal('form_jabatan_indak_2') || 'Petugas Penindakan 2' },
      { nama: getVal('form_indak_lainnya'), nip: getVal('form_nip_indak_lainnya'), pangkat: getVal('form_gol_indak_lainnya'), jabatan: getVal('form_jabatan_indak_lainnya') || 'Petugas Penindakan 3' }
    ];
  }

  container.innerHTML = list.map((p: any, i: number) => `
    <div class="item">
      <div class="grid4">
        <div><label>Nama Pegawai #${i + 1}</label><input value="${escText(p.nama || '')}" data-spi="${i}" data-spk="nama"></div>
        <div><label>NIP Pegawai #${i + 1}</label><input value="${escText(p.nip || '')}" data-spi="${i}" data-spk="nip"></div>
        <div><label>Pangkat/Gol. #${i + 1}</label><input value="${escText(p.pangkat || '')}" data-spi="${i}" data-spk="pangkat"></div>
        <div><label>Jabatan #${i + 1}</label><input value="${escText(p.jabatan || '')}" data-spi="${i}" data-spk="jabatan"></div>
      </div>
      <button type="button" class="btn danger" onclick="delSprinPegawai(${i})" style="margin-top:8px;">
        <i class="fi fi-rr-trash"></i> Hapus Pegawai
      </button>
    </div>
  `).join('');

  container.querySelectorAll('input[data-spi]').forEach(inp => {
    (inp as HTMLInputElement).oninput = () => {
      let arr = JSON.parse(localStorage.getItem('sprinPegawaiList') || '[]');
      if (arr.length === 0) {
        arr = [
          { nama: getVal('form_ketua_tim'), nip: getVal('form_nip_ketua_tim'), pangkat: getVal('form_gol_ketua_tim'), jabatan: getVal('form_jabatan_ketua_tim') || 'Ketua Tim Peneliti' },
          { nama: getVal('form_pembuat_lpp'), nip: getVal('form_nip_pembuat_lpp'), pangkat: getVal('form_gol_pembuat_lpp'), jabatan: getVal('form_jabatan_pembuat_lpp') || 'Petugas LPP' },
          { nama: getVal('form_petugas_lpf'), nip: getVal('form_nip_petugas_lpf'), pangkat: getVal('form_gol_petugas_lpf'), jabatan: getVal('form_jabatan_petugas_lpf') || 'Petugas LPF' },
          { nama: getVal('form_indak_1'), nip: getVal('form_nip_indak_1'), pangkat: getVal('form_gol_indak_1'), jabatan: getVal('form_jabatan_indak_1') || 'Petugas Penindakan 1' },
          { nama: getVal('form_indak_2'), nip: getVal('form_nip_indak_2'), pangkat: getVal('form_gol_indak_2'), jabatan: getVal('form_jabatan_indak_2') || 'Petugas Penindakan 2' },
          { nama: getVal('form_indak_lainnya'), nip: getVal('form_nip_indak_lainnya'), pangkat: getVal('form_gol_indak_lainnya'), jabatan: getVal('form_jabatan_indak_lainnya') || 'Petugas Penindakan 3' }
        ];
      }
      let index = Number((inp as HTMLElement).dataset.spi);
      let key = (inp as HTMLElement).dataset.spk;
      if (arr[index] && key) {
        arr[index][key] = (inp as HTMLInputElement).value;
        localStorage.setItem('sprinPegawaiList', JSON.stringify(arr));

        if (store.activeRecordIndex >= 0 && store.databasePerkara[store.activeRecordIndex]) {
          (store.databasePerkara[store.activeRecordIndex] as any).sprinPegawaiList = arr;
          savePerkaraToStorage();
        }

        updateReportLive();
      }
    };
  });
}

export function delSprinPegawai(i: number): void {
  let list = JSON.parse(localStorage.getItem('sprinPegawaiList') || '[]');
  list.splice(i, 1);
  localStorage.setItem('sprinPegawaiList', JSON.stringify(list));

  if (store.activeRecordIndex >= 0 && store.databasePerkara[store.activeRecordIndex]) {
    (store.databasePerkara[store.activeRecordIndex] as any).sprinPegawaiList = list;
    savePerkaraToStorage();
  }

  renderSprinPegawaiList();
  updateReportLive();
}

export function renderTLFormSection(type: string): void {
  let container = document.getElementById('modalDynamicInputBodyTL');
  if (!container) return;
  if (store.activeRecordIndex < 0) {
    container.innerHTML = `<h4>PILIH PERKARA DULU</h4><p class="small">Silakan gunakan tombol Validasi Data LHP untuk mulai.</p>`;
    return;
  }
  let rec: any = store.databasePerkara[store.activeRecordIndex];

  if (type === 'BAST_PEMILIK') {
    container.innerHTML = `
      <div class="grid" style="margin-bottom:10px;">
        <div><label>Hari BAST</label><input value="${escText(rec.TL_Hari_BAST || '')}" oninput="saveDynamicValTL('TL_Hari_BAST', (this as HTMLInputElement).value)"></div>
        <div><label>Tanggal Surat BAST</label><input value="${escText(rec.TL_Tanggal_Surat || '')}" oninput="saveDynamicValTL('TL_Tanggal_Surat', (this as HTMLInputElement).value)"></div>
        <div style="grid-column: span 2;"><label>Tanggal Dalam Huruf</label><input value="${escText(rec.TL_Tgl_Huruf_BAST || '')}" oninput="saveDynamicValTL('TL_Tgl_Huruf_BAST', (this as HTMLInputElement).value)"></div>
        <div><label>Nama Pemilik / Penerima</label><input value="${escText(rec.TL_Nama_Pemilik || rec.Nama_Pelaku || '')}" oninput="saveDynamicValTL('TL_Nama_Pemilik', (this as HTMLInputElement).value)"></div>
        <div><label>NIK / Identitas Penerima</label><input value="${escText(rec.TL_NIK_Pemilik || rec.Nomor_Identitas || '')}" oninput="saveDynamicValTL('TL_NIK_Pemilik', (this as HTMLInputElement).value)"></div>
        <div style="grid-column: span 2;"><label>Atas Nama PT / Kuasa</label><input value="${escText(rec.TL_Atas_Nama_Pt || '')}" oninput="saveDynamicValTL('TL_Atas_Nama_Pt', (this as HTMLInputElement).value)"></div>
        <div style="grid-column: span 2;"><label>Alamat Penerima</label><textarea oninput="saveDynamicValTL('TL_Alamat_Pemilik', (this as HTMLTextAreaElement).value)">${escText(rec.TL_Alamat_Pemilik || rec.Alamat_Pelaku || '')}</textarea></div>
        <div><label>Petugas Penyerah 1</label><input value="${escText(rec.TL_Petugas_Bast_1 || rec.ketua_tim || '')}" oninput="saveDynamicValTL('TL_Petugas_Bast_1', (this as HTMLInputElement).value)"></div>
        <div><label>Petugas Penyerah 2</label><input value="${escText(rec.TL_Petugas_Bast_2 || '')}" oninput="saveDynamicValTL('TL_Petugas_Bast_2', (this as HTMLInputElement).value)"></div>
      </div>
    `;
  } else if (type === 'BA_SEGEL') {
    container.innerHTML = `
      <div class="grid" style="margin-bottom:10px;">
        <div><label>Hari Pembukaan Segel</label><input value="${escText(rec.TL_Segel_Hari || '')}" oninput="saveDynamicValTL('TL_Segel_Hari', (this as HTMLInputElement).value)"></div>
        <div><label>Tanggal Surat</label><input value="${escText(rec.TL_Tanggal_Surat || '')}" oninput="saveDynamicValTL('TL_Tanggal_Surat', (this as HTMLInputElement).value)"></div>
        <div style="grid-column: span 2;"><label>Tanggal Dalam Huruf</label><input value="${escText(rec.TL_Segel_Tgl_Huruf || '')}" oninput="saveDynamicValTL('TL_Segel_Tgl_Huruf', (this as HTMLInputElement).value)"></div>
        <div><label>Nomor SPLI</label><input value="${escText(rec.TL_Segel_No_SPLI || '')}" oninput="saveDynamicValTL('TL_Segel_No_SPLI', (this as HTMLInputElement).value)"></div>
        <div><label>Tanggal SPLI</label><input value="${escText(rec.TL_Segel_Tgl_SPLI || '')}" oninput="saveDynamicValTL('TL_Segel_Tgl_SPLI', (this as HTMLInputElement).value)"></div>
        <div><label>Nama & Jenis Sarkut</label><input value="${escText(rec.TL_Segel_Nama_Sarkut || rec.Pengangkut || '')}" oninput="saveDynamicValTL('TL_Segel_Nama_Sarkut', (this as HTMLInputElement).value)"></div>
        <div><label>No. Register Sarkut</label><input value="${escText(rec.TL_Segel_Reg_Sarkut || '')}" oninput="saveDynamicValTL('TL_Segel_Reg_Sarkut', (this as HTMLInputElement).value)"></div>
        <div><label>Bendera</label><input value="${escText(rec.TL_Segel_Bendera || 'INDONESIA')}" oninput="saveDynamicValTL('TL_Segel_Bendera', (this as HTMLInputElement).value)"></div>
        <div><label>Nama Nahkoda / Pengemudi</label><input value="${escText(rec.TL_Segel_Nahkoda || rec.Nama_Pelaku || '')}" oninput="saveDynamicValTL('TL_Segel_Nahkoda', (this as HTMLInputElement).value)"></div>
        <div><label>Nama Saksi / Penghadap</label><input value="${escText(rec.TL_Nama_Pemilik || '')}" oninput="saveDynamicValTL('TL_Nama_Pemilik', (this as HTMLInputElement).value)"></div>
        <div><label>NIK Saksi</label><input value="${escText(rec.TL_NIK_Pemilik || '')}" oninput="saveDynamicValTL('TL_NIK_Pemilik', (this as HTMLInputElement).value)"></div>
        <div><label>Pekerjaan Saksi</label><input value="${escText(rec.TL_Segel_Pekerjaan || '')}" oninput="saveDynamicValTL('TL_Segel_Pekerjaan', (this as HTMLInputElement).value)"></div>
        <div><label>Petugas Pembuka Segel 1</label><input value="${escText(rec.TL_Segel_P1 || rec.ketua_tim || '')}" oninput="saveDynamicValTL('TL_Segel_P1', (this as HTMLInputElement).value)"></div>
        <div style="grid-column: span 2;"><label>Alamat Saksi</label><textarea oninput="saveDynamicValTL('TL_Alamat_Pemilik', (this as HTMLTextAreaElement).value)">${escText(rec.TL_Alamat_Pemilik || '')}</textarea></div>
      </div>
    `;
  } else if (type === 'KEP_BDN') {
    container.innerHTML = `
      <div class="grid" style="margin-bottom:10px;">
        <div><label>Nomor Keputusan KEP</label><input value="${escText(rec.KEP_Nomor_ND || '')}" oninput="saveDynamicValTL('KEP_Nomor_ND', (this as HTMLInputElement).value)"></div>
        <div><label>Tanggal Keputusan KEP</label><input value="${escText(rec.KEP_Tanggal_ND || '')}" oninput="saveDynamicValTL('KEP_Tanggal_ND', (this as HTMLInputElement).value)"></div>
        <div><label>Nama Kepala Kantor</label><input value="${escText(rec.Kepala_Kantor || '')}" oninput="saveDynamicValTL('Kepala_Kantor', (this as HTMLInputElement).value)"></div>
        <div><label>NIP Kepala Kantor</label><input value="${escText(rec.NIP_Kepala_Kantor || '')}" oninput="saveDynamicValTL('NIP_Kepala_Kantor', (this as HTMLInputElement).value)"></div>
      </div>
    `;
  } else if (type === 'SPSA') {
    container.innerHTML = `
      <div class="grid" style="margin-bottom:10px;">
        <div><label>Nomor SPSA</label><input value="${escText(rec.SPSA_Nomor || '')}" oninput="saveDynamicValTL('SPSA_Nomor', (this as HTMLInputElement).value)"></div>
        <div><label>Tanggal SPSA</label><input value="${escText(rec.SPSA_Tanggal || '')}" oninput="saveDynamicValTL('SPSA_Tanggal', (this as HTMLInputElement).value)"></div>
        <div><label>Besaran Denda</label><input value="${escText(rec.SPSA_Denda || '')}" oninput="saveDynamicValTL('SPSA_Denda', (this as HTMLInputElement).value)"></div>
        <div><label>Jatuh Tempo Pembayaran</label><input value="${escText(rec.SPSA_Jatuh_Tempo || '')}" oninput="saveDynamicValTL('SPSA_Jatuh_Tempo', (this as HTMLInputElement).value)"></div>
        <div style="grid-column: span 2;"><label>Pasal Pelanggaran SPSA</label><textarea oninput="saveDynamicValTL('SPSA_Pasal_Pelanggaran', (this as HTMLTextAreaElement).value)">${escText(rec.SPSA_Pasal_Pelanggaran || '')}</textarea></div>
        <div style="grid-column: span 2;"><label>Alasan Penetapan Denda</label><textarea oninput="saveDynamicValTL('SPSA_Alasan', (this as HTMLTextAreaElement).value)">${escText(rec.SPSA_Alasan || '')}</textarea></div>
      </div>
    `;
  } else if (type === 'BAST_LIMPAH') {
    container.innerHTML = `
      <div class="grid" style="margin-bottom:10px;">
        <div><label>Hari Pelimpahan</label><input value="${escText(rec.Limpah_Hari || '')}" oninput="saveDynamicValTL('Limpah_Hari', (this as HTMLInputElement).value)"></div>
        <div><label>Tanggal Surat</label><input value="${escText(rec.Limpah_Tanggal || '')}" oninput="saveDynamicValTL('Limpah_Tanggal', (this as HTMLInputElement).value)"></div>
        <div style="grid-column: span 2;"><label>Tanggal Dalam Huruf</label><input value="${escText(rec.Limpah_Tgl_Huruf || '')}" oninput="saveDynamicValTL('Limpah_Tgl_Huruf', (this as HTMLInputElement).value)"></div>
        <div><label>Instansi Penerima</label><input value="${escText(rec.Instansi_Penerima || '')}" oninput="saveDynamicValTL('Instansi_Penerima', (this as HTMLInputElement).value)"></div>
        <div><label>Nama Pejabat Penerima</label><input value="${escText(rec.Limpah_Pejabat_Penerima || '')}" oninput="saveDynamicValTL('Limpah_Pejabat_Penerima', (this as HTMLInputElement).value)"></div>
        <div><label>NIP Pejabat Penerima</label><input value="${escText(rec.Limpah_NIP_Penerima || '')}" oninput="saveDynamicValTL('Limpah_NIP_Penerima', (this as HTMLInputElement).value)"></div>
        <div><label>Petugas Pelimpah (Bea Cukai)</label><input value="${escText(rec.Limpah_Petugas_1 || rec.ketua_tim || '')}" oninput="saveDynamicValTL('Limpah_Petugas_1', (this as HTMLInputElement).value)"></div>
      </div>
    `;
  }
}