import { convertCurrency } from "../API/currencyApi.js";
import type Expense from "../models/expense.js";

// In-memory storage for expenses
const expenses: Expense[] = [];

// Function to add a new expense
export const addExpense = async ({
    description,
    amount,
    currency,
    category
}: Expense) => {
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

// Function to get all expenses, optionally converting to a target currency
export const getExpenses = async (targetCurrency?: string) => {
    if (!targetCurrency) {
        return expenses;
    }

    const convertedExpenses = await Promise.all(
        expenses.map(async (expense) => {
            if (expense.currency === targetCurrency) {
                return expense;
            }
            const convertedAmount = await convertCurrency(
                expense.currency,
                targetCurrency,
                expense.amount
            );
            return {
                ...expense,
                amount: convertedAmount,
                currency: targetCurrency
            };
        })
    );

    return convertedExpenses;
};

export const updateExpense = async (id:string, updateExpense: Partial<Expense>) => {
    const index = expenses.findIndex(expense => expense.id === id);
    if (index === -1){
        throw new Error('Expense not found unu')
    }

}