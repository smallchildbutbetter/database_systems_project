import express from 'express';
import {
  getSupplierPriceComparison,
  getSupplierPriceHistory,
} from '../controllers/supplierController.js';

const router = express.Router();

router.get('/prices/comparison', getSupplierPriceComparison);
router.get('/prices/history/:productId', getSupplierPriceHistory);

export default router;

