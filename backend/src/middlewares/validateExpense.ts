import type { Request, Response, NextFunction } from 'express';

export function validateExpense(req: Request, res: Response, next: NextFunction): void {
    const { description, amount, currency, category } = req.body;

    if (!description || !amount || !currency || !category) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
    }

    next();
}