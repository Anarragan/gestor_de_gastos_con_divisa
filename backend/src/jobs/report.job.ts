import cron from 'node-cron';
import nodemailer from 'nodemailer';
import 'dotenv/config';
import { generateReport } from '../services/report.service.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

function buildReportHtml(report: any): string {
    const rows = report.expenses
        .map((e: any, index: number) => `
            <tr style="background-color: ${index % 2 === 0 ? '#f8f9fa' : '#ffffff'};">
                <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">${e.description || "-"}</td>
                <td style="padding: 12px; border-bottom: 1px solid #dee2e6;">
                    <span style="background-color: #e9ecef; padding: 4px 8px; border-radius: 12px; font-size: 12px; text-transform: uppercase;">
                        ${e.category || "-"}
                    </span>
                </td>
                <td style="padding: 12px; text-align: right; border-bottom: 1px solid #dee2e6; font-weight: bold; color: #dc3545;">
                    ${Number(e.amount).toFixed(2)}
                </td>
                <td style="padding: 12px; text-align: center; border-bottom: 1px solid #dee2e6;">
                    <span style="background-color: #007bff; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px;">
                        ${e.currency || "-"}
                    </span>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #dee2e6; color: #6c757d;">
                    ${e.date ? new Date(e.date).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                    }) : "-"}
                </td>
            </tr>
        `)
        .join("");
    
    const categories = Object.entries(report.byCategory)
        .map(([cat, amt]) => `
            <tr style="background-color: #f8f9fa;">
                <td style="padding: 10px; border-bottom: 1px solid #dee2e6; font-weight: 500;">
                    ${cat}
                </td>
                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #dee2e6; font-weight: bold; color: #28a745;">
                    ${Number(amt).toFixed(2)} ${report.baseCurrency}
                </td>
            </tr>
        `)
        .join("");

    const currentDate = new Date().toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reporte Semanal de Gastos</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 300;">📊 Reporte Semanal de Gastos</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">${currentDate}</p>
        </div>

        <!-- Summary Cards -->
        <div style="display: flex; gap: 20px; margin-bottom: 30px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 200px; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-left: 4px solid #28a745;">
                <h3 style="margin: 0 0 10px 0; color: #28a745; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Total Gastado</h3>
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #333;">
                    ${report.total.toFixed(2)} <span style="font-size: 16px; color: #6c757d;">${report.baseCurrency}</span>
                </p>
            </div>
            <div style="flex: 1; min-width: 200px; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-left: 4px solid #007bff;">
                <h3 style="margin: 0 0 10px 0; color: #007bff; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Total de Gastos</h3>
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #333;">
                    ${report.count} <span style="font-size: 16px; color: #6c757d;">transacciones</span>
                </p>
            </div>
        </div>

        <!-- Categories Summary -->
        ${Object.keys(report.byCategory).length > 0 ? `
        <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 30px;">
            <h3 style="margin: 0 0 20px 0; color: #333; font-size: 18px; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;">
                📈 Resumen por Categorías
            </h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f8f9fa;">
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; color: #495057; font-weight: 600;">Categoría</th>
                        <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6; color: #495057; font-weight: 600;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${categories}
                </tbody>
            </table>
        </div>
        ` : ''}

        <!-- Expenses Details -->
        <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="margin: 0 0 20px 0; color: #333; font-size: 18px; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;">
                📋 Detalle de Gastos
            </h3>
            ${report.expenses.length > 0 ? `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f8f9fa;">
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; color: #495057; font-weight: 600;">Descripción</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; color: #495057; font-weight: 600;">Categoría</th>
                        <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6; color: #495057; font-weight: 600;">Monto</th>
                        <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6; color: #495057; font-weight: 600;">Moneda</th>
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6; color: #495057; font-weight: 600;">Fecha</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
            ` : `
            <div style="text-align: center; padding: 40px; color: #6c757d;">
                <p style="font-size: 18px; margin: 0;">No hay gastos registrados en este período</p>
                <p style="font-size: 14px; margin: 10px 0 0 0;">¡Excelente control financiero! 🎉</p>
            </div>
            `}
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
            <p style="margin: 0; color: #6c757d; font-size: 14px;">
                📧 Reporte generado automáticamente | 
                💰 Gestor de Gastos con Divisas
            </p>
        </div>
        
    </body>
    </html>
    `;
}

export function scheduleWeeklyReport() {
    const cronExpr = process.env.REPORT_CRON || '*/30 * * * *'; // por defecto, cada 5 minutos
    const tz = process.env.REPORT_TIMEZONE || 'America/Bogota';

    console.log(`Scheduling weekly report with cron: "${cronExpr}" and timezone: "${tz}"`);

    cron.schedule(
        cronExpr,
        async () => {
            console.log("Generating weekly report...");

            try {
                const baseCurrency = process.env.REPORT_BASE_CURRENCY || 'USD';
                const ownerId = process.env.REPORT_OWNER_ID;

                const reportOptions: any = { baseCurrency, periodDays: 7 };
                if (ownerId !== undefined) {
                    reportOptions.ownerId = ownerId;
                }

                const report = await generateReport(reportOptions);
                const html = buildReportHtml(report);

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: process.env.EMAIL_TO,
                    subject: 'Weekly Expense Report',
                    html
                };

                await transporter.sendMail(mailOptions);
                console.log("Weekly report sent successfully.");
            } catch (error) {
                console.error("Error generating weekly report:", error);
            }
        },
        {
            timezone: tz
        }
    );
}