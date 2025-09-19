import { convertCurrency } from "../API/currencyApi.js";
import type Expense from "../models/expense.js";
import crypto from 'crypto';
import { Transform } from "stream";

type NewExpenseInput = Omit<Expense, 'id'>;

// In-memory storage for expenses
const expenses: Expense[] = [];

// Function to add a new expense
export const addExpense = async ({
    description,
    amount,
    currency,
    category
}: NewExpenseInput) => {
    const newExpense: Expense = {
        id: crypto.randomUUID(),
        description,
        amount,
        currency,
        category
    };
    expenses.push(newExpense);
    return newExpense;
};

export function getAllExpenses(): { transform: Transform} {
    let leftover = '';
    const transform = new Transform({
        readableObjectMode: true,
        writableObjectMode: false,
        transform(chunk, _encoding, callback) {
            const data = leftover + chunk.toString();
            const lines = data.split('\n');
            leftover = lines.pop() || '';

            for (const line of lines) {
                if (line.trim()) {
                    try {
                        const expense: Expense = JSON.parse(line);
                        this.push(expense);
                    } catch (error) {
                        console.error('Error parsing line:', line, error);
                    }
                }
            }
            callback();
        },
        flush(callback) {
            if (leftover.trim()) {
                try {
                    const expense: Expense = JSON.parse(leftover);
                    this.push(expense);
                } catch (error) {
                    console.error('Error parsing leftover:', leftover, error);
                }
            }
            callback();
        }
    });

    return { transform };
}

export const updateExpense = async (id:string, updateExpense: Partial<Expense>) => {
    const index = expenses.findIndex(expense => expense.id === id);
    if (index === -1){
        throw new Error('Expense not found unu')
    }

}