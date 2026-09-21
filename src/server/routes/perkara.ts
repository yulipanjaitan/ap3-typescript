import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  try {
    const list = db.getAllPerkara();
    return res.json({ success: true, data: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = db.getPerkaraById(id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Data perkara tidak ditemukan.' });
    }
    return res.json({ success: true, data: item });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { record, index } = req.body;
    if (!record) {
      return res.status(400).json({ success: false, error: 'Data perkara (record) harus disertakan.' });
    }
    const updatedList = db.savePerkara(record, typeof index === 'number' ? index : undefined);
    return res.json({ success: true, message: 'Data perkara berhasil disimpan.', data: updatedList });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/bulk', (req: Request, res: Response) => {
  try {
    const { list } = req.body;
    if (!Array.isArray(list)) {
      return res.status(400).json({ success: false, error: 'Daftar perkara (list array) harus disertakan.' });
    }
    db.replacePerkaraList(list);
    return res.json({ success: true, message: 'Seluruh data perkara berhasil diperbarui.', data: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/reset', (_req: Request, res: Response) => {
  try {
    db.resetPerkara();
    return res.json({ success: true, message: 'Seluruh database perkara berhasil direset.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:indexOrId', (req: Request, res: Response) => {
  try {
    const param = parseInt(req.params.indexOrId, 10);
    const updatedList = db.deletePerkara(param);
    return res.json({ success: true, message: 'Perkara berhasil dihapus.', data: updatedList });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
