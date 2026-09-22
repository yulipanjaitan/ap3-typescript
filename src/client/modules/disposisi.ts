import { store, savePerkaraToStorage } from '../state/store.js';
import { escText } from '../utils/formatters.js';
import { showToast } from './ui.js';

// ==========================================
// 1. STATE & UTILITY PAGINATION DISPOSISI
// ==========================================
let currentDisposisiPage: number = 1;
const pageSizeDisposisi: number = 5;

// Global helper agar bisa dipanggil via atribut onclick di string HTML
(window as any).changeDisposisiPage = function(page: number) {
  currentDisposisiPage = page;
  renderDisposisiTable();
};

// ==========================================
// 2. FUNGSI CLONING OPSI DROPDOWN DARI MASTER FORM
// ==========================================
export function cloneDropdownOptionsToDisposisi(): void {
  // Clone opsi Komoditi
  const srcKomoditi = document.getElementById('Komoditi_Select') as HTMLSelectElement;
  const targetKomoditi = document.getElementById('dsp_komoditi') as HTMLSelectElement;
  if (srcKomoditi && targetKomoditi) {
    targetKomoditi.innerHTML = srcKomoditi.innerHTML;
  }

  // Clone opsi Jenis Perkara
  const srcPerkara = document.getElementById('Jenis_Perkara_Select') as HTMLSelectElement;
  const targetPerkara = document.getElementById('dsp_jenis_perkara_select') as HTMLSelectElement;
  if (srcPerkara && targetPerkara) {
    targetPerkara.innerHTML = srcPerkara.innerHTML;
  }

  // Clone opsi Jenis Identitas
  const srcIdentitas = document.getElementById('Jenis_Identitas_Select') as HTMLSelectElement;
  const targetIdentitas = document.getElementById('dsp_jenis_identitas') as HTMLSelectElement;
  if (srcIdentitas && targetIdentitas) {
    targetIdentitas.innerHTML = srcIdentitas.innerHTML;
  }

  // Clone opsi Jenis Dokumen Pemberitahuan
  const srcDok = document.getElementById('Jenis_Dok_Pemberitahuan_Select') as HTMLSelectElement;
  const targetDok = document.getElementById('dsp_jenis_dok_select') as HTMLSelectElement;
  if (srcDok && targetDok) {
    targetDok.innerHTML = srcDok.innerHTML;
  }

  // Clone opsi Jenis Koli / Kemasan
  const srcKoli = document.getElementById('Jenis_Koli_Select') as HTMLSelectElement;
  const targetKoli = document.getElementById('dsp_jenis_koli_select') as HTMLSelectElement;
  if (srcKoli && targetKoli) {
    targetKoli.innerHTML = srcKoli.innerHTML;
  }
}

// ==========================================
// 3. FUNGSI SINKRONISASI & GENERATOR TEKS
// ==========================================
export function syncDspJenisPerkara(val: string): void {
  let el = document.getElementById('dsp_jenis_perkara') as HTMLInputElement;
  if (el) el.value = val;
}

export function toggleDspJenisDokumen(val: string): void {
  let manual = document.getElementById('dsp_jenis_dok_manual') as HTMLInputElement;
  let nomorInput = document.getElementById('dsp_nomor_dok') as HTMLInputElement;
  let dokPemberitahuan = document.getElementById('dsp_dokumen_pemberitahuan') as HTMLInputElement;
  
  if (val === 'Tanpa Dokumen') {
    if (manual) { manual.style.display = 'none'; manual.value = ''; }
    if (nomorInput) { nomorInput.value = ''; nomorInput.disabled = true; }
    if (dokPemberitahuan) dokPemberitahuan.value = 'Tanpa Dokumen';
  } else {
    if (nomorInput) nomorInput.disabled = false;
    if (manual) {
      if (val === 'LAINNYA') { manual.style.display = 'block'; }
      else { manual.style.display = 'none'; manual.value = val === '-' ? '' : val; }
    }
    syncDspDokumenPemberitahuan();
  }
}

export function syncDspDokumenPemberitahuan(): void {
  let selEl = document.getElementById('dsp_jenis_dok_select') as HTMLSelectElement;
  let dokPemberitahuan = document.getElementById('dsp_dokumen_pemberitahuan') as HTMLInputElement;
  let manualEl = document.getElementById('dsp_jenis_dok_manual') as HTMLInputElement;
  let nomorEl = document.getElementById('dsp_nomor_dok') as HTMLInputElement;

  if (!selEl || !dokPemberitahuan) return;

  let sel = selEl.value;
  if (sel === 'Tanpa Dokumen') { dokPemberitahuan.value = 'Tanpa Dokumen'; return; }
  let jenis = sel === 'LAINNYA' ? (manualEl ? manualEl.value : '') : (sel === '-' ? '' : sel);
  let nomor = nomorEl ? nomorEl.value : '';
  
  let res: string[] = [];
  if (jenis.trim()) res.push(jenis.trim());
  if (nomor.trim()) res.push(nomor.trim());
  dokPemberitahuan.value = res.length > 0 ? res.join(' ') : 'Tanpa Dokumen';
}

export function handleDspJenisKoliChange(val: string): void {
  let manualInput = document.getElementById('dsp_jenis_koli') as HTMLInputElement;
  if (!manualInput) return;

  if (val === 'LAINNYA') {
    manualInput.style.display = 'block';
    manualInput.value = '';
    manualInput.focus();
  } else {
    manualInput.style.display = 'none';
    manualInput.value = (val === '-' ? '' : val);
  }
  generateDspUraianBarangOtomatis();
}

export function handleDspJenisKoliSelectChange(val: string): void {
  handleDspJenisKoliChange(val);
}

export function generateDspUraianBarangOtomatis(): void {
  let jmlEl = document.getElementById('dsp_jumlah_koli') as HTMLInputElement;
  let satuanSelectEl = document.getElementById('dsp_jenis_koli_select') as HTMLSelectElement;
  let manualKoliEl = document.getElementById('dsp_jenis_koli') as HTMLInputElement;
  let autoBarangEl = document.getElementById('dsp_auto_barang') as HTMLInputElement;

  let jml = jmlEl ? jmlEl.value.trim() : '';
  let satuanSelect = satuanSelectEl ? satuanSelectEl.value : '';
  let satuan = satuanSelect === 'LAINNYA' ? (manualKoliEl ? manualKoliEl.value.trim() : '') : (satuanSelect !== '-' ? satuanSelect : '');
  let barang = autoBarangEl ? autoBarangEl.value.trim() : '';

  if (!jml && !satuan && !barang) return;

  let cleanBarang = barang.replace(/[,.\s]+$/, '').trim();
  let parts = [jml, satuan, cleanBarang].filter(p => p !== '' && p !== '-');
  let baseText = parts.join(' ');

  if (baseText) { baseText = baseText.charAt(0).toUpperCase() + baseText.slice(1); }

  let uraianTarget = document.getElementById('dsp_uraian_barang') as HTMLInputElement;
  if (uraianTarget) { uraianTarget.value = baseText; }
}

export function updateDspCodePreviews(): void {
  let valLP = (document.getElementById('dsp_no_lp') as HTMLInputElement)?.value.trim() || '';
  let valSBP = (document.getElementById('dsp_no_sbp') as HTMLInputElement)?.value.trim() || '';
  let valSPRIN = (document.getElementById('dsp_no_sprin') as HTMLInputElement)?.value.trim() || '';

  let previewLP = document.getElementById('dsp_preview_NoLP');
  let previewSBP = document.getElementById('dsp_preview_SBP');
  let previewSPRIN = document.getElementById('dsp_preview_SPRIN');

  if (previewLP) { previewLP.textContent = valLP !== '' ? `LP-${valLP}/KPU.206/2026` : 'LP-/KPU.206/2026'; }
  if (previewSBP) { previewSBP.textContent = valSBP !== '' ? `SBP-${valSBP}/MANDIRI/KPU.2/2026` : 'SBP-/MANDIRI/KPU.2/2026'; }
  if (previewSPRIN) {
    let sprinPad = valSPRIN !== '' ? (valSPRIN.length < 2 ? String(valSPRIN).padStart(2, '0') : valSPRIN) : '01';
    previewSPRIN.textContent = valSPRIN !== '' ? `SPRIN-${sprinPad}/KPU.206/2026` : 'SPRIN-/KPU.206/2026';
  }
}

// ==========================================
// 4. MANAJEMEN MODAL & CLONING MASTER PERKARA
// ==========================================
function setModalReadonly(isReadonly: boolean): void {
  const modal = document.getElementById('disposisiModal');
  if (!modal) return;
  const inputs = modal.querySelectorAll('input, select, textarea');
  inputs.forEach((el: any) => {
    if (el.id !== 'editingDisposisiIndex' && el.id !== 'dspRecordId') {
      if (isReadonly) {
        el.setAttribute('disabled', 'true');
      } else {
        el.removeAttribute('disabled');
      }
    }
  });

  let btnSimpanDraft = document.getElementById('btnSimpanDraftDsp');
  let btnKirim = document.getElementById('btnKirimDsp');
  if (btnSimpanDraft) (btnSimpanDraft as HTMLElement).style.display = isReadonly ? 'none' : 'inline-block';
  if (btnKirim) (btnKirim as HTMLElement).style.display = isReadonly ? 'none' : 'inline-block';
}

export function openDisposisiModal(editIndex: number = -1, customData: any = null): void {
  let modalTitle = document.getElementById('disposisiModalTitle');
  let recordIdInput = document.getElementById('dspRecordId') as HTMLInputElement;
  let modal = document.getElementById('disposisiModal');

  if (modalTitle) modalTitle.textContent = "Form Pengusulan & Disposisi Berkas";
  setModalReadonly(false);

  // Jalankan cloning opsi dropdown dari master form dan data pendukung
  cloneDropdownOptionsToDisposisi();
  populatePenyidikDropdownForDisposisi();
  populateMasterPerkaraDropdownForCloning();

  const setVal = (id: string, val: string) => {
    let el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement;
    if (el) el.value = val;
  };

  if (customData) {
    if (recordIdInput) recordIdInput.value = String(customData.id || '');
    setVal('dsp_nama_pelaku', customData.pelaku || '');
    setVal('dsp_jenis_identitas', customData.jenisIdentitas || '-');
    setVal('dsp_no_identitas', customData.noIdentitas || '');
    setVal('dsp_jenis_perkara_select', customData.jenisPerkara || '');
    setVal('dsp_jenis_perkara', customData.jenisPerkara || '');
    setVal('dsp_komoditi', customData.komoditi || '');
    setVal('dsp_dokumen_pemberitahuan', customData.dokPemberitahuan || 'Tanpa Dokumen');
    setVal('dsp_tgl_dokumen', customData.tglDokPemberitahuan || '');
    setVal('dsp_jumlah_koli', customData.jumlahKoli || '');
    setVal('dsp_uraian_barang', customData.uraianBarang || '');
    setVal('dsp_no_lp', customData.noLp || '');
    setVal('dsp_tgl_lp', customData.tglLp || '');
    setVal('dsp_no_sbp', customData.noSbp || '');
    setVal('dsp_tgl_sbp', customData.tglSbp || '');
    setVal('dsp_no_sprin', customData.noSprin || '');
    setVal('dsp_tgl_sprin', customData.tglSprin || '');
    setVal('dsp_target_penyidik', customData.targetPenyidik || '-');

    if (customData.status === 'TERKIRIM' || customData.status?.includes('Diterima')) {
      setModalReadonly(true);
      if (modalTitle) modalTitle.textContent = "Detail Disposisi (Terkunci / Read-Only)";
    }
  } else {
    if (recordIdInput) recordIdInput.value = '';
    setVal('dsp_nama_pelaku', '');
    setVal('dsp_jenis_identitas', '');
    setVal('dsp_no_identitas', '');
    setVal('dsp_jenis_perkara_select', '');
    setVal('dsp_jenis_perkara', '');
    setVal('dsp_komoditi', '');
    setVal('dsp_jenis_dok_select', 'Tanpa Dokumen');
    setVal('dsp_tgl_dokumen', '');
    setVal('dsp_jumlah_koli', '');
    setVal('dsp_jenis_koli_select', '');
    setVal('dsp_auto_barang', '');
    setVal('dsp_uraian_barang', '');
    setVal('dsp_no_lp', '');
    setVal('dsp_tgl_lp', '');
    setVal('dsp_no_sbp', '');
    setVal('dsp_tgl_sbp', '');
    setVal('dsp_no_sprin', '');
    setVal('dsp_tgl_sprin', '');
    setVal('dsp_target_penyidik', '-');
  }
  
  updateDspCodePreviews();
  if (modal) modal.classList.add('active');
}

export function closeDisposisiModal(): void {
  let modal = document.getElementById('disposisiModal');
  if (modal) modal.classList.remove('active');
}

export function populatePenyidikDropdownForDisposisi(): void {
  let select = document.getElementById('dsp_target_penyidik');
  if (!select) return;

  // Ambil akun dari store, jika kosong ambil langsung dari localStorage('registeredUsers')
  let accounts = store.userAccounts;
  if (!accounts || accounts.length === 0) {
    accounts = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  }

  let penyidikList = accounts.filter((u: any) => u.role === 'Penyidik / Ketua Tim Peneliti');
  
  select.innerHTML = `<option value="-">- Pilih Penyidik / Peneliti Tujuan -</option>` + 
    penyidikList.map((u: any) => `<option value="${escText(u.nama)}">${escText(u.nama)} (${escText(u.email || u.username)})</option>`).join('');
}

export function populateMasterPerkaraDropdownForCloning(): void {
  let select = document.getElementById('dsp_clone_master_perkara');
  if (!select) return;
  let listPerkara = store.databasePerkara || [];
  select.innerHTML = `<option value="">-- Clone dari Data Perkara Master --</option>` +
    listPerkara.map((p: any, idx: number) => `<option value="${idx}">LP: ${escText(p.NoLP_LP_1 || '-')} | Pelaku: ${escText(p.Nama_Pelaku || '-')}</option>`).join('');
}

(window as any).cloneDataFromMasterPerkara = function(indexVal: string) {
  if (indexVal === '') return;
  let idx = parseInt(indexVal, 10);
  let p = store.databasePerkara[idx];
  if (!p) return;

  const setVal = (id: string, val: string) => {
    let el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement;
    if (el) el.value = val || '';
  };

  setVal('dsp_nama_pelaku', p.Nama_Pelaku || '');
  setVal('dsp_jenis_identitas', p.Jenis_Identitas || '');
  setVal('dsp_no_identitas', p.No_Identitas || '');
  setVal('dsp_jenis_perkara_select', p.Jenis_Perkara || '');
  setVal('dsp_jenis_perkara', p.Jenis_Perkara || '');
  setVal('dsp_komoditi', p.Komoditi || '');
  setVal('dsp_dokumen_pemberitahuan', p.Dokumen_Pemberitahuan || 'Tanpa Dokumen');
  setVal('dsp_tgl_dokumen', p.Tanggal_Dokumen_Pemberitahuan || '');
  setVal('dsp_jumlah_koli', p.Jumlah_Koli || '');
  setVal('dsp_uraian_barang', p.Uraian_Barang || p.Detail_Barang_LPP || '');
  setVal('dsp_no_lp', p.NoLP_LP_1 || '');
  setVal('dsp_tgl_lp', p.Tanggal_LP_LP_1 || '');
  setVal('dsp_no_sbp', p.Nomor_SBP || '');
  setVal('dsp_tgl_sbp', p.Tanggal_SBP || '');
  setVal('dsp_no_sprin', p.No_SPRIN_Indak || '');
  setVal('dsp_tgl_sprin', p.Tanggal_SPRIN_Indak || '');

  updateDspCodePreviews();
  showToast("BERHASIL CLONE", "Data berhasil disalin dari Master Perkara.", "success");
};

// ==========================================
// 5. PENYIMPANAN DRAFT & KIRIM DISPOSISI
// ==========================================
export async function saveAsDraftDisposisi(): Promise<void> {
  processSimpanDisposisi('DRAFT');
}

export async function sendDisposisi(): Promise<void> {
  processSimpanDisposisi('TERKIRIM');
}

function processSimpanDisposisi(targetStatus: 'DRAFT' | 'TERKIRIM'): void {
  let recordIdInput = (document.getElementById('dspRecordId') as HTMLInputElement)?.value || '';
  let pelaku = (document.getElementById('dsp_nama_pelaku') as HTMLInputElement)?.value.trim() || '';
  let jenisIdentitas = (document.getElementById('dsp_jenis_identitas') as HTMLSelectElement)?.value || '-';
  let noIdentitas = (document.getElementById('dsp_no_identitas') as HTMLInputElement)?.value.trim() || '';
  let jenisPerkara = (document.getElementById('dsp_jenis_perkara') as HTMLInputElement)?.value.trim() || '';
  let komoditi = (document.getElementById('dsp_komoditi') as HTMLSelectElement)?.value.trim() || '';
  let dokPemberitahuan = (document.getElementById('dsp_dokumen_pemberitahuan') as HTMLInputElement)?.value.trim() || '';
  let tglDokPemberitahuan = (document.getElementById('dsp_tgl_dokumen') as HTMLInputElement)?.value || '';
  let jumlahKoli = (document.getElementById('dsp_jumlah_koli') as HTMLInputElement)?.value.trim() || '';
  let uraianBarang = (document.getElementById('dsp_uraian_barang') as HTMLInputElement)?.value.trim() || '';
  let noLp = (document.getElementById('dsp_no_lp') as HTMLInputElement)?.value.trim() || '';
  let tglLp = (document.getElementById('dsp_tgl_lp') as HTMLInputElement)?.value || '';
  let noSbp = (document.getElementById('dsp_no_sbp') as HTMLInputElement)?.value.trim() || '';
  let tglSbp = (document.getElementById('dsp_tgl_sbp') as HTMLInputElement)?.value || '';
  let noSprin = (document.getElementById('dsp_no_sprin') as HTMLInputElement)?.value.trim() || '';
  let tglSprin = (document.getElementById('dsp_tgl_sprin') as HTMLInputElement)?.value || '';
  let targetPenyidik = (document.getElementById('dsp_target_penyidik') as HTMLSelectElement)?.value || '-';

  if (!noLp || !pelaku || targetPenyidik === '-') {
    showToast("ISIAN BELUM LENGKAP", "Nomor LP, Nama Pelaku, dan Penyidik Tujuan wajib diisi!", "warning");
    return;
  }

  let listDisposisi = JSON.parse(localStorage.getItem('databaseDisposisi') || '[]');
  let existingIndex = -1;
  if (recordIdInput) {
    existingIndex = listDisposisi.findIndex((d: any) => String(d.id) === String(recordIdInput));
  }

  let dspDataObj = {
    id: recordIdInput ? Number(recordIdInput) : Date.now(),
    pelaku, jenisIdentitas, noIdentitas, jenisPerkara, komoditi, 
    dokPemberitahuan, tglDokPemberitahuan, jumlahKoli, uraianBarang,
    noLp, tglLp, noSbp, tglSbp, noSprin, tglSprin,
    targetPenyidik,
    pengusul: store.currentUser ? store.currentUser.nama : 'Admin',
    status: targetStatus,
    tanggalDisposisi: new Date().toISOString()
  };

  if (existingIndex !== -1) {
    listDisposisi[existingIndex] = dspDataObj;
  } else {
    listDisposisi.push(dspDataObj);
  }
  localStorage.setItem('databaseDisposisi', JSON.stringify(listDisposisi));

  closeDisposisiModal();
  renderDisposisiTable();

  if (targetStatus === 'DRAFT') {
    showToast("BERHASIL SIMPAN DRAFT", `Disposisi berkas a.n ${pelaku} disimpan sebagai Draft.`, "success");
  } else {
    showToast("BERHASIL KIRIM DISPOSISI", `Disposisi berkas a.n ${pelaku} dikirim ke ${targetPenyidik}.`, "success");
  }
}

// ==========================================
// 6. RENDER TABEL & PAGINATION (5 BARIS/HALAMAN)
// ==========================================
export function renderDisposisiTable(): void {
  let tbody = document.getElementById('disposisiTableBody');
  if (!tbody) return;

  let listDisposisi = JSON.parse(localStorage.getItem('databaseDisposisi') || '[]');
  let filtered = listDisposisi;
  
  if (store.currentUser && store.currentUser.role === 'Penyidik / Ketua Tim Peneliti') {
    filtered = listDisposisi.filter((d: any) => 
      d.targetPenyidik && 
      store.currentUser?.nama && 
      d.targetPenyidik.trim().toLowerCase() === store.currentUser.nama.trim().toLowerCase() &&
      d.status !== 'DRAFT'
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--text-muted);">Belum ada data disposisi berkas.</td></tr>`;
    renderDisposisiPagination(0);
    return;
  }

  // Hitung Pagination (5 Baris per Halaman)
  const totalPages = Math.ceil(filtered.length / pageSizeDisposisi);
  if (currentDisposisiPage > totalPages) currentDisposisiPage = totalPages || 1;
  const startIndex = (currentDisposisiPage - 1) * pageSizeDisposisi;
  const paginatedItems = filtered.slice(startIndex, startIndex + pageSizeDisposisi);

  tbody.innerHTML = paginatedItems.map((d: any, localIndex: number) => {
    let globalIndex = startIndex + localIndex;
    let actionBtn = '';
    let statusBadgeClass = 'badge-ready';
    let currentStatus = d.status || 'DRAFT';

    if (currentStatus === 'TERKIRIM') {
      statusBadgeClass = 'badge-warning';
      currentStatus = 'Menunggu Penyidik';
    } else if (currentStatus.includes('Diterima')) {
      statusBadgeClass = 'badge-success';
    } else if (currentStatus.includes('Ditolak')) {
      statusBadgeClass = 'badge-danger';
    } else {
      currentStatus = 'Draft';
      statusBadgeClass = 'badge-secondary';
    }

    let tglFormatted = d.tanggalDisposisi ? new Date(d.tanggalDisposisi).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}) : '-';

    if (store.currentUser && store.currentUser.role === 'Penyidik / Ketua Tim Peneliti') {
      if (d.status === 'TERKIRIM') {
        actionBtn = `
          <div style="display:flex; gap:4px; justify-content:flex-end;">
            <button type="button" class="btn primary btn-terima-dsp" data-id="${d.id}" style="padding:4px 8px; font-size:10px;"><i class="fi fi-rr-check"></i> Terima</button>
            <button type="button" class="btn danger btn-tolak-dsp" data-id="${d.id}" style="padding:4px 8px; font-size:10px;"><i class="fi fi-rr-cross"></i> Tolak</button>
          </div>
        `;
      } else {
        actionBtn = `<span style="font-size:11px; font-weight:600; color:var(--text-muted);">${escText(currentStatus)}</span>`;
      }
    } else {
      let safeJsonData = JSON.stringify(d).replace(/"/g, '&quot;');
      let editKirimBtn = d.status === 'DRAFT' ? `
        <button type="button" class="btn primary" style="padding:4px 8px; font-size:10px;" onclick='window.bukaDetailDisposisi(${safeJsonData})'><i class="fi fi-rr-edit"></i> Edit / Kirim</button>
      ` : `
        <button type="button" class="btn secondary" style="padding:4px 8px; font-size:10px;" onclick='window.bukaDetailDisposisi(${safeJsonData})'><i class="fi fi-rr-eye"></i> Lihat</button>
      `;
      actionBtn = `<div style="display:flex; gap:4px; justify-content:flex-end;">${editKirimBtn}</div>`;
    }

    return `
      <tr>
        <td><b>${globalIndex + 1}</b></td>
        <td>LP: <b>${escText(d.noLp)}</b><br><small style="color:var(--text-muted)">SBP: ${escText(d.noSbp || '-')}</small></td>
        <td><b>${escText(d.pelaku)}</b><br><small style="color:var(--text-muted)">${escText(d.uraianBarang || '-')}</small></td>
        <td>
          <span class="badge-status ${statusBadgeClass}">${escText(currentStatus)}</span><br>
          <small style="color:var(--text-muted); font-size:10px;">Tgl: ${tglFormatted}</small>
        </td>
        <td><b>${escText(d.targetPenyidik)}</b><br><small style="color:var(--text-muted)">Oleh: ${escText(d.pengusul)}</small></td>
        <td style="text-align:right;">${actionBtn}</td>
      </tr>
    `;
  }).join('');

  renderDisposisiPagination(totalPages);
}

function renderDisposisiPagination(totalPages: number, totalItems: number = 0): void {
  let paginationContainer = document.getElementById('disposisiPaginationContainer');
  if (!paginationContainer) {
    // Cari pembungkus card utama (misalnya #disposisi atau container panel) agar posisinya di luar tabel
    let cardBodyEl = document.querySelector('#disposisi .panel-body, #disposisi .data-table-container, #disposisi');
    if (cardBodyEl) {
      let div = document.createElement('div');
      div.id = 'disposisiPaginationContainer';
      div.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding: 4px 8px; font-size: 12px;';
      cardBodyEl.appendChild(div);
      paginationContainer = div;
    } else {
      return;
    }
  }

  const maxPage = totalPages > 0 ? totalPages : 1;
  if (currentDisposisiPage > maxPage) currentDisposisiPage = maxPage;

  paginationContainer.innerHTML = `
    <span style="color: var(--text-muted);">Halaman ${currentDisposisiPage} dari ${maxPage} <b style="margin-left: 8px; color: var(--text-main);">Total: ${totalItems} Data</b></span>
    <div style="display: flex; gap: 4px;">
      <button type="button" class="btn secondary" style="padding: 4px 10px; font-size: 11px;" ${currentDisposisiPage === 1 ? 'disabled' : ''} onclick="window.changeDisposisiPage(${currentDisposisiPage - 1})">Sebelumnya</button>
      <button type="button" class="btn secondary" style="padding: 4px 10px; font-size: 11px;" ${currentDisposisiPage >= maxPage ? 'disabled' : ''} onclick="window.changeDisposisiPage(${currentDisposisiPage + 1})">Selanjutnya</button>
    </div>
  `;
}

// ==========================================
// 7. RESPON PENYIDIK (TERIMA / TOLAK)
// ==========================================
export function responDisposisi(aksi: string, idDisposisi: any): void {
  let listDisposisi = JSON.parse(localStorage.getItem('databaseDisposisi') || '[]');
  let target = listDisposisi.find((d: any) => String(d.id) === String(idDisposisi) || String(d.noLp) === String(idDisposisi));
  
  if (aksi === 'terima') {
    if (!target) {
      showToast("DATA TIDAK DITEMUKAN", "Data disposisi tidak ditemukan.", "danger");
      return;
    }

    target.status = "Disposisi Diterima";
    target.waktuRespon = new Date().toISOString();
    localStorage.setItem('databaseDisposisi', JSON.stringify(listDisposisi));

    let foundIdx = store.databasePerkara.findIndex((r: any) => {
      let rLP = String(r.NoLP_LP_1 || '').trim();
      let dLP = String(target.noLp || '').trim();
      return rLP === dLP || rLP === dLP.replace(/^LP-?/i, '');
    });
    
    if (foundIdx === -1) {
      let newRec: any = {
        NoLP_LP_1: target.noLp,
        Tanggal_LP_LP_1: target.tglLp || new Date().toISOString().split('T')[0],
        Nomor_SBP: target.noSbp || '',
        Tanggal_SBP: target.tglSbp || '',
        No_SPRIN_Indak: target.noSprin || '',
        Tanggal_SPRIN_Indak: target.tglSprin || '',
        Nama_Pelaku: target.pelaku,
        Jenis_Identitas: target.jenisIdentitas,
        No_Identitas: target.noIdentitas,
        Jenis_Perkara: target.jenisPerkara,
        Komoditi: target.komoditi,
        Dokumen_Pemberitahuan: target.dokPemberitahuan,
        Tanggal_Dokumen_Pemberitahuan: target.tglDokPemberitahuan,
        Jumlah_Koli: target.jumlahKoli,
        Uraian_Barang: target.uraianBarang,
        Detail_Barang_LPP: target.uraianBarang,
        disposisiPetugas: target.targetPenyidik,
        statusAlur: "DITERIMA PENYIDIK"
      };
      store.databasePerkara.push(newRec);
      savePerkaraToStorage();
      store.activeRecordIndex = store.databasePerkara.length - 1;
      if (typeof (window as any).renderPerkaraTable === 'function') (window as any).renderPerkaraTable();
    }

    document.querySelectorAll('.nav-btn').forEach((btn: Element) => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach((tab: Element) => tab.classList.remove('active'));
    
    let dataBtn = document.querySelector('.nav-btn[data-target="data"]');
    if (dataBtn) dataBtn.classList.add('active');
    let dataTab = document.getElementById('data');
    if (dataTab) dataTab.classList.add('active');

    if (typeof (window as any).editPerkara === 'function') (window as any).editPerkara(store.activeRecordIndex);
    showToast("DISPOSISI DITERIMA", `Berkas a.n ${target.pelaku} diterima dan resmi tercatat sebagai baris data di Perkara.`, "success");
    renderDisposisiTable();
  } 
  else if (aksi === 'tolak') {
    let modal = document.getElementById('alasanTolakModal');
    let inputData = document.getElementById('currentTolakDspData') as HTMLInputElement;
    let inputText = document.getElementById('inputAlasanTolak') as HTMLInputElement;
    
    if (inputData) inputData.value = String(idDisposisi);
    if (inputText) inputText.value = '';
    if (modal) modal.classList.add('active');
    if (inputText) inputText.focus();
  }
}

export function closeAlasanTolakModal(): void {
  let modal = document.getElementById('alasanTolakModal');
  if (modal) modal.classList.remove('active');
}

export function submitTolakDisposisi(): void {
  let rawId = (document.getElementById('currentTolakDspData') as HTMLInputElement)?.value || '';
  let alasan = (document.getElementById('inputAlasanTolak') as HTMLInputElement)?.value.trim() || '';

  if (!rawId) { showToast("GAGAL", "ID data tidak valid.", "danger"); return; }

  let listDisposisi = JSON.parse(localStorage.getItem('databaseDisposisi') || '[]');
  let target = listDisposisi.find((d: any) => String(d.id) === String(rawId) || String(d.noLp) === String(rawId));
  
  if (target) {
    target.status = "Disposisi Ditolak: " + (alasan || "Tanpa alasan");
    target.waktuRespon = new Date().toISOString();
    localStorage.setItem('databaseDisposisi', JSON.stringify(listDisposisi));

    closeAlasanTolakModal();
    renderDisposisiTable();
    showToast("DISPOSISI DITOLAK", `Berkas a.n ${target.pelaku} ditolak dan dikembalikan ke Admin.`, "warning");
  } else {
    showToast("GAGAL", "Data disposisi tidak ditemukan.", "danger");
  }
}

export function checkDisposisiAccessByRole(): void {
  let btnBuatDisposisi = document.getElementById('btnBuatDisposisiBaru');
  if (!btnBuatDisposisi) return;

  if (store.currentUser && store.currentUser.role === 'Penyidik / Ketua Tim Peneliti') {
    btnBuatDisposisi.style.display = 'none';
  } else {
    btnBuatDisposisi.style.display = 'inline-flex';
  }
}

export function cekNotifikasiDisposisiMasuk(): void {
  if (!store.currentUser || store.currentUser.role !== 'Penyidik / Ketua Tim Peneliti') {
    let wrapper = document.querySelector('.notification-wrapper') as HTMLElement;
    if (wrapper) wrapper.style.display = 'none';
    return;
  }

  let listDisposisi = JSON.parse(localStorage.getItem('databaseDisposisi') || '[]');
  let myDisposisi = listDisposisi.filter((d: any) => 
    d.targetPenyidik && 
    store.currentUser?.nama &&
    d.targetPenyidik.toLowerCase() === store.currentUser.nama.toLowerCase() &&
    d.status === 'TERKIRIM'
  );

  let unreadCount = myDisposisi.filter((d: any) => !d.isRead).length;
  let badge = document.getElementById('notifBadgeCount');

  if (badge) {
    if (unreadCount > 0) {
      badge.textContent = String(unreadCount);
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }

  let brandNew = myDisposisi.filter((d: any) => !d.toastShown);
  if (brandNew.length > 0) {
    showToast("DISPOSISI BERKAS BARU!", `Anda menerima ${brandNew.length} berkas disposisi baru untuk ditindaklanjuti.`, "warning");
    brandNew.forEach((d: any) => d.toastShown = true);
    localStorage.setItem('databaseDisposisi', JSON.stringify(listDisposisi));
  }
}

export function toggleNotificationDropdown(): void {
  let dropdown = document.getElementById('notificationDropdown') as HTMLElement;
  if (!dropdown) return;
  
  if (dropdown.style.display === 'none' || dropdown.style.display === '') {
    dropdown.style.display = 'block';
    renderNotificationHistoryList();
  } else {
    dropdown.style.display = 'none';
  }
}

export function renderNotificationHistoryList(): void {
  let container = document.getElementById('notificationListContent');
  if (!container || !store.currentUser) return;

  let listDisposisi = JSON.parse(localStorage.getItem('databaseDisposisi') || '[]');
  let myDisposisi = listDisposisi.filter((d: any) => 
    d.targetPenyidik && 
    store.currentUser?.nama &&
    d.targetPenyidik.toLowerCase() === store.currentUser.nama.toLowerCase() &&
    d.status === 'TERKIRIM'
  );

  myDisposisi.sort((a: any, b: any) => new Date(b.tanggalDisposisi).getTime() - new Date(a.tanggalDisposisi).getTime());

  if (myDisposisi.length === 0) {
    container.innerHTML = `<div style="padding: 16px; text-align: center; color: var(--text-muted, #94a3b8); font-size: 12px;">Belum ada riwayat disposisi masuk.</div>`;
    return;
  }

  container.innerHTML = myDisposisi.map((d: any) => {
    let tglFormatted = d.tanggalDisposisi ? new Date(d.tanggalDisposisi).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'}) : '';
    let bgStyle = !d.isRead ? 'background: rgba(59, 130, 246, 0.08);' : '';
    let safeJsonData = JSON.stringify(d).replace(/"/g, '&quot;');
    
    return `
      <div style="padding: 10px 14px; border-bottom: 1px solid var(--border-color, #334155); ${bgStyle} cursor: pointer;" onclick='window.klikRiwayatDisposisi(${safeJsonData})'>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
          <b style="font-size: 12px; color: var(--text-main, #f8fafc);">LP: ${escText(d.noLp)}</b>
          <span style="font-size: 10px; color: var(--text-muted, #94a3b8);">${tglFormatted}</span>
        </div>
        <div style="font-size: 11px; color: var(--text-main, #cbd5e1); margin-bottom: 2px;">Pelaku: <b>${escText(d.pelaku)}</b></div>
        <div style="font-size: 10px; color: var(--primary, #38bdf8);">Dari: ${escText(d.pengusul)}</div>
      </div>
    `;
  }).join('');
}

(window as any).klikRiwayatDisposisi = function(dspData: any) {
  let listDisposisi = JSON.parse(localStorage.getItem('databaseDisposisi') || '[]');
  let target = listDisposisi.find((d: any) => d.id === dspData.id);
  if (target) {
    target.isRead = true;
    localStorage.setItem('databaseDisposisi', JSON.stringify(listDisposisi));
  }

  let dropdown = document.getElementById('notificationDropdown') as HTMLElement;
  if (dropdown) dropdown.style.display = 'none';

  cekNotifikasiDisposisiMasuk();
  openDisposisiModal(-1, dspData);
};

(window as any).bukaDetailDisposisi = function(dspData: any) {
  openDisposisiModal(-1, dspData);
};

// Tambahkan fungsi inisialisasi ini di disposisi.ts
export function initDisposisiModule(): void {
  renderDisposisiTable();
  checkDisposisiAccessByRole();
  cekNotifikasiDisposisiMasuk();
}