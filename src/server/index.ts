// @ts-ignore
import express, { Request, Response } from 'express';
// @ts-ignore
import cors from 'cors';
// @ts-ignore
import path from 'path';
// @ts-ignore
import { fileURLToPath } from 'url';
import authRouter from './routes/auth.js';
import perkaraRouter from './routes/perkara.js';
import disposisiRouter from './routes/disposisi.js';

// Deklarasi tambahan agar process tidak error
declare const process: any;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.resolve(__dirname, '../../public');

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files (HTML, CSS, JS, Assets)
app.use(express.static(PUBLIC_DIR));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/perkara', perkaraRouter);
app.use('/api/disposisi', disposisiRouter);

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', app: 'AP3 - Aplikasi Penyusunan Penelitian Perkara', timestamp: new Date() });
});

// Single Page Application route fallback
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Start Server
app.listen(Number(PORT), () => {
  console.log(`=======================================================`);
  console.log(`  AP3 Server (Node.js + TypeScript) Berjalan!`);
  console.log(`  Akses di peramban: http://localhost:${PORT}`);
  console.log(`  Basis data tersimpan di direktori: /data`);
  console.log(`=======================================================`);
});

export default app;