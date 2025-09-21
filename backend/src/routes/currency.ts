import { Router } from 'express';
import { convertExpense } from '../controllers/expense.controller.js';

const router = Router();

router.post('/convert', convertExpense);

export { router };