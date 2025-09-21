import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFilePath = path.join(__dirname, '../files/requests.jsonl');

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();
    res.on('finish', ()=>{
        const logEntry = {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            time: new Date().toISOString(),
            duration: Date.now() - start + 'ms'
        };
        try {
            fs.appendFileSync(logFilePath, JSON.stringify(logEntry) + '\n');
        } catch (err) {
            console.error('Error writing log entry:', err);
        }
    });
    next();
}