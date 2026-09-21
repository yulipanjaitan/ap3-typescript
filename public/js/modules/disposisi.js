import { store, savePerkaraToStorage } from '../state/store.js';
import { escText, terbilangHuruf } from '../utils/formatters.js';
import { showToast } from './ui.js';
export function syncDspJenisPerkara(val) {
  let el = document.getElementById('dsp_jenis_perkara');
  if (el) el.value = val;
}
export function toggleDspJenisDokumen(val) {
  let manual = document.getElementById('dsp_jenis_dok_manual');
  let nomorInput = document.getElementById('dsp_nomor_dok');
  if (val === 'Tanpa Dokumen') {
    manual.style.display = 'none';
    manual.value = '';
    if (nomorInput) {
      nomorInput.value = '';
      nomorInput.disabled = true;
    }
    document.getElementById('dsp_dokumen_pemberitahuan').value = 'Tanpa Dokumen';
  } else {
    if (nomorInput) nomorInput.disabled = false;
    if (val === 'LAINNYA') {
      manual.style.display = 'block';
    } else {
      manual.style.display = 'none';
      manual.value = val === '-' ? '' : val;
    }
    syncDspDokumenPemberitahuan();
  }
}
export function syncDspDokumenPemberitahuan() {
  let sel = document.getElementById('dsp_jenis_dok_select').value;
  if (sel === 'Tanpa Dokumen') {
    document.getElementById('dsp_dokumen_pemberitahuan').value = 'Tanpa Dokumen';
    return;
  }
  let jenis = sel === 'LAINNYA' ? document.getElementById('dsp_jenis_dok_manual').value : sel === '-' ? '' : sel;
  let nomor = document.getElementById('dsp_nomor_dok').value;
  let res = [];
  if (jenis.trim()) res.push(jenis.trim());
  if (nomor.trim()) res.push(nomor.trim());
  document.getElementById('dsp_dokumen_pemberitahuan').value = res.length > 0 ? res.join(' ') : 'Tanpa Dokumen';
}
export function handleDspJenisKoliChange(val) {
  let manualInput = document.getElementById('dsp_jenis_koli');
  if (!manualInput) return;
  if (val === 'LAINNYA') {
    manualInput.style.display = 'block';
    manualInput.value = '';
    manualInput.focus();
  } else {
    manualInput.style.display = 'none';
    manualInput.value = val === '-' ? '' : val;
  }
  generateDspUraianBarangOtomatis();
}
export function handleDspJenisKoliSelectChange(val) {
  handleDspJenisKoliChange(val);
}
export function generateDspUraianBarangOtomatis() {
  let jml = document.getElementById('dsp_jumlah_koli') ? document.getElementById('dsp_jumlah_koli').value.trim() : '';
  let satuanSelect = document.getElementById('dsp_jenis_koli_select') ? document.getElementById('dsp_jenis_koli_select').value : '';
  let satuan = satuanSelect === 'LAINNYA' ? document.getElementById('dsp_jenis_koli') ? document.getElementById('dsp_jenis_koli').value.trim() : '' : satuanSelect !== '-' ? satuanSelect : '';
  let barang = document.getElementById('dsp_auto_barang') ? document.getElementById('dsp_auto_barang').value.trim() : '';
  let akhiranTipe = document.getElementById('dsp_auto_akhiran_select') ? document.getElementById('dsp_auto_akhiran_select').value : '';
  let kustomText = document.getElementById('dsp_auto_kustom_text') ? document.getElementById('dsp_auto_kustom_text').value.trim() : '';
  let kustomContainer = document.getElementById('dsp_auto_kustom_container');
  if (kustomContainer) {
    kustomContainer.style.display = akhiranTipe === 'manual' ? 'block' : 'none';
  }
  if (!jml && !satuan && !barang) return;
  let cleanBarang = barang.replace(/[,.\s]+$/, '').trim();
  let jmlTerbilang = typeof terbilangHuruf === 'function' ? terbilangHuruf(jml) : jml;
  let formattedJml = jml ? `${jml} (${jmlTerbilang})` : '';
  let parts = [formattedJml, satuan, cleanBarang].filter(p => p !== '' && p !== '-');
  let baseText = parts.join(' ');
  if (baseText) {
    baseText = baseText.charAt(0).toUpperCase() + baseText.slice(1);
  }
  if (cleanBarang) {
    if (akhiranTipe === 'dll') {
      baseText += ', dll.';
    } else if (akhiranTipe === 'etc') {
      baseText += ', etc.';
    } else if (akhiranTipe === 'barang_lainnya') {
      baseText += ', dan barang lainnya';
    } else if (akhiranTipe === 'manual' && kustomText) {
      baseText += `, ${kustomText.replace(/^,\s*/, '')}`;
    }
  }
  let uraianTarget = document.getElementById('dsp_uraian_barang');
  if (uraianTarget) {
    uraianTarget.value = baseText;
  }
}
export function updateDspCodePreviews() {
  let valLP = document.getElementById('dsp_no_lp') ? document.getElementById('dsp_no_lp').value.trim() : '';
  let valSBP = document.getElementById('dsp_no_sbp') ? document.getElementById('dsp_no_sbp').value.trim() : '';
  let valSPRIN = document.getElementById('dsp_no_sprin') ? document.getElementById('dsp_no_sprin').value.trim() : '';
  let previewLP = document.getElementById('dsp_preview_NoLP');
  let previewSBP = document.getElementById('dsp_preview_SBP');
  let previewSPRIN = document.getElementById('dsp_preview_SPRIN');
  if (previewLP) {
    previewLP.textContent = valLP !== '' ? `LP-${valLP}/KPU.206/2026` : 'LP-/KPU.206/2026';
  }
  if (previewSBP) {
    previewSBP.textContent = valSBP !== '' ? `SBP-${valSBP}/MANDIRI/KPU.2/2026` : 'SBP-/MANDIRI/KPU.2/2026';
  }
  if (previewSPRIN) {
    let sprinPad = valSPRIN !== '' ? valSPRIN.length < 2 ? String(valSPRIN).padStart(2, '0') : valSPRIN : '01';
    previewSPRIN.textContent = valSPRIN !== '' ? `SPRIN-${sprinPad}/KPU.206/2026` : 'SPRIN-/KPU.206/2026';
  }
}
export function openDisposisiModal() {
  document.getElementById('disposisiModalTitle').textContent = "Form Pengusulan & Disposisi Berkas";
  document.getElementById('editingDisposisiIndex').value = "-1";
  document.getElementById('dsp_nama_pelaku').value = '';
  document.getElementById('dsp_jenis_perkara_select').value = '-';
  document.getElementById('dsp_jenis_perkara').value = '';
  document.getElementById('dsp_jenis_dok_select').value = 'Tanpa Dokumen';
  document.getElementById('dsp_jenis_dok_manual').style.display = 'none';
  document.getElementById('dsp_nomor_dok').value = '';
  document.getElementById('dsp_nomor_dok').disabled = true;
  document.getElementById('dsp_dokumen_pemberitahuan').value = 'Tanpa Dokumen';
  document.getElementById('dsp_tgl_dokumen').value = '';
  document.getElementById('dsp_jumlah_koli').value = '';
  document.getElementById('dsp_jenis_koli_select').value = '-';
  document.getElementById('dsp_jenis_koli').style.display = 'none';
  document.getElementById('dsp_auto_barang').value = '';
  document.getElementById('dsp_uraian_barang').value = '';
  document.getElementById('dsp_no_lp').value = '';
  document.getElementById('dsp_tgl_lp').value = '';
  document.getElementById('dsp_no_sbp').value = '';
  document.getElementById('dsp_tgl_sbp').value = '';
  document.getElementById('dsp_no_sprin').value = '';
  document.getElementById('dsp_tgl_sprin').value = '';
  updateDspCodePreviews();
  populatePenyidikDropdownForDisposisi();
  document.getElementById('disposisiModal').classList.add('active');
}
export function closeDisposisiModal() {
  document.getElementById('disposisiModal').classList.remove('active');
}
export function populatePenyidikDropdownForDisposisi() {
  let select = document.getElementById('dsp_target_penyidik');
  if (!select) return;
  let penyidikList = store.userAccounts.filter(u => u.role === 'Penyidik / Ketua Tim Peneliti');
  select.innerHTML = `<option value="-">- Pilih Penyidik / Peneliti Tujuan -</option>` + penyidikList.map(u => `<option value="${escText(u.nama)}">${escText(u.nama)} (${escText(u.email)})</option>`).join('');
}
export async function saveAndSendDisposisi() {
  // Sync to backend /api/disposisi
  setTimeout(async () => {
    try {
      let activePerkara = store.databasePerkara[store.activeRecordIndex];
      let pId = activePerkara ? activePerkara.id || store.activeRecordIndex : null;
      let catatan = document.getElementById('dsp_catatan') ? document.getElementById('dsp_catatan').value : '';
      let instruksi = document.getElementById('dsp_instruksi') ? document.getElementById('dsp_instruksi').value : '';
      let kepada = document.getElementById('dsp_penyidik_tujuan') ? document.getElementById('dsp_penyidik_tujuan').value : '';
      await fetch('/api/disposisi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          disposisi: {
            perkaraId: pId,
            kepada: kepada,
            dari: store.currentUser ? store.currentUser.nama : 'Admin',
            instruksi: instruksi,
            catatan: catatan,
            status: 'TERKIRIM'
          }
        })
      });
    } catch (e) {
      console.warn('[Disposisi] Gagal sync ke backend API:', e);
    }
  }, 10);
  let pelaku = document.getElementById('dsp_nama_pelaku').value.trim();
  let jenisPerkara = document.getElementById('dsp_jenis_perkara').value.trim();
  let dokPemberitahuan = document.getElementById('dsp_dokumen_pemberitahuan').value.trim();
  let tglDokPemberitahuan = document.getElementById('dsp_tgl_dokumen').value;
  let uraianBarang = document.getElementById('dsp_uraian_barang').value.trim();
  let noLp = document.getElementById('dsp_no_lp').value.trim();
  let tglLp = document.getElementById('dsp_tgl_lp').value;
  let noSbp = document.getElementById('dsp_no_sbp').value.trim();
  let tglSbp = document.getElementById('dsp_tgl_sbp').value;
  let noSprin = document.getElementById('dsp_no_sprin').value.trim();
  let tglSprin = document.getElementById('dsp_tgl_sprin').value;
  let targetPenyidik = document.getElementById('dsp_target_penyidik').value;
  if (!noLp || !pelaku || targetPenyidik === '-') {
    showToast("ISIAN BELUM LENGKAP", "Nomor LP, Nama Pelaku, dan Penyidik Tujuan wajib diisi!", "warning");
    return;
  }
  let listDisposisi = JSON.parse(localStorage.getItem('databaseDisposisi') || '[]');
  let existingDspIndex = listDisposisi.findIndex(d => d.noLp === noLp);
  let dspDataObj = {
    id: existingDspIndex !== -1 ? listDisposisi[existingDspIndex].id : Date.now(),
    pelaku,
    jenisPerkara,
    dokPemberitahuan,
    tglDokPemberitahuan,
    uraianBarang,
    noLp,
    tglLp,
    noSbp,
    tglSbp,
    noSprin,
    tglSprin,
    targetPenyidik,
    pengusul: store.currentUser ? store.currentUser.nama : 'Admin',
    status: 'DIDISPOSISIKAN',
    tanggalDisposisi: new Date().toISOString(),
    notifiedForMe: false
  };
  if (existingDspIndex !== -1) {
    listDisposisi[existingDspIndex] = dspDataObj;
  } else {
    listDisposisi.push(dspDataObj);
  }
  localStorage.setItem('databaseDisposisi', JSON.stringify(listDisposisi));
  let existingPerkaraIndex = store.databasePerkara.findIndex(r => r.NoLP_LP_1 === noLp);
  let perkaraRecord = {
    NoLP_LP_1: noLp,
    Tanggal_LP_LP_1: tglLp,
    Nomor_SBP: noSbp,
    Tanggal_SBP: tglSbp,
    No_SPRIN_Indak: noSprin,
    Tanggal_SPRIN_Indak: tglSprin,
    Nama_Pelaku: pelaku,
    Jenis_Perkara: jenisPerkara,
    Dokumen_Pemberitahuan: dokPemberitahuan,
    Tanggal_Dokumen_Pemberitahuan: tglDokPemberitahuan,
    Uraian_Barang: uraianBarang,
    Detail_Barang_LPP: uraianBarang,
    disposisiPetugas: targetPenyidik,
    statusAlur: "DIDISPOSISIKAN / SINKRON"
  };
  if (existingPerkaraIndex !== -1) {
    store.databasePerkara[existingPerkaraIndex] = {
      ...store.databasePerkara[existingPerkaraIndex],
      ...perkaraRecord
    };
  } else {
    store.databasePerkara.push(perkaraRecord);
  }
  savePerkaraToStorage();
  closeDisposisiModal();
  renderDisposisiTable();
  if (window.renderPerkaraTable) window.renderPerkaraTable();
  if (window.updateDashboardStats) window.updateDashboardStats();
  showToast("BERHASIL DISPOSISI & SINKRON", `Berkas a.n ${pelaku} berhasil didisposisikan ke ${targetPenyidik} dan disinkronkan ke Data Perkara.`, "success");
}
export function renderDisposisiTable() {
  let tbody = document.getElementById('disposisiTableBody');
  if (!tbody) return;
  let listDisposisi = JSON.parse(localStorage.getItem('databaseDisposisi') || '[]');
  let filtered = listDisposisi;
  if (store.currentUser && store.currentUser.role === 'Penyidik / Ketua Tim Peneliti') {
    filtered = listDisposisi.filter(d => d.targetPenyidik && store.currentUser.nama && d.targetPenyidik.trim().toLowerCase() === store.currentUser.nama.trim().toLowerCase());
  }
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--text-muted);">Belum ada data disposisi berkas.</td></tr>`;
    return;
  }
  tbody.innerHTML = filtered.map((d, i) => {
    let actionBtn = '';
    let statusBadgeClass = 'badge-ready';
    let currentStatus = d.status || 'Disposisi Masuk';
    if (currentStatus.includes('Diterima')) {
      statusBadgeClass = 'badge-success';
    } else if (currentStatus.includes('Ditolak')) {
      statusBadgeClass = 'badge-danger';
    } else {
      currentStatus = 'Disposisi Masuk';
    }
    let tglFormatted = d.tanggalDisposisi ? new Date(d.tanggalDisposisi).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) : '-';
    if (store.currentUser && store.currentUser.role === 'Penyidik / Ketua Tim Peneliti') {
      if (!d.status || d.status === 'Disposisi Masuk' || d.status === 'DIDISPOSISIKAN') {
        actionBtn = `
          <div style="display:flex; gap:4px; justify-content:flex-end;">
            <button type="button" class="btn primary btn-terima-dsp" data-id="${d.id}" style="padding:4px 8px; font-size:10px;">
              <i class="fi fi-rr-check"></i> Terima
            </button>
            <button type="button" class="btn danger btn-tolak-dsp" data-id="${d.id}" style="padding:4px 8px; font-size:10px;">
              <i class="fi fi-rr-cross"></i> Tolak
            </button>
          </div>
        `;
      } else {
        actionBtn = `<span style="font-size:11px; font-weight:600; color:var(--text-muted);">${escText(d.status)}</span>`;
      }
    } else {
      actionBtn = `
        <button type="button" class="btn secondary" style="padding:4px 8px; font-size:10px;" onclick='bukaDetailDisposisi(${JSON.stringify(d)})'>
          <i class="fi fi-rr-eye"></i> Lihat Data
        </button>
      `;
    }
    return `
      <tr>
        <td><b>${i + 1}</b></td>
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
}
export function terimaDisposisi(dspData) {
  responDisposisi('terima', dspData.id || dspData.noLp);
}
export function responDisposisi(aksi, idDisposisi) {
  let listDisposisi = JSON.parse(localStorage.getItem('databaseDisposisi') || '[]');
  let target = listDisposisi.find(d => String(d.id) === String(idDisposisi) || String(d.noLp) === String(idDisposisi));
  if (aksi === 'terima') {
    if (!target) {
      showToast("DATA TIDAK DITEMUKAN", "Data disposisi tidak ditemukan.", "danger");
      return;
    }
    target.status = "Disposisi Diterima";
    target.waktuRespon = new Date().toISOString();
    localStorage.setItem('databaseDisposisi', JSON.stringify(listDisposisi));
    let foundIdx = store.databasePerkara.findIndex(r => {
      let rLP = String(r.NoLP_LP_1 || '').trim();
      let dLP = String(target.noLp || '').trim();
      return rLP === dLP || rLP === dLP.replace(/^LP-?/i, '');
    });
    if (foundIdx !== -1) {
      store.activeRecordIndex = foundIdx;
    } else {
      let newRec = {
        NoLP_LP_1: target.noLp,
        Tanggal_LP_LP_1: target.tglLp || new Date().toISOString().split('T')[0],
        Nomor_SBP: target.noSbp || '',
        Tanggal_SBP: target.tglSbp || '',
        Nama_Pelaku: target.pelaku,
        Jenis_Perkara: target.jenisPerkara,
        Dokumen_Pemberitahuan: target.dokPemberitahuan,
        Tanggal_Dokumen_Pemberitahuan: target.tglDokPemberitahuan,
        Uraian_Barang: target.uraianBarang,
        Detail_Barang_LPP: target.uraianBarang,
        disposisiPetugas: target.targetPenyidik,
        statusAlur: "DITERIMA PENYIDIK"
      };
      store.databasePerkara.push(newRec);
      savePerkaraToStorage();
      store.activeRecordIndex = store.databasePerkara.length - 1;
      if (typeof window.renderPerkaraTable === 'function') window.renderPerkaraTable();
    }
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(tab => tab.classList.remove('active'));
    let dataBtn = document.querySelector('.nav-btn[data-target="data"]');
    if (dataBtn) dataBtn.classList.add('active');
    let dataTab = document.getElementById('data');
    if (dataTab) dataTab.classList.add('active');
    if (typeof window.editPerkara === 'function') window.editPerkara(store.activeRecordIndex);
    showToast("DISPOSISI DITERIMA", `Berkas a.n ${target.pelaku} diterima. Silakan lanjutkan pengisian data perkara.`, "success");
    renderDisposisiTable();
  } else if (aksi === 'tolak') {
    let modal = document.getElementById('alasanTolakModal');
    let inputData = document.getElementById('currentTolakDspData');
    let inputText = document.getElementById('inputAlasanTolak');
    if (inputData) inputData.value = String(idDisposisi);
    if (inputText) inputText.value = '';
    if (modal) modal.classList.add('active');
    if (inputText) inputText.focus();
  }
}
export function closeAlasanTolakModal() {
  let modal = document.getElementById('alasanTolakModal');
  if (modal) modal.classList.remove('active');
}
export function submitTolakDisposisi() {
  let rawId = document.getElementById('currentTolakDspData').value;
  let alasan = document.getElementById('inputAlasanTolak').value.trim();
  if (!rawId) {
    showToast("GAGAL", "ID data tidak valid.", "danger");
    return;
  }
  let listDisposisi = JSON.parse(localStorage.getItem('databaseDisposisi') || '[]');
  let target = listDisposisi.find(d => String(d.id) === String(rawId) || String(d.noLp) === String(rawId));
  if (target) {
    target.status = "Disposisi Ditolak: " + (alasan || "Tanpa alasan");
    target.waktuRespon = new Date().toISOString();
    localStorage.setItem('databaseDisposisi', JSON.stringify(listDisposisi));
    closeAlasanTolakModal();
    renderDisposisiTable();
    showToast("DISPOSISI DITOLAK", `Berkas a.n ${target.pelaku} ditolak dan dikembalikan ke Admin/Kasi.`, "warning");
  } else {
    showToast("GAGAL", "Data disposisi tidak ditemukan saat menyimpan alasan.", "danger");
  }
}
export function checkDisposisiAccessByRole() {
  let btnBuatDisposisi = document.getElementById('btnBuatDisposisiBaru');
  if (!btnBuatDisposisi) return;
  if (store.currentUser && store.currentUser.role === 'Penyidik / Ketua Tim Peneliti') {
    btnBuatDisposisi.style.display = 'none';
  } else {
    btnBuatDisposisi.style.display = 'inline-flex';
  }
}
export function cekNotifikasiDisposisiMasuk() {
  if (!store.currentUser || store.currentUser.role !== 'Penyidik / Ketua Tim Peneliti') {
    let wrapper = document.querySelector('.notification-wrapper');
    if (wrapper) wrapper.style.display = 'none';
    return;
  }
  let listDisposisi = JSON.parse(localStorage.getItem('databaseDisposisi') || '[]');
  let myDisposisi = listDisposisi.filter(d => d.targetPenyidik && d.targetPenyidik.toLowerCase() === store.currentUser.nama.toLowerCase());
  let unreadCount = myDisposisi.filter(d => !d.isRead).length;
  let badge = document.getElementById('notifBadgeCount');
  if (badge) {
    if (unreadCount > 0) {
      badge.textContent = unreadCount;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }
  let brandNew = myDisposisi.filter(d => !d.toastShown);
  if (brandNew.length > 0) {
    showToast("DISPOSISI BERKAS BARU!", `Anda menerima ${brandNew.length} berkas disposisi baru untuk ditindaklanjuti.`, "warning");
    brandNew.forEach(d => d.toastShown = true);
    localStorage.setItem('databaseDisposisi', JSON.stringify(listDisposisi));
  }
}
export function toggleNotificationDropdown() {
  let dropdown = document.getElementById('notificationDropdown');
  if (!dropdown) return;
  if (dropdown.style.display === 'none' || dropdown.style.display === '') {
    dropdown.style.display = 'block';
    renderNotificationHistoryList();
  } else {
    dropdown.style.display = 'none';
  }
}
export function renderNotificationHistoryList() {
  let container = document.getElementById('notificationListContent');
  if (!container || !store.currentUser) return;
  let listDisposisi = JSON.parse(localStorage.getItem('databaseDisposisi') || '[]');
  let myDisposisi = listDisposisi.filter(d => d.targetPenyidik && d.targetPenyidik.toLowerCase() === store.currentUser.nama.toLowerCase());
  myDisposisi.sort((a, b) => new Date(b.tanggalDisposisi) - new Date(a.tanggalDisposisi));
  if (myDisposisi.length === 0) {
    container.innerHTML = `<div style="padding: 16px; text-align: center; color: var(--text-muted, #94a3b8); font-size: 12px;">Belum ada riwayat disposisi.</div>`;
    return;
  }
  container.innerHTML = myDisposisi.map(d => {
    let tglFormatted = d.tanggalDisposisi ? new Date(d.tanggalDisposisi).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : '';
    let bgStyle = !d.isRead ? 'background: rgba(59, 130, 246, 0.08);' : '';
    return `
      <div style="padding: 10px 14px; border-bottom: 1px solid var(--border-color, #334155); ${bgStyle} cursor: pointer; transition: background 0.2s;" onclick='klikRiwayatDisposisi(${JSON.stringify(d)})'>
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
export function klikRiwayatDisposisi(dspData) {
  let listDisposisi = JSON.parse(localStorage.getItem('databaseDisposisi') || '[]');
  let target = listDisposisi.find(d => d.id === dspData.id);
  if (target) {
    target.isRead = true;
    localStorage.setItem('databaseDisposisi', JSON.stringify(listDisposisi));
  }
  let dropdown = document.getElementById('notificationDropdown');
  if (dropdown) dropdown.style.display = 'none';
  cekNotifikasiDisposisiMasuk();
  bukaDetailDisposisi(dspData);
}
export function markAllDisposisiAsRead() {
  let listDisposisi = JSON.parse(localStorage.getItem('databaseDisposisi') || '[]');
  listDisposisi.forEach(d => {
    if (d.targetPenyidik && d.targetPenyidik.toLowerCase() === store.currentUser.nama.toLowerCase()) {
      d.isRead = true;
    }
  });
  localStorage.setItem('databaseDisposisi', JSON.stringify(listDisposisi));
  cekNotifikasiDisposisiMasuk();
  renderNotificationHistoryList();
}
export function bukaDetailDisposisi(dspData) {
  let foundIdx = store.databasePerkara.findIndex(r => {
    let rLP = String(r.NoLP_LP_1 || '').trim();
    let dLP = String(dspData.noLp || '').trim();
    return rLP === dLP || rLP === dLP.replace(/^LP-?/i, '');
  });
  if (foundIdx !== -1) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(tab => tab.classList.remove('active'));
    let dataBtn = document.querySelector('.nav-btn[data-target="data"]');
    if (dataBtn) dataBtn.classList.add('active');
    let dataTab = document.getElementById('data');
    if (dataTab) dataTab.classList.add('active');
    if (typeof window.editPerkara === 'function') window.editPerkara(foundIdx);
  } else {
    showToast("INFORMASI", "Data perkara untuk LP " + dspData.noLp + " belum ditemukan di database perkara.", "warning");
  }
}