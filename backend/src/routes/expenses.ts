import { Router } from "express";
import { createExpense, deleteExpense, getExpenses } from "../controllers/expense.controller.js";
import cors from 'cors';
import { validateExpense } from "../middlewares/validateExpense.js";

const router = Router();
const corsOptions = {
    origin: 'http://localhost:5173', //frontend url
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
}

router.use(cors(corsOptions));

router.post('/', validateExpense, createExpense);
router.get('/', getExpenses);
router.delete('/:id', deleteExpense);

export { router };