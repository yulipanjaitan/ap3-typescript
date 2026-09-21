import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  try {
    const list = db.getDisposisi();
    return res.json({ success: true, data: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { disposisi } = req.body;
    if (!disposisi) {
      return res.status(400).json({ success: false, error: 'Data disposisi harus disertakan.' });
    }
    const saved = db.saveDisposisi(disposisi);
    return res.json({ success: true, message: 'Disposisi berhasil disimpan.', data: saved });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
