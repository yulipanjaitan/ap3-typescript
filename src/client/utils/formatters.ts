export function formatProperCase(str: string | number | null | undefined): string {
  if (!str || str === '-') return '-';
  const cleanStr = str.toString().trim();

  const connectors = ['dan', 'di', 'ke', 'dari', 'yang', 'untuk', 'pada', 'dengan', 'dalam', 'atas', 'oleh', 'sebagai', 'atau', 'serta'];
  const uppercaseWords = [
    'WIB', 'FTZ', 'PP', 'UU', 'PMK', 'NIK', 'NIB', 'NPWP', 'SIM', 'SBP', 'LP', 'LPP', 'LPF',
    'SPLIT', 'LHP', 'BAP', 'BA', 'KPU', 'BC', 'TMP', 'B', 'C', 'DKI', 'NO', 'NO.', 'NOMOR',
    'PBI', 'BPOM', 'BKC', 'NPPBKC', 'EA', 'MMEA', 'HT', 'BDN', 'SPSA', 'BAST', 'CN', 'PIBK'
  ];

  const words = cleanStr.split(/\s+/);
  const formattedWords = words.map((w, index) => {
    const lowerW = w.toLowerCase();
    const upperW = w.toUpperCase();

    if (/[0-9]/.test(w) && /[a-zA-Z]/.test(w)) {
      return upperW;
    }

    if (w.includes('/') || (w.includes('.') && /[a-zA-Z]/.test(w) && w.length > 4)) {
      return upperW;
    }

    if (uppercaseWords.includes(upperW) || uppercaseWords.includes(upperW.replace(/[^A-Z]/g, ''))) {
      return upperW;
    }

    if (connectors.includes(lowerW) && index > 0) {
      return lowerW;
    }

    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  });

  return formattedWords.join(' ');
}

export function getVal(id: string): string {
  const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
  if (!el) return '-';
  const val = String(el.value || '').trim();
  return val !== '' ? formatProperCase(val) : '-';
}

export function escText(s: string | number | null | undefined): string {
  return String(s ?? '-').replace(/[&<>"]/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  }[m] || m));
}

export function formatModusVerb(modus: string | null | undefined): string {
  if (!modus || modus === '-') return '-';
  let str = modus.trim();

  const verbMap = [
    { from: /^Pemasukan/i, to: 'memasukkan' },
    { from: /^Pengeluaran/i, to: 'mengeluarkan' },
    { from: /^Penyediaan/i, to: 'menyediakan' },
    { from: /^Penyerahan/i, to: 'menyerahkan' },
    { from: /^Pengangkutan/i, to: 'mengangkut' },
    { from: /^Pembawaan/i, to: 'membawa' },
    { from: /^Pembongkaran/i, to: 'membongkar' },
    { from: /^Penimbunan/i, to: 'menimbun' }
  ];

  for (const rule of verbMap) {
    if (rule.from.test(str)) {
      str = str.replace(rule.from, rule.to);
      break;
    }
  }

  return str.charAt(0).toLowerCase() + str.slice(1);
}

export function terbilangHuruf(angka: number | string): string {
  const bilangan = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
  const n = typeof angka === 'number' ? angka : parseInt(angka, 10);
  if (isNaN(n)) return String(angka);
  if (n < 12) return bilangan[n];
  if (n < 20) return terbilangHuruf(n - 10) + ' belas';
  if (n < 100) return terbilangHuruf(Math.floor(n / 10)) + ' puluh ' + terbilangHuruf(n % 10);
  if (n < 200) return 'seratus ' + terbilangHuruf(n - 100);
  if (n < 1000) return terbilangHuruf(Math.floor(n / 100)) + ' ratus ' + terbilangHuruf(n % 100);
  if (n < 2000) return 'seribu ' + terbilangHuruf(n - 1000);
  if (n < 1000000) return terbilangHuruf(Math.floor(n / 1000)) + ' ribu ' + terbilangHuruf(n % 1000);
  return n.toString();
}

export function terbilang(angka: number | string): string {
  return terbilangHuruf(angka);
}

export function tanggalKeTeks(dateString: string): string {
  if (!dateString) return '';
  const d = new Date(dateString + 'T12:00:00');
  const bulan = ['januari', 'februari', 'maret', 'april', 'mei', 'juni', 'juli', 'agustus', 'september', 'oktober', 'november', 'desember'];
  return `${terbilang(d.getDate())} bulan ${bulan[d.getMonth()]} tahun ${terbilang(d.getFullYear())}`.replace(/\s+/g, ' ').trim();
}

export function formatJam24(el: HTMLInputElement): void {
  const val = el.value.replace(/[^0-9]/g, '');
  if (val.length >= 3) {
    el.value = val.slice(0, 2) + '.' + val.slice(2, 4);
  } else {
    el.value = val;
  }
}

export function validateJam24(el: HTMLInputElement): void {
  const val = el.value.trim().replace(':', '.');
  if (!val) return;

  const parts = val.split('.');
  if (parts.length === 2) {
    let hh = parseInt(parts[0], 10);
    let mm = parseInt(parts[1], 10);

    if (isNaN(hh) || hh < 0 || hh > 23) hh = 0;
    if (isNaN(mm) || mm < 0 || mm > 59) mm = 0;

    const padHH = String(hh).padStart(2, '0');
    const padMM = String(mm).padStart(2, '0');
    el.value = `${padHH}.${padMM}`;
  } else if (parts.length === 1 && parts[0].length >= 2) {
    let hh = parseInt(parts[0].slice(0, 2), 10);
    if (isNaN(hh) || hh < 0 || hh > 23) hh = 0;
    el.value = `${String(hh).padStart(2, '0')}.00`;
  }
}

export function formatRupiahInput(el: HTMLInputElement): void {
  const raw = el.value.replace(/[^0-9]/g, '');
  if (!raw) {
    el.value = '';
    return;
  }
  const formatted = parseInt(raw, 10).toLocaleString('id-ID');
  el.value = `Rp ${formatted}`;
}

export function formatRupiahFinal(el: HTMLInputElement): void {
  const raw = el.value.replace(/[^0-9]/g, '');
  if (!raw) {
    el.value = '';
    return;
  }
  const formatted = parseInt(raw, 10).toLocaleString('id-ID');
  el.value = `Rp ${formatted},00`;
}

export function formatDateIndo(dateStr: string | number | null | undefined): string {
  if (!dateStr || dateStr === '-') return '-';
  const cleanStr = String(dateStr).trim();
  const bulanList = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
    const [y, m, d] = cleanStr.split('-');
    const mIdx = parseInt(m, 10) - 1;
    const day = String(parseInt(d, 10)).padStart(2, '0');
    return `${day} ${bulanList[mIdx]} ${y}`;
  }

  if (/^\d{2}-\d{2}-\d{4}$/.test(cleanStr)) {
    const [d, m, y] = cleanStr.split('-');
    const mIdx = parseInt(m, 10) - 1;
    const day = String(parseInt(d, 10)).padStart(2, '0');
    return `${day} ${bulanList[mIdx]} ${y}`;
  }

  return cleanStr;
}

export function formatDate(id: string): string {
  const el = document.getElementById(id) as HTMLInputElement | null;
  const val = el ? el.value : '';
  if (!val) {
    const v = getVal(id);
    return v !== '-' ? formatDateIndo(v) : '-';
  }
  return formatDateIndo(val);
}

export function autoIsiTeksBA(dateStr: string): void {
  if (!dateStr) return;
  const d = new Date(dateStr + 'T12:00:00');
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const elHari = document.getElementById('val_hari_BA') as HTMLInputElement | null;
  if (elHari) elHari.value = days[d.getDay()].toLowerCase();

  const elTeks = document.getElementById('val_teks_tgl_BA') as HTMLInputElement | null;
  if (elTeks) elTeks.value = tanggalKeTeks(dateStr).toLowerCase();
}
