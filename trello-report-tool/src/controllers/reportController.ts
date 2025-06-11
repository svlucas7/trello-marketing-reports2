import { Request, Response } from 'express';
import { TrelloProcessor } from '../services/trelloProcessor';
import { ReportFormatter } from '../utils/reportFormatter';

export class ReportController {
    private trelloProcessor: TrelloProcessor;
    private reportFormatter: ReportFormatter;

    constructor() {
        this.trelloProcessor = new TrelloProcessor();
        this.reportFormatter = new ReportFormatter();
    }

    public async importTrelloData(req: Request, res: Response): Promise<void> {
        try {
            const jsonData = req.body; // Assuming JSON data is sent in the request body
            const processedData = this.trelloProcessor.processData(jsonData);
            res.status(200).json({ message: 'Data imported successfully', data: processedData });
        } catch (error) {
            res.status(500).json({ message: 'Error importing data', error: error.message });
        }
    }

    public async generateReport(req: Request, res: Response): Promise<void> {
        try {
            const reportData = await this.trelloProcessor.generateReportData();
            const formattedReport = this.reportFormatter.formatReport(reportData);
            res.status(200).send(formattedReport);
        } catch (error) {
            res.status(500).json({ message: 'Error generating report', error: error.message });
        }
    }

    public async exportReport(req: Request, res: Response): Promise<void> {
        try {
            const reportFormat = req.params.format; // e.g., 'pdf', 'excel', etc.
            const reportData = await this.trelloProcessor.generateReportData();
            const exportedReport = this.reportFormatter.exportReport(reportData, reportFormat);
            res.status(200).send(exportedReport);
        } catch (error) {
            res.status(500).json({ message: 'Error exporting report', error: error.message });
        }
    }
}