import express from 'express';
import { getExpenses } from '../controllers/expensesController.js';

const router = express.Router();

router.get('/', getExpenses);

export default router;

