const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Inisialisasi basis data file jika belum ada
const usersFile = path.join(DATA_DIR, 'users.json');
const perkaraFile = path.join(DATA_DIR, 'perkara.json');
const disposisiFile = path.join(DATA_DIR, 'disposisi.json');

if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(usersFile, JSON.stringify([
    { id: 1, nama: 'Admin System', email: 'admin', pass: 'admin', role: 'Admin', createdAt: new Date().toISOString() }
  ], null, 2));
}
if (!fs.existsSync(perkaraFile)) {
  fs.writeFileSync(perkaraFile, JSON.stringify([], null, 2));
}
if (!fs.existsSync(disposisiFile)) {
  fs.writeFileSync(disposisiFile, JSON.stringify([], null, 2));
}

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return []; }
}
function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Parse body for POST/PUT
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    let payload = {};
    if (body) {
      try { payload = JSON.parse(body); } catch {}
    }

    // --- API ROUTES ---
    if (pathname.startsWith('/api/')) {
      res.setHeader('Content-Type', 'application/json');

      // 1. Health
      if (pathname === '/api/health') {
        res.writeHead(200);
        return res.end(JSON.stringify({ status: 'ok', app: 'AP3 TypeScript Node.js Server', time: new Date() }));
      }

      // 2. Auth: Login
      if (pathname === '/api/auth/login' && req.method === 'POST') {
        const users = readJson(usersFile);
        const user = users.find(u => u.email.toLowerCase() === (payload.email || '').toLowerCase() && u.pass === payload.pass);
        if (user) {
          res.writeHead(200);
          return res.end(JSON.stringify({ success: true, message: 'Login berhasil.', user: { nama: user.nama, email: user.email, role: user.role } }));
        } else {
          res.writeHead(401);
          return res.end(JSON.stringify({ success: false, error: 'Email/Username atau kata sandi tidak valid.' }));
        }
      }

      // 3. Auth: Register
      if (pathname === '/api/auth/register' && req.method === 'POST') {
        const users = readJson(usersFile);
        if (users.some(u => u.email.toLowerCase() === (payload.email || '').toLowerCase())) {
          res.writeHead(409);
          return res.end(JSON.stringify({ success: false, error: 'Email/Username ini sudah terdaftar!' }));
        }
        const newUser = {
          id: users.length > 0 ? Math.max(...users.map(u => u.id || 0)) + 1 : 1,
          nama: (payload.nama || '').trim(),
          email: (payload.email || '').trim(),
          pass: (payload.pass || '').trim(),
          role: payload.role || 'Staff Indak',
          createdAt: new Date().toISOString()
        };
        users.push(newUser);
        writeJson(usersFile, users);
        res.writeHead(201);
        return res.end(JSON.stringify({ success: true, message: 'Registrasi berhasil.', user: { nama: newUser.nama, email: newUser.email, role: newUser.role } }));
      }

      // 4. Auth: Users list
      if (pathname === '/api/auth/users' && req.method === 'GET') {
        const users = readJson(usersFile).map(u => ({ id: u.id, nama: u.nama, email: u.email, role: u.role, createdAt: u.createdAt }));
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, data: users }));
      }

      // 5. Perkara: GET all
      if (pathname === '/api/perkara' && req.method === 'GET') {
        const data = readJson(perkaraFile);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, data: data }));
      }

      // 6. Perkara: Bulk update
      if (pathname === '/api/perkara/bulk' && (req.method === 'PUT' || req.method === 'POST')) {
        if (Array.isArray(payload.list)) {
          writeJson(perkaraFile, payload.list);
          res.writeHead(200);
          return res.end(JSON.stringify({ success: true, message: 'Seluruh data perkara berhasil diperbarui.', data: payload.list }));
        }
      }

      // 7. Perkara: Reset
      if (pathname === '/api/perkara/reset' && (req.method === 'DELETE' || req.method === 'POST')) {
        writeJson(perkaraFile, []);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, message: 'Database perkara berhasil direset.' }));
      }

      // 8. Disposisi: GET
      if (pathname === '/api/disposisi' && req.method === 'GET') {
        const data = readJson(disposisiFile);
        res.writeHead(200);
        return res.end(JSON.stringify({ success: true, data: data }));
      }

      // 9. Disposisi: POST
      if (pathname === '/api/disposisi' && req.method === 'POST') {
        const list = readJson(disposisiFile);
        const item = {
          ...(payload.disposisi || payload),
          id: list.length > 0 ? Math.max(...list.map(d => d.id || 0)) + 1 : 1,
          createdAt: new Date().toISOString()
        };
        list.push(item);
        writeJson(disposisiFile, list);
        res.writeHead(201);
        return res.end(JSON.stringify({ success: true, message: 'Disposisi berhasil disimpan.', data: item }));
      }

      res.writeHead(404);
      return res.end(JSON.stringify({ error: 'Endpoint API tidak ditemukan' }));
    }

    // --- STATIC FILES ---
    let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
    if (safePath === '/' || safePath === '\\') safePath = '/index.html';
    let filePath = path.join(PUBLIC_DIR, safePath);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    try {
      const content = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    } catch (err) {
      res.writeHead(500);
      res.end('Internal Server Error: ' + err.message);
    }
  });
});

server.listen(PORT, () => {
  console.log('===========================================================');
  console.log(`  AP3 Server (Node.js & TypeScript) Berjalan di Port ${PORT}`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`  Basis Data: ${DATA_DIR}`);
  console.log('===========================================================');
});
