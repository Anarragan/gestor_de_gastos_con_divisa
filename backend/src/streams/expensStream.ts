import { Transform } from "stream";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type Expense from "../models/expense.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXPENSES_FILE = path.join(__dirname, "../files/expenses.jsonl");

export function createExpenseStream(): { transform: Transform } {
  let leftover = "";

  const transform = new Transform({
    readableObjectMode: true,
    writableObjectMode: false,
    transform(chunk, _encoding, callback) {
      const data = leftover + chunk.toString();
      const lines = data.split("\n");
      leftover = lines.pop() || "";

      for (const line of lines) {
        if (line.trim()) {
          try {
            const expense: Expense = JSON.parse(line);
            this.push(expense);
          } catch (error) {
            console.error("Error parsing line:", line, error);
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
          console.error("Error parsing leftover:", leftover, error);
        }
      }
      callback();
    },
  });

  const readStream = fs.createReadStream(EXPENSES_FILE, { encoding: "utf8" });
  readStream.pipe(transform);

  return { transform };
}