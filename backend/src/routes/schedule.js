import express from 'express';
import { generateSchedule, getSchedule } from '../controllers/scheduleController.js';

const router = express.Router();

router.post('/generate', generateSchedule);
router.get('/', getSchedule);

export default router;

