import { Router, type Request, type Response } from "express";
import { createExpense, getExpenses } from "../controllers/expense.controller.js";
import cors from 'cors';
import { METHODS } from "http";

const router = Router();
const corsOptions = {
    origin: 'http://localhost:3000', //frontend url
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
}

router.use(cors(corsOptions));

router.post('/', createExpense);
router.get('/', getExpenses);

