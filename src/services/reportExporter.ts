import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import type { TaskReport, ReportSummary, DateRange } from '../types/trello';
import { format } from 'date-fns';

export class ReportExporter {
  
  // Exportar para PDF
  static exportToPDF(
    summary: ReportSummary, 
    taskReports: TaskReport[], 
    dateRange: DateRange
  ): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPosition = 20;

    // Título
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO DE TAREFAS - EQUIPE DE MARKETING', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Período
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const periodText = `Período: ${format(dateRange.startDate, 'dd/MM/yyyy')} - ${format(dateRange.endDate, 'dd/MM/yyyy')}`;
    doc.text(periodText, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Resumo Geral
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMO GERAL:', 20, yPosition);
    yPosition += 10;

    doc.setFont('helvetica', 'normal');
    doc.text(`Total de Tarefas: ${summary.totalTasks}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Tarefas Concluídas: ${summary.completedTasks}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Tarefas em Andamento: ${summary.inProgressTasks}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Tarefas Atrasadas: ${summary.lateTasks}`, 20, yPosition);
    yPosition += 20;

    // Relatório Individual
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO INDIVIDUAL POR TAREFA:', 20, yPosition);
    yPosition += 15;

    taskReports.forEach((task, index) => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${task.taskName}`, 20, yPosition);
      yPosition += 7;

      doc.setFont('helvetica', 'normal');
      doc.text(`Responsável: ${task.collaboratorName}`, 25, yPosition);
      yPosition += 5;
      doc.text(`Data prevista: ${task.dueDate}`, 25, yPosition);
      yPosition += 5;
      doc.text(`Status: ${task.status}`, 25, yPosition);
      yPosition += 5;
      
      if (task.daysLate > 0) {
        doc.text(`Dias em Atraso: ${task.daysLate} dias`, 25, yPosition);
        yPosition += 5;
      }
      
      if (task.observations) {
        const observations = doc.splitTextToSize(`Observações: ${task.observations}`, 150);
        doc.text(observations, 25, yPosition);
        yPosition += observations.length * 5;
      }
      
      yPosition += 10;
    });

    doc.save(`relatorio-marketing-${format(new Date(), 'dd-MM-yyyy')}.pdf`);
  }

  // Exportar para Excel
  static exportToExcel(
    summary: ReportSummary,
    taskReports: TaskReport[],
    dateRange: DateRange
  ): void {
    const workbook = XLSX.utils.book_new();

    // Aba Resumo
    const summaryData = [
      ['RELATÓRIO DE TAREFAS - EQUIPE DE MARKETING'],
      [`Período: ${format(dateRange.startDate, 'dd/MM/yyyy')} - ${format(dateRange.endDate, 'dd/MM/yyyy')}`],
      [''],
      ['RESUMO GERAL'],
      ['Total de Tarefas', summary.totalTasks],
      ['Tarefas Concluídas', summary.completedTasks],
      ['Tarefas em Andamento', summary.inProgressTasks],
      ['Tarefas Atrasadas', summary.lateTasks],
      ['Tarefas Bloqueadas', summary.blockedTasks]
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');

    // Aba Detalhada
    const detailData = [
      ['Responsável', 'Tarefa', 'Data Prevista', 'Status', 'Dias em Atraso', 'Observações']
    ];

    taskReports.forEach(task => {
      detailData.push([
        task.collaboratorName,
        task.taskName,
        task.dueDate,
        task.status,
        task.daysLate > 0 ? task.daysLate.toString() : '-',
        task.observations || ''
      ]);
    });

    const detailSheet = XLSX.utils.aoa_to_sheet(detailData);
    XLSX.utils.book_append_sheet(workbook, detailSheet, 'Tarefas Detalhadas');

    XLSX.writeFile(workbook, `relatorio-marketing-${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
  }

  // Exportar para texto formatado
  static exportToText(
    summary: ReportSummary,
    taskReports: TaskReport[],
    dateRange: DateRange
  ): string {
    let text = 'RELATÓRIO DE TAREFAS - EQUIPE DE MARKETING\n';
    text += `Período: ${format(dateRange.startDate, 'dd/MM/yyyy')} - ${format(dateRange.endDate, 'dd/MM/yyyy')}\n\n`;
    
    text += 'RESUMO GERAL:\n';
    text += `Total de Tarefas: ${summary.totalTasks}\n`;
    text += `Tarefas Concluídas: ${summary.completedTasks}\n`;
    text += `Tarefas em Andamento: ${summary.inProgressTasks}\n`;
    text += `Tarefas Atrasadas: ${summary.lateTasks}\n\n`;
    
    text += 'RELATÓRIO INDIVIDUAL POR TAREFA:\n\n';
    
    taskReports.forEach((task, index) => {
      text += `${index + 1}. Nome da Tarefa: ${task.taskName}\n`;
      text += `   Nome do colaborador responsável: ${task.collaboratorName}\n`;
      text += `   Data prevista da Entrega: ${task.dueDate}\n`;
      text += `   Status: ${task.status}\n`;
      text += `   Dias em Atraso: ${task.daysLate > 0 ? `${task.daysLate} dias` : '-'}\n`;
      text += `   Observações: ${task.observations || '-'}\n\n`;
    });

    return text;
  }

  // Download do texto
  static downloadText(
    summary: ReportSummary,
    taskReports: TaskReport[],
    dateRange: DateRange
  ): void {
    const text = this.exportToText(summary, taskReports, dateRange);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-marketing-${format(new Date(), 'dd-MM-yyyy')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Exportar para JSON
  static exportToJSON(
    summary: ReportSummary,
    taskReports: TaskReport[],
    dateRange: DateRange
  ): void {
    const data = {
      periodo: {
        inicio: format(dateRange.startDate, 'dd/MM/yyyy'),
        fim: format(dateRange.endDate, 'dd/MM/yyyy')
      },
      resumo: summary,
      tarefas: taskReports,
      geradoEm: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-marketing-${format(new Date(), 'dd-MM-yyyy')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
