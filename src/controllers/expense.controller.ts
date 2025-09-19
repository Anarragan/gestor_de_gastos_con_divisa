import type { Request, Response } from 'express';
import { addExpense, getAllExpenses, updateExpense } from '../services/expense.services.js';



export const createExpense = async (req: Request, res: Response) => {
    try {
        const { description, amount, currency, category } = req.body;

        if (!description || !amount || !currency || !category){
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newExpense = await addExpense({ description, amount, currency, category });
        res.status(201).json(newExpense);
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

export const getExpenses = async (req: Request, res: Response) => {
    const { currency } = req.query;
    try {
        const { transform } = getAllExpenses();
        res.setHeader('Content-Type', 'application/json');
        res.write('[');
        let isFirst = true;

        transform.on('data', async (expense) => {
            if (currency && expense.currency !== currency) {
                try {
                    const convertedAmount = await convertCurrency(expense.currency, currency as string, expense.amount);
                    expense.amount = parseFloat(convertedAmount.toFixed(2));
                    expense.currency = currency as string;
                } catch (error) {
                    console.error('Error converting currency for expense:', expense, error);
                }
            }
            if (!isFirst) {
                res.write(',');
            } else {
                isFirst = false;
            }
            res.write(JSON.stringify(expense));
        });

        transform.on('finish', () => {
            res.write(']');
            res.end();
        });

        transform.on('error', (error) => {
            console.error('Error streaming expenses:', error);
            res.status(500).json({ error: 'Internal server error' });
        });

        transform.resume(); 
    } catch (error) {
        console.error('Error getting expenses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }   
}