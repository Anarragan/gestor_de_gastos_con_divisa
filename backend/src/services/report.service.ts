import { createExpenseStream } from "../streams/expensStream.js";
import { convertCurrency } from "../services/api.service.js";
import type Expense from "../models/expense.js";
import type { ReportOptions, ReportResult } from "../models/reports.js";

export async function generateReport(opts: ReportOptions = {}): Promise<ReportResult> {
  const { baseCurrency = "COP", periodDays = 7} = opts;

  const { transform } = createExpenseStream();
  const rawExpenses: Expense[] = [];

  return new Promise((resolve, reject) => {
    transform.on("data", (exp: Expense) => {
      rawExpenses.push(exp);
    });

    transform.on("error", (err) => {
      console.error("Error reading expense stream:", err);
      reject(err);
    });

    transform.on("finish", async () => {
      try {
        // filter by date
        const now = new Date();
        const since = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);

        const filtered = rawExpenses.filter((e) => {
          const date = (e as any).date;
          if (date) {
            const d = new Date(date);
            if (!isNaN(d.getTime())) {
              return d >= since && d <= now;
            }
          }
          return true;
        });

        // convert all to baseCurrency
        const rateCache = new Map<string, number>(); 
        const convertedExpenses: Expense[] = [];

        for (const e of filtered) {
          const amountNum = Number(e.amount) || 0;
          if (!e.currency || e.currency === baseCurrency) {
            convertedExpenses.push({ ...e, amount: parseFloat(amountNum.toFixed(2)), currency: baseCurrency });
            continue;
          }

          const from = e.currency;

          if (!rateCache.has(from)) {
            try {
              const rate = await convertCurrency(1, from, baseCurrency);
              rateCache.set(from, rate);
            } catch (err) {
              console.error(`Error obteniendo tasa de ${from} -> ${baseCurrency}:`, err);
              rateCache.set(from, NaN);
            }
          }

          const rate = rateCache.get(from) ?? NaN;
          if (!isNaN(rate)) {
            const converted = parseFloat((amountNum * rate).toFixed(2));
            convertedExpenses.push({ ...e, amount: converted, currency: baseCurrency });
          } else {
            convertedExpenses.push({ ...e, amount: parseFloat(amountNum.toFixed(2)) });
          }
        }

        // generate summary
        const total = convertedExpenses.reduce((s, it) => s + Number(it.amount || 0), 0);
        const byCategory: Record<string, number> = {};
        for (const it of convertedExpenses) {
          const cat = it.category || "Uncategorized";
          byCategory[cat] = (byCategory[cat] || 0) + Number(it.amount || 0);
        }

        const report: ReportResult = {
          baseCurrency,
          total: parseFloat(total.toFixed(2)),
          count: convertedExpenses.length,
          byCategory,
          expenses: convertedExpenses,
        };

        resolve(report);
      } catch (err) {
        console.error("Error generating report:", err);
        reject(err);
      }
    });

    // start the stream
    transform.resume();
  });
}