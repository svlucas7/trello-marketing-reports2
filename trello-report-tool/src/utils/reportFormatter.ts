import { ReportData } from '../types';
import * as fs from 'fs';
import * as pdf from 'pdfkit';
import * as ExcelJS from 'exceljs';

export function formatAsPDF(reportData: ReportData, filePath: string): void {
    const doc = new pdf();
    doc.pipe(fs.createWriteStream(filePath));
    doc.fontSize(25).text('Monthly Report', { align: 'center' });
    doc.moveDown();

    for (const item of reportData.items) {
        doc.fontSize(12).text(`${item.title}: ${item.value}`);
    }

    doc.end();
}

export function formatAsExcel(reportData: ReportData, filePath: string): void {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Monthly Report');

    worksheet.columns = [
        { header: 'Title', key: 'title', width: 30 },
        { header: 'Value', key: 'value', width: 30 },
    ];

    reportData.items.forEach(item => {
        worksheet.addRow({ title: item.title, value: item.value });
    });

    workbook.xlsx.writeFile(filePath);
}

export function formatAsText(reportData: ReportData): string {
    let reportText = 'Monthly Report\n\n';
    reportData.items.forEach(item => {
        reportText += `${item.title}: ${item.value}\n`;
    });
    return reportText;
}

export function formatAsJSON(reportData: ReportData): string {
    return JSON.stringify(reportData, null, 2);
}