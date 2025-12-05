import express from 'express';
import { getDashboardMetrics } from '../controllers/salesController.js';

const router = express.Router();

router.get('/metrics', getDashboardMetrics);

export default router;

