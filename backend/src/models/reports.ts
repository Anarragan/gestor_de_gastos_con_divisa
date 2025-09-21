import type Expense from "./expense.js";

export type ReportOptions = {
    baseCurrency?: string;
    periodDays?: number;
    ownerId?: string;
}

export type ReportResult = {
    baseCurrency: string;
    total: number;
    count: number;
    byCategory: Record<string, number>;
    expenses: Expense[];
}