export interface StoreState {
  currentUser: any;
  userAccounts: any[];
  currentDoc: string;
  currentTLDoc: string;
  selectedPaperSize: string;
  databasePerkara: any[];
  activeRecordIndex: number;
  visiblePasswordIndex: number;
  selectedViewPage: any;
  currentActivePageIdx: number;
}

export const store: StoreState = {
  currentUser: null,
  userAccounts: [],
  currentDoc: 'LPP',
  currentTLDoc: 'BAST_PEMILIK',
  selectedPaperSize: 'F4',
  databasePerkara: [],
  activeRecordIndex: -1,
  visiblePasswordIndex: -1,
  selectedViewPage: 'ALL',
  currentActivePageIdx: 0
};

export function getStore(): StoreState {
  return store;
}

export async function savePerkaraToStorage(): Promise<void> {
  // Simpan ke localStorage untuk fallback & cache instan
  localStorage.setItem('databasePerkara', JSON.stringify(store.databasePerkara));

  // Sinkronisasi ke backend Node.js (Express + SQLite)
  try {
    await fetch('/api/perkara/bulk', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        list: store.databasePerkara
      })
    });
  } catch (err) {
    console.warn('[Store] Gagal sinkronisasi ke backend server, menggunakan cache lokal:', err);
  }
}

export async function loadPerkaraFromStorage(): Promise<any[]> {
  // 1. Muat dari localStorage terlebih dahulu untuk tampilan cepat
  const saved = localStorage.getItem('databasePerkara');
  if (saved) {
    try {
      store.databasePerkara = JSON.parse(saved);
    } catch {
      store.databasePerkara = [];
    }
  } else {
    store.databasePerkara = [];
  }

  // 2. Muat data terbaru dari backend server (SQLite)
  try {
    const res = await fetch('/api/perkara');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        store.databasePerkara = json.data;
        localStorage.setItem('databasePerkara', JSON.stringify(store.databasePerkara));
      }
    }
  } catch (err) {
    console.warn('[Store] Mode offline atau server tidak merespon, menggunakan data lokal:', err);
  }
  return store.databasePerkara;
}