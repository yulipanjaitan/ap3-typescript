import { Router } from 'express';
import { db } from '../db/database.js';
const router = Router();
router.get('/', (_req, res) => {
  try {
    const list = db.getDisposisi();
    return res.json({
      success: true,
      data: list
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});
router.post('/', (req, res) => {
  try {
    const {
      disposisi
    } = req.body;
    if (!disposisi) {
      return res.status(400).json({
        success: false,
        error: 'Data disposisi harus disertakan.'
      });
    }
    const saved = db.saveDisposisi(disposisi);
    return res.json({
      success: true,
      message: 'Disposisi berhasil disimpan.',
      data: saved
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});
export default router;