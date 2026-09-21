import { store, savePerkaraToStorage, loadPerkaraFromStorage } from '../state/store.js';
import { defaultPasalClusters, defaultKantorList } from '../config/constants.js';
import { escText, getVal, formatDate, formatDateIndo, formatModusVerb, terbilangHuruf, autoIsiTeksBA } from '../utils/formatters.js';
import { showToast, showToastConfirm } from './ui.js';
import { refreshReportTableUI, updateReportLive } from './editor.js';
export function populateAgeDropdown() {
  let select = document.getElementById('Umur_Pelaku');
  if (!select) return;
  let optionsHtml = `<option value="-">- Pilih Usia -</option>`;
  for (let i = 17; i <= 90; i++) {
    optionsHtml += `<option value="${i}">${i} Tahun</option>`;
  }
  select.innerHTML = optionsHtml;
}
export function updateHariSBP() {
  let tgl = document.getElementById('Tanggal_SBP').value;
  if (tgl) {
    let d = new Date(tgl + 'T12:00:00');
    let days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    document.getElementById('Hari_SBP').value = days[d.getDay()];
  }
}
export function updateLiveCodePreviews() {
  let valLP = document.getElementById('NoLP_LP_1') ? document.getElementById('NoLP_LP_1').value.trim() : '';
  let valSBP = document.getElementById('Nomor_SBP') ? document.getElementById('Nomor_SBP').value.trim() : '';
  let valSPRIN = document.getElementById('No_SPRIN_Indak') ? document.getElementById('No_SPRIN_Indak').value.trim() : '';
  let statusPenangkapan = document.getElementById('Status_Penangkapan_Select') ? document.getElementById('Status_Penangkapan_Select').value : '-';
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
    let sprinPad = valSPRIN !== '' ? valSPRIN.length < 2 ? String(valSPRIN).padStart(2, '0') : valSPRIN : '01';
    previewSPRIN.textContent = valSPRIN !== '' ? `SPRIN-${sprinPad}/KPU.206/2026` : 'SPRIN-/KPU.206/2026';
  }
}
export function updateValCodePreviews() {
  let valLP = document.getElementById('val_input_LP') ? document.getElementById('val_input_LP').value.trim() : '';
  let valSBP = document.getElementById('val_input_SBP') ? document.getElementById('val_input_SBP').value.trim() : '';
  let previewLP = document.getElementById('val_preview_LP');
  let previewSBP = document.getElementById('val_preview_SBP');
  if (previewLP) {
    previewLP.textContent = valLP !== '' ? `LP-${valLP}/KPU.206/2026` : 'LP-/KPU.206/2026';
  }
  if (previewSBP) {
    previewSBP.textContent = valSBP !== '' ? `SBP-${valSBP}/MANDIRI/KPU.2/2026` : 'SBP-/MANDIRI/KPU.2/2026';
  }
}
export function generateKronologisOtomatis() {
  let hari = getVal('Hari_SBP');
  let tglIndo = formatDate('Tanggal_SBP');
  let rawJam = document.getElementById('Jam_Kejadian') ? document.getElementById('Jam_Kejadian').value.trim() : '';
  let jamFormatted = rawJam ? rawJam.replace(':', '.') + ' WIB' : '-';
  let lokasi = getVal('Lokasi_Penindakan');
  let pelaku = getVal('Nama_Pelaku');
  let rawModus = getVal('Modus_Operandi');
  let modusVerb = formatModusVerb(rawModus);
  let kantor = getVal('Kantor') !== '-' ? getVal('Kantor') : 'Kantor Pelayanan Utama Bea dan Cukai Tipe B Batam';
  let cleanModus = modusVerb.replace(/[;:]+$/, '').trim();
  let text = `Pada hari ${hari}, tanggal ${tglIndo} sekira pukul ${jamFormatted} di ${lokasi} telah dilakukan penindakan oleh Petugas ${kantor} terhadap ${pelaku} yang ${cleanModus}`;
  let el = document.getElementById('Kronologis');
  if (el) el.value = text;
}
export function generateKesimpulanOtomatis() {
  let pasal = getVal('Pasal_Pelanggaran');
  let rawModus = getVal('Modus_Operandi');
  let modusVerb = formatModusVerb(rawModus);
  let text = pasal !== '-' || rawModus !== '-' ? `Diduga melanggar ${pasal} karena ${modusVerb}.` : '-';
  let el = document.getElementById('Jenis_Pelanggaran_Pasal');
  if (el) el.value = text;
}
export function handleJenisKoliSelectChange(val) {
  let manualInput = document.getElementById('Jenis_Koli');
  if (!manualInput) return;
  if (val === 'LAINNYA') {
    manualInput.style.display = 'block';
    manualInput.value = '';
    manualInput.focus();
  } else {
    manualInput.style.display = 'none';
    manualInput.value = val === '-' ? '' : val;
  }
  generateUraianBarangOtomatis();
}
export function generateUraianBarangOtomatis() {
  let jml = document.getElementById('Jumlah_Koli') ? document.getElementById('Jumlah_Koli').value.trim() : '';
  let satuan = document.getElementById('Jenis_Koli') ? document.getElementById('Jenis_Koli').value.trim() : '';
  let barang = document.getElementById('auto_barang') ? document.getElementById('auto_barang').value.trim() : '';
  let akhiranTipe = document.getElementById('auto_akhiran_select') ? document.getElementById('auto_akhiran_select').value : '';
  let kustomText = document.getElementById('auto_kustom_text') ? document.getElementById('auto_kustom_text').value.trim() : '';
  let kustomContainer = document.getElementById('auto_kustom_container');
  if (kustomContainer) {
    kustomContainer.style.display = akhiranTipe === 'manual' ? 'block' : 'none';
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
  let uraianTarget = document.getElementById('Uraian_Barang');
  if (uraianTarget) {
    uraianTarget.value = baseText;
  }
}
export function autoGenerateAndAddMasterPasal(modusText) {
  if (!modusText || modusText === '-') return;
  let newPasalList = [];
  if (/cukai|pita cukai|bkc|etiket|nppbkc/i.test(modusText)) {
    if (/penyediaan|penimbunan/i.test(modusText)) {
      newPasalList.push({
        cluster: "UU CUKAI",
        pasal: "Pasal 54 UU NO. 39 TAHUN 2007 TENTANG CUKAI"
      });
      newPasalList.push({
        cluster: "UU CUKAI",
        pasal: "Pasal 56 UU NO. 39 TAHUN 2007 TENTANG CUKAI"
      });
    } else if (/penyerahan/i.test(modusText)) {
      newPasalList.push({
        cluster: "UU CUKAI",
        pasal: "Pasal 54 UU NO. 39 TAHUN 2007 TENTANG CUKAI"
      });
      newPasalList.push({
        cluster: "UU CUKAI",
        pasal: "Pasal 55 UU NO. 39 TAHUN 2007 TENTANG CUKAI"
      });
    } else if (/pengangkutan/i.test(modusText)) {
      newPasalList.push({
        cluster: "UU CUKAI",
        pasal: "Pasal 52 UU NO. 39 TAHUN 2007 TENTANG CUKAI"
      });
      newPasalList.push({
        cluster: "PERATURAN MENTERI KEUANGAN",
        pasal: "PMK NO. 161/PMK.04/2019 TENTANG TATA CARA PENGANGKUT BARANG KENA CUKAI"
      });
    } else {
      newPasalList.push({
        cluster: "UU CUKAI",
        pasal: "Pasal 54 UU NO. 39 TAHUN 2007 TENTANG CUKAI"
      });
    }
  }
  if (/luar daerah pabean|pembongkaran|workshop container|impor sementara/i.test(modusText)) {
    if (/tanpa\/salah pemberitahuan|tidak diberitahukan/i.test(modusText)) {
      newPasalList.push({
        cluster: "UU KEPABEANAN",
        pasal: "Pasal 102 UU NO. 17 TAHUN 2006 TENTANG KEPABEANAN"
      });
    }
    if (/impor sementara/i.test(modusText)) {
      newPasalList.push({
        cluster: "UU KEPABEANAN",
        pasal: "Pasal 108 UU NO. 17 TAHUN 2006 TENTANG KEPABEANAN"
      });
    }
    if (/pembongkaran/i.test(modusText)) {
      newPasalList.push({
        cluster: "UU KEPABEANAN",
        pasal: "Pasal 103 UU NO. 17 TAHUN 2006 TENTANG KEPABEANAN"
      });
    }
  }
  if (/ke luar daerah pabean|outward manifest|ekspor/i.test(modusText)) {
    newPasalList.push({
      cluster: "UU KEPABEANAN",
      pasal: "Pasal 102A UU NO. 17 TAHUN 2006 TENTANG KEPABEANAN"
    });
    if (/outward manifest/i.test(modusText)) {
      newPasalList.push({
        cluster: "UU KEPABEANAN",
        pasal: "Pasal 103 UU NO. 17 TAHUN 2006 TENTANG KEPABEANAN"
      });
    }
  }
  if (/larangan dan pembatasan|perizinan|badan pengusahaan|instansi terkait/i.test(modusText)) {
    newPasalList.push({
      cluster: "UU KEPABEANAN",
      pasal: "Pasal 53 Ayat (4) UU NO. 17 TAHUN 2006 TENTANG KEPABEANAN"
    });
    newPasalList.push({
      cluster: "PERATURAN MENTERI/BADAN LAIN",
      pasal: "Peraturan Menteri Perdagangan Terkait Larangan Dan Pembatasan (Lartas)"
    });
  }
  if (/kawasan perdagangan bebas|pelabuhan bebas|batam|ftz|tempat lain dalam daerah pabean/i.test(modusText)) {
    newPasalList.push({
      cluster: "PERATURAN PEMERINTAH",
      pasal: "Pasal 71 Ayat (1) PP NO. 41 TAHUN 2021 TENTANG KAWASAN BEBAS BATAM"
    });
    newPasalList.push({
      cluster: "PERATURAN MENTERI KEUANGAN",
      pasal: "PMK NO. 34/PMK.04/2021 TENTANG PEMASUKAN DAN PENGELUARAN BARANG FTZ"
    });
  }
  if (/uang kertas asing|uang tunai|bank indonesia|seratus juta/i.test(modusText)) {
    newPasalList.push({
      cluster: "UU INSTANSI LAIN",
      pasal: "UU NO. 7 TAHUN 2011 TENTANG MATA UANG"
    });
    newPasalList.push({
      cluster: "PERATURAN MENTERI KEUANGAN",
      pasal: "PMK NO. 100/PMK.04/2018 TENTANG PEMBAWAAN UANG TUNAI"
    });
    newPasalList.push({
      cluster: "PERATURAN MENTERI/BADAN LAIN",
      pasal: "Peraturan Bank Indonesia NO. 20/2/PBI/2018 TENTANG PEMBAWAAN UKA"
    });
  }
  if (newPasalList.length === 0) return;
  let customMap = JSON.parse(localStorage.getItem('customPasalMap') || '{}');
  let isNewAdded = false;
  newPasalList.forEach(item => {
    if (!customMap[item.cluster]) customMap[item.cluster] = [];
    let defaultList = defaultPasalClusters[item.cluster] || [];
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
    document.querySelectorAll('#pasal_pelanggaran_checkboxes input[type="checkbox"]').forEach(cb => cb.checked = false);
    newPasalList.forEach(item => {
      let cb = document.querySelector(`#pasal_pelanggaran_checkboxes input[value="${item.pasal}"]`);
      if (cb) cb.checked = true;
    });
    syncPasalPelanggaran();
  }, 50);
}
export function toggleAsalPerkaraManual(val) {
  let manualInput = document.getElementById('Asal_Perkara');
  if (val === 'LAINNYA') {
    manualInput.style.display = 'block';
    manualInput.value = '';
  } else {
    manualInput.style.display = 'none';
    manualInput.value = val;
  }
}
export function togglePekerjaanManual(val) {
  let manualInput = document.getElementById('Pekerjaan');
  if (val === 'LAINNYA') {
    manualInput.style.display = 'block';
    manualInput.value = '';
  } else {
    manualInput.style.display = 'none';
    manualInput.value = val;
  }
}
export function toggleUkuranKontainerManual(val) {
  let manualInput = document.getElementById('Ukuran_Kontainer');
  if (val === 'LAINNYA') {
    manualInput.style.display = 'block';
    manualInput.value = '';
  } else {
    manualInput.style.display = 'none';
    manualInput.value = val;
  }
}
export function toggleJenisDokumen(val) {
  let manual = document.getElementById('Jenis_Dok_Pemberitahuan_Manual');
  let nomorInput = document.getElementById('Nomor_Dok_Pemberitahuan');
  if (val === 'Tanpa Dokumen') {
    manual.style.display = 'none';
    manual.value = '';
    if (nomorInput) {
      nomorInput.value = '';
      nomorInput.disabled = true;
    }
    document.getElementById('Dokumen_Pemberitahuan').value = 'Tanpa Dokumen';
  } else {
    if (nomorInput) nomorInput.disabled = false;
    if (val === 'LAINNYA') {
      manual.style.display = 'block';
    } else {
      manual.style.display = 'none';
      manual.value = val === '-' ? '' : val;
    }
    syncDokumenPemberitahuan();
  }
}
export function syncDokumenPemberitahuan() {
  let sel = document.getElementById('Jenis_Dok_Pemberitahuan_Select').value;
  if (sel === 'Tanpa Dokumen') {
    document.getElementById('Dokumen_Pemberitahuan').value = 'Tanpa Dokumen';
    return;
  }
  let jenis = sel === 'LAINNYA' ? document.getElementById('Jenis_Dok_Pemberitahuan_Manual').value : sel === '-' ? '' : sel;
  let nomor = document.getElementById('Nomor_Dok_Pemberitahuan').value;
  let res = [];
  if (jenis.trim()) res.push(jenis.trim());
  if (nomor.trim()) res.push(nomor.trim());
  document.getElementById('Dokumen_Pemberitahuan').value = res.length > 0 ? res.join(' ') : 'Tanpa Dokumen';
}
export function handleJenisDokPelengkapChange(val) {
  let manualInput = document.getElementById('Jenis_Dok_Pelengkap_Manual');
  let noInput = document.getElementById('Nomor_Dok_Pelengkap');
  let tglInput = document.getElementById('Tanggal_Dok_Pelengkap');
  if (val === '-') {
    if (manualInput) {
      manualInput.style.display = 'none';
      manualInput.value = '';
    }
    if (noInput) {
      noInput.value = '';
      noInput.disabled = true;
    }
    if (tglInput) {
      tglInput.value = '';
      tglInput.disabled = true;
    }
    document.getElementById('Dokumen_Pelengkap').value = '-';
  } else {
    if (noInput) noInput.disabled = false;
    if (tglInput) tglInput.disabled = false;
    if (val === 'LAINNYA') {
      if (manualInput) {
        manualInput.style.display = 'block';
        manualInput.value = '';
        manualInput.focus();
      }
    } else {
      if (manualInput) {
        manualInput.style.display = 'none';
        manualInput.value = val;
      }
    }
    syncDokumenPelengkap();
  }
}
export function syncDokumenPelengkap() {
  let sel = document.getElementById('Jenis_Dok_Pelengkap_Select').value;
  if (sel === '-') {
    document.getElementById('Dokumen_Pelengkap').value = '-';
    return;
  }
  let jenis = sel === 'LAINNYA' ? document.getElementById('Jenis_Dok_Pelengkap_Manual').value.trim() : sel;
  let nomor = document.getElementById('Nomor_Dok_Pelengkap').value.trim();
  let tglRaw = document.getElementById('Tanggal_Dok_Pelengkap').value;
  let tglIndo = tglRaw ? formatDateIndo(tglRaw) : '';
  let parts = [];
  if (jenis) parts.push(jenis);
  if (nomor) parts.push(`nomor ${nomor}`);
  if (tglIndo && tglIndo !== '-') parts.push(`tanggal ${tglIndo}`);
  document.getElementById('Dokumen_Pelengkap').value = parts.length > 0 ? parts.join(' ') : '-';
}
export function syncIdentitasValue() {
  let jenis = document.getElementById('Jenis_Identitas_Select').value;
  let nomor = document.getElementById('Nomor_Identitas_Input').value.trim();
  let hidden = document.getElementById('Nomor_Identitas');
  if (nomor) {
    hidden.value = `${jenis} : ${nomor}`;
  } else {
    hidden.value = '';
  }
}
export function syncPenyelesaianPerkara() {
  let checkboxes = document.querySelectorAll('#penyelesaian_checkboxes input[type="checkbox"]:checked');
  let selected = Array.from(checkboxes).map(cb => cb.value);
  let el = document.getElementById('Penyelesaian_Perkara');
  if (el) el.value = selected.length > 0 ? selected.join(', ') : '-';
}
export function syncKondisiBarang() {
  let checkboxes = document.querySelectorAll('#kondisi_checkboxes input[type="checkbox"]:checked');
  let selected = Array.from(checkboxes).map(cb => cb.value);
  let el = document.getElementById('Kondisi');
  if (el) el.value = selected.length > 0 ? selected.join(', ') : '-';
}
export function syncPasalPelanggaran() {
  let checkboxes = document.querySelectorAll('#pasal_pelanggaran_checkboxes input[type="checkbox"]:checked');
  let selected = Array.from(checkboxes).map(cb => cb.value);
  let result = '-';
  let n = selected.length;
  if (n === 1) {
    result = selected[0];
  } else if (n === 2) {
    result = selected[0] + ' dan ' + selected[1];
  } else if (n === 3) {
    result = selected[0] + ', ' + selected[1] + ' dan ' + selected[2];
  } else if (n > 3) {
    result = selected.slice(0, n - 2).join(', ') + ' dan ' + selected[n - 2] + ' serta ' + selected[n - 1];
  }
  let el = document.getElementById('Pasal_Pelanggaran');
  if (el) el.value = result;
  generateKesimpulanOtomatis();
}
export function syncStatusPenangkapan(val) {
  let el = document.getElementById('Status_Penangkapan');
  if (el) el.value = val;
  updateLiveCodePreviews();
  refreshReportTableUI();
  updateReportLive();
}
export function syncJenisPelanggaran(val) {
  let el = document.getElementById('Jenis_Pelanggaran');
  if (el) el.value = val;
}
export function syncJenisPenindakan(val) {
  let el = document.getElementById('Jenis_Penindakan');
  if (el) el.value = val;
}
export function syncJenisPerkara(val) {
  let el = document.getElementById('Jenis_Perkara');
  if (el) el.value = val;
}
export function syncModusOperandi(val) {
  let el = document.getElementById('Modus_Operandi');
  if (el) el.value = val;
}
export function syncKomoditi(val) {
  let el = document.getElementById('Komoditi');
  if (el) el.value = val;
}
export function syncKantor(val) {
  let el = document.getElementById('Kantor');
  if (el) el.value = val;
}
export function addCustomKantor() {
  let input = document.getElementById('setting_newKantor');
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
export function renderPasalCheckboxes() {
  let container = document.getElementById('pasal_pelanggaran_checkboxes');
  if (!container) return;
  let customMap = JSON.parse(localStorage.getItem('customPasalMap') || '{}');
  let html = '';
  Object.keys(defaultPasalClusters).forEach(cluster => {
    html += `<div style="grid-column: span 2; font-weight:bold; color:var(--primary); margin-top:6px; border-bottom:1px solid #334155; display:flex; align-items:center; gap:6px;"><i class="fi fi-rr-bookmark"></i> ${cluster}</div>`;
    let items = [...defaultPasalClusters[cluster], ...(customMap[cluster] || [])];
    items.forEach(p => {
      html += `<label class="checkbox-item"><input type="checkbox" value="${escText(p)}" onchange="syncPasalPelanggaran()"> ${escText(p)}</label>`;
    });
  });
  container.innerHTML = html;
}
export function renderCustomKomoditiOptions() {
  let customKomoditi = JSON.parse(localStorage.getItem('customKomoditiList') || '[]');
  let komoditiGroup = document.getElementById('optgroup_custom_komoditi');
  if (komoditiGroup) {
    komoditiGroup.innerHTML = customKomoditi.map(k => `<option value="${escText(k)}">${escText(k)}</option>`).join('');
  }
}
export function renderKantorDropdown() {
  let customKantor = JSON.parse(localStorage.getItem('customKantorList') || '[]');
  let allKantor = [...defaultKantorList, ...customKantor];
  let select = document.getElementById('Kantor_Select');
  if (select) {
    select.innerHTML = `<option value="-">-</option>` + allKantor.map(k => `<option value="${escText(k)}">${escText(k)}</option>`).join('');
    if (!document.getElementById('Kantor').value) {
      select.value = defaultKantorList[0];
      document.getElementById('Kantor').value = defaultKantorList[0];
    }
  }
  let listDisplay = document.getElementById('setting_kantorListDisplay');
  if (listDisplay) {
    listDisplay.innerHTML = allKantor.map(k => `<li>${escText(k)}</li>`).join('');
  }
}
export function getFilteredDataForUser() {
  if (!store.currentUser) return store.databasePerkara;
  if (store.currentUser.role === 'Admin' || store.currentUser.role === 'Kepala Seksi Penyidikan') {
    return store.databasePerkara;
  } else {
    return store.databasePerkara.filter(rec => rec.disposisiPetugas && rec.disposisiPetugas.toLowerCase() === store.currentUser.nama.toLowerCase());
  }
}
export function updateDashboardStats() {
  let filteredData = getFilteredDataForUser();
  let stLP = document.getElementById('statLP');
  let stK = document.getElementById('statKerugian');
  let valSummary = document.getElementById('valPenyelesaianSummary');
  let valStatusAlur = document.getElementById('valStatusAlurPerkara');
  let valDisposisi = document.getElementById('valPetugasDisposisi');
  if (stLP) stLP.textContent = filteredData.length;
  let totalKerugian = 0;
  let cntBDN = 0;
  let cntSPSA = 0;
  let cntBAST = 0;
  let cntLimpah = 0;
  let cntOther = 0;
  filteredData.forEach(rec => {
    let rawK = String(rec.Kerugian_Negara || '').replace(/[^0-9]/g, '');
    let k = parseFloat(rawK || 0);
    if (!isNaN(k)) totalKerugian += k;
    let peny = rec.Penyelesaian_Perkara || '';
    if (/dikuasai negara|bdn/i.test(peny)) cntBDN++;else if (/spsa|denda/i.test(peny)) cntSPSA++;else if (/kembalikan ke pemilik|pemilik/i.test(peny)) cntBAST++;else if (/serah terima.*instansi|limpah/i.test(peny)) cntLimpah++;else if (peny.trim() !== '' && peny !== '-') cntOther++;
  });
  if (stK) stK.textContent = 'Rp ' + totalKerugian.toLocaleString('id-ID');
  let elBdn = document.getElementById('tl_bdn_cnt');
  if (elBdn) elBdn.textContent = cntBDN;
  let elSpsa = document.getElementById('tl_spsa_cnt');
  if (elSpsa) elSpsa.textContent = cntSPSA;
  let elBast = document.getElementById('tl_bast_cnt');
  if (elBast) elBast.textContent = cntBAST;
  let elLimpah = document.getElementById('tl_limpah_cnt');
  if (elLimpah) elLimpah.textContent = cntLimpah;
  let elOther = document.getElementById('tl_other_cnt');
  if (elOther) elOther.textContent = cntOther;
  if (filteredData.length > 0) {
    let lastRec = filteredData[filteredData.length - 1];
    if (valSummary) valSummary.textContent = lastRec.Penyelesaian_Perkara || '-';
    if (valStatusAlur) valStatusAlur.textContent = lastRec.statusAlur || 'DRAFT';
    if (valDisposisi) valDisposisi.textContent = lastRec.disposisiPetugas || '-';
  } else {
    if (valSummary) valSummary.textContent = '-';
    if (valStatusAlur) valStatusAlur.textContent = 'DRAFT / BELUM DIVALIDASI';
    if (valDisposisi) valDisposisi.textContent = '-';
  }
}
export function openValidateModal() {
  let modal = document.getElementById('validateModal');
  if (!modal) return;
  document.getElementById('val_input_LP').value = '';
  document.getElementById('val_input_SBP').value = '';
  document.getElementById('validatedDocFormSection').style.display = 'none';
  document.getElementById('btnSaveValidatedDocs').style.display = 'none';
  if (store.activeRecordIndex >= 0 && store.databasePerkara[store.activeRecordIndex]) {
    let rec = store.databasePerkara[store.activeRecordIndex];
    document.getElementById('val_input_LP').value = rec.NoLP_LP_1 || '';
    document.getElementById('val_input_SBP').value = rec.Nomor_SBP || '';
  }
  updateValCodePreviews();
  modal.classList.add('active');
}
export function closeValidateModal() {
  let modal = document.getElementById('validateModal');
  if (modal) modal.classList.remove('active');
}
export function performLPValidation() {
  let inputLP = document.getElementById('val_input_LP').value.trim();
  let inputSBP = document.getElementById('val_input_SBP').value.trim();
  if (!inputLP && !inputSBP) {
    showToast("ISIAN PERKARA KOSONG", "Masukkan setidaknya Nomor LP atau SBP untuk divalidasi.", "warning");
    return;
  }
  let foundIdx = store.databasePerkara.findIndex(rec => {
    let matchLP = inputLP !== "" && rec.NoLP_LP_1 === inputLP;
    let matchSBP = inputSBP !== "" && rec.Nomor_SBP === inputSBP;
    return matchLP || matchSBP;
  });
  if (foundIdx === -1) {
    showToast("DATA TIDAK DITEMUKAN", "Nomor LP / SBP tidak ada dalam Database Perkara.", "danger");
    return;
  }
  store.activeRecordIndex = foundIdx;
  let rec = store.databasePerkara[foundIdx];
  loadRecordToCurrentView(rec);
  document.getElementById('validatedDocFormSection').style.display = 'block';
  document.getElementById('btnSaveValidatedDocs').style.display = 'inline-flex';
  document.getElementById('val_doc_LPP').value = rec.No_LPP || rec.NoLP_LP_1 || '';
  document.getElementById('val_tgl_LPP').value = rec.Tanggal_LPP || rec.Tanggal_LP_LP_1 || '';
  document.getElementById('val_doc_LPF').value = rec.No_LPF || rec.NoLP_LP_1 || '';
  document.getElementById('val_tgl_LPF').value = rec.Tanggal_LPF || rec.Tanggal_LP_LP_1 || '';
  document.getElementById('val_doc_SPLIT').value = rec.Nomor_SPLIT || '';
  document.getElementById('val_tgl_SPLIT').value = rec.Tanggal_SPLIT || rec.Tanggal_LP_LP_1 || '';
  document.getElementById('val_doc_SPRIN_CACAH').value = rec.No_SPRIN_CACAH || '';
  document.getElementById('val_tgl_SPRIN_CACAH').value = rec.Tanggal_Sprin_Cacah || rec.Tanggal_SBP || '';
  document.getElementById('val_doc_BA').value = rec.Nomor_BA || '';
  let defaultTglBA = rec.Tanggal_BA || rec.Tanggal_SBP || '';
  document.getElementById('val_tgl_BA').value = defaultTglBA;
  if (defaultTglBA) {
    autoIsiTeksBA(defaultTglBA);
  } else {
    document.getElementById('val_hari_BA').value = (rec.Hari_Cacah || '').toLowerCase();
    document.getElementById('val_teks_tgl_BA').value = (rec.TeksTanggal || '').toLowerCase();
  }
  document.getElementById('val_doc_LHP').value = rec.Nomor_LHP || '';
  document.getElementById('val_tgl_LHP').value = rec.Tanggal_LHP || rec.Tanggal_LP_LP_1 || '';
  if (rec.disposisiPetugas) {
    document.getElementById('val_disposisi_user').value = rec.disposisiPetugas;
  }
  let bannerBox = document.getElementById('validatorBannerBox');
  if (bannerBox) bannerBox.style.display = 'flex';
  let statusLabel = document.getElementById('reportActiveStatusLabel');
  if (statusLabel) statusLabel.textContent = `TERVALIDASI: LP-${rec.NoLP_LP_1 || '-'} / SBP-${rec.Nomor_SBP || '-'}`;
  showToast("DATA BERHASIL DIVALIDASI!", "Silakan isi Nomor/Tanggal Dokumen dan Penunjukan Disposisi.", "success");
}
export function saveValidatedDocsData() {
  if (store.activeRecordIndex < 0 || !store.databasePerkara[store.activeRecordIndex]) {
    showToast("PERINGATAN", "Belum ada perkara aktif yang divalidasi.", "warning");
    return;
  }
  let rec = store.databasePerkara[store.activeRecordIndex];
  rec.No_LPP = document.getElementById('val_doc_LPP').value.trim();
  rec.Tanggal_LPP = document.getElementById('val_tgl_LPP').value;
  rec.No_LPF = document.getElementById('val_doc_LPF').value.trim();
  rec.Tanggal_LPF = document.getElementById('val_tgl_LPF').value;
  rec.Nomor_SPLIT = document.getElementById('val_doc_SPLIT').value.trim();
  rec.Tanggal_SPLIT = document.getElementById('val_tgl_SPLIT').value;
  rec.No_SPRIN_CACAH = document.getElementById('val_doc_SPRIN_CACAH').value.trim();
  rec.Tanggal_Sprin_Cacah = document.getElementById('val_tgl_SPRIN_CACAH').value;
  rec.Nomor_BA = document.getElementById('val_doc_BA').value.trim();
  rec.Tanggal_BA = document.getElementById('val_tgl_BA').value;
  rec.Hari_Cacah = document.getElementById('val_hari_BA').value.trim().toLowerCase();
  rec.TeksTanggal = document.getElementById('val_teks_tgl_BA').value.trim().toLowerCase();
  rec.Nomor_LHP = document.getElementById('val_doc_LHP').value.trim();
  rec.Tanggal_LHP = document.getElementById('val_tgl_LHP').value;
  rec.disposisiPetugas = document.getElementById('val_disposisi_user').value;
  rec.statusAlur = "DIVALIDASI / DISPOSISI";
  store.databasePerkara[store.activeRecordIndex] = rec;
  savePerkaraToStorage();
  loadRecordToCurrentView(rec);
  closeValidateModal();
  renderPerkaraTable();
  updateDashboardStats();
  showToast("DIPERBARUI & DIDISPOSISI", `Perkara LP-${rec.NoLP_LP_1} divalidasi dan didisposisikan ke ${rec.disposisiPetugas}`, "success");
}
export function loadRecordToCurrentView(rec) {
  if (!rec) return;
  const setSafe = (id, val) => {
    let el = document.getElementById(id);
    if (el) el.value = val !== undefined && val !== null ? String(val) : '';
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
  let selModus = document.getElementById('Modus_Operandi_Select');
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
    if (document.getElementById('Jenis_Identitas_Select')) document.getElementById('Jenis_Identitas_Select').value = parts[0];
    setSafe('Nomor_Identitas_Input', parts[1]);
  } else {
    if (document.getElementById('Jenis_Identitas_Select')) document.getElementById('Jenis_Identitas_Select').value = 'NIK';
    setSafe('Nomor_Identitas_Input', rawIdentitas);
  }
  setSafe('Nomor_Identitas', rawIdentitas);
  setSafe('Pekerjaan', rec.Pekerjaan);
  setSafe('Alamat_Pelaku', rec.Alamat_Pelaku);
  setSafe('Nomor_Telepon', rec.Nomor_Telepon);
  setSafe('Nomor_Rekening', rec.Nomor_Rekening);
  setSafe('Pengulangan_Pelanggaran', rec.Pengulangan_Pelanggaran);
  setSafe('Komoditi', rec.Komoditi);
  let selKomoditi = document.getElementById('Komoditi_Select');
  if (selKomoditi && rec.Komoditi) {
    selKomoditi.value = rec.Komoditi;
  }
  setSafe('Kerugian_Negara', rec.Kerugian_Negara);
  setSafe('Jumlah_Koli', rec.Jumlah_Koli);
  let jenisVal = String(rec.Jenis_Koli || '');
  let selectKoli = document.getElementById('Jenis_Koli_Select');
  let inputKoli = document.getElementById('Jenis_Koli');
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
  let jenisDokSelect = document.getElementById('Jenis_Dok_Pemberitahuan_Select');
  let nomorDokInput = document.getElementById('Nomor_Dok_Pemberitahuan');
  if (dokPabVal.toLowerCase().includes('tanpa dokumen') || !dokPabVal || dokPabVal === '-') {
    if (jenisDokSelect) jenisDokSelect.value = 'Tanpa Dokumen';
    if (nomorDokInput) {
      nomorDokInput.value = '';
      nomorDokInput.disabled = true;
    }
    setSafe('Dokumen_Pemberitahuan', 'Tanpa Dokumen');
  } else {
    if (jenisDokSelect) jenisDokSelect.value = '-';
    if (nomorDokInput) {
      nomorDokInput.disabled = false;
      nomorDokInput.value = dokPabVal;
    }
    setSafe('Dokumen_Pemberitahuan', dokPabVal);
  }
  setSafe('Tanggal_Dokumen_Pemberitahuan', rec.Tanggal_Dokumen_Pemberitahuan);
  setSafe('Penyelesaian_Perkara', rec.Penyelesaian_Perkara);
  let dokPelengkapVal = rec.Dokumen_Pelengkap || '-';
  setSafe('Dokumen_Pelengkap', dokPelengkapVal);
  setSafe('Jenis_Dok_Pelengkap_Manual', rec.Jenis_Dok_Pelengkap_Manual || '');
  setSafe('Nomor_Dok_Pelengkap', rec.Nomor_Dok_Pelengkap || '');
  setSafe('Tanggal_Dok_Pelengkap', rec.Tanggal_Dok_Pelengkap || '');
  let selPelengkap = document.getElementById('Jenis_Dok_Pelengkap_Select');
  let manualPelengkap = document.getElementById('Jenis_Dok_Pelengkap_Manual');
  let noPelengkap = document.getElementById('Nomor_Dok_Pelengkap');
  let tglPelengkap = document.getElementById('Tanggal_Dok_Pelengkap');
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
  setSafe('form_gol_indak_1', rec.gol_indak_1);
  setSafe('form_indak_2', rec.indak_2);
  setSafe('form_nip_indak_2', rec.nip_indak_2);
  setSafe('form_jabatan_indak_2', rec.jabatan_indak_2 || 'Petugas Penindakan 2');
  setSafe('form_gol_indak_2', rec.gol_indak_2);
  setSafe('form_indak_lainnya', rec.indak_lainnya);
  setSafe('form_nip_indak_lainnya', rec.nip_indak_lainnya);
  setSafe('form_jabatan_indak_lainnya', rec.jabatan_indak_lainnya || 'Petugas Penindakan 3');
  setSafe('form_gol_indak_lainnya', rec.gol_indak_lainnya);
  let defaultCatatanLPP = "Laporan penerimaan perkara diterima, segera lanjutkan dengan penelitian formal dan pengumpulan bahan keterangan lebih lanjut.";
  let defaultCatatanLPF = "Setuju dengan usulan tim peneliti, segera tindak lanjuti proses administrasi penanganan perkara sesuai ketentuan yang berlaku.";
  setSafe('Catatan_LPP', rec.Catatan_LPP && rec.Catatan_LPP !== '-' ? rec.Catatan_LPP : defaultCatatanLPP);
  setSafe('Catatan_LPF', rec.Catatan_LPF && rec.Catatan_LPF !== '-' ? rec.Catatan_LPF : defaultCatatanLPF);
  refreshReportTableUI();
  updateReportLive();
}
export function renderPerkaraTable() {
  let tbody = document.getElementById('perkaraTableBody');
  if (!tbody) return;
  let filtered = getFilteredDataForUser();
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:16px; color:var(--text-muted);">Belum ada data perkara tersimpan.</td></tr>`;
    return;
  }
  tbody.innerHTML = filtered.map((rec, i) => {
    let statusBadge = `<span class="badge-status badge-draft">${escText(rec.statusAlur || 'DRAFT')}</span>`;
    if (rec.statusAlur === 'DIUSULKAN') statusBadge = `<span class="badge-status badge-proposed">DIUSULKAN</span>`;
    if (rec.statusAlur && rec.statusAlur.includes('DIVALIDASI')) statusBadge = `<span class="badge-status badge-ready">DIVALIDASI</span>`;
    let isBooked = rec.No_LPP && rec.No_LPF && rec.Nomor_SPLIT;
    let bookingIndicator = isBooked ? `<span style="font-size:10px; color:#10b981; display:block; font-weight:600;"><i class="fi fi-rr-check"></i> LPP/LPF/SPLIT Ter-booking</span>` : `<span style="font-size:10px; color:#f59e0b; display:block; font-weight:600;">Belum Booking</span>`;
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
export function addNewPerkaraModal() {
  document.getElementById('modalTitle').textContent = "Input Data Perkara";
  document.getElementById('editingRecordIndex').value = "-1";
  let inputs = document.querySelectorAll('#perkaraModal input:not([readonly]), #perkaraModal textarea');
  inputs.forEach(el => {
    if (el.type === 'checkbox') el.checked = false;else el.value = '';
  });
  let selects = document.querySelectorAll('#perkaraModal select');
  selects.forEach(el => {
    el.selectedIndex = 0;
  });
  if (document.getElementById('Jenis_Koli')) document.getElementById('Jenis_Koli').style.display = 'none';
  if (document.getElementById('auto_kustom_container')) document.getElementById('auto_kustom_container').style.display = 'none';
  if (document.getElementById('Asal_Perkara')) document.getElementById('Asal_Perkara').style.display = 'none';
  if (document.getElementById('Pekerjaan')) document.getElementById('Pekerjaan').style.display = 'none';
  if (document.getElementById('Ukuran_Kontainer')) document.getElementById('Ukuran_Kontainer').style.display = 'none';
  if (document.getElementById('Jenis_Dok_Pemberitahuan_Manual')) document.getElementById('Jenis_Dok_Pemberitahuan_Manual').style.display = 'none';
  if (document.getElementById('Nomor_Dok_Pemberitahuan')) document.getElementById('Nomor_Dok_Pemberitahuan').disabled = true;
  if (document.getElementById('No_SPRIN_Indak')) document.getElementById('No_SPRIN_Indak').value = '';
  if (document.getElementById('Tanggal_SPRIN_Indak')) document.getElementById('Tanggal_SPRIN_Indak').value = '';
  if (document.getElementById('Jenis_Dok_Pelengkap_Select')) document.getElementById('Jenis_Dok_Pelengkap_Select').value = '-';
  if (document.getElementById('Jenis_Dok_Pelengkap_Manual')) {
    document.getElementById('Jenis_Dok_Pelengkap_Manual').value = '';
    document.getElementById('Jenis_Dok_Pelengkap_Manual').style.display = 'none';
  }
  if (document.getElementById('Nomor_Dok_Pelengkap')) {
    document.getElementById('Nomor_Dok_Pelengkap').value = '';
    document.getElementById('Nomor_Dok_Pelengkap').disabled = true;
  }
  if (document.getElementById('Tanggal_Dok_Pelengkap')) {
    document.getElementById('Tanggal_Dok_Pelengkap').value = '';
    document.getElementById('Tanggal_Dok_Pelengkap').disabled = true;
  }
  if (document.getElementById('Dokumen_Pelengkap')) document.getElementById('Dokumen_Pelengkap').value = '-';
  if (document.getElementById('Kantor_Select') && typeof defaultKantorList !== 'undefined' && defaultKantorList.length > 0) {
    document.getElementById('Kantor_Select').value = defaultKantorList[0];
    document.getElementById('Kantor').value = defaultKantorList[0];
  }
  let catLpfEl = document.getElementById('Catatan_LPF');
  if (catLpfEl && !catLpfEl.value) {
    catLpfEl.value = "Setuju dengan usulan tim peneliti, segera tindak lanjuti proses penyusunan administrasi penanganan perkara sesuai ketentuan yang berlaku.";
  }
  updateLiveCodePreviews();
  document.getElementById('perkaraModal').classList.add('active');
}
export function editPerkara(idx) {
  let filtered = getFilteredDataForUser();
  let rec = filtered[idx] || store.databasePerkara[idx];
  if (!rec) return;
  let realIdx = store.databasePerkara.indexOf(rec);
  document.getElementById('editingRecordIndex').value = realIdx >= 0 ? realIdx : idx;
  document.getElementById('modalTitle').textContent = `Edit Data Perkara LP-${rec.NoLP_LP_1 || ''}`;
  loadRecordToCurrentView(rec);
  updateLiveCodePreviews();
  document.getElementById('perkaraModal').classList.add('active');
}
export function deletePerkara(idx) {
  showToastConfirm("KONFIRMASI HAPUS", "Apakah Anda yakin ingin menghapus data perkara ini?", () => {
    store.databasePerkara.splice(idx, 1);
    savePerkaraToStorage();
    renderPerkaraTable();
    updateDashboardStats();
    showToast("TERHAPUS", "Data perkara berhasil dihapus.", "danger");
  });
}
export function closeModal() {
  let modal = document.getElementById('perkaraModal');
  if (modal) {
    modal.classList.remove('active');
  }
}
export function confirmAndSubmitPerkara() {
  let idx = parseInt(document.getElementById('editingRecordIndex').value);
  if (idx >= 0 && store.databasePerkara[idx] && store.databasePerkara[idx].No_LPP) {
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
  modalOverlay.querySelector('div').style.transform = 'translateY(0)';
  document.getElementById('cancelConfirmBtn').onclick = function () {
    modalOverlay.style.opacity = '0';
    modalOverlay.style.pointerEvents = 'none';
    modalOverlay.querySelector('div').style.transform = 'translateY(-20px)';
  };
  document.getElementById('okConfirmBtn').onclick = function () {
    modalOverlay.style.opacity = '0';
    modalOverlay.style.pointerEvents = 'none';
    modalOverlay.querySelector('div').style.transform = 'translateY(-20px)';
    executePerkaraSubmission();
  };
}
export function executePerkaraSubmission() {
  try {
    let idx = parseInt(document.getElementById('editingRecordIndex').value);
    let noLpVal = document.getElementById('NoLP_LP_1').value.trim() || '1';
    let tglLpVal = document.getElementById('Tanggal_LP_LP_1').value;
    let noSbpVal = document.getElementById('Nomor_SBP').value.trim() || '';
    let tglSbpVal = document.getElementById('Tanggal_SBP').value || tglLpVal;
    let rec = {
      NoLP_LP_1: noLpVal,
      Tanggal_LP_LP_1: tglLpVal,
      Nomor_SBP: noSbpVal,
      Tanggal_SBP: tglSbpVal,
      Jam_Kejadian: document.getElementById('Jam_Kejadian').value,
      Hari_SBP: document.getElementById('Hari_SBP').value,
      No_SPRIN_Indak: document.getElementById('No_SPRIN_Indak').value.trim(),
      Tanggal_SPRIN_Indak: document.getElementById('Tanggal_SPRIN_Indak').value,
      Asal_Perkara: document.getElementById('Asal_Perkara').value.trim(),
      Jenis_Penindakan: document.getElementById('Jenis_Penindakan').value.trim(),
      Jenis_Perkara: document.getElementById('Jenis_Perkara').value.trim(),
      Status_Penangkapan: document.getElementById('Status_Penangkapan').value.trim(),
      Jenis_Pelanggaran: document.getElementById('Jenis_Pelanggaran').value.trim(),
      Pasal_Pelanggaran: document.getElementById('Pasal_Pelanggaran').value.trim(),
      Modus_Operandi: document.getElementById('Modus_Operandi').value.trim(),
      Kronologis: document.getElementById('Kronologis').value.trim(),
      Jenis_Pelanggaran_Pasal: document.getElementById('Jenis_Pelanggaran_Pasal').value.trim(),
      Lokasi_Penindakan: document.getElementById('Lokasi_Penindakan').value.trim(),
      Nama_Pelaku: document.getElementById('Nama_Pelaku').value.trim(),
      Umur_Pelaku: document.getElementById('Umur_Pelaku').value,
      Jenis_Kelamin_Pelaku: document.getElementById('Jenis_Kelamin_Pelaku').value,
      TTL: document.getElementById('TTL').value.trim(),
      Nomor_Identitas: document.getElementById('Nomor_Identitas').value.trim(),
      Pekerjaan: document.getElementById('Pekerjaan').value.trim(),
      Alamat_Pelaku: document.getElementById('Alamat_Pelaku').value.trim(),
      Nomor_Telepon: document.getElementById('Nomor_Telepon').value.trim(),
      Nomor_Rekening: document.getElementById('Nomor_Rekening').value.trim(),
      Pengulangan_Pelanggaran: document.getElementById('Pengulangan_Pelanggaran').value.trim(),
      Komoditi: document.getElementById('Komoditi').value.trim(),
      Kerugian_Negara: document.getElementById('Kerugian_Negara').value.trim(),
      Uraian_Barang: document.getElementById('Uraian_Barang').value.trim(),
      Detail_Barang_LPP: document.getElementById('Uraian_Barang').value.trim(),
      Merek: document.getElementById('Merek').value.trim(),
      Tipe: document.getElementById('Tipe').value.trim(),
      Kondisi: document.getElementById('Kondisi').value.trim(),
      Spesifikasi_Lain: document.getElementById('Spesifikasi_Lain').value.trim(),
      Jumlah_Koli: document.getElementById('Jumlah_Koli').value.trim(),
      Jenis_Koli: document.getElementById('Jenis_Koli').value.trim(),
      Pengangkut: document.getElementById('Pengangkut').value.trim(),
      No_Kontainer: document.getElementById('No_Kontainer').value.trim(),
      Ukuran_Kontainer: document.getElementById('Ukuran_Kontainer').value.trim(),
      Kantor: document.getElementById('Kantor').value.trim(),
      Dokumen_Pemberitahuan: document.getElementById('Dokumen_Pemberitahuan').value.trim(),
      Tanggal_Dokumen_Pemberitahuan: document.getElementById('Tanggal_Dokumen_Pemberitahuan').value,
      Dokumen_Pelengkap: document.getElementById('Dokumen_Pelengkap').value.trim(),
      Jenis_Dok_Pelengkap_Select: document.getElementById('Jenis_Dok_Pelengkap_Select').value,
      Jenis_Dok_Pelengkap_Manual: document.getElementById('Jenis_Dok_Pelengkap_Manual').value.trim(),
      Nomor_Dok_Pelengkap: document.getElementById('Nomor_Dok_Pelengkap').value.trim(),
      Tanggal_Dok_Pelengkap: document.getElementById('Tanggal_Dok_Pelengkap').value,
      Penyelesaian_Perkara: document.getElementById('Penyelesaian_Perkara').value.trim(),
      No_LPP: noLpVal,
      Tanggal_LPP: tglLpVal,
      No_LPF: noLpVal,
      Tanggal_LPF: tglLpVal,
      Nomor_SPLIT: noLpVal,
      Tanggal_SPLIT: tglLpVal,
      No_SPRIN_CACAH: document.getElementById('No_SPRIN_CACAH') ? document.getElementById('No_SPRIN_CACAH').value.trim() : '',
      Tanggal_SPRIN_CACAH: document.getElementById('Tanggal_SPRIN_CACAH') ? document.getElementById('Tanggal_SPRIN_CACAH').value : '',
      Nomor_BA: document.getElementById('Nomor_BA') ? document.getElementById('Nomor_BA').value.trim() : '',
      Tanggal_BA: document.getElementById('Tanggal_BA') ? document.getElementById('Tanggal_BA').value : '',
      Nomor_LHP: document.getElementById('Nomor_LHP') ? document.getElementById('Nomor_LHP').value.trim() : '',
      Tanggal_LHP: document.getElementById('Tanggal_LHP') ? document.getElementById('Tanggal_LHP').value : '',
      kabid: document.getElementById('form_kabid').value.trim(),
      nip_kabid: document.getElementById('form_nip_kabid').value.trim(),
      gol_kabid: document.getElementById('form_gol_kabid').value.trim(),
      nama_seksi: document.getElementById('form_nama_seksi').value.trim(),
      nip_seksi: document.getElementById('form_nip_seksi').value.trim(),
      jabatan_seksi: document.getElementById('form_jabatan_seksi').value.trim(),
      gol_seksi: document.getElementById('form_gol_seksi').value.trim(),
      ketua_tim: document.getElementById('form_ketua_tim').value.trim(),
      nip_ketua_tim: document.getElementById('form_nip_ketua_tim').value.trim(),
      jabatan_ketua_tim: document.getElementById('form_jabatan_ketua_tim').value.trim(),
      gol_ketua_tim: document.getElementById('form_gol_ketua_tim').value.trim(),
      pembuat_lpp: document.getElementById('form_pembuat_lpp').value.trim(),
      nip_pembuat_lpp: document.getElementById('form_nip_pembuat_lpp').value.trim(),
      jabatan_pembuat_lpp: document.getElementById('form_jabatan_pembuat_lpp').value.trim(),
      gol_pembuat_lpp: document.getElementById('form_gol_pembuat_lpp').value.trim(),
      petugas_lpf: document.getElementById('form_petugas_lpf').value.trim(),
      nip_petugas_lpf: document.getElementById('form_nip_petugas_lpf').value.trim(),
      jabatan_petugas_lpf: document.getElementById('form_jabatan_petugas_lpf').value.trim(),
      gol_petugas_lpf: document.getElementById('form_gol_petugas_lpf').value.trim(),
      indak_1: document.getElementById('form_indak_1').value.trim(),
      nip_indak_1: document.getElementById('form_nip_indak_1').value.trim(),
      jabatan_indak_1: document.getElementById('form_jabatan_indak_1').value.trim(),
      gol_indak_1: document.getElementById('form_gol_indak_1').value.trim(),
      indak_2: document.getElementById('form_indak_2').value.trim(),
      nip_indak_2: document.getElementById('form_nip_indak_2').value.trim(),
      jabatan_indak_2: document.getElementById('form_jabatan_indak_2').value.trim(),
      gol_indak_2: document.getElementById('form_gol_indak_2').value.trim(),
      indak_lainnya: document.getElementById('form_indak_lainnya').value.trim(),
      nip_indak_lainnya: document.getElementById('form_nip_indak_lainnya').value.trim(),
      jabatan_indak_lainnya: document.getElementById('form_jabatan_indak_lainnya').value.trim(),
      gol_indak_lainnya: document.getElementById('form_gol_indak_lainnya').value.trim(),
      statusAlur: "TERHUBUNG / OTOMATIS",
      disposisiPetugas: store.currentUser ? store.currentUser.nama : "Admin"
    };
    if (idx >= 0 && store.databasePerkara[idx]) {
      rec.statusAlur = store.databasePerkara[idx].statusAlur || "DRAFT";
      rec.disposisiPetugas = store.databasePerkara[idx].disposisiPetugas || "";
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
export function submitPerkaraForm() {
  confirmAndSubmitPerkara();
}
export function saveData() {
  savePerkaraToStorage();
  showToast("DATA TERSIMPAN", "Seluruh data AP3 berhasil dicadangkan.", "success");
}
export function loadData() {
  loadPerkaraFromStorage();
  renderKantorDropdown();
  renderCustomKomoditiOptions();
  renderPasalCheckboxes();
}
export function confirmResetAllData() {
  showToastConfirm("RESET SEMUA DATA", "Apakah Anda yakin ingin menghapus seluruh database perkara secara permanen?", () => {
    localStorage.removeItem('databasePerkara');
    fetch('/api/perkara/reset', {
      method: 'DELETE'
    }).catch(err => console.warn(err));
    store.databasePerkara = [];
    store.activeRecordIndex = -1;
    renderPerkaraTable();
    updateDashboardStats();
    showToast("RESET BERHASIL", "Database berhasil dikosongkan.", "danger");
  });
}
export function exportDataToExcel() {
  let data = getFilteredDataForUser();
  if (!data || data.length === 0) {
    showToast("DATA KOSONG", "Tidak ada data perkara untuk diekspor.", "warning");
    return;
  }
  let headers = ["No", "No LP", "Tanggal LP", "No SBP", "Tanggal SBP", "Nama Pelaku", "Identitas", "Komoditi", "Uraian Barang", "Kerugian Negara", "Status Workflow", "Disposisi Peneliti"];
  let csvRows = [headers.join(";")];
  data.forEach((rec, idx) => {
    let row = [idx + 1, `"LP-${rec.NoLP_LP_1 || '-'}"`, `"${rec.Tanggal_LP_LP_1 || '-'}"`, `"SBP-${rec.Nomor_SBP || '-'}"`, `"${rec.Tanggal_SBP || '-'}"`, `"${(rec.Nama_Pelaku || '-').replace(/"/g, '""')}"`, `"${(rec.Nomor_Identitas || '-').replace(/"/g, '""')}"`, `"${(rec.Komoditi || '-').replace(/"/g, '""')}"`, `"${(rec.Uraian_Barang || '-').replace(/"/g, '""')}"`, `"${(rec.Kerugian_Negara || 'Rp 0').replace(/"/g, '""')}"`, `"${rec.statusAlur || 'DRAFT'}"`, `"${(rec.disposisiPetugas || '-').replace(/"/g, '""')}"`];
    csvRows.push(row.join(";"));
  });
  let csvContent = "\uFEFF" + csvRows.join("\r\n");
  let blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;"
  });
  let url = URL.createObjectURL(blob);
  let link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Data_Perkara_AP3_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("EKSPOR BERHASIL", "File Excel (.csv) berhasil diunduh.", "success");
}
export function exportDataToPDF() {
  let data = getFilteredDataForUser();
  if (!data || data.length === 0) {
    showToast("DATA KOSONG", "Tidak ada data perkara untuk dicetak ke PDF.", "warning");
    return;
  }
  let tableRows = data.map((rec, i) => `
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
    printWindow.print();
  }, 300);
}