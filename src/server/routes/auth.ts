import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';

const router = Router();

router.post('/login', (req: Request, res: Response) => {
  try {
    const { email, pass } = req.body;
    if (!email || !pass) {
      return res.status(400).json({ success: false, error: 'Email/Username dan Password harus diisi.' });
    }

    const user = db.getUserByEmail(email);
    if (!user || user.pass !== pass) {
      return res.status(401).json({ success: false, error: 'Kombinasi email/username dan password tidak valid.' });
    }

    const session = { nama: user.nama, email: user.email, role: user.role };
    return res.json({ success: true, message: 'Login berhasil.', user: session });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/register', (req: Request, res: Response) => {
  try {
    const { nama, email, pass, role } = req.body;
    if (!nama || !email || !pass) {
      return res.status(400).json({ success: false, error: 'Nama lengkap, email, dan password wajib diisi.' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email atau username ini sudah terdaftar.' });
    }

    const newUser = db.createUser({
      nama: nama.trim(),
      email: email.trim(),
      pass: pass.trim(),
      role: role || 'Staff Indak'
    });

    const session = { nama: newUser.nama, email: newUser.email, role: newUser.role };
    return res.status(201).json({ success: true, message: 'Registrasi berhasil.', user: session });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/users', (_req: Request, res: Response) => {
  try {
    const users = db.getUsers().map(u => ({
      id: u.id,
      nama: u.nama,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt
    }));
    return res.json({ success: true, data: users });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
