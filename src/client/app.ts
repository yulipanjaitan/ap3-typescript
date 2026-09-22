// AP3 - Client Entry Point (TypeScript)
declare global {
  interface Window {
    [key: string]: any;
    store: any;
    databasePerkara: any;
    currentUser: any;
    userAccounts: any;
    activeRecordIndex: number;
    currentDoc: string;
    currentTLDoc: string;
    selectedPaperSize: string;
  }
}

import { store, savePerkaraToStorage, loadPerkaraFromStorage } from './state/store.js';
import { defaultPasalClusters, defaultKantorList } from './config/constants.js';
import * as formatters from './utils/formatters.js';
import * as ui from './modules/ui.js';
import * as auth from './modules/auth.js';
import * as disposisi from './modules/disposisi.js';
import * as perkara from './modules/perkara.js';
import * as editor from './modules/editor.js';
import * as laporan from './templates/laporan.js';
import * as tindaklanjut from './templates/tindaklanjut.js';

// Expose all modules and functions to window for seamless inline event handlers
const allModules = [formatters, ui, auth, disposisi, perkara, editor, laporan, tindaklanjut];
allModules.forEach(mod => {
  Object.keys(mod).forEach(key => {
    (window as any)[key] = (mod as any)[key];
  });
});

// Also expose store properties if accessed directly
window.store = store;
Object.defineProperty(window, 'databasePerkara', {
  get: () => store.databasePerkara,
  set: (val) => { store.databasePerkara = val; }
});
Object.defineProperty(window, 'currentUser', {
  get: () => store.currentUser,
  set: (val) => { store.currentUser = val; }
});
Object.defineProperty(window, 'userAccounts', {
  get: () => store.userAccounts,
  set: (val) => { store.userAccounts = val; }
});
Object.defineProperty(window, 'activeRecordIndex', {
  get: () => store.activeRecordIndex,
  set: (val) => { store.activeRecordIndex = val; }
});
Object.defineProperty(window, 'currentDoc', {
  get: () => store.currentDoc,
  set: (val) => { store.currentDoc = val; }
});
Object.defineProperty(window, 'currentTLDoc', {
  get: () => store.currentTLDoc,
  set: (val) => { store.currentTLDoc = val; }
});
Object.defineProperty(window, 'selectedPaperSize', {
  get: () => store.selectedPaperSize,
  set: (val) => { store.selectedPaperSize = val; }
});

document.addEventListener("DOMContentLoaded", function() {
  auth.initUserAccounts();
  auth.checkLoginSession();
  perkara.populateAgeDropdown();

  // --- INISIALISASI MODUL DISPOSISI AGAR LANGSUNG MUNCUL SAAT AWAL ---
  disposisi.renderDisposisiTable();
  disposisi.checkDisposisiAccessByRole();
  disposisi.cekNotifikasiDisposisiMasuk();
  // -----------------------------------------------------------------

  const navButtons = document.querySelectorAll('.nav-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  navButtons.forEach(button => {
    button.addEventListener('click', function(this: HTMLElement, e: Event) {
      e.preventDefault();
      navButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');

      const targetId = this.getAttribute('data-target');
      if (!targetId) return;

      tabPanes.forEach(tab => tab.classList.remove('active'));
      const activeTab = document.getElementById(targetId);
      if (activeTab) activeTab.classList.add('active');

      if (targetId === 'disposisi') {
        disposisi.renderDisposisiTable();
        disposisi.checkDisposisiAccessByRole();
      }

      if (targetId === 'dasbor') {
        perkara.updateDashboardStats();
      } else if (targetId === 'laporan') {
        let sel = document.getElementById('docFilterSelect') as HTMLSelectElement | null;
        let selectedType = sel ? sel.value : store.currentDoc;
        editor.switchDocTab(selectedType);
      } else if (targetId === 'tindaklanjut') {
        let selTL = document.getElementById('tlDocFilterSelect') as HTMLSelectElement | null;
        let selectedTLType = selTL ? selTL.value : store.currentTLDoc;
        editor.switchTLDocTab(selectedTLType);
      }
    });
  });

  const geminiNavItems = document.querySelectorAll('.gemini-nav-item');
  const geminiSubPanes = document.querySelectorAll('.setting-subtab-pane');

  geminiNavItems.forEach(item => {
    item.addEventListener('click', function(this: HTMLElement) {
      geminiNavItems.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');

      const targetSub = this.getAttribute('data-setting-tab');
      geminiSubPanes.forEach(pane => pane.classList.remove('active'));
      
      if (targetSub) {
        const activePane = document.getElementById(targetSub);
        if (activePane) activePane.classList.add('active');
      }
    });
  });

  document.addEventListener('click', function(e: MouseEvent) {
    let profileWrapper = document.querySelector('.user-profile-wrapper');
    let dropdownMenu = document.getElementById('userDropdownMenu');
    if (profileWrapper && e.target && !profileWrapper.contains(e.target as Node)) {
      if (dropdownMenu) dropdownMenu.classList.remove('show');
    }
  });

  perkara.loadData();
  perkara.renderPerkaraTable();
  perkara.updateDashboardStats();
  ui.changePaperSize('F4');
  editor.switchDocTab(store.currentDoc); 
  editor.switchTLDocTab(store.currentTLDoc);
  perkara.updateLiveCodePreviews();
});

// Otomatis aktif saat tombol cetak ditekan atau Ctrl+P
window.addEventListener('beforeprint', () => {
  document.querySelectorAll('#reports .report, #tl_reports .report').forEach((card) => {
    (card as HTMLElement).style.display = 'block';
  });
});

// Otomatis merapikan kembali ke halaman preview aktif setelah selesai cetak
window.addEventListener('afterprint', () => {
  if (document.getElementById('reports')) {
    ui.navigatePreviewPage((store as any).currentActivePageIdx, 'reports');
  }
  if (document.getElementById('tl_reports')) {
    ui.navigatePreviewPage((store as any).currentActivePageIdx, 'tl_reports');
  }
});

document.addEventListener('click', function(e: MouseEvent) {
  let targetEl = e.target as HTMLElement | null;
  if (!targetEl) return;

  let btnTerima = targetEl.closest('.btn-terima-dsp');
  if (btnTerima) {
    let id = btnTerima.getAttribute('data-id');
    disposisi.responDisposisi('terima', id);
  }

  let btnTolak = targetEl.closest('.btn-tolak-dsp');
  if (btnTolak) {
    let id = btnTolak.getAttribute('data-id');
    disposisi.responDisposisi('tolak', id);
  }
});