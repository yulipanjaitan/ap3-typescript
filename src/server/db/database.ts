import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { UserAccount, PerkaraRecord, DisposisiRecord } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface IDatabase {
  getUsers(): UserAccount[];
  getUserByEmail(email: string): UserAccount | undefined;
  createUser(user: UserAccount): UserAccount;
  getAllPerkara(): PerkaraRecord[];
  getPerkaraById(id: number): PerkaraRecord | undefined;
  savePerkara(rec: PerkaraRecord, index?: number): PerkaraRecord[];
  replacePerkaraList(list: PerkaraRecord[]): void;
  deletePerkara(indexOrId: number): PerkaraRecord[];
  resetPerkara(): void;
  getDisposisi(): DisposisiRecord[];
  saveDisposisi(disp: DisposisiRecord): DisposisiRecord;
}

class JsonDatabase implements IDatabase {
  private usersFile = path.join(DATA_DIR, 'users.json');
  private perkaraFile = path.join(DATA_DIR, 'perkara.json');
  private disposisiFile = path.join(DATA_DIR, 'disposisi.json');

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(this.usersFile)) {
      const defaultAdmin: UserAccount[] = [
        {
          id: 1,
          nama: 'Admin System',
          email: 'admin',
          pass: 'admin',
          role: 'Admin',
          createdAt: new Date().toISOString()
        }
      ];
      fs.writeFileSync(this.usersFile, JSON.stringify(defaultAdmin, null, 2), 'utf-8');
    }

    if (!fs.existsSync(this.perkaraFile)) {
      fs.writeFileSync(this.perkaraFile, JSON.stringify([], null, 2), 'utf-8');
    }

    if (!fs.existsSync(this.disposisiFile)) {
      fs.writeFileSync(this.disposisiFile, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  getUsers(): UserAccount[] {
    try {
      const data = fs.readFileSync(this.usersFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  getUserByEmail(email: string): UserAccount | undefined {
    const users = this.getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: UserAccount): UserAccount {
    const users = this.getUsers();
    const newUser: UserAccount = {
      ...user,
      id: (users.length > 0 ? Math.max(...users.map(u => u.id || 0)) + 1 : 1),
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    fs.writeFileSync(this.usersFile, JSON.stringify(users, null, 2), 'utf-8');
    return newUser;
  }

  getAllPerkara(): PerkaraRecord[] {
    try {
      const data = fs.readFileSync(this.perkaraFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  getPerkaraById(id: number): PerkaraRecord | undefined {
    const list = this.getAllPerkara();
    return list.find((p, idx) => (p.id === id || idx === id));
  }

  savePerkara(rec: PerkaraRecord, index?: number): PerkaraRecord[] {
    const list = this.getAllPerkara();
    if (typeof index === 'number' && index >= 0 && index < list.length) {
      list[index] = { ...list[index], ...rec };
    } else {
      rec.id = list.length > 0 ? (Math.max(...list.map(p => p.id || 0)) + 1) : 1;
      list.push(rec);
    }
    fs.writeFileSync(this.perkaraFile, JSON.stringify(list, null, 2), 'utf-8');
    return list;
  }

  replacePerkaraList(newList: PerkaraRecord[]): void {
    fs.writeFileSync(this.perkaraFile, JSON.stringify(newList, null, 2), 'utf-8');
  }

  deletePerkara(indexOrId: number): PerkaraRecord[] {
    let list = this.getAllPerkara();
    if (indexOrId >= 0 && indexOrId < list.length) {
      list.splice(indexOrId, 1);
    } else {
      list = list.filter(p => p.id !== indexOrId);
    }
    fs.writeFileSync(this.perkaraFile, JSON.stringify(list, null, 2), 'utf-8');
    return list;
  }

  resetPerkara(): void {
    fs.writeFileSync(this.perkaraFile, JSON.stringify([], null, 2), 'utf-8');
  }

  getDisposisi(): DisposisiRecord[] {
    try {
      const data = fs.readFileSync(this.disposisiFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  saveDisposisi(disp: DisposisiRecord): DisposisiRecord {
    const list = this.getDisposisi();
    const newDisp: DisposisiRecord = {
      ...disp,
      id: list.length > 0 ? (Math.max(...list.map(d => d.id || 0)) + 1) : 1,
      tanggalDisposisi: disp.tanggalDisposisi || new Date().toISOString()
    };
    list.push(newDisp);
    fs.writeFileSync(this.disposisiFile, JSON.stringify(list, null, 2), 'utf-8');
    return newDisp;
  }
}

// Support SQLite if better-sqlite3 is available, else JsonDatabase
let dbInstance: IDatabase;

try {
  // Attempt dynamic import or check if better-sqlite3 is available
  const SQLite = (await import('better-sqlite3')).default;
  const dbFile = path.join(DATA_DIR, 'ap3.sqlite');
  const sqlite = new SQLite(dbFile);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT,
      email TEXT UNIQUE,
      pass TEXT,
      role TEXT,
      createdAt TEXT
    );
    CREATE TABLE IF NOT EXISTS perkara (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      data TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );
    CREATE TABLE IF NOT EXISTS disposisi (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      perkara_id INTEGER,
      data TEXT,
      createdAt TEXT
    );
  `);

  // Seed admin if not present
  const checkAdmin = sqlite.prepare('SELECT * FROM users WHERE lower(email) = ?').get('admin');
  if (!checkAdmin) {
    sqlite.prepare('INSERT INTO users (nama, email, pass, role, createdAt) VALUES (?, ?, ?, ?, ?)')
      .run('Admin System', 'admin', 'admin', 'Admin', new Date().toISOString());
  }

  class SqliteDatabase implements IDatabase {
    getUsers(): UserAccount[] {
      return sqlite.prepare('SELECT id, nama, email, pass, role, createdAt FROM users').all() as UserAccount[];
    }
    getUserByEmail(email: string): UserAccount | undefined {
      return sqlite.prepare('SELECT id, nama, email, pass, role, createdAt FROM users WHERE lower(email) = ?').get(email.toLowerCase()) as UserAccount | undefined;
    }
    createUser(user: UserAccount): UserAccount {
      const info = sqlite.prepare('INSERT INTO users (nama, email, pass, role, createdAt) VALUES (?, ?, ?, ?, ?)')
        .run(user.nama, user.email, user.pass, user.role, new Date().toISOString());
      return { ...user, id: Number(info.lastInsertRowid) };
    }
    getAllPerkara(): PerkaraRecord[] {
      const rows = sqlite.prepare('SELECT id, data FROM perkara ORDER BY id ASC').all() as { id: number; data: string }[];
      return rows.map(r => {
        try {
          const parsed = JSON.parse(r.data);
          parsed.id = r.id;
          return parsed;
        } catch {
          return { id: r.id };
        }
      });
    }
    getPerkaraById(id: number): PerkaraRecord | undefined {
      const row = sqlite.prepare('SELECT id, data FROM perkara WHERE id = ?').get(id) as { id: number; data: string } | undefined;
      if (!row) return undefined;
      const parsed = JSON.parse(row.data);
      parsed.id = row.id;
      return parsed;
    }
    savePerkara(rec: PerkaraRecord, index?: number): PerkaraRecord[] {
      const list = this.getAllPerkara();
      const now = new Date().toISOString();
      if (typeof index === 'number' && index >= 0 && index < list.length) {
        const target = list[index];
        const updated = { ...target, ...rec };
        sqlite.prepare('UPDATE perkara SET data = ?, updatedAt = ? WHERE id = ?')
          .run(JSON.stringify(updated), now, target.id);
      } else {
        const info = sqlite.prepare('INSERT INTO perkara (data, createdAt, updatedAt) VALUES (?, ?, ?)')
          .run(JSON.stringify(rec), now, now);
        rec.id = Number(info.lastInsertRowid);
      }
      return this.getAllPerkara();
    }
    replacePerkaraList(newList: PerkaraRecord[]): void {
      const now = new Date().toISOString();
      const insert = sqlite.prepare('INSERT INTO perkara (data, createdAt, updatedAt) VALUES (?, ?, ?)');
      sqlite.transaction(() => {
        sqlite.exec('DELETE FROM perkara');
        for (const item of newList) {
          insert.run(JSON.stringify(item), now, now);
        }
      })();
    }
    deletePerkara(indexOrId: number): PerkaraRecord[] {
      const list = this.getAllPerkara();
      if (indexOrId >= 0 && indexOrId < list.length) {
        const target = list[indexOrId];
        sqlite.prepare('DELETE FROM perkara WHERE id = ?').run(target.id);
      } else {
        sqlite.prepare('DELETE FROM perkara WHERE id = ?').run(indexOrId);
      }
      return this.getAllPerkara();
    }
    resetPerkara(): void {
      sqlite.exec('DELETE FROM perkara');
    }
    getDisposisi(): DisposisiRecord[] {
      const rows = sqlite.prepare('SELECT id, perkara_id, data, createdAt FROM disposisi').all() as { id: number; perkara_id: number; data: string; createdAt: string }[];
      return rows.map(r => {
        try {
          const parsed = JSON.parse(r.data);
          parsed.id = r.id;
          parsed.perkaraId = r.perkara_id;
          return parsed;
        } catch {
          return { id: r.id };
        }
      });
    }
    saveDisposisi(disp: DisposisiRecord): DisposisiRecord {
      const now = new Date().toISOString();
      const info = sqlite.prepare('INSERT INTO disposisi (perkara_id, data, createdAt) VALUES (?, ?, ?)')
        .run(disp.perkaraId || 0, JSON.stringify(disp), now);
      return { ...disp, id: Number(info.lastInsertRowid) };
    }
  }

  dbInstance = new SqliteDatabase();
  console.log('[DB] Menggunakan SQLite database di', dbFile);
} catch (e) {
  dbInstance = new JsonDatabase();
  console.log('[DB] Fallback ke JSON file-based database');
}

export const db = dbInstance;
