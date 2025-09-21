import type Expense from "../models/expense.js";
import crypto from 'crypto';
import { createExpenseStream } from "../streams/expensStream.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type NewExpenseInput = Omit<Expense, 'id'>;

const EXPENSES_FILE = path.join(__dirname, '../files/expenses.jsonl');

export async function addExpenseService(expenseData: NewExpenseInput): Promise<Expense> {
    const newExpense: Expense = {
        id: crypto.randomUUID(),
        ...expenseData
    };

    return new Promise((resolve, reject) => {
        const line = JSON.stringify(newExpense) + '\n';
        fs.appendFile(EXPENSES_FILE, line, (err) => {
            if (err) {
                return reject(err);
            }
            resolve(newExpense);
        });
    });
}

export function getAllExpenses() {
  return createExpenseStream();
}

export async function deleteExpenseService(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        // Primero leemos todos los gastos
        const expenses: Expense[] = [];
        const readStream = fs.createReadStream(EXPENSES_FILE, { encoding: 'utf8' });
        
        let data = '';
        readStream.on('data', (chunk) => {
            data += chunk;
        });
        
        readStream.on('end', () => {
            // Parsear cada línea del JSONL
            const lines = data.trim().split('\n').filter(line => line.trim());
            let expenseFound = false;
            
            lines.forEach(line => {
                try {
                    const expense = JSON.parse(line);
                    if (expense.id !== id) {
                        expenses.push(expense);
                    } else {
                        expenseFound = true;
                    }
                } catch (error) {
                    console.error('Error parsing line:', line, error);
                }
            });
            
            if (!expenseFound) {
                return resolve(false); // No se encontró el gasto
            }
            
            // Reescribir el archivo sin el gasto eliminado
            const newContent = expenses.map(expense => JSON.stringify(expense)).join('\n') + '\n';
            
            fs.writeFile(EXPENSES_FILE, newContent, (err) => {
                if (err) {
                    return reject(err);
                }
                resolve(true);
            });
        });
        
        readStream.on('error', (err) => {
            reject(err);
        });
    });
}