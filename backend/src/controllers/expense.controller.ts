import type { Request, Response } from 'express';
import { addExpenseService, deleteExpenseService, getAllExpenses } from '../services/expense.services.js';
import { convertCurrency } from '../services/api.service.js';

export const createExpense = async (req: Request, res: Response) => {
    try {
        const { description, amount, currency, category } = req.body;

        if (
            typeof description !== 'string' ||
            typeof amount !== 'number' ||
            typeof currency !== 'string' ||
            typeof category !== 'string'
        ) {
            return res.status(400).json({ error: 'Invalid or missing required fields' });
        }

        const expenseData = {
            description,
            amount,
            currency,
            category,
            date: new Date().toISOString(),
        };

        const newExpense = await addExpenseService(expenseData);
        res.status(201).json(newExpense);
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getExpenses = async (req: Request, res: Response) => {
    const { currency } = req.query;
    try {
        const { transform } = getAllExpenses();
        const expenses: any[] = [];
        
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
            expenses.push(expense);
        });

        transform.on('finish', () => {
            res.json(expenses);
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

export const convertExpense = async (req: Request, res: Response) => {
  try {
    const { amount, fromCurrency, toCurrency } = req.body;

    if (!amount || !fromCurrency || !toCurrency) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const convertedAmount = await convertCurrency(
      Number(amount),
      fromCurrency,
      toCurrency
    );

    res.json({
      fromCurrency,
      toCurrency,
      originalAmount: amount,
      convertedAmount: parseFloat(convertedAmount.toFixed(2)),
    });
  } catch (error) {
    console.error("Error converting currency:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({ error: 'ID is required' });
        }
        
        const deleted = await deleteExpenseService(id);
        
        if (!deleted) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        
        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};