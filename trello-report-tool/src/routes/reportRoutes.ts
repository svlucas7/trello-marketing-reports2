import { Router } from 'express';
import ReportController from '../controllers/reportController';

const router = Router();
const reportController = new ReportController();

export function setRoutes(app: Router) {
    app.post('/reports/import', reportController.importReport.bind(reportController));
    app.post('/reports/process', reportController.processReport.bind(reportController));
    app.get('/reports/export', reportController.exportReport.bind(reportController));
}