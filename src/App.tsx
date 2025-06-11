import React, { useState } from 'react';
import { Upload, FileText, Download, Calendar, Users, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { TrelloProcessor } from './services/trelloProcessor';
import { ReportExporter } from './services/reportExporter';
import type { TrelloBoard, TaskReport, ReportSummary, DateRange } from './types/trello';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

function App() {
  const [currentStep, setCurrentStep] = useState<'upload' | 'config' | 'report'>('upload');
  const [trelloData, setTrelloData] = useState<TrelloBoard | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date())
  });
  const [taskReports, setTaskReports] = useState<TaskReport[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleJSONUpload = (jsonText: string) => {
    try {
      setLoading(true);
      setError('');
      
      const data = JSON.parse(jsonText);
      
      if (!TrelloProcessor.validateTrelloData(data)) {
        throw new Error('Formato de JSON do Trello inválido. Verifique se exportou corretamente.');
      }
      
      setTrelloData(data);
      setCurrentStep('config');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar JSON');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    if (!trelloData) return;
    
    try {
      setLoading(true);
      const processor = new TrelloProcessor(trelloData);
      const reports = processor.generateTaskReports(dateRange);
      const reportSummary = processor.generateReportSummary(reports);
      
      setTaskReports(reports);
      setSummary(reportSummary);
      setCurrentStep('report');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'pdf' | 'excel' | 'text' | 'json') => {
    if (!summary || !taskReports.length) return;
    
    switch (format) {
      case 'pdf':
        ReportExporter.exportToPDF(summary, taskReports, dateRange);
        break;
      case 'excel':
        ReportExporter.exportToExcel(summary, taskReports, dateRange);
        break;
      case 'text':
        ReportExporter.downloadText(summary, taskReports, dateRange);
        break;
      case 'json':
        ReportExporter.exportToJSON(summary, taskReports, dateRange);
        break;
    }
  };

  const setQuickDateRange = (type: 'current' | 'previous') => {
    const today = new Date();
    if (type === 'current') {
      setDateRange({
        startDate: startOfMonth(today),
        endDate: endOfMonth(today)
      });
    } else {
      const previousMonth = subMonths(today, 1);
      setDateRange({
        startDate: startOfMonth(previousMonth),
        endDate: endOfMonth(previousMonth)
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClass = "status-badge";
    switch (status) {
      case 'Concluída':
        return `${baseClass} status-completed`;
      case 'Em Andamento':
        return `${baseClass} status-in-progress`;
      case 'Atrasada':
        return `${baseClass} status-late`;
      case 'Bloqueada':
        return `${baseClass} status-blocked`;
      default:
        return `${baseClass} status-in-progress`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-primary-color text-white py-6">
        <div className="container">
          <h1 className="text-center text-white">
            <FileText className="inline-block mr-3" size={36} />
            Relatórios de Marketing - Trello
          </h1>
          <p className="text-center text-blue-100 mt-2">
            Transforme dados do Trello em relatórios executivos profissionais
          </p>
        </div>
      </header>

      <main className="container py-8">
        {error && (
          <div className="alert alert-error">
            <AlertTriangle className="inline-block mr-2" size={20} />
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center">
            <div className="spinner"></div>
            <p>Processando dados...</p>
          </div>
        )}

        {/* Passo 1: Upload do JSON */}
        {currentStep === 'upload' && (
          <div className="card">
            <div className="card-header">
              <h2>
                <Upload className="inline-block mr-2" size={24} />
                1. Importar Dados do Trello
              </h2>
              <p>Cole o JSON exportado do seu quadro Trello abaixo:</p>
            </div>

            <div className="mb-4">
              <h3>Como exportar do Trello:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>Acesse seu quadro de Marketing no Trello</li>
                <li>Clique no menu do quadro (três pontos)</li>
                <li>Selecione "Mais" → "Imprimir e Exportar" → "Exportar JSON"</li>
                <li>Copie todo o conteúdo do arquivo JSON</li>
                <li>Cole no campo abaixo</li>
              </ol>
            </div>

            <JSONUploadArea onUpload={handleJSONUpload} />
          </div>
        )}

        {/* Passo 2: Configuração do Período */}
        {currentStep === 'config' && (
          <div className="card">
            <div className="card-header">
              <h2>
                <Calendar className="inline-block mr-2" size={24} />
                2. Selecionar Período do Relatório
              </h2>
              <p>Escolha o período para análise das tarefas:</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <button 
                className="btn btn-secondary"
                onClick={() => setQuickDateRange('current')}
              >
                Mês Atual
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setQuickDateRange('previous')}
              >
                Mês Anterior
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="form-group">
                <label className="form-label">Data de Início:</label>
                <input
                  type="date"
                  className="form-input"
                  value={format(dateRange.startDate, 'yyyy-MM-dd')}
                  onChange={(e) => setDateRange(prev => ({
                    ...prev,
                    startDate: new Date(e.target.value)
                  }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Data de Fim:</label>
                <input
                  type="date"
                  className="form-input"
                  value={format(dateRange.endDate, 'yyyy-MM-dd')}
                  onChange={(e) => setDateRange(prev => ({
                    ...prev,
                    endDate: new Date(e.target.value)
                  }))}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                className="btn btn-secondary"
                onClick={() => setCurrentStep('upload')}
              >
                Voltar
              </button>
              <button 
                className="btn btn-primary"
                onClick={generateReport}
                disabled={loading}
              >
                Gerar Relatório
              </button>
            </div>
          </div>
        )}

        {/* Passo 3: Relatório Gerado */}
        {currentStep === 'report' && summary && (
          <>
            {/* Resumo Visual */}
            <div className="card">
              <div className="card-header">
                <h2>Resumo Executivo</h2>
                <p>
                  Período: {format(dateRange.startDate, 'dd/MM/yyyy')} - {format(dateRange.endDate, 'dd/MM/yyyy')}
                </p>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="card text-center">
                  <Users size={32} className="mx-auto mb-2 text-primary-color" />
                  <h3 className="text-2xl font-bold">{summary.totalTasks}</h3>
                  <p className="text-gray-600">Total de Tarefas</p>
                </div>
                <div className="card text-center">
                  <CheckCircle size={32} className="mx-auto mb-2 text-success" />
                  <h3 className="text-2xl font-bold text-success">{summary.completedTasks}</h3>
                  <p className="text-gray-600">Concluídas</p>
                </div>
                <div className="card text-center">
                  <Clock size={32} className="mx-auto mb-2 text-warning" />
                  <h3 className="text-2xl font-bold text-warning">{summary.inProgressTasks}</h3>
                  <p className="text-gray-600">Em Andamento</p>
                </div>
                <div className="card text-center">
                  <AlertTriangle size={32} className="mx-auto mb-2 text-danger" />
                  <h3 className="text-2xl font-bold text-danger">{summary.lateTasks}</h3>
                  <p className="text-gray-600">Atrasadas</p>
                </div>
              </div>

              {/* Botões de Exportação */}
              <div className="flex flex-wrap gap-2">
                <button 
                  className="btn btn-primary"
                  onClick={() => handleExport('pdf')}
                >
                  <Download size={16} />
                  Exportar PDF
                </button>
                <button 
                  className="btn btn-success"
                  onClick={() => handleExport('excel')}
                >
                  <Download size={16} />
                  Exportar Excel
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleExport('text')}
                >
                  <Download size={16} />
                  Exportar Texto
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleExport('json')}
                >
                  <Download size={16} />
                  Exportar JSON
                </button>
              </div>
            </div>

            {/* Tabela Detalhada */}
            <div className="card">
              <div className="card-header">
                <h2>Relatório Detalhado de Tarefas</h2>
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tarefa</th>
                      <th>Responsável</th>
                      <th>Data Prevista</th>
                      <th>Status</th>
                      <th>Dias em Atraso</th>
                      <th>Observações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taskReports.map((task, index) => (
                      <tr key={index}>
                        <td className="font-medium">{task.taskName}</td>
                        <td>{task.collaboratorName}</td>
                        <td>{task.dueDate}</td>
                        <td>
                          <span className={getStatusBadge(task.status)}>
                            {task.status}
                          </span>
                        </td>
                        <td>
                          {task.daysLate > 0 ? (
                            <span className="text-danger font-medium">
                              {task.daysLate} dias
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="text-sm text-gray-600">
                          {task.observations || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-between">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setCurrentStep('config')}
                >
                  Alterar Período
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setCurrentStep('upload');
                    setTrelloData(null);
                    setTaskReports([]);
                    setSummary(null);
                  }}
                >
                  Novo Relatório
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="bg-gray-800 text-white py-4">
        <div className="container text-center">
          <p>Ferramenta de Relatórios de Marketing - Desenvolvida para otimizar seu workflow</p>
        </div>
      </footer>
    </div>
  );
}

// Componente para upload de JSON
function JSONUploadArea({ onUpload }: { onUpload: (json: string) => void }) {
  const [jsonText, setJsonText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jsonText.trim()) {
      onUpload(jsonText.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">JSON do Trello:</label>
        <textarea
          className="form-input"
          rows={10}
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder='Cole aqui o JSON exportado do Trello...'
          required
        />
      </div>
      <button 
        type="submit" 
        className="btn btn-primary btn-lg"
        disabled={!jsonText.trim()}
      >
        <Upload size={20} />
        Processar Dados
      </button>
    </form>
  );
}

export default App;
