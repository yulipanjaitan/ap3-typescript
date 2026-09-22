declare global {
  interface Window {
    showReportView?: (docType?: string) => void;
    showTLReportView?: (docType?: string) => void;
    saveData?: () => void;
    loadRecordToCurrentView?: (record: any) => void;
    renderDynamicInputs?: (type: string) => void;
    renderTLFormSection?: (docType: string) => void;
    refreshReportTableUI?: () => void;
    updateReportLive?: () => void;
    refreshTLTableUI?: () => void;
  }
}

import { store, savePerkaraToStorage } from '../state/store.js';
import { escText } from '../utils/formatters.js';

export function showToast(title: string, desc: string, type: string = "success"): void {
  let container = document.getElementById('toastContainer');
  if (!container) return;

  let toast = document.createElement('div');
  toast.className = `toast ${type}`;
  let icon = type === 'success' ? '<i class="fi fi-rr-check"></i>' : (type === 'warning' ? '<i class="fi fi-rr-exclamation"></i>' : '<i class="fi fi-rr-cross"></i>');

  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-body">
      <div class="toast-title">${escText(title)}</div>
      <div class="toast-desc">${escText(desc)}</div>
    </div>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

export function showToastConfirm(title: string, desc: string, onConfirm: () => void): void {
  let container = document.getElementById('toastContainer');
  if (!container) return;

  let toast = document.createElement('div');
  toast.className = `toast warning`;
  toast.innerHTML = `
    <div class="toast-icon"><i class="fi fi-rr-exclamation"></i></div>
    <div class="toast-body">
      <div class="toast-title">${escText(title)}</div>
      <div class="toast-desc">${escText(desc)}</div>
      <div class="toast-actions">
        <button type="button" class="btn primary" id="toastYesBtn" style="padding:2px 8px; font-size:10px;">Ya</button>
        <button type="button" class="btn secondary" id="toastNoBtn" style="padding:2px 8px; font-size:10px;">Batal</button>
      </div>
    </div>
  `;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);

  let yesBtn = toast.querySelector('#toastYesBtn');
  let noBtn = toast.querySelector('#toastNoBtn');

  if (yesBtn) {
    yesBtn.addEventListener('click', () => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
      onConfirm();
    });
  }

  if (noBtn) {
    noBtn.addEventListener('click', () => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    });
  }
}

export function autoPaginateReports(containerId: string = 'reports'): void {
  let container = document.getElementById(containerId);
  if (!container) return;

  let reportCards = Array.from(container.querySelectorAll('.report')) as HTMLElement[];

  reportCards.forEach((reportEl) => {
    if (reportEl.classList.contains('landscape') || reportEl.dataset.paginated === "true") return;

    let reportText = reportEl.innerText || '';
    if (reportText.includes('SURAT PERINTAH PENELITIAN (SPLIT)') ||  
        reportText.includes('SURAT PERINTAH PENCACAHAN') ||
        reportText.includes('BERITA ACARA SERAH TERIMA BARANG BUKTI') ||
        reportText.includes('BERITA ACARA PEMBUKAAN SEGEL') ||
        reportText.includes('SURAT PENETAPAN SANKSI ADMINISTRASI') ||
        reportText.includes('BERITA ACARA SERAH TERIMA')) {
      return;
    }

    if (reportEl.scrollHeight > 1250) {
      reportEl.dataset.paginated = "true";

      let page2 = document.createElement('div');
      page2.className = reportEl.className;
      page2.dataset.paginated = "true";
      page2.innerHTML = '';

      let children = Array.from(reportEl.children) as HTMLElement[];
      let moving = false;
      let currentHeight = 0;

      children.forEach((child) => {
        if (child.classList.contains('office-left') || child.classList.contains('title-center') || child.classList.contains('nomor-center')) {
          currentHeight += child.offsetHeight;
          return;
        }

        if (child.tagName === 'TABLE' && !moving) {
          let tablePage1 = child as HTMLTableElement;
          let rows = Array.from(tablePage1.querySelectorAll('tr'));
          
          let firstRowCells = tablePage1.querySelectorAll('tr:first-child > td, tr:first-child > th');
          let colWidths = Array.from(firstRowCells).map(td => (td as HTMLElement).style.width || td.getAttribute('width') || '');

          let tablePage2 = tablePage1.cloneNode(false) as HTMLTableElement;
          tablePage2.style.tableLayout = 'fixed';
          let tbodyPage2 = document.createElement('tbody');
          tablePage2.appendChild(tbodyPage2);

          let tableMoving = false;

          rows.forEach((row) => {
            let rowH = (row as HTMLElement).offsetHeight || 24;
            if (currentHeight + rowH > 1150 || tableMoving) {
              tableMoving = true;
              moving = true;

              if (tbodyPage2.children.length === 0 && colWidths.length > 0) {
                let cells = row.children;
                for (let i = 0; i < cells.length; i++) {
                  if (colWidths[i]) (cells[i] as HTMLElement).style.width = colWidths[i];
                }
              }

              tbodyPage2.appendChild(row);
            } else {
              currentHeight += rowH;
            }
          });

          if (tableMoving && tbodyPage2.children.length > 0) {
            page2.appendChild(tablePage2);
          }
          return;
        }

        currentHeight += child.offsetHeight;

        if (currentHeight > 1150 || moving) {
          moving = true;
          page2.appendChild(child);
        }
      });

      let pageBreak = document.createElement('div');
      pageBreak.className = 'pagebreak';

      if (reportEl.parentNode) {
        reportEl.parentNode.insertBefore(pageBreak, reportEl.nextSibling);
        reportEl.parentNode.insertBefore(page2, pageBreak.nextSibling);
      }
    }
  });
}

export function renderPageSelector(totalDocs: number, containerId: string = 'pageSelectorContainer', reportContainerId: string = 'reports'): void {
  let container = document.getElementById(containerId);
  if (!container) return;

  if (totalDocs <= 1) {
    container.style.display = 'none';
    container.innerHTML = '';
    return;
  }

  container.style.display = 'inline-flex';
  container.style.alignItems = 'center';
  container.style.gap = '6px';

  let prevDisabled = ((store as any).currentActivePageIdx === 0) ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : '';
  let nextDisabled = ((store as any).currentActivePageIdx === totalDocs - 1) ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : '';

  container.innerHTML = `
    <button type="button" class="page-nav-btn" ${prevDisabled} onclick="navigatePreviewPage(${(store as any).currentActivePageIdx - 1}, '${reportContainerId}')">
      <i class="fi fi-rr-angle-left"></i> Prev
    </button>

    <span style="font-size:11px; font-weight:700; color:var(--primary); padding:0 4px;">
      Hal ${(store as any).currentActivePageIdx + 1} / ${totalDocs}
    </span>

    <button type="button" class="page-nav-btn" ${nextDisabled} onclick="navigatePreviewPage(${(store as any).currentActivePageIdx + 1}, '${reportContainerId}')">
      Next <i class="fi fi-rr-angle-right"></i>
    </button>
  `;
}

export function selectPreviewPage(pageIndex: number | 'ALL', reportContainerId: string = 'reports', clickedBtn: HTMLElement | null = null): void {
  (store as any).selectedViewPage = pageIndex;
  
  let reportsEl = document.getElementById(reportContainerId);
  if (!reportsEl) return;

  let reportCards = reportsEl.querySelectorAll('.report') as NodeListOf<HTMLElement>;
  let pageBreaks = reportsEl.querySelectorAll('.pagebreak') as NodeListOf<HTMLElement>;

  if (clickedBtn && clickedBtn.parentNode) {
    clickedBtn.parentNode.querySelectorAll('.page-nav-btn').forEach(btn => btn.classList.remove('active'));
    clickedBtn.classList.add('active');
  }

  reportCards.forEach((card, idx) => {
    if (pageIndex === 'ALL' || (typeof pageIndex === 'number' && (pageIndex - 1) === idx)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });

  pageBreaks.forEach(pb => {
    pb.style.display = (pageIndex === 'ALL') ? 'block' : 'none';
  });
}

export function applyPageNumbers(containerId: string = 'reports'): void {
  let container = document.getElementById(containerId);
  if (!container) return;

  container.querySelectorAll('.page-number-footer').forEach(el => el.remove());

  let reportCards = container.querySelectorAll('.report');
  reportCards.forEach((card, index) => {
    let footerEl = document.createElement('div');
    footerEl.className = 'page-number-footer';
    footerEl.innerText = (index + 1).toString();
    card.appendChild(footerEl);
  });
}

export function navigatePreviewPage(pageIndex: number, reportContainerId: string = 'reports'): void {
  let reportsEl = document.getElementById(reportContainerId);
  if (!reportsEl) return;

  let reportCards = Array.from(reportsEl.querySelectorAll('.report')) as HTMLElement[];
  let total = reportCards.length;
  if (total === 0) return;

  if (pageIndex < 0) pageIndex = 0;
  if (pageIndex >= total) pageIndex = total - 1;

  (store as any).currentActivePageIdx = pageIndex;

  reportCards.forEach((card, idx) => {
    card.style.display = (idx === pageIndex) ? 'block' : 'none';
  });

  let containerId = (reportContainerId === 'reports') ? 'pageSelectorContainer' : 'tlPageSelectorContainer';
  renderPageSelector(total, containerId, reportContainerId);
}

export function updatePreviewHeaderUI(docType?: string): void {
  let rawType = (docType || (store as any).currentDoc || 'LPP').toString().toUpperCase().trim();
  (store as any).currentDoc = rawType;

  const docMeta: Record<string, { title: string; icon: string }> = {
    'ALL': { title: 'SEMUA DOKUMEN LAPORAN', icon: 'fi-rr-documents' },
    'LPP': { title: 'LEMBAR PENELITIAN PERKARA (LPP)', icon: 'fi-rr-document' },
    'LPF': { title: 'LEMBAR PENELITIAN FORMAL (LPF)', icon: 'fi-rr-document-signed' },
    'SPLIT': { title: 'SURAT PERINTAH PENELITIAN (SPLIT)', icon: 'fi-rr-users-alt' },
    'SPRIN_CACAH': { title: 'SURAT PERINTAH PENCACAHAN', icon: 'fi-rr-shield-check' },
    'SPRIN': { title: 'SURAT PERINTAH PENCACAHAN', icon: 'fi-rr-shield-check' },
    'BA': { title: 'BERITA ACARA PENCACAHAN (BA CACAH)', icon: 'fi-rr-box-open' },
    'BA_CACAH': { title: 'BERITA ACARA PENCACAHAN (BA CACAH)', icon: 'fi-rr-box-open' },
    'LHP': { title: 'LAPORAN HASIL PENELITIAN (LHP)', icon: 'fi-rr-diploma' }
  };

  let titleEl = document.getElementById('previewHeaderText');
  let iconEl = document.getElementById('previewHeaderIcon');
  let meta = docMeta[rawType] || { title: `DOKUMEN ${rawType}`, icon: 'fi-rr-document' };

  if (titleEl) titleEl.textContent = `PRATINJAU DOKUMEN: ${meta.title}`;
  if (iconEl) iconEl.className = `fi ${meta.icon}`;
}

export function updateTLPreviewHeaderUI(docType?: string): void {
  let rawType = (docType || (store as any).currentTLDoc || 'BAST_PEMILIK').toString().toUpperCase().trim();
  (store as any).currentTLDoc = rawType;

  const tlDocMeta: Record<string, { title: string; icon: string }> = {
    'ALL': { title: 'SEMUA DOKUMEN TINDAK LANJUT', icon: 'fi-rr-documents' },
    'BAST_PEMILIK': { title: 'BAST KE PEMILIK / KUASA', icon: 'fi-rr-user-check' },
    'BA_SEGEL': { title: 'BERITA ACARA BUKA SEGEL', icon: 'fi-rr-unlock' },
    'KEP_BDN': { title: 'KEPUTUSAN BPP / BDN', icon: 'fi-rr-diploma' },
    'SPSA': { title: 'SURAT PERINTAH SPSA', icon: 'fi-rr-shield-check' },
    'BAST_LIMPAH': { title: 'BAST LIMPAH INSTANSI LAIN', icon: 'fi-rr-paper-plane' }
  };

  let titleEl = document.getElementById('tlPreviewHeaderText');
  let iconEl = document.getElementById('tlPreviewHeaderIcon');
  let meta = tlDocMeta[rawType] || { title: `DOKUMEN ${rawType}`, icon: 'fi-rr-document' };

  if (titleEl) titleEl.textContent = `PRATINJAU DOKUMEN: ${meta.title}`;
  if (iconEl) iconEl.className = `fi ${meta.icon}`;
}

export function changePaperSize(size: string): void {
  (store as any).selectedPaperSize = size;
  let dynamicStyle = document.getElementById('dynamicPaperStyle');
  let paperLabel = document.getElementById('currentPaperSizeLabel');
  let settingSelect = document.getElementById('setting_paperSize') as HTMLSelectElement;

  if (settingSelect) settingSelect.value = size;

  if (size === 'A4') {
    if (dynamicStyle) dynamicStyle.innerHTML = `@page { size: A4; margin: 0; } @page landscape-page { size: A4 landscape; margin: 0; } @media print { .report { width: 210mm !important; min-height: 297mm !important; } .report.landscape { width: 297mm !important; min-height: 210mm !important; } }`;
    if (paperLabel) paperLabel.textContent = 'A4 (210 x 297 mm)';
  } else {
    if (dynamicStyle) dynamicStyle.innerHTML = `@page { size: 215mm 330mm; margin: 0; } @page landscape-page { size: 330mm 215mm; margin: 0; } @media print { .report { width: 215mm !important; min-height: 330mm !important; } .report.landscape { width: 330mm !important; min-height: 215mm !important; } }`;
    if (paperLabel) paperLabel.textContent = 'F4 / FOLIO (215 x 330 mm)';
  }

  if (window.showReportView) window.showReportView((store as any).currentDoc);
  if (window.showTLReportView) window.showTLReportView((store as any).currentTLDoc);
  if (window.saveData) window.saveData();
}

export function handleEditDocFocus(type: string): void {
  if (store.activeRecordIndex < 0 && store.databasePerkara.length > 0) {
    store.activeRecordIndex = 0;
  }

  if (store.activeRecordIndex < 0 || !store.databasePerkara[store.activeRecordIndex]) {
    showToast("PERINGATAN", "Simpan atau pilih data perkara terlebih dahulu sebelum mengedit parameter.", "warning");
    return;
  }

  if (window.loadRecordToCurrentView) {
    window.loadRecordToCurrentView(store.databasePerkara[store.activeRecordIndex]);
  }

  (store as any).currentDoc = type;
  let sel = document.getElementById('docFilterSelect') as HTMLSelectElement;
  if (sel) sel.value = type;

  const docTitles: Record<string, string> = {
    'LPP': 'Edit Dokumen LPP',
    'LPF': 'Edit Dokumen LPF',
    'SPLIT': 'Edit Dokumen SPLIT',
    'SPRIN_CACAH': 'Edit Sprin Cacah',
    'BA': 'Edit BA Cacah',
    'LHP': 'Edit Dokumen LHP'
  };
  
  let modalTitle = document.getElementById('editDocModalTitle');
  if (modalTitle) modalTitle.textContent = docTitles[type] || 'Edit Dokumen';

  if (window.renderDynamicInputs) window.renderDynamicInputs(type);
  let modal = document.getElementById('editDocModal');
  if (modal) modal.classList.add('active');
}

export function focusEditTLDoc(docType: string): void {
  if (store.activeRecordIndex < 0 && store.databasePerkara.length > 0) {
    store.activeRecordIndex = 0;
  }

  if (store.activeRecordIndex < 0 || !store.databasePerkara[store.activeRecordIndex]) {
    showToast("PERINGATAN", "Simpan atau pilih data perkara terlebih dahulu sebelum mengedit parameter tindak lanjut.", "warning");
    return;
  }

  if (window.loadRecordToCurrentView) {
    window.loadRecordToCurrentView(store.databasePerkara[store.activeRecordIndex]);
  }

  (store as any).currentTLDoc = docType;
  let sel = document.getElementById('tlDocFilterSelect') as HTMLSelectElement;
  if (sel) sel.value = docType;

  const tlDocTitles: Record<string, string> = {
    'BAST_PEMILIK': 'Edit BAST Ke Pemilik / Kuasa',
    'BA_SEGEL': 'Edit Berita Acara Buka Segel',
    'KEP_BDN': 'Edit Keputusan BDN',
    'SPSA': 'Edit Surat SPSA',
    'BAST_LIMPAH': 'Edit BAST Limpah Ke Instansi Lain'
  };
  
  let modalTitle = document.getElementById('editTLDocModalTitle');
  if (modalTitle) modalTitle.textContent = tlDocTitles[docType] || 'Edit Dokumen Tindak Lanjut';

  if (window.renderTLFormSection) window.renderTLFormSection(docType);
  let modal = document.getElementById('editTLDocModal');
  if (modal) modal.classList.add('active');
}

export function closeEditDocModal(): void {
  let modal = document.getElementById('editDocModal');
  if (modal) modal.classList.remove('active');
}

export function saveAndCloseEditDocModal(): void {
  closeEditDocModal();
  if (window.refreshReportTableUI) window.refreshReportTableUI();
  if (window.updateReportLive) window.updateReportLive();
  showToast("PERUBAHAN TERSIMPAN", `Parameter ${(store as any).currentDoc} berhasil diperbarui.`, "success");
}

export function closeEditTLDocModal(): void {
  let modal = document.getElementById('editTLDocModal');
  if (modal) modal.classList.remove('active');
}

export function saveAndCloseEditTLDocModal(): void {
  closeEditTLDocModal();
  if (window.refreshTLTableUI) window.refreshTLTableUI();
  if (window.showTLReportView) window.showTLReportView((store as any).currentTLDoc);
  showToast("PERUBAHAN TERSIMPAN", `Parameter ${(store as any).currentTLDoc} berhasil diperbarui.`, "success");
}