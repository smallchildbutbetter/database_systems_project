import express from 'express';
import {
  getSuppliers,
  getSupplierPriceComparison,
  getSupplierPricesForProduct,
  getSupplierPriceHistory,
  getSupplierOptimization,
} from '../controllers/supplierController.js';

const router = express.Router();

router.get('/', getSuppliers);
router.get('/prices/comparison', getSupplierPriceComparison);
router.get('/prices/product/:productId', getSupplierPricesForProduct);
router.get('/prices/history/:productId', getSupplierPriceHistory);
router.get('/optimization', getSupplierOptimization);

export default router;

