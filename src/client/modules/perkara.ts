import { store, savePerkaraToStorage, loadPerkaraFromStorage } from '../state/store.js';
import { defaultPasalClusters, defaultKantorList } from '../config/constants.js';
import { escText, getVal, formatDate, formatDateIndo, formatModusVerb, terbilangHuruf, autoIsiTeksBA } from '../utils/formatters.js';
import { showToast, showToastConfirm } from './ui.js';
import { refreshReportTableUI, updateReportLive } from './editor.js';

export function populateAgeDropdown(): void {
  let select = document.getElementById('Umur_Pelaku');
  if (!select) return;
  
  let optionsHtml = `<option value="-">- Pilih Usia -</option>`;
  for (let i = 17; i <= 90; i++) {
    optionsHtml += `<option value="${i}">${i} Tahun</option>`;
  }
  select.innerHTML = optionsHtml;
}

export function updateHariSBP(): void {
  let tglInput = document.getElementById('Tanggal_SBP') as HTMLInputElement;
  if (tglInput && tglInput.value) {
    let d = new Date(tglInput.value + 'T12:00:00');
    let days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    let hariEl = document.getElementById('Hari_SBP') as HTMLInputElement;
    if (hariEl) hariEl.value = days[d.getDay()];
  }
}

export function updateLiveCodePreviews(): void {
  let valLP = (document.getElementById('NoLP_LP_1') as HTMLInputElement)?.value.trim() || '';
  let valSBP = (document.getElementById('Nomor_SBP') as HTMLInputElement)?.value.trim() || '';
  let valSPRIN = (document.getElementById('No_SPRIN_Indak') as HTMLInputElement)?.value.trim() || '';
  let statusPenangkapan = (document.getElementById('Status_Penangkapan_Select') as HTMLSelectElement)?.value || '-';
  
  let tipeSBP = statusPenangkapan.toUpperCase().includes('LIMPAHAN') ? 'LIMPAH' : 'MANDIRI';

  let previewLP = document.getElementById('preview_NoLP');
  let previewSBP = document.getElementById('preview_SBP');
  let previewSPRIN = document.getElementById('preview_SPRIN');

  if (previewLP) {
    previewLP.textContent = valLP !== '' ? `LP-${valLP}/KPU.206/2026` : 'LP-/KPU.206/2026';
  }
  if (previewSBP) {
    previewSBP.textContent = valSBP !== '' ? `SBP-${valSBP}/${tipeSBP}/KPU.2/2026` : `SBP-/${tipeSBP}/KPU.2/2026`;
  }
  if (previewSPRIN) {
    let sprinPad = valSPRIN !== '' ? (valSPRIN.length < 2 ? String(valSPRIN).padStart(2, '0') : valSPRIN) : '01';
    previewSPRIN.textContent = valSPRIN !== '' ? `SPRIN-${sprinPad}/KPU.206/2026` : 'SPRIN-/KPU.206/2026';
  }
}

export function updateValCodePreviews(): void {
  let valLP = (document.getElementById('val_input_LP') as HTMLInputElement)?.value.trim() || '';
  let valSBP = (document.getElementById('val_input_SBP') as HTMLInputElement)?.value.trim() || '';

  let previewLP = document.getElementById('val_preview_LP');
  let previewSBP = document.getElementById('val_preview_SBP');

  if (previewLP) {
    previewLP.textContent = valLP !== '' ? `LP-${valLP}/KPU.206/2026` : 'LP-/KPU.206/2026';
  }
  if (previewSBP) {
    previewSBP.textContent = valSBP !== '' ? `SBP-${valSBP}/MANDIRI/KPU.2/2026` : 'SBP-/MANDIRI/KPU.2/2026';
  }
}

export function generateKronologisOtomatis(): void {
  let hari = getVal('Hari_SBP');
  let tglIndo = formatDate('Tanggal_SBP');
  
  let rawJam = (document.getElementById('Jam_Kejadian') as HTMLInputElement)?.value.trim() || '';
  let jamFormatted = rawJam ? rawJam.replace(':', '.') + ' WIB' : '-';

  let lokasi = getVal('Lokasi_Penindakan');
  let pelaku = getVal('Nama_Pelaku');
  let rawModus = getVal('Modus_Operandi');
  let modusVerb = formatModusVerb(rawModus);
  let kantor = getVal('Kantor') !== '-' ? getVal('Kantor') : 'Kantor Pelayanan Utama Bea dan Cukai Tipe B Batam';

  let cleanModus = modusVerb.replace(/[;:]+$/, '').trim();

  let text = `Pada hari ${hari}, tanggal ${tglIndo} sekira pukul ${jamFormatted} di ${lokasi} telah dilakukan penindakan oleh Petugas ${kantor} terhadap ${pelaku} yang ${cleanModus}`;
  
  let el = document.getElementById('Kronologis') as HTMLTextAreaElement;
  if (el) el.value = text;
}

export function generateKesimpulanOtomatis(): void {
  let pasal = getVal('Pasal_Pelanggaran');
  let rawModus = getVal('Modus_Operandi');
  let modusVerb = formatModusVerb(rawModus);

  let text = (pasal !== '-' || rawModus !== '-') ? `Diduga melanggar ${pasal} karena ${modusVerb}.` : '-';
  let el = document.getElementById('Jenis_Pelanggaran_Pasal') as HTMLTextAreaElement;
  if (el) el.value = text;
}

export function handleJenisKoliSelectChange(val: string): void {
  let manualInput = document.getElementById('Jenis_Koli') as HTMLInputElement;
  if (!manualInput) return;

  if (val === 'LAINNYA') {
    manualInput.style.display = 'block';
    manualInput.value = '';
    manualInput.focus();
  } else {
    manualInput.style.display = 'none';
    manualInput.value = (val === '-' ? '' : val);
  }
  generateUraianBarangOtomatis();
}

export function generateUraianBarangOtomatis(): void {
  let jml = (document.getElementById('Jumlah_Koli') as HTMLInputElement)?.value.trim() || '';
  let satuan = (document.getElementById('Jenis_Koli') as HTMLInputElement)?.value.trim() || '';
  let barang = (document.getElementById('auto_barang') as HTMLInputElement)?.value.trim() || '';
  let akhiranTipe = (document.getElementById('auto_akhiran_select') as HTMLSelectElement)?.value || '';
  let kustomText = (document.getElementById('auto_kustom_text') as HTMLInputElement)?.value.trim() || '';

  let kustomContainer = document.getElementById('auto_kustom_container');
  if (kustomContainer) {
    (kustomContainer as HTMLElement).style.display = (akhiranTipe === 'manual') ? 'block' : 'none';
  }

  if (!jml && !satuan && !barang) return;

  let cleanBarang = barang.replace(/[,.\s]+$/, '').trim();
  let jmlTerbilang = terbilangHuruf(jml);
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
  } else if (baseText && akhiranTipe) {
    if (akhiranTipe === 'dll') {
      baseText += ' dll.';
    } else if (akhiranTipe === 'etc') {
      baseText += ' etc.';
    } else if (akhiranTipe === 'barang_lainnya') {
      baseText += ' dan barang lainnya';
    } else if (akhiranTipe === 'manual' && kustomText) {
      baseText += ` ${kustomText.replace(/^,\s*/, '')}`;
    }
  }

  let uraianTarget = document.getElementById('Uraian_Barang') as HTMLTextAreaElement;
  if (uraianTarget) {
    uraianTarget.value = baseText;
  }
}

export function autoGenerateAndAddMasterPasal(modusText: string): void {
  if (!modusText || modusText === '-') return;

  let newPasalList: any[] = [];

  if (/cukai|pita cukai|bkc|etiket|nppbkc/i.test(modusText)) {
    if (/penyediaan|penimbunan/i.test(modusText)) {
      newPasalList.push({ cluster: "UU CUKAI", pasal: "Pasal 54 UU NO. 39 TAHUN 2007 TENTANG CUKAI" });
      newPasalList.push({ cluster: "UU CUKAI", pasal: "Pasal 56 UU NO. 39 TAHUN 2007 TENTANG CUKAI" });
    } else if (/penyerahan/i.test(modusText)) {
      newPasalList.push({ cluster: "UU CUKAI", pasal: "Pasal 54 UU NO. 39 TAHUN 2007 TENTANG CUKAI" });
      newPasalList.push({ cluster: "UU CUKAI", pasal: "Pasal 55 UU NO. 39 TAHUN 2007 TENTANG CUKAI" });
    } else if (/pengangkutan/i.test(modusText)) {
      newPasalList.push({ cluster: "UU CUKAI", pasal: "Pasal 52 UU NO. 39 TAHUN 2007 TENTANG CUKAI" });
      newPasalList.push({ cluster: "PERATURAN MENTERI KEUANGAN", pasal: "PMK NO. 161/PMK.04/2019 TENTANG TATA CARA PENGANGKUT BARANG KENA CUKAI" });
    } else {
      newPasalList.push({ cluster: "UU CUKAI", pasal: "Pasal 54 UU NO. 39 TAHUN 2007 TENTANG CUKAI" });
    }
  }

  if (/luar daerah pabean|pembongkaran|workshop container|impor sementara/i.test(modusText)) {
    if (/tanpa\/salah pemberitahuan|tidak diberitahukan/i.test(modusText)) {
      newPasalList.push({ cluster: "UU KEPABEANAN", pasal: "Pasal 102 UU NO. 17 TAHUN 2006 TENTANG KEPABEANAN" });
    }
    if (/impor sementara/i.test(modusText)) {
      newPasalList.push({ cluster: "UU KEPABEANAN", pasal: "Pasal 108 UU NO. 17 TAHUN 2006 TENTANG KEPABEANAN" });
    }
    if (/pembongkaran/i.test(modusText)) {
      newPasalList.push({ cluster: "UU KEPABEANAN", pasal: "Pasal 103 UU NO. 17 TAHUN 2006 TENTANG KEPABEANAN" });
    }
  }

  if (/ke luar daerah pabean|outward manifest|ekspor/i.test(modusText)) {
    newPasalList.push({ cluster: "UU KEPABEANAN", pasal: "Pasal 102A UU NO. 17 TAHUN 2006 TENTANG KEPABEANAN" });
    if (/outward manifest/i.test(modusText)) {
      newPasalList.push({ cluster: "UU KEPABEANAN", pasal: "Pasal 103 UU NO. 17 TAHUN 2006 TENTANG KEPABEANAN" });
    }
  }

  if (/larangan dan pembatasan|perizinan|badan pengusahaan|instansi terkait/i.test(modusText)) {
    newPasalList.push({ cluster: "UU KEPABEANAN", pasal: "Pasal 53 Ayat (4) UU NO. 17 TAHUN 2006 TENTANG KEPABEANAN" });
    newPasalList.push({ cluster: "PERATURAN MENTERI/BADAN LAIN", pasal: "Peraturan Menteri Perdagangan Terkait Larangan Dan Pembatasan (Lartas)" });
  }

  if (/kawasan perdagangan bebas|pelabuhan bebas|batam|ftz|tempat lain dalam daerah pabean/i.test(modusText)) {
    newPasalList.push({ cluster: "PERATURAN PEMERINTAH", pasal: "Pasal 71 Ayat (1) PP NO. 41 TAHUN 2021 TENTANG KAWASAN BEBAS BATAM" });
    newPasalList.push({ cluster: "PERATURAN MENTERI KEUANGAN", pasal: "PMK NO. 34/PMK.04/2021 TENTANG PEMASUKAN DAN PENGELUARAN BARANG FTZ" });
  }

  if (/uang kertas asing|uang tunai|bank indonesia|seratus juta/i.test(modusText)) {
    newPasalList.push({ cluster: "UU INSTANSI LAIN", pasal: "UU NO. 7 TAHUN 2011 TENTANG MATA UANG" });
    newPasalList.push({ cluster: "PERATURAN MENTERI KEUANGAN", pasal: "PMK NO. 100/PMK.04/2018 TENTANG PEMBAWAAN UANG TUNAI" });
    newPasalList.push({ cluster: "PERATURAN MENTERI/BADAN LAIN", pasal: "Peraturan Bank Indonesia NO. 20/2/PBI/2018 TENTANG PEMBAWAAN UKA" });
  }

  if (newPasalList.length === 0) return;

  let customMap = JSON.parse(localStorage.getItem('customPasalMap') || '{}');
  let isNewAdded = false;

  newPasalList.forEach((item: any) => {
    if (!customMap[item.cluster]) customMap[item.cluster] = [];
    let defaultList = (defaultPasalClusters as any)[item.cluster] || [];
    if (!defaultList.includes(item.pasal) && !customMap[item.cluster].includes(item.pasal)) {
      customMap[item.cluster].push(item.pasal);
      isNewAdded = true;
    }
  });

  if (isNewAdded) {
    localStorage.setItem('customPasalMap', JSON.stringify(customMap));
    renderPasalCheckboxes();
  }

  setTimeout(() => {
    document.querySelectorAll('#pasal_pelanggaran_checkboxes input[type="checkbox"]').forEach((cb: any) => cb.checked = false);
    
    newPasalList.forEach((item: any) => {
      let cb = document.querySelector(`#pasal_pelanggaran_checkboxes input[value="${item.pasal}"]`) as HTMLInputElement;
      if (cb) cb.checked = true;
    });
    syncPasalPelanggaran();
  }, 50);
}

export function toggleAsalPerkaraManual(val: string): void {
  let manualInput = document.getElementById('Asal_Perkara') as HTMLInputElement;
  if (!manualInput) return;
  if (val === 'LAINNYA') {
    manualInput.style.display = 'block';
    manualInput.value = '';
  } else {
    manualInput.style.display = 'none';
    manualInput.value = val;
  }
}

export function togglePekerjaanManual(val: string): void {
  let manualInput = document.getElementById('Pekerjaan') as HTMLInputElement;
  if (!manualInput) return;
  if (val === 'LAINNYA') {
    manualInput.style.display = 'block';
    manualInput.value = '';
  } else {
    manualInput.style.display = 'none';
    manualInput.value = val;
  }
}

export function toggleUkuranKontainerManual(val: string): void {
  let manualInput = document.getElementById('Ukuran_Kontainer') as HTMLInputElement;
  if (!manualInput) return;
  if (val === 'LAINNYA') {
    manualInput.style.display = 'block';
    manualInput.value = '';
  } else {
    manualInput.style.display = 'none';
    manualInput.value = val;
  }
}

export function toggleJenisDokumen(val: string): void {
  let manual = document.getElementById('Jenis_Dok_Pemberitahuan_Manual') as HTMLInputElement;
  let nomorInput = document.getElementById('Nomor_Dok_Pemberitahuan') as HTMLInputElement;
  let dokPemberitahuan = document.getElementById('Dokumen_Pemberitahuan') as HTMLInputElement;
  
  if (val === 'Tanpa Dokumen') {
    if (manual) { manual.style.display = 'none'; manual.value = ''; }
    if (nomorInput) { nomorInput.value = ''; nomorInput.disabled = true; }
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
    syncDokumenPemberitahuan();
  }
}

export function syncDokumenPemberitahuan(): void {
  let selEl = document.getElementById('Jenis_Dok_Pemberitahuan_Select') as HTMLSelectElement;
  let dokPemberitahuan = document.getElementById('Dokumen_Pemberitahuan') as HTMLInputElement;
  let manualEl = document.getElementById('Jenis_Dok_Pemberitahuan_Manual') as HTMLInputElement;
  let nomorEl = document.getElementById('Nomor_Dok_Pemberitahuan') as HTMLInputElement;

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

export function handleJenisDokPelengkapChange(val: string): void {
  let manualInput = document.getElementById('Jenis_Dok_Pelengkap_Manual') as HTMLInputElement;
  let noInput = document.getElementById('Nomor_Dok_Pelengkap') as HTMLInputElement;
  let tglInput = document.getElementById('Tanggal_Dok_Pelengkap') as HTMLInputElement;
  let dokPelengkap = document.getElementById('Dokumen_Pelengkap') as HTMLInputElement;

  if (val === '-') {
    if (manualInput) { manualInput.style.display = 'none'; manualInput.value = ''; }
    if (noInput) { noInput.value = ''; noInput.disabled = true; }
    if (tglInput) { tglInput.value = ''; tglInput.disabled = true; }
    if (dokPelengkap) dokPelengkap.value = '-';
  } else {
    if (noInput) noInput.disabled = false;
    if (tglInput) tglInput.disabled = false;
    
    if (val === 'LAINNYA') {
      if (manualInput) { manualInput.style.display = 'block'; manualInput.value = ''; manualInput.focus(); }
    } else {
      if (manualInput) { manualInput.style.display = 'none'; manualInput.value = val; }
    }
    syncDokumenPelengkap();
  }
}

export function syncDokumenPelengkap(): void {
  let selEl = document.getElementById('Jenis_Dok_Pelengkap_Select') as HTMLSelectElement;
  let dokPelengkap = document.getElementById('Dokumen_Pelengkap') as HTMLInputElement;
  let manualEl = document.getElementById('Jenis_Dok_Pelengkap_Manual') as HTMLInputElement;
  let nomorEl = document.getElementById('Nomor_Dok_Pelengkap') as HTMLInputElement;
  let tglEl = document.getElementById('Tanggal_Dok_Pelengkap') as HTMLInputElement;

  if (!selEl || !dokPelengkap) return;

  let sel = selEl.value;
  if (sel === '-') {
    dokPelengkap.value = '-';
    return;
  }

  let jenis = sel === 'LAINNYA' ? (manualEl ? manualEl.value.trim() : '') : sel;
  let nomor = nomorEl ? nomorEl.value.trim() : '';
  let tglRaw = tglEl ? tglEl.value : '';
  let tglIndo = tglRaw ? formatDateIndo(tglRaw) : '';

  let parts: string[] = [];
  if (jenis) parts.push(jenis);
  if (nomor) parts.push(`nomor ${nomor}`);
  if (tglIndo && tglIndo !== '-') parts.push(`tanggal ${tglIndo}`);

  dokPelengkap.value = parts.length > 0 ? parts.join(' ') : '-';
}

export function syncIdentitasValue(): void {
  let jenis = (document.getElementById('Jenis_Identitas_Select') as HTMLSelectElement)?.value || '';
  let nomor = (document.getElementById('Nomor_Identitas_Input') as HTMLInputElement)?.value.trim() || '';
  let hidden = document.getElementById('Nomor_Identitas') as HTMLInputElement;
  if (hidden) {
    hidden.value = nomor ? `${jenis} : ${nomor}` : '';
  }
}

export function syncPenyelesaianPerkara(): void {
  let checkboxes = document.querySelectorAll('#penyelesaian_checkboxes input[type="checkbox"]:checked');
  let selected = Array.from(checkboxes).map((cb: any) => cb.value);
  let el = document.getElementById('Penyelesaian_Perkara') as HTMLInputElement;
  if (el) el.value = selected.length > 0 ? selected.join(', ') : '-';
}

export function syncKondisiBarang(): void {
  let checkboxes = document.querySelectorAll('#kondisi_checkboxes input[type="checkbox"]:checked');
  let selected = Array.from(checkboxes).map((cb: any) => cb.value);
  let el = document.getElementById('Kondisi') as HTMLInputElement;
  if (el) el.value = selected.length > 0 ? selected.join(', ') : '-';
}

export function syncPasalPelanggaran(): void {
  let checkboxes = document.querySelectorAll('#pasal_pelanggaran_checkboxes input[type="checkbox"]:checked');
  let selected = Array.from(checkboxes).map((cb: any) => cb.value); 
  let result = '-';
  let n = selected.length;
  
  if (n === 1) {
    result = selected[0];
  } else if (n === 2) {
    result = selected[0] + ' dan ' + selected[1];
  } else if (n === 3) {
    result = selected[0] + ', ' + selected[1] + ' dan ' + selected[2];
  } else if (n > 3) {
    result = selected.slice(0, n-2).join(', ') + ' dan ' + selected[n-2] + ' serta ' + selected[n-1];
  }
  
  let el = document.getElementById('Pasal_Pelanggaran') as HTMLInputElement;
  if (el) el.value = result;
  generateKesimpulanOtomatis();
}

export function syncStatusPenangkapan(val: string): void {
  let el = document.getElementById('Status_Penangkapan') as HTMLInputElement;
  if (el) el.value = val;
  updateLiveCodePreviews();
  refreshReportTableUI();
  updateReportLive();
}

export function syncJenisPelanggaran(val: string): void {
  let el = document.getElementById('Jenis_Pelanggaran') as HTMLInputElement;
  if (el) el.value = val;
}

export function syncJenisPenindakan(val: string): void {
  let el = document.getElementById('Jenis_Penindakan') as HTMLInputElement;
  if (el) el.value = val;
}

export function syncJenisPerkara(val: string): void {
  let el = document.getElementById('Jenis_Perkara') as HTMLInputElement;
  if (el) el.value = val;
}

export function syncModusOperandi(val: string): void {
  let el = document.getElementById('Modus_Operandi') as HTMLInputElement;
  if (el) el.value = val;
}

export function syncKomoditi(val: string): void {
  let el = document.getElementById('Komoditi') as HTMLInputElement;
  if (el) el.value = val;
}

export function syncKantor(val: string): void {
  let el = document.getElementById('Kantor') as HTMLInputElement;
  if (el) el.value = val;
}

export function addCustomKantor(): void {
  let input = document.getElementById('setting_newKantor') as HTMLInputElement;
  if (!input) return;
  let val = input.value.trim();
  if (!val) return;

  let customKantor = JSON.parse(localStorage.getItem('customKantorList') || '[]');
  if (!customKantor.includes(val)) {
    customKantor.push(val);
    localStorage.setItem('customKantorList', JSON.stringify(customKantor));
    renderKantorDropdown();
    input.value = '';
    showToast('KANTOR BERHASIL DITAMBAHKAN', 'Unit kantor baru ditambahkan ke opsi.', 'success');
  } else {
    showToast('PERINGATAN KANTOR', 'Kantor tersebut sudah terdaftar!', 'warning');
  }
}

export function renderPasalCheckboxes(): void {
  let container = document.getElementById('pasal_pelanggaran_checkboxes');
  if (!container) return;

  let customMap = JSON.parse(localStorage.getItem('customPasalMap') || '{}');
  let html = '';

  Object.keys(defaultPasalClusters).forEach(cluster => {
    html += `<div style="grid-column: span 2; font-weight:bold; color:var(--primary); margin-top:6px; border-bottom:1px solid #334155; display:flex; align-items:center; gap:6px;"><i class="fi fi-rr-bookmark"></i> ${cluster}</div>`;
    let items = [...(defaultPasalClusters as any)[cluster], ...(customMap[cluster] || [])];
    items.forEach((p: string) => {
      html += `<label class="checkbox-item"><input type="checkbox" value="${escText(p)}" onchange="syncPasalPelanggaran()"> ${escText(p)}</label>`;
    });
  });

  container.innerHTML = html;
}

export function renderCustomKomoditiOptions(): void {
  let customKomoditi = JSON.parse(localStorage.getItem('customKomoditiList') || '[]');
  let komoditiGroup = document.getElementById('optgroup_custom_komoditi');
  if (komoditiGroup) {
    komoditiGroup.innerHTML = customKomoditi.map((k: string) => `<option value="${escText(k)}">${escText(k)}</option>`).join('');
  }
}

export function renderKantorDropdown(): void {
  let customKantor = JSON.parse(localStorage.getItem('customKantorList') || '[]');
  let allKantor = [...defaultKantorList, ...customKantor];

  let select = document.getElementById('Kantor_Select') as HTMLSelectElement;
  let kantorInput = document.getElementById('Kantor') as HTMLInputElement;
  if (select) {
    select.innerHTML = `<option value="-">-</option>` + allKantor.map((k: string) => `<option value="${escText(k)}">${escText(k)}</option>`).join('');
    if (kantorInput && !kantorInput.value) {
      select.value = defaultKantorList[0];
      kantorInput.value = defaultKantorList[0];
    }
  }

  let listDisplay = document.getElementById('setting_kantorListDisplay');
  if (listDisplay) {
    listDisplay.innerHTML = allKantor.map((k: string) => `<li>${escText(k)}</li>`).join('');
  }
}

export function getFilteredDataForUser(): any[] {
  if (!store.currentUser) return store.databasePerkara;
  if (store.currentUser.role === 'Admin' || store.currentUser.role === 'Kepala Seksi Penyidikan') {
    return store.databasePerkara;
  } else {
    return store.databasePerkara.filter((rec: any) => rec.disposisiPetugas && store.currentUser?.nama && rec.disposisiPetugas.toLowerCase() === store.currentUser.nama.toLowerCase());
  }
}

export function updateDashboardStats(): void {
  let filteredData = getFilteredDataForUser();

  let stLP = document.getElementById('statLP');
  let stK = document.getElementById('statKerugian');
  let valSummary = document.getElementById('valPenyelesaianSummary');
  let valStatusAlur = document.getElementById('valStatusAlurPerkara');
  let valDisposisi = document.getElementById('valPetugasDisposisi');

  if (stLP) stLP.textContent = String(filteredData.length);

  let totalKerugian = 0;
  let cntBDN = 0;
  let cntSPSA = 0;
  let cntBAST = 0;
  let cntLimpah = 0;
  let cntOther = 0;

  filteredData.forEach((rec: any) => {
    let rawK = String(rec.Kerugian_Negara || '').replace(/[^0-9]/g, '');
    let k = parseFloat(rawK || '0');
    if (!isNaN(k)) totalKerugian += k;

    let peny = rec.Penyelesaian_Perkara || '';
    if (/dikuasai negara|bdn/i.test(peny)) cntBDN++;
    else if (/spsa|denda/i.test(peny)) cntSPSA++;
    else if (/kembalikan ke pemilik|pemilik/i.test(peny)) cntBAST++;
    else if (/serah terima.*instansi|limpah/i.test(peny)) cntLimpah++;
    else if (peny.trim() !== '' && peny !== '-') cntOther++;
  });

  if (stK) stK.textContent = 'Rp ' + totalKerugian.toLocaleString('id-ID');

  let elBdn = document.getElementById('tl_bdn_cnt');
  if (elBdn) elBdn.textContent = String(cntBDN);
  let elSpsa = document.getElementById('tl_spsa_cnt');
  if (elSpsa) elSpsa.textContent = String(cntSPSA);
  let elBast = document.getElementById('tl_bast_cnt');
  if (elBast) elBast.textContent = String(cntBAST);
  let elLimpah = document.getElementById('tl_limpah_cnt');
  if (elLimpah) elLimpah.textContent = String(cntLimpah);
  let elOther = document.getElementById('tl_other_cnt');
  if (elOther) elOther.textContent = String(cntOther);

  if (filteredData.length > 0) {
    let lastRec: any = filteredData[filteredData.length - 1];
    if (valSummary) valSummary.textContent = lastRec.Penyelesaian_Perkara || '-';
    if (valStatusAlur) valStatusAlur.textContent = lastRec.statusAlur || 'DRAFT';
    if (valDisposisi) valDisposisi.textContent = lastRec.disposisiPetugas || '-';
  } else {
    if (valSummary) valSummary.textContent = '-';
    if (valStatusAlur) valStatusAlur.textContent = 'DRAFT / BELUM DIVALIDASI';
    if (valDisposisi) valDisposisi.textContent = '-';
  }
}

export function openValidateModal(): void {
  let modal = document.getElementById('validateModal');
  if (!modal) return;
  
  (document.getElementById('val_input_LP') as HTMLInputElement).value = '';
  (document.getElementById('val_input_SBP') as HTMLInputElement).value = '';
  (document.getElementById('validatedDocFormSection') as HTMLElement).style.display = 'none';
  (document.getElementById('btnSaveValidatedDocs') as HTMLElement).style.display = 'none';

  if (store.activeRecordIndex >= 0 && store.databasePerkara[store.activeRecordIndex]) {
    let rec: any = store.databasePerkara[store.activeRecordIndex];
    (document.getElementById('val_input_LP') as HTMLInputElement).value = rec.NoLP_LP_1 || '';
    (document.getElementById('val_input_SBP') as HTMLInputElement).value = rec.Nomor_SBP || '';
  }

  updateValCodePreviews();
  modal.classList.add('active');
}

export function closeValidateModal(): void {
  let modal = document.getElementById('validateModal');
  if (modal) modal.classList.remove('active');
}

export function performLPValidation(): void {
  let inputLP = (document.getElementById('val_input_LP') as HTMLInputElement)?.value.trim() || '';
  let inputSBP = (document.getElementById('val_input_SBP') as HTMLInputElement)?.value.trim() || '';

  if (!inputLP && !inputSBP) {
    showToast("ISIAN PERKARA KOSONG", "Masukkan setidaknya Nomor LP atau SBP untuk divalidasi.", "warning");
    return;
  }

  let foundIdx = store.databasePerkara.findIndex((rec: any) => {
    let matchLP = inputLP !== "" && rec.NoLP_LP_1 === inputLP;
    let matchSBP = inputSBP !== "" && rec.Nomor_SBP === inputSBP;
    return matchLP || matchSBP;
  });

  if (foundIdx === -1) {
    showToast("DATA TIDAK DITEMUKAN", "Nomor LP / SBP tidak ada dalam Database Perkara.", "danger");
    return;
  }

  store.activeRecordIndex = foundIdx;
  let rec: any = store.databasePerkara[foundIdx];
  loadRecordToCurrentView(rec);

  (document.getElementById('validatedDocFormSection') as HTMLElement).style.display = 'block';
  (document.getElementById('btnSaveValidatedDocs') as HTMLElement).style.display = 'inline-flex';

  (document.getElementById('val_doc_LPP') as HTMLInputElement).value = rec.No_LPP || rec.NoLP_LP_1 || '';
  (document.getElementById('val_tgl_LPP') as HTMLInputElement).value = rec.Tanggal_LPP || rec.Tanggal_LP_LP_1 || '';
  
  (document.getElementById('val_doc_LPF') as HTMLInputElement).value = rec.No_LPF || rec.NoLP_LP_1 || '';
  (document.getElementById('val_tgl_LPF') as HTMLInputElement).value = rec.Tanggal_LPF || rec.Tanggal_LP_LP_1 || '';
  
  (document.getElementById('val_doc_SPLIT') as HTMLInputElement).value = rec.Nomor_SPLIT || '';
  (document.getElementById('val_tgl_SPLIT') as HTMLInputElement).value = rec.Tanggal_SPLIT || rec.Tanggal_LP_LP_1 || '';

  (document.getElementById('val_doc_SPRIN_CACAH') as HTMLInputElement).value = rec.No_SPRIN_CACAH || '';
  (document.getElementById('val_tgl_SPRIN_CACAH') as HTMLInputElement).value = rec.Tanggal_Sprin_Cacah || rec.Tanggal_SBP || '';
  
  (document.getElementById('val_doc_BA') as HTMLInputElement).value = rec.Nomor_BA || '';
  let defaultTglBA = rec.Tanggal_BA || rec.Tanggal_SBP || '';
  (document.getElementById('val_tgl_BA') as HTMLInputElement).value = defaultTglBA;
  
  if (defaultTglBA) {
    autoIsiTeksBA(defaultTglBA);
  } else {
    (document.getElementById('val_hari_BA') as HTMLInputElement).value = (rec.Hari_Cacah || '').toLowerCase();
    (document.getElementById('val_teks_tgl_BA') as HTMLInputElement).value = (rec.TeksTanggal || '').toLowerCase();
  }
  
  (document.getElementById('val_doc_LHP') as HTMLInputElement).value = rec.Nomor_LHP || '';
  (document.getElementById('val_tgl_LHP') as HTMLInputElement).value = rec.Tanggal_LHP || rec.Tanggal_LP_LP_1 || '';

  if (rec.disposisiPetugas) {
    (document.getElementById('val_disposisi_user') as HTMLSelectElement).value = rec.disposisiPetugas;
  }

  let bannerBox = document.getElementById('validatorBannerBox');
  if (bannerBox) bannerBox.style.display = 'flex';

  let statusLabel = document.getElementById('reportActiveStatusLabel');
  if (statusLabel) statusLabel.textContent = `TERVALIDASI: LP-${rec.NoLP_LP_1 || '-'} / SBP-${rec.Nomor_SBP || '-'}`;

  showToast("DATA BERHASIL DIVALIDASI!", "Silakan isi Nomor/Tanggal Dokumen dan Penunjukan Disposisi.", "success");
}

export function saveValidatedDocsData(): void {
  if (store.activeRecordIndex < 0 || !store.databasePerkara[store.activeRecordIndex]) {
    showToast("PERINGATAN", "Belum ada perkara aktif yang divalidasi.", "warning");
    return;
  }

  let rec: any = store.databasePerkara[store.activeRecordIndex];

  rec.No_LPP = (document.getElementById('val_doc_LPP') as HTMLInputElement).value.trim();
  rec.Tanggal_LPP = (document.getElementById('val_tgl_LPP') as HTMLInputElement).value;
  
  rec.No_LPF = (document.getElementById('val_doc_LPF') as HTMLInputElement).value.trim();
  rec.Tanggal_LPF = (document.getElementById('val_tgl_LPF') as HTMLInputElement).value;
  
  rec.Nomor_SPLIT = (document.getElementById('val_doc_SPLIT') as HTMLInputElement).value.trim();
  rec.Tanggal_SPLIT = (document.getElementById('val_tgl_SPLIT') as HTMLInputElement).value;

  rec.No_SPRIN_CACAH = (document.getElementById('val_doc_SPRIN_CACAH') as HTMLInputElement).value.trim();
  rec.Tanggal_Sprin_Cacah = (document.getElementById('val_tgl_SPRIN_CACAH') as HTMLInputElement).value;
  
  rec.Nomor_BA = (document.getElementById('val_doc_BA') as HTMLInputElement).value.trim();
  rec.Tanggal_BA = (document.getElementById('val_tgl_BA') as HTMLInputElement).value;
  rec.Hari_Cacah = (document.getElementById('val_hari_BA') as HTMLInputElement).value.trim().toLowerCase();
  rec.TeksTanggal = (document.getElementById('val_teks_tgl_BA') as HTMLInputElement).value.trim().toLowerCase();
  
  rec.Nomor_LHP = (document.getElementById('val_doc_LHP') as HTMLInputElement).value.trim();
  rec.Tanggal_LHP = (document.getElementById('val_tgl_LHP') as HTMLInputElement).value;

  rec.disposisiPetugas = (document.getElementById('val_disposisi_user') as HTMLSelectElement).value;
  rec.statusAlur = "DIVALIDASI / DISPOSISI";

  store.databasePerkara[store.activeRecordIndex] = rec;
  savePerkaraToStorage();

  loadRecordToCurrentView(rec);
  closeValidateModal();
  renderPerkaraTable();
  updateDashboardStats();
  showToast("DIPERBARUI & DIDISPOSISI", `Perkara LP-${rec.NoLP_LP_1} divalidasi dan didisposisikan ke ${rec.disposisiPetugas}`, "success");
}

export function loadRecordToCurrentView(rec: any): void {
  if (!rec) return;

  const setSafe = (id: string, val: any) => {
    let el = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (el) el.value = (val !== undefined && val !== null) ? String(val) : '';
  };

  setSafe('NoLP_LP_1', rec.NoLP_LP_1);
  setSafe('Tanggal_LP_LP_1', rec.Tanggal_LP_LP_1);
  setSafe('Nomor_SBP', rec.Nomor_SBP);
  setSafe('Tanggal_SBP', rec.Tanggal_SBP);
  setSafe('Jam_Kejadian', rec.Jam_Kejadian);
  setSafe('Hari_SBP', rec.Hari_SBP || '-');
  setSafe('No_SPRIN_Indak', rec.No_SPRIN_Indak);
  setSafe('Tanggal_SPRIN_Indak', rec.Tanggal_SPRIN_Indak);
  setSafe('Asal_Perkara', rec.Asal_Perkara);
  setSafe('Jenis_Penindakan', rec.Jenis_Penindakan);
  setSafe('Jenis_Perkara', rec.Jenis_Perkara);
  setSafe('Status_Penangkapan', rec.Status_Penangkapan);
  setSafe('Jenis_Pelanggaran', rec.Jenis_Pelanggaran);
  setSafe('Pasal_Pelanggaran', rec.Pasal_Pelanggaran);
  
  setSafe('Modus_Operandi', rec.Modus_Operandi);
  let selModus = document.getElementById('Modus_Operandi_Select') as HTMLSelectElement;
  if (selModus && rec.Modus_Operandi) {
    selModus.value = rec.Modus_Operandi;
  }

  setSafe('Kronologis', rec.Kronologis);
  setSafe('Jenis_Pelanggaran_Pasal', rec.Jenis_Pelanggaran_Pasal);
  setSafe('Lokasi_Penindakan', rec.Lokasi_Penindakan);
  setSafe('Nama_Pelaku', rec.Nama_Pelaku);
  setSafe('Umur_Pelaku', rec.Umur_Pelaku || '-');
  setSafe('Jenis_Kelamin_Pelaku', rec.Jenis_Kelamin_Pelaku || '-');
  setSafe('TTL', rec.TTL);

  let rawIdentitas = String(rec.Nomor_Identitas || '');
  if (rawIdentitas.includes(' : ')) {
    let parts = rawIdentitas.split(' : ');
    let jenisIdentitasSelect = document.getElementById('Jenis_Identitas_Select') as HTMLSelectElement;
    if (jenisIdentitasSelect) jenisIdentitasSelect.value = parts[0];
    setSafe('Nomor_Identitas_Input', parts[1]);
  } else {
    let jenisIdentitasSelect = document.getElementById('Jenis_Identitas_Select') as HTMLSelectElement;
    if (jenisIdentitasSelect) jenisIdentitasSelect.value = 'NIK';
    setSafe('Nomor_Identitas_Input', rawIdentitas);
  }
  setSafe('Nomor_Identitas', rawIdentitas);

  setSafe('Pekerjaan', rec.Pekerjaan);
  setSafe('Alamat_Pelaku', rec.Alamat_Pelaku);
  setSafe('Nomor_Telepon', rec.Nomor_Telepon);
  setSafe('Nomor_Rekening', rec.Nomor_Rekening);
  setSafe('Pengulangan_Pelanggaran', rec.Pengulangan_Pelanggaran);
  
  setSafe('Komoditi', rec.Komoditi);
  let selKomoditi = document.getElementById('Komoditi_Select') as HTMLSelectElement;
  if (selKomoditi && rec.Komoditi) {
    selKomoditi.value = rec.Komoditi;
  }

  setSafe('Kerugian_Negara', rec.Kerugian_Negara);

  setSafe('Jumlah_Koli', rec.Jumlah_Koli);
  let jenisVal = String(rec.Jenis_Koli || '');
  let selectKoli = document.getElementById('Jenis_Koli_Select') as HTMLSelectElement;
  let inputKoli = document.getElementById('Jenis_Koli') as HTMLInputElement;
  if (selectKoli && inputKoli) {
    inputKoli.value = jenisVal;
    let matchOpt = Array.from(selectKoli.options).some(opt => opt.value.toLowerCase() === jenisVal.toLowerCase());
    if (matchOpt && jenisVal) {
      selectKoli.value = jenisVal.toLowerCase();
      inputKoli.style.display = 'none';
    } else if (jenisVal && jenisVal !== '-') {
      selectKoli.value = 'LAINNYA';
      inputKoli.style.display = 'block';
    } else {
      selectKoli.value = '-';
      inputKoli.style.display = 'none';
    }
  }

  setSafe('Uraian_Barang', rec.Uraian_Barang);
  setSafe('Merek', rec.Merek);
  setSafe('Tipe', rec.Tipe);
  setSafe('Kondisi', rec.Kondisi);
  setSafe('Spesifikasi_Lain', rec.Spesifikasi_Lain);
  setSafe('Pengangkut', rec.Pengangkut);
  setSafe('No_Kontainer', rec.No_Kontainer);
  setSafe('Ukuran_Kontainer', rec.Ukuran_Kontainer);
  setSafe('Kantor', rec.Kantor);

  let dokPabVal = String(rec.Dokumen_Pemberitahuan || '');
  let jenisDokSelect = document.getElementById('Jenis_Dok_Pemberitahuan_Select') as HTMLSelectElement;
  let nomorDokInput = document.getElementById('Nomor_Dok_Pemberitahuan') as HTMLInputElement;

  if (dokPabVal.toLowerCase().includes('tanpa dokumen') || !dokPabVal || dokPabVal === '-') {
    if (jenisDokSelect) jenisDokSelect.value = 'Tanpa Dokumen';
    if (nomorDokInput) { nomorDokInput.value = ''; nomorDokInput.disabled = true; }
    setSafe('Dokumen_Pemberitahuan', 'Tanpa Dokumen');
  } else {
    if (jenisDokSelect) jenisDokSelect.value = '-';
    if (nomorDokInput) { nomorDokInput.disabled = false; nomorDokInput.value = dokPabVal; }
    setSafe('Dokumen_Pemberitahuan', dokPabVal);
  }

  setSafe('Tanggal_Dokumen_Pemberitahuan', rec.Tanggal_Dokumen_Pemberitahuan);
  setSafe('Penyelesaian_Perkara', rec.Penyelesaian_Perkara);

  let dokPelengkapVal = rec.Dokumen_Pelengkap || '-';
  setSafe('Dokumen_Pelengkap', dokPelengkapVal);
  setSafe('Jenis_Dok_Pelengkap_Manual', rec.Jenis_Dok_Pelengkap_Manual || '');
  setSafe('Nomor_Dok_Pelengkap', rec.Nomor_Dok_Pelengkap || '');
  setSafe('Tanggal_Dok_Pelengkap', rec.Tanggal_Dok_Pelengkap || '');

  let selPelengkap = document.getElementById('Jenis_Dok_Pelengkap_Select') as HTMLSelectElement;
  let manualPelengkap = document.getElementById('Jenis_Dok_Pelengkap_Manual') as HTMLInputElement;
  let noPelengkap = document.getElementById('Nomor_Dok_Pelengkap') as HTMLInputElement;
  let tglPelengkap = document.getElementById('Tanggal_Dok_Pelengkap') as HTMLInputElement;

  if (selPelengkap) {
    selPelengkap.value = rec.Jenis_Dok_Pelengkap_Select || '-';
    
    if (selPelengkap.value === '-') {
      if (manualPelengkap) manualPelengkap.style.display = 'none';
      if (noPelengkap) noPelengkap.disabled = true;
      if (tglPelengkap) tglPelengkap.disabled = true;
    } else if (selPelengkap.value === 'LAINNYA') {
      if (manualPelengkap) manualPelengkap.style.display = 'block';
      if (noPelengkap) noPelengkap.disabled = false;
      if (tglPelengkap) tglPelengkap.disabled = false;
    } else {
      if (manualPelengkap) manualPelengkap.style.display = 'none';
      if (noPelengkap) noPelengkap.disabled = false;
      if (tglPelengkap) tglPelengkap.disabled = false;
    }
  }

  setSafe('No_LPP', rec.No_LPP);
  setSafe('No_LPF', rec.No_LPF);
  setSafe('Nomor_SPLIT', rec.Nomor_SPLIT);
  setSafe('No_SPRIN_CACAH', rec.No_SPRIN_CACAH);
  setSafe('Nomor_BA', rec.Nomor_BA);
  setSafe('Nomor_LHP', rec.Nomor_LHP);

  setSafe('Tanggal_LPP', rec.Tanggal_LPP);
  setSafe('Catatan_LPP', rec.Catatan_LPP);
  setSafe('Detail_Barang_LPP', rec.Detail_Barang_LPP || rec.Uraian_Barang);
  setSafe('Tanggal_LPF', rec.Tanggal_LPF);
  setSafe('Catatan_LPF', rec.Catatan_LPF);
  setSafe('Tanggal_SPLIT', rec.Tanggal_SPLIT);
  setSafe('Dasar_SPLIT', rec.Dasar_SPLIT);
  setSafe('Tanggal_Sprin_Cacah', rec.Tanggal_Sprin_Cacah);
  setSafe('Tanggal_BA', rec.Tanggal_BA);
  setSafe('Hari_Cacah', String(rec.Hari_Cacah || '').toLowerCase());
  setSafe('TeksTanggal', String(rec.TeksTanggal || '').toLowerCase());
  setSafe('Tanggal_LHP', rec.Tanggal_LHP);

  setSafe('form_kabid', rec.kabid);
  setSafe('form_nip_kabid', rec.nip_kabid);
  setSafe('form_gol_kabid', rec.gol_kabid);

  setSafe('form_nama_seksi', rec.nama_seksi);
  setSafe('form_nip_seksi', rec.nip_seksi);
  setSafe('form_jabatan_seksi', rec.jabatan_seksi || 'Kepala Seksi Penyidikan');
  setSafe('form_gol_seksi', rec.gol_seksi);

  setSafe('form_ketua_tim', rec.ketua_tim);
  setSafe('form_nip_ketua_tim', rec.nip_ketua_tim);
  setSafe('form_jabatan_ketua_tim', rec.jabatan_ketua_tim || 'Ketua Tim Peneliti');
  setSafe('form_gol_ketua_tim', rec.gol_ketua_tim);

  setSafe('form_pembuat_lpp', rec.pembuat_lpp);
  setSafe('form_nip_pembuat_lpp', rec.nip_pembuat_lpp);
  setSafe('form_jabatan_pembuat_lpp', rec.jabatan_pembuat_lpp || 'Petugas LPP');
  setSafe('form_gol_pembuat_lpp', rec.gol_pembuat_lpp);

  setSafe('form_petugas_lpf', rec.petugas_lpf);
  setSafe('form_nip_petugas_lpf', rec.nip_petugas_lpf);
  setSafe('form_jabatan_petugas_lpf', rec.jabatan_petugas_lpf || 'Petugas LPF');
  setSafe('form_gol_petugas_lpf', rec.gol_petugas_lpf);

  setSafe('form_indak_1', rec.indak_1);
  setSafe('form_nip_indak_1', rec.nip_indak_1);
  setSafe('form_jabatan_indak_1', rec.jabatan_indak_1 || 'Petugas Penindakan 1');
  setSafe('form_gol_indak_1', rec.gol_gol_indak_1);

  setSafe('form_indak_2', rec.indak_2);
  setSafe('form_nip_indak_2', rec.nip_indak_2);
  setSafe('form_jabatan_indak_2', rec.jabatan_indak_2 || 'Petugas Penindakan 2');
  setSafe('form_gol_indak_2', rec.gol_gol_indak_2);

  setSafe('form_indak_lainnya', rec.indak_lainnya);
  setSafe('form_nip_indak_lainnya', rec.nip_indak_lainnya);
  setSafe('form_jabatan_indak_lainnya', rec.jabatan_indak_lainnya || 'Petugas Penindakan 3');
  setSafe('form_gol_indak_lainnya', rec.gol_gol_indak_lainnya);

  let defaultCatatanLPP = "Laporan penerimaan perkara diterima, segera lanjutkan dengan penelitian formal dan pengumpulan bahan keterangan lebih lanjut.";
  let defaultCatatanLPF = "Setuju dengan usulan tim peneliti, segera tindak lanjuti proses administrasi penanganan perkara sesuai ketentuan yang berlaku.";

  setSafe('Catatan_LPP', (rec.Catatan_LPP && rec.Catatan_LPP !== '-') ? rec.Catatan_LPP : defaultCatatanLPP);
  setSafe('Catatan_LPF', (rec.Catatan_LPF && rec.Catatan_LPF !== '-') ? rec.Catatan_LPF : defaultCatatanLPF);

  refreshReportTableUI();
  updateReportLive();
}

export function renderPerkaraTable(): void {
  let tbody = document.getElementById('perkaraTableBody');
  if (!tbody) return;

  let filtered = getFilteredDataForUser();
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:16px; color:var(--text-muted);">Belum ada data perkara tersimpan.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((rec: any, i: number) => {
    let statusBadge = `<span class="badge-status badge-draft">${escText(rec.statusAlur || 'DRAFT')}</span>`;
    if (rec.statusAlur === 'DIUSULKAN') statusBadge = `<span class="badge-status badge-proposed">DIUSULKAN</span>`;
    if (rec.statusAlur && rec.statusAlur.includes('DIVALIDASI')) statusBadge = `<span class="badge-status badge-ready">DIVALIDASI</span>`;

    let isBooked = rec.No_LPP && rec.No_LPF && rec.Nomor_SPLIT;
    let bookingIndicator = isBooked 
      ? `<span style="font-size:10px; color:#10b981; display:block; font-weight:600;"><i class="fi fi-rr-check"></i> LPP/LPF/SPLIT Ter-booking</span>` 
      : `<span style="font-size:10px; color:#f59e0b; display:block; font-weight:600;">Belum Booking</span>`;

    let actionButtons = `
      <button type="button" class="btn primary" style="padding:2px 6px; font-size:10px;" onclick="editPerkara(${i})">
        <i class="fi fi-rr-edit"></i> Edit
      </button>
      <button type="button" class="btn danger" style="padding:2px 6px; font-size:10px;" onclick="deletePerkara(${i})">
        <i class="fi fi-rr-trash"></i> Hapus
      </button>
    `;

    return `
      <tr>
        <td><b>${i + 1}</b></td>
        <td><b>LP-${escText(rec.NoLP_LP_1 || '-')}</b>${bookingIndicator}</td>
        <td>${escText(rec.Tanggal_LP_LP_1 || '-')}</td>
        <td><b>SBP-${escText(rec.Nomor_SBP || '-')}</b></td>
        <td><b>${escText(rec.Nama_Pelaku || '-')}</b></td>
        <td>${escText(rec.Komoditi || '-')}</td>
        <td>${statusBadge}</td>
        <td>${escText(rec.disposisiPetugas || '-')}</td>
        <td style="text-align:right;">
          <div style="display:flex; gap:4px; justify-content:flex-end; flex-wrap:wrap;">
            ${actionButtons}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

export function addNewPerkaraModal(): void {
  (document.getElementById('modalTitle') as HTMLElement).textContent = "Input Data Perkara";
  (document.getElementById('editingRecordIndex') as HTMLInputElement).value = "-1";

  let inputs = document.querySelectorAll('#perkaraModal input:not([readonly]), #perkaraModal textarea');
  inputs.forEach((el: any) => {
    if (el.type === 'checkbox') el.checked = false;
    else el.value = '';
  });

  let selects = document.querySelectorAll('#perkaraModal select');
  selects.forEach((el: any) => {
    el.selectedIndex = 0;
  });

  let jenisKoliEl = document.getElementById('Jenis_Koli') as HTMLElement;
  if (jenisKoliEl) jenisKoliEl.style.display = 'none';
  let autoKustomEl = document.getElementById('auto_kustom_container') as HTMLElement;
  if (autoKustomEl) autoKustomEl.style.display = 'none';
  let asalPerkaraEl = document.getElementById('Asal_Perkara') as HTMLElement;
  if (asalPerkaraEl) asalPerkaraEl.style.display = 'none';
  let pekerjaanEl = document.getElementById('Pekerjaan') as HTMLElement;
  if (pekerjaanEl) pekerjaanEl.style.display = 'none';
  let ukuranKontainerEl = document.getElementById('Ukuran_Kontainer') as HTMLElement;
  if (ukuranKontainerEl) ukuranKontainerEl.style.display = 'none';
  let jenisDokManualEl = document.getElementById('Jenis_Dok_Pemberitahuan_Manual') as HTMLElement;
  if (jenisDokManualEl) jenisDokManualEl.style.display = 'none';
  let nomorDokInput = document.getElementById('Nomor_Dok_Pemberitahuan') as HTMLInputElement;
  if (nomorDokInput) nomorDokInput.disabled = true;

  let noSprinIndak = document.getElementById('No_SPRIN_Indak') as HTMLInputElement;
  if (noSprinIndak) noSprinIndak.value = '';
  let tglSprinIndak = document.getElementById('Tanggal_SPRIN_Indak') as HTMLInputElement;
  if (tglSprinIndak) tglSprinIndak.value = '';

  let jenisPelengkapSel = document.getElementById('Jenis_Dok_Pelengkap_Select') as HTMLSelectElement;
  if (jenisPelengkapSel) jenisPelengkapSel.value = '-';
  let jenisPelengkapMan = document.getElementById('Jenis_Dok_Pelengkap_Manual') as HTMLInputElement;
  if (jenisPelengkapMan) {
    jenisPelengkapMan.value = '';
    jenisPelengkapMan.style.display = 'none';
  }
  let nomorPelengkap = document.getElementById('Nomor_Dok_Pelengkap') as HTMLInputElement;
  if (nomorPelengkap) {
    nomorPelengkap.value = '';
    nomorPelengkap.disabled = true;
  }
  let tglPelengkap = document.getElementById('Tanggal_Dok_Pelengkap') as HTMLInputElement;
  if (tglPelengkap) {
    tglPelengkap.value = '';
    tglPelengkap.disabled = true;
  }
  let dokPelengkap = document.getElementById('Dokumen_Pelengkap') as HTMLInputElement;
  if (dokPelengkap) dokPelengkap.value = '-';

  let kantorSelect = document.getElementById('Kantor_Select') as HTMLSelectElement;
  let kantorInput = document.getElementById('Kantor') as HTMLInputElement;
  if (kantorSelect && typeof defaultKantorList !== 'undefined' && defaultKantorList.length > 0) {
    kantorSelect.value = defaultKantorList[0];
    if (kantorInput) kantorInput.value = defaultKantorList[0];
  }

  let catLpfEl = document.getElementById('Catatan_LPF') as HTMLTextAreaElement;
  if (catLpfEl && !catLpfEl.value) {
    catLpfEl.value = "Setuju dengan usulan tim peneliti, segera tindak lanjuti proses penyusunan administrasi penanganan perkara sesuai ketentuan yang berlaku.";
  }

  updateLiveCodePreviews();
  let perkaraModal = document.getElementById('perkaraModal');
  if (perkaraModal) perkaraModal.classList.add('active');
}

export function editPerkara(idx: number): void {
  let filtered = getFilteredDataForUser();
  let rec = filtered[idx] || store.databasePerkara[idx];
  if (!rec) return;

  let realIdx = store.databasePerkara.indexOf(rec);
  (document.getElementById('editingRecordIndex') as HTMLInputElement).value = String(realIdx >= 0 ? realIdx : idx);
  (document.getElementById('modalTitle') as HTMLElement).textContent = `Edit Data Perkara LP-${(rec as any).NoLP_LP_1 || ''}`;

  loadRecordToCurrentView(rec);
  updateLiveCodePreviews();
  let perkaraModal = document.getElementById('perkaraModal');
  if (perkaraModal) perkaraModal.classList.add('active');
}

export function deletePerkara(idx: number): void {
  showToastConfirm("KONFIRMASI HAPUS", "Apakah Anda yakin ingin menghapus data perkara ini?", () => {
    store.databasePerkara.splice(idx, 1);
    savePerkaraToStorage();
    renderPerkaraTable();
    updateDashboardStats();
    showToast("TERHAPUS", "Data perkara berhasil dihapus.", "danger");
  });
}

export function closeModal(): void {
  let modal = document.getElementById('perkaraModal');
  if (modal) {
    modal.classList.remove('active');
  }
}

export function confirmAndSubmitPerkara(): void {
  let idx = parseInt((document.getElementById('editingRecordIndex') as HTMLInputElement).value);
  
  if (idx >= 0 && store.databasePerkara[idx] && (store.databasePerkara[idx] as any).No_LPP) {
    executePerkaraSubmission();
    return;
  }

  let modalOverlay = document.getElementById('customConfirmModal');
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'customConfirmModal';
    modalOverlay.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 10000; opacity: 0; transition: opacity 0.3s ease; pointer-events: none;";
    
    modalOverlay.innerHTML = `
      <div style="background: #ffffff; padding: 24px; border-radius: 12px; width: 90%; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); transform: translateY(-20px); transition: transform 0.3s ease;">
        <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #0f172a; font-weight: 600;">Konfirmasi Auto-Booking</h3>
        <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569; line-height: 1.5;">Nomor dokumen awal (LPP, LPF, SPLIT) akan di-booking otomatis untuk perkara ini. Lanjutkan?</p>
        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button type="button" id="cancelConfirmBtn" style="padding: 8px 16px; background: #e2e8f0; color: #334155; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">Batal</button>
          <button type="button" id="okConfirmBtn" style="padding: 8px 16px; background: #0f172a; color: #ffffff; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">Ya, Lanjutkan</button>
        </div>
      </div>
    `;
    document.body.appendChild(modalOverlay);
  }

  modalOverlay.style.pointerEvents = 'auto';
  modalOverlay.style.opacity = '1';
  (modalOverlay.querySelector('div') as HTMLElement).style.transform = 'translateY(0)';

  (document.getElementById('cancelConfirmBtn') as HTMLElement).onclick = function() {
    if (modalOverlay) {
      modalOverlay.style.opacity = '0';
      modalOverlay.style.pointerEvents = 'none';
      (modalOverlay.querySelector('div') as HTMLElement).style.transform = 'translateY(-20px)';
    }
  };

  (document.getElementById('okConfirmBtn') as HTMLElement).onclick = function() {
    if (modalOverlay) {
      modalOverlay.style.opacity = '0';
      modalOverlay.style.pointerEvents = 'none';
      (modalOverlay.querySelector('div') as HTMLElement).style.transform = 'translateY(-20px)';
    }
    executePerkaraSubmission();
  };
}

export function executePerkaraSubmission(): void {
  try {
    let idx = parseInt((document.getElementById('editingRecordIndex') as HTMLInputElement).value);
    let noLpVal = (document.getElementById('NoLP_LP_1') as HTMLInputElement).value.trim() || '1';
    let tglLpVal = (document.getElementById('Tanggal_LP_LP_1') as HTMLInputElement).value;
    let noSbpVal = (document.getElementById('Nomor_SBP') as HTMLInputElement).value.trim() || '';
    let tglSbpVal = (document.getElementById('Tanggal_SBP') as HTMLInputElement).value || tglLpVal;

    let rec: any = {
      NoLP_LP_1: noLpVal,
      Tanggal_LP_LP_1: tglLpVal,
      Nomor_SBP: noSbpVal,
      Tanggal_SBP: tglSbpVal,
      Jam_Kejadian: (document.getElementById('Jam_Kejadian') as HTMLInputElement).value,
      Hari_SBP: (document.getElementById('Hari_SBP') as HTMLInputElement).value,
      No_SPRIN_Indak: (document.getElementById('No_SPRIN_Indak') as HTMLInputElement).value.trim(),
      Tanggal_SPRIN_Indak: (document.getElementById('Tanggal_SPRIN_Indak') as HTMLInputElement).value,
      Asal_Perkara: (document.getElementById('Asal_Perkara') as HTMLInputElement).value.trim(),
      Jenis_Penindakan: (document.getElementById('Jenis_Penindakan') as HTMLInputElement).value.trim(),
      Jenis_Perkara: (document.getElementById('Jenis_Perkara') as HTMLInputElement).value.trim(),
      Status_Penangkapan: (document.getElementById('Status_Penangkapan') as HTMLInputElement).value.trim(),
      Jenis_Pelanggaran: (document.getElementById('Jenis_Pelanggaran') as HTMLInputElement).value.trim(),
      Pasal_Pelanggaran: (document.getElementById('Pasal_Pelanggaran') as HTMLInputElement).value.trim(),
      Modus_Operandi: (document.getElementById('Modus_Operandi') as HTMLInputElement).value.trim(),
      Kronologis: (document.getElementById('Kronologis') as HTMLTextAreaElement).value.trim(),
      Jenis_Pelanggaran_Pasal: (document.getElementById('Jenis_Pelanggaran_Pasal') as HTMLTextAreaElement).value.trim(),
      Lokasi_Penindakan: (document.getElementById('Lokasi_Penindakan') as HTMLInputElement).value.trim(),
      Nama_Pelaku: (document.getElementById('Nama_Pelaku') as HTMLInputElement).value.trim(),
      Umur_Pelaku: (document.getElementById('Umur_Pelaku') as HTMLInputElement).value,
      Jenis_Kelamin_Pelaku: (document.getElementById('Jenis_Kelamin_Pelaku') as HTMLSelectElement).value,
      TTL: (document.getElementById('TTL') as HTMLInputElement).value.trim(),
      Nomor_Identitas: (document.getElementById('Nomor_Identitas') as HTMLInputElement).value.trim(),
      Pekerjaan: (document.getElementById('Pekerjaan') as HTMLInputElement).value.trim(),
      Alamat_Pelaku: (document.getElementById('Alamat_Pelaku') as HTMLTextAreaElement).value.trim(),
      Nomor_Telepon: (document.getElementById('Nomor_Telepon') as HTMLInputElement).value.trim(),
      Nomor_Rekening: (document.getElementById('Nomor_Rekening') as HTMLInputElement).value.trim(),
      Pengulangan_Pelanggaran: (document.getElementById('Pengulangan_Pelanggaran') as HTMLInputElement).value.trim(),
      Komoditi: (document.getElementById('Komoditi') as HTMLInputElement).value.trim(),
      Kerugian_Negara: (document.getElementById('Kerugian_Negara') as HTMLInputElement).value.trim(),
      Uraian_Barang: (document.getElementById('Uraian_Barang') as HTMLTextAreaElement).value.trim(),
      Detail_Barang_LPP: (document.getElementById('Uraian_Barang') as HTMLTextAreaElement).value.trim(),
      Merek: (document.getElementById('Merek') as HTMLInputElement).value.trim(),
      Tipe: (document.getElementById('Tipe') as HTMLInputElement).value.trim(),
      Kondisi: (document.getElementById('Kondisi') as HTMLInputElement).value.trim(),
      Spesifikasi_Lain: (document.getElementById('Spesifikasi_Lain') as HTMLInputElement).value.trim(),
      Jumlah_Koli: (document.getElementById('Jumlah_Koli') as HTMLInputElement).value.trim(),
      Jenis_Koli: (document.getElementById('Jenis_Koli') as HTMLInputElement).value.trim(),
      Pengangkut: (document.getElementById('Pengangkut') as HTMLInputElement).value.trim(),
      No_Kontainer: (document.getElementById('No_Kontainer') as HTMLInputElement).value.trim(),
      Ukuran_Kontainer: (document.getElementById('Ukuran_Kontainer') as HTMLInputElement).value.trim(),
      Kantor: (document.getElementById('Kantor') as HTMLInputElement).value.trim(),
      Dokumen_Pemberitahuan: (document.getElementById('Dokumen_Pemberitahuan') as HTMLInputElement).value.trim(),
      Tanggal_Dokumen_Pemberitahuan: (document.getElementById('Tanggal_Dokumen_Pemberitahuan') as HTMLInputElement).value,
      Dokumen_Pelengkap: (document.getElementById('Dokumen_Pelengkap') as HTMLInputElement).value.trim(),
      Jenis_Dok_Pelengkap_Select: (document.getElementById('Jenis_Dok_Pelengkap_Select') as HTMLSelectElement).value,
      Jenis_Dok_Pelengkap_Manual: (document.getElementById('Jenis_Dok_Pelengkap_Manual') as HTMLInputElement).value.trim(),
      Nomor_Dok_Pelengkap: (document.getElementById('Nomor_Dok_Pelengkap') as HTMLInputElement).value.trim(),
      Tanggal_Dok_Pelengkap: (document.getElementById('Tanggal_Dok_Pelengkap') as HTMLInputElement).value,
      Penyelesaian_Perkara: (document.getElementById('Penyelesaian_Perkara') as HTMLInputElement).value.trim(),

      No_LPP: noLpVal,
      Tanggal_LPP: tglLpVal,
      No_LPF: noLpVal,
      Tanggal_LPF: tglLpVal,
      Nomor_SPLIT: noLpVal,
      Tanggal_SPLIT: tglLpVal,

      No_SPRIN_CACAH: (document.getElementById('No_SPRIN_CACAH') as HTMLInputElement)?.value.trim() || '',
      Tanggal_SPRIN_CACAH: (document.getElementById('Tanggal_SPRIN_CACAH') as HTMLInputElement)?.value || '',
      Nomor_BA: (document.getElementById('Nomor_BA') as HTMLInputElement)?.value.trim() || '',
      Tanggal_BA: (document.getElementById('Tanggal_BA') as HTMLInputElement)?.value || '',
      Nomor_LHP: (document.getElementById('Nomor_LHP') as HTMLInputElement)?.value.trim() || '',
      Tanggal_LHP: (document.getElementById('Tanggal_LHP') as HTMLInputElement)?.value || '',

      kabid: (document.getElementById('form_kabid') as HTMLInputElement).value.trim(),
      nip_kabid: (document.getElementById('form_nip_kabid') as HTMLInputElement).value.trim(),
      gol_kabid: (document.getElementById('form_gol_kabid') as HTMLInputElement).value.trim(),
      nama_seksi: (document.getElementById('form_nama_seksi') as HTMLInputElement).value.trim(),
      nip_seksi: (document.getElementById('form_nip_seksi') as HTMLInputElement).value.trim(),
      jabatan_seksi: (document.getElementById('form_jabatan_seksi') as HTMLInputElement).value.trim(),
      gol_seksi: (document.getElementById('form_gol_seksi') as HTMLInputElement).value.trim(),
      ketua_tim: (document.getElementById('form_ketua_tim') as HTMLInputElement).value.trim(),
      nip_ketua_tim: (document.getElementById('form_nip_ketua_tim') as HTMLInputElement).value.trim(),
      jabatan_ketua_tim: (document.getElementById('form_jabatan_ketua_tim') as HTMLInputElement).value.trim(),
      gol_ketua_tim: (document.getElementById('form_gol_ketua_tim') as HTMLInputElement).value.trim(),
      pembuat_lpp: (document.getElementById('form_pembuat_lpp') as HTMLInputElement).value.trim(),
      nip_pembuat_lpp: (document.getElementById('form_nip_pembuat_lpp') as HTMLInputElement).value.trim(),
      jabatan_pembuat_lpp: (document.getElementById('form_jabatan_pembuat_lpp') as HTMLInputElement).value.trim(),
      gol_pembuat_lpp: (document.getElementById('form_gol_pembuat_lpp') as HTMLInputElement).value.trim(),
      petugas_lpf: (document.getElementById('form_petugas_lpf') as HTMLInputElement).value.trim(),
      nip_petugas_lpf: (document.getElementById('form_nip_petugas_lpf') as HTMLInputElement).value.trim(),
      jabatan_petugas_lpf: (document.getElementById('form_jabatan_petugas_lpf') as HTMLInputElement).value.trim(),
      gol_petugas_lpf: (document.getElementById('form_gol_petugas_lpf') as HTMLInputElement).value.trim(),
      indak_1: (document.getElementById('form_indak_1') as HTMLInputElement).value.trim(),
      nip_indak_1: (document.getElementById('form_nip_indak_1') as HTMLInputElement).value.trim(),
      jabatan_indak_1: (document.getElementById('form_jabatan_indak_1') as HTMLInputElement).value.trim(),
      gol_indak_1: (document.getElementById('form_gol_indak_1') as HTMLInputElement).value.trim(),
      indak_2: (document.getElementById('form_indak_2') as HTMLInputElement).value.trim(),
      nip_indak_2: (document.getElementById('form_nip_indak_2') as HTMLInputElement).value.trim(),
      jabatan_indak_2: (document.getElementById('form_jabatan_indak_2') as HTMLInputElement).value.trim(),
      gol_indak_2: (document.getElementById('form_gol_indak_2') as HTMLInputElement).value.trim(),
      indak_lainnya: (document.getElementById('form_indak_lainnya') as HTMLInputElement).value.trim(),
      nip_indak_lainnya: (document.getElementById('form_nip_indak_lainnya') as HTMLInputElement).value.trim(),
      jabatan_indak_lainnya: (document.getElementById('form_jabatan_indak_lainnya') as HTMLInputElement).value.trim(),
      gol_indak_lainnya: (document.getElementById('form_gol_indak_lainnya') as HTMLInputElement).value.trim(),
      
      statusAlur: "TERHUBUNG / OTOMATIS",
      disposisiPetugas: store.currentUser ? store.currentUser.nama : "Admin"
    };

    if (idx >= 0 && store.databasePerkara[idx]) {
      rec.statusAlur = (store.databasePerkara[idx] as any).statusAlur || "DRAFT";
      rec.disposisiPetugas = (store.databasePerkara[idx] as any).disposisiPetugas || "";
      store.databasePerkara[idx] = rec;
    } else {
      store.databasePerkara.push(rec);
      store.activeRecordIndex = store.databasePerkara.length - 1;
    }

    savePerkaraToStorage();
    closeModal();
    renderPerkaraTable();
    updateDashboardStats();
    showToast("BERHASIL DISIMPAN", "Data perkara & auto-booking dokumen berhasil diproses.", "success");
  } catch (err) {
    console.error("Error saat menyimpan perkara:", err);
    showToast("KESALAHAN SISTEM", "Gagal memproses penyimpanan data form.", "danger");
  }
}

export function submitPerkaraForm(): void {
  confirmAndSubmitPerkara();
}

export function saveData(): void {
  savePerkaraToStorage();
  showToast("DATA TERSIMPAN", "Seluruh data AP3 berhasil dicadangkan.", "success");
}

export function loadData(): void {
  loadPerkaraFromStorage();
  renderKantorDropdown();
  renderCustomKomoditiOptions();
  renderPasalCheckboxes();
}

export function confirmResetAllData(): void {
  showToastConfirm("RESET SEMUA DATA", "Apakah Anda yakin ingin menghapus seluruh database perkara secara permanen?", () => {
    localStorage.removeItem('databasePerkara');
    fetch('/api/perkara/reset', { method: 'DELETE' }).catch(err => console.warn(err));
    store.databasePerkara = [];
    store.activeRecordIndex = -1;
    renderPerkaraTable();
    updateDashboardStats();
    showToast("RESET BERHASIL", "Database berhasil dikosongkan.", "danger");
  });
}

export function exportDataToExcel(): void {
  let data = getFilteredDataForUser();
  if (!data || data.length === 0) {
    showToast("DATA KOSONG", "Tidak ada data perkara untuk diekspor.", "warning");
    return;
  }

  let headers = [
    "No", "No LP", "Tanggal LP", "No SBP", "Tanggal SBP", 
    "Nama Pelaku", "Identitas", "Komoditi", "Uraian Barang", 
    "Kerugian Negara", "Status Workflow", "Disposisi Peneliti"
  ];

  let csvRows = [headers.join(";")];

  data.forEach((rec: any, idx: number) => {
    let row = [
      idx + 1,
      `"LP-${rec.NoLP_LP_1 || '-'}"`,
      `"${rec.Tanggal_LP_LP_1 || '-'}"`,
      `"SBP-${rec.Nomor_SBP || '-'}"`,
      `"${rec.Tanggal_SBP || '-'}"`,
      `"${(rec.Nama_Pelaku || '-').replace(/"/g, '""')}"`,
      `"${(rec.Nomor_Identitas || '-').replace(/"/g, '""')}"`,
      `"${(rec.Komoditi || '-').replace(/"/g, '""')}"`,
      `"${(rec.Uraian_Barang || '-').replace(/"/g, '""')}"`,
      `"${(rec.Kerugian_Negara || 'Rp 0').replace(/"/g, '""')}"`,
      `"${rec.statusAlur || 'DRAFT'}"`,
      `"${(rec.disposisiPetugas || '-').replace(/"/g, '""')}"`
    ];
    csvRows.push(row.join(";"));
  });

  let csvContent = "\uFEFF" + csvRows.join("\r\n");
  let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  let url = URL.createObjectURL(blob);
  
  let link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Data_Perkara_AP3_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast("EKSPOR BERHASIL", "File Excel (.csv) berhasil diunduh.", "success");
}

export function exportDataToPDF(): void {
  let data = getFilteredDataForUser();
  if (!data || data.length === 0) {
    showToast("DATA KOSONG", "Tidak ada data perkara untuk dicetak ke PDF.", "warning");
    return;
  }

  let tableRows = data.map((rec: any, i: number) => `
    <tr>
      <td style="text-align:center; padding:6px; border:1px solid #333;">${i + 1}</td>
      <td style="padding:6px; border:1px solid #333; font-weight:bold;">LP-${escText(rec.NoLP_LP_1 || '-')}</td>
      <td style="padding:6px; border:1px solid #333;">${escText(rec.Tanggal_LP_LP_1 || '-')}</td>
      <td style="padding:6px; border:1px solid #333;">SBP-${escText(rec.Nomor_SBP || '-')}</td>
      <td style="padding:6px; border:1px solid #333;">${escText(rec.Nama_Pelaku || '-')}</td>
      <td style="padding:6px; border:1px solid #333;">${escText(rec.Komoditi || '-')}</td>
      <td style="padding:6px; border:1px solid #333;">${escText(rec.Kerugian_Negara || '-')}</td>
      <td style="padding:6px; border:1px solid #333;">${escText(rec.statusAlur || 'DRAFT')}</td>
      <td style="padding:6px; border:1px solid #333;">${escText(rec.disposisiPetugas || '-')}</td>
    </tr>
  `).join('');

  let printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Laporan Data Perkara AP3</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 10pt; margin: 20px; color: #000; }
        h2 { text-align: center; margin-bottom: 4px; text-transform: uppercase; }
        p { text-align: center; font-size: 9pt; margin-top: 0; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9pt; }
        th { background: #f0f0f0; border: 1px solid #333; padding: 6px; text-align: left; }
      </style>
    </head>
    <body>
      <h2>Daftar Data Perkara AP3</h2>
      <p>Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}</p>
      <table>
        <thead>
          <tr>
            <th style="width:30px; text-align:center;">No</th>
            <th>No. LP</th>
            <th>Tgl LP</th>
            <th>No. SBP</th>
            <th>Nama Pelaku</th>
            <th>Komoditi</th>
            <th>Kerugian Negara</th>
            <th>Status</th>
            <th>Disposisi</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow?.print();
  }, 300);
}