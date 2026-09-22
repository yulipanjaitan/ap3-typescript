import { store, savePerkaraToStorage } from '../state/store.js';
import { escText, terbilangHuruf } from '../utils/formatters.js';
import { showToast } from './ui.js';

export function syncDspJenisPerkara(val: string): void {
  let el = document.getElementById('dsp_jenis_perkara') as HTMLInputElement;
  if (el) el.value = val;
}

export function toggleDspJenisDokumen(val: string): void {
  let manual = document.getElementById('dsp_jenis_dok_manual') as HTMLInputElement;
  let nomorInput = document.getElementById('dsp_nomor_dok') as HTMLInputElement;
  let dokPemberitahuan = document.getElementById('dsp_dokumen_pemberitahuan') as HTMLInputElement;
  
  if (val === 'Tanpa Dokumen') {
    if (manual) {
      manual.style.display = 'none';
      manual.value = '';
    }
    if (nomorInput) {
      nomorInput.value = '';
      nomorInput.disabled = true;
    }
    if (dokPemberitahuan) dokPemberitahuan.value = 'Tanpa Dokumen';
  } else {
    if (nomorInput) nomorInput.disabled = false;
    if (manual) {
      if (val === 'LAINNYA') {
        manual.style.display = 'block';
      } else {
        manual.style.display = 'none';
        manual.value = val === '-' ? '' : val;
      }
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
  if (sel === 'Tanpa Dokumen') {
    dokPemberitahuan.value = 'Tanpa Dokumen';
    return;
  }
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
  let akhiranSelectEl = document.getElementById('dsp_auto_akhiran_select') as HTMLSelectElement;
  let kustomTextEl = document.getElementById('dsp_auto_kustom_text') as HTMLInputElement;
  let kustomContainer = document.getElementById('dsp_auto_kustom_container');

  let jml = jmlEl ? jmlEl.value.trim() : '';
  let satuanSelect = satuanSelectEl ? satuanSelectEl.value : '';
  let satuan = satuanSelect === 'LAINNYA' 
    ? (manualKoliEl ? manualKoliEl.value.trim() : '') 
    : (satuanSelect !== '-' ? satuanSelect : '');
  let barang = autoBarangEl ? autoBarangEl.value.trim() : '';
  let akhiranTipe = akhiranSelectEl ? akhiranSelectEl.value : '';
  let kustomText = kustomTextEl ? kustomTextEl.value.trim() : '';

  if (kustomContainer) {
    (kustomContainer as HTMLElement).style.display = (akhiranTipe === 'manual') ? 'block' : 'none';
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

  let uraianTarget = document.getElementById('dsp_uraian_barang') as HTMLInputElement;
  if (uraianTarget) {
    uraianTarget.value = baseText;
  }
}

export function updateDspCodePreviews(): void {
  let valLP = (document.getElementById('dsp_no_lp') as HTMLInputElement)?.value.trim() || '';
  let valSBP = (document.getElementById('dsp_no_sbp') as HTMLInputElement)?.value.trim() || '';
  let valSPRIN = (document.getElementById('dsp_no_sprin') as HTMLInputElement)?.value.trim() || '';

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
    let sprinPad = valSPRIN !== '' ? (valSPRIN.length < 2 ? String(valSPRIN).padStart(2, '0') : valSPRIN) : '01';
    previewSPRIN.textContent = valSPRIN !== '' ? `SPRIN-${sprinPad}/KPU.206/2026` : 'SPRIN-/KPU.206/2026';
  }
}

export function openDisposisiModal(editIndex: number = -1): void {
  let modalTitle = document.getElementById('disposisiModalTitle');
  let editingIndexInput = document.getElementById('editingDisposisiIndex') as HTMLInputElement;
  let modal = document.getElementById('disposisiModal');

  if (modalTitle) modalTitle.textContent = "Form Pengusulan & Disposisi Berkas";
  if (editingIndexInput) editingIndexInput.value = String(editIndex);
  
  const setVal = (id: string, val: string) => {
    let el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement;
    if (el) el.value = val;
  };

  setVal('dsp_nama_pelaku', '');
  setVal('dsp_jenis_perkara_select', '-');
  setVal('dsp_jenis_perkara', '');
  setVal('dsp_jenis_dok_select', 'Tanpa Dokumen');
  
  let manualDok = document.getElementById('dsp_jenis_dok_manual') as HTMLInputElement;
  if (manualDok) manualDok.style.display = 'none';

  let nomorDok = document.getElementById('dsp_nomor_dok') as HTMLInputElement;
  if (nomorDok) {
    nomorDok.value = '';
    nomorDok.disabled = true;
  }

  setVal('dsp_dokumen_pemberitahuan', 'Tanpa Dokumen');
  setVal('dsp_tgl_dokumen', '');
  setVal('dsp_jumlah_koli', '');
  setVal('dsp_jenis_koli_select', '-');

  let manualKoli = document.getElementById('dsp_jenis_koli') as HTMLInputElement;
  if (manualKoli) manualKoli.style.display = 'none';

  setVal('dsp_auto_barang', '');
  setVal('dsp_uraian_barang', '');
  setVal('dsp_no_lp', '');
  setVal('dsp_tgl_lp', '');
  setVal('dsp_no_sbp', '');
  setVal('dsp_tgl_sbp', '');
  setVal('dsp_no_sprin', '');
  setVal('dsp_tgl_sprin', '');
  
  updateDspCodePreviews();
  populatePenyidikDropdownForDisposisi();
  if (modal) modal.classList.add('active');
}

export function closeDisposisiModal(): void {
  let modal = document.getElementById('disposisiModal');
  if (modal) modal.classList.remove('active');
}

export function populatePenyidikDropdownForDisposisi(): void {
  let select = document.getElementById('dsp_target_penyidik');
  if (!select) return;
  let penyidikList = (store.userAccounts as any[]).filter((u: any) => u.role === 'Penyidik / Ketua Tim Peneliti');
  select.innerHTML = `<option value="-">- Pilih Penyidik / Peneliti Tujuan -</option>` + 
    penyidikList.map((u: any) => `<option value="${escText(u.nama)}">${escText(u.nama)} (${escText(u.email)})</option>`).join('');
}

export async function saveAndSendDisposisi(): Promise<void> {
  setTimeout(async () => {
    try {
      let activePerkara = store.databasePerkara[store.activeRecordIndex];
      let pId = activePerkara ? ((activePerkara as any).id || store.activeRecordIndex) : null;
      let catatan = (document.getElementById('dsp_catatan') as HTMLInputElement)?.value || '';
      let instruksi = (document.getElementById('dsp_instruksi') as HTMLInputElement)?.value || '';
      let kepada = (document.getElementById('dsp_penyidik_tujuan') as HTMLInputElement)?.value || '';
      await fetch('/api/disposisi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  let pelaku = (document.getElementById('dsp_nama_pelaku') as HTMLInputElement)?.value.trim() || '';
  let jenisPerkara = (document.getElementById('dsp_jenis_perkara') as HTMLInputElement)?.value.trim() || '';
  let dokPemberitahuan = (document.getElementById('dsp_dokumen_pemberitahuan') as HTMLInputElement)?.value.trim() || '';
  let tglDokPemberitahuan = (document.getElementById('dsp_tgl_dokumen') as HTMLInputElement)?.value || '';
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
  let existingDspIndex = listDisposisi.findIndex((d: any) => d.noLp === noLp);

  let dspDataObj = {
    id: existingDspIndex !== -1 ? listDisposisi[existingDspIndex].id : Date.now(),
    pelaku, jenisPerkara, dokPemberitahuan, tglDokPemberitahuan, uraianBarang,
    noLp, tglLp, noSbp, tglSbp, noSprin, tglSprin,
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

  let existingPerkaraIndex = store.databasePerkara.findIndex((r: any) => r.NoLP_LP_1 === noLp);

  let perkaraRecord: any = {
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
    store.databasePerkara[existingPerkaraIndex] = { ...store.databasePerkara[existingPerkaraIndex], ...perkaraRecord };
  } else {
    store.databasePerkara.push(perkaraRecord);
  }
  
  savePerkaraToStorage();
  closeDisposisiModal();
  renderDisposisiTable();
  if ((window as any).renderPerkaraTable) (window as any).renderPerkaraTable();
  if ((window as any).updateDashboardStats) (window as any).updateDashboardStats();

  showToast("BERHASIL DISPOSISI & SINKRON", `Berkas a.n ${pelaku} berhasil didisposisikan ke ${targetPenyidik} dan disinkronkan ke Data Perkara.`, "success");
}

export function renderDisposisiTable(): void {
  let tbody = document.getElementById('disposisiTableBody');
  if (!tbody) return;

  let listDisposisi = JSON.parse(localStorage.getItem('databaseDisposisi') || '[]');
  let filtered = listDisposisi;
  
  if (store.currentUser && store.currentUser.role === 'Penyidik / Ketua Tim Peneliti') {
    filtered = listDisposisi.filter((d: any) => 
      d.targetPenyidik && 
      store.currentUser?.nama && 
      d.targetPenyidik.trim().toLowerCase() === store.currentUser.nama.trim().toLowerCase()
    );
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px; color:var(--text-muted);">Belum ada data disposisi berkas.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((d: any, i: number) => {
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

    let tglFormatted = d.tanggalDisposisi ? new Date(d.tanggalDisposisi).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}) : '-';

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
      let safeJsonData = JSON.stringify(d).replace(/"/g, '&quot;');
      actionBtn = `
        <button type="button" class="btn secondary" style="padding:4px 8px; font-size:10px;" onclick='bukaDetailDisposisi(${safeJsonData})'>
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

export function terimaDisposisi(dspData: any): void {
  responDisposisi('terima', dspData.id || dspData.noLp);
}

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
    
    if (foundIdx !== -1) {
      store.activeRecordIndex = foundIdx;
    } else {
      let newRec: any = {
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
      if (typeof (window as any).renderPerkaraTable === 'function') (window as any).renderPerkaraTable();
    }

    document.querySelectorAll('.nav-btn').forEach((btn: Element) => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach((tab: Element) => tab.classList.remove('active'));
    
    let dataBtn = document.querySelector('.nav-btn[data-target="data"]');
    if (dataBtn) dataBtn.classList.add('active');
    let dataTab = document.getElementById('data');
    if (dataTab) dataTab.classList.add('active');

    if (typeof (window as any).editPerkara === 'function') (window as any).editPerkara(store.activeRecordIndex);
    showToast("DISPOSISI DITERIMA", `Berkas a.n ${target.pelaku} diterima. Silakan lanjutkan pengisian data perkara.`, "success");
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

  if (!rawId) {
    showToast("GAGAL", "ID data tidak valid.", "danger");
    return;
  }

  let listDisposisi = JSON.parse(localStorage.getItem('databaseDisposisi') || '[]');
  let target = listDisposisi.find((d: any) => String(d.id) === String(rawId) || String(d.noLp) === String(rawId));
  
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
    d.targetPenyidik.toLowerCase() === store.currentUser.nama.toLowerCase()
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
    d.targetPenyidik.toLowerCase() === store.currentUser.nama.toLowerCase()
  );

  myDisposisi.sort((a: any, b: any) => new Date(b.tanggalDisposisi).getTime() - new Date(a.tanggalDisposisi).getTime());

  if (myDisposisi.length === 0) {
    container.innerHTML = `<div style="padding: 16px; text-align: center; color: var(--text-muted, #94a3b8); font-size: 12px;">Belum ada riwayat disposisi.</div>`;
    return;
  }

  container.innerHTML = myDisposisi.map((d: any) => {
    let tglFormatted = d.tanggalDisposisi ? new Date(d.tanggalDisposisi).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'}) : '';
    let bgStyle = !d.isRead ? 'background: rgba(59, 130, 246, 0.08);' : '';
    let safeJsonData = JSON.stringify(d).replace(/"/g, '&quot;');
    
    return `
      <div style="padding: 10px 14px; border-bottom: 1px solid var(--border-color, #334155); ${bgStyle} cursor: pointer; transition: background 0.2s;" onclick='klikRiwayatDisposisi(${safeJsonData})'>
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

export function klikRiwayatDisposisi(dspData: any): void {
  let listDisposisi = JSON.parse(localStorage.getItem('databaseDisposisi') || '[]');
  let target = listDisposisi.find((d: any) => d.id === dspData.id);
  if (target) {
    target.isRead = true;
    localStorage.setItem('databaseDisposisi', JSON.stringify(listDisposisi));
  }

  let dropdown = document.getElementById('notificationDropdown') as HTMLElement;
  if (dropdown) dropdown.style.display = 'none';

  cekNotifikasiDisposisiMasuk();
  bukaDetailDisposisi(dspData);
}

export function markAllDisposisiAsRead(): void {
  let listDisposisi = JSON.parse(localStorage.getItem('databaseDisposisi') || '[]');
  listDisposisi.forEach((d: any) => {
    if (d.targetPenyidik && store.currentUser?.nama && d.targetPenyidik.toLowerCase() === store.currentUser.nama.toLowerCase()) {
      d.isRead = true;
    }
  });
  localStorage.setItem('databaseDisposisi', JSON.stringify(listDisposisi));
  cekNotifikasiDisposisiMasuk();
  renderNotificationHistoryList();
}

export function bukaDetailDisposisi(dspData: any): void {
  let foundIdx = store.databasePerkara.findIndex((r: any) => {
    let rLP = String(r.NoLP_LP_1 || '').trim();
    let dLP = String(dspData.noLp || '').trim();
    return rLP === dLP || rLP === dLP.replace(/^LP-?/i, '');
  });
  if (foundIdx !== -1) {
    document.querySelectorAll('.nav-btn').forEach((btn: Element) => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach((tab: Element) => tab.classList.remove('active'));
    let dataBtn = document.querySelector('.nav-btn[data-target="data"]');
    if (dataBtn) dataBtn.classList.add('active');
    let dataTab = document.getElementById('data');
    if (dataTab) dataTab.classList.add('active');
    if (typeof (window as any).editPerkara === 'function') (window as any).editPerkara(foundIdx);
  } else {
    showToast("INFORMASI", "Data perkara untuk LP " + dspData.noLp + " belum ditemukan di database perkara.", "warning");
  }
}