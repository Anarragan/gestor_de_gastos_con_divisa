import { Router } from "express";
import { convertExpense, getRates } from "../controllers/expense.controller.js";

const router = Router();

router.post("/convert", convertExpense);
router.get("/rate", getRates);

export { router };