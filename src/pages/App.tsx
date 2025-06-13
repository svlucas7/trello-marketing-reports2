import { useState } from 'react';
import { Upload, FileText, Download, Calendar, Users, CheckCircle, Clock, AlertTriangle, TrendingUp, BarChart3, Info, Search, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { TrelloProcessor } from '../services/trelloProcessor';
import { ReportExporter } from '../services/reportExporter';
import type { TrelloBoard, TaskReport, ReportSummary, DateRange, CollaboratorReport } from '../types/trello';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import InfoCard from '../components/InfoCard';
import ProgressBar from '../components/ProgressBar';
import StatusPieChart from '../components/StatusPieChart';
import JSONUploadArea from '../components/JSONUploadArea';
import AdvancedMetricsCard from '../components/AdvancedMetricsCard';
import TaskTrendChart from '../components/TaskTrendChart';
import CollaboratorBarChart from '../components/CollaboratorBarChart';

function App() {
  const [currentStep, setCurrentStep] = useState<'upload' | 'config' | 'report'>('upload');
  const [trelloData, setTrelloData] = useState<TrelloBoard | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date())
  });
  const [taskReports, setTaskReports] = useState<TaskReport[]>([]);
  const [collaboratorReports, setCollaboratorReports] = useState<CollaboratorReport[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'tasks' | 'collaborators'>('summary');
    // Estados para funcionalidades de busca e filtro
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [collaboratorFilter, setCollaboratorFilter] = useState<string>('all');
  const [showAdvancedView, setShowAdvancedView] = useState<boolean>(false);
  const [expandedCollaborators, setExpandedCollaborators] = useState<Set<string>>(new Set());

  // Funções auxiliares para filtros
  const filteredTasks = taskReports.filter(task => {
    const matchesSearch = task.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.collaboratorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesCollaborator = collaboratorFilter === 'all' || 
                               task.collaboratorName === collaboratorFilter;
    return matchesSearch && matchesStatus && matchesCollaborator;
  });

  const filteredCollaborators = collaboratorReports.filter(collab => 
    collab.collaboratorName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // Função para obter lista de colaboradores únicos
  const getUniqueCollaborators = () => {
    const collaborators = new Set<string>();
    taskReports.forEach(task => {
      collaborators.add(task.collaboratorName);
    });
    return Array.from(collaborators).sort();
  };

  // Função para alternar expansão de colaborador
  const toggleCollaboratorExpansion = (collaboratorName: string) => {
    setExpandedCollaborators(prev => {
      const newSet = new Set(prev);
      if (newSet.has(collaboratorName)) {
        newSet.delete(collaboratorName);
      } else {
        newSet.add(collaboratorName);
      }
      return newSet;
    });
  };

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
      const collabReports = processor.generateCollaboratorReports(reports);
      
      setTaskReports(reports);
      setSummary(reportSummary);
      setCollaboratorReports(collabReports);
      setCurrentStep('report');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };
  const handleExport = (format: 'json' | 'text' | 'compact') => {
    if (!summary || !taskReports.length) return;
    if (format === 'json') {
      ReportExporter.exportJSON({ summary, taskReports, collaboratorReports }, dateRange);
    } else if (format === 'compact') {
      ReportExporter.exportTextCompact({ summary, taskReports, collaboratorReports }, dateRange);
    } else {
      ReportExporter.exportText({ summary, taskReports, collaboratorReports }, dateRange);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClass = "badge";
    switch (status) {
      case 'Concluída':
        return `${baseClass} bg-success`;
      case 'Em Andamento':
        return `${baseClass} bg-primary`;
      case 'Atrasada':
        return `${baseClass} bg-danger`;
      case 'Bloqueada':
        return `${baseClass} bg-warning`;
      default:
        return `${baseClass} bg-secondary`;
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <header className="bg-primary-color text-white py-4 shadow-lg animate-fade-in">
        <div className="container-fluid">
          <h1 className="text-center text-white fw-bold display-5 mb-2">
            <FileText className="me-3" size={36} />
            Relatórios de Marketing - Trello
          </h1>
          <p className="text-center text-light mt-2 fs-5 animate-fade-in">
            Transforme dados do Trello em relatórios executivos profissionais
          </p>
        </div>
      </header>

      <main className="container-fluid py-4">
        {error && (
          <div className="alert alert-danger d-flex align-items-center animate-shake" role="alert">
            <AlertTriangle className="me-2" size={20} />
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center animate-pulse">
            <div className="spinner-custom"></div>
            <p className="fs-5 fw-medium text-primary mt-2">Processando dados...</p>
          </div>
        )}

        {/* Passo 1: Upload do JSON */}
        {currentStep === 'upload' && (
          <div className="card card-modern animate-fade-in">
            <div className="card-header border-bottom">
              <h2 className="card-title h4 mb-2">
                <Upload className="me-2" size={24} />
                1. Importar Dados do Trello
              </h2>
              <p className="text-muted mb-0">
                Faça upload do arquivo JSON exportado do seu board do Trello
              </p>
            </div>
            <div className="card-body">
              <JSONUploadArea onUpload={handleJSONUpload} />
              
              <div className="row g-4 mt-4">
                <div className="col-lg-6">
                  <div className="card border-info">
                    <div className="card-header bg-info bg-opacity-10">
                      <h6 className="text-info mb-0">
                        <Info size={16} className="me-2" />
                        Como exportar do Trello:
                      </h6>
                    </div>
                    <div className="card-body">
                      <ol className="mb-0 small">
                        <li>Abra seu board no Trello</li>
                        <li>Clique em "Mostrar menu" (canto superior direito)</li>
                        <li>Selecione "Mais" → "Imprimir e exportar"</li>
                        <li>Escolha "Exportar JSON"</li>
                        <li>Faça download e cole o conteúdo aqui</li>
                      </ol>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="card border-success">
                    <div className="card-header bg-success bg-opacity-10">
                      <h6 className="text-success mb-0">
                        <CheckCircle size={16} className="me-2" />
                        Recursos do Sistema:
                      </h6>
                    </div>
                    <div className="card-body">
                      <ul className="mb-0 small">
                        <li>Análise automática de produtividade</li>
                        <li>Relatórios por colaborador</li>
                        <li>Gráficos e métricas avançadas</li>
                        <li>Identificação de tarefas atrasadas</li>
                        <li>Exportação em múltiplos formatos</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Passo 2: Configuração do Período */}
        {currentStep === 'config' && trelloData && (
          <div className="card card-modern animate-fade-in">
            <div className="card-header border-bottom">
              <h2 className="card-title h4 mb-2">
                <Calendar className="me-2" size={24} />
                2. Configurar Período do Relatório
              </h2>
              <p className="text-muted mb-0">
                Selecione o período para análise das tarefas
              </p>
            </div>
            <div className="card-body">
              <div className="row g-4">
                <div className="col-lg-8">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Data de Início:</label>
                      <input
                        type="date"
                        className="form-control"
                        value={format(dateRange.startDate, 'yyyy-MM-dd')}
                        onChange={(e) => setDateRange(prev => ({
                          ...prev,
                          startDate: new Date(e.target.value)
                        }))}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Data de Fim:</label>
                      <input
                        type="date"
                        className="form-control"
                        value={format(dateRange.endDate, 'yyyy-MM-dd')}
                        onChange={(e) => setDateRange(prev => ({
                          ...prev,
                          endDate: new Date(e.target.value)
                        }))}
                      />
                    </div>
                  </div>

                  <div className="row g-2 mt-3">
                    <div className="col-auto">
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setDateRange({
                          startDate: startOfMonth(new Date()),
                          endDate: endOfMonth(new Date())
                        })}
                      >
                        Este Mês
                      </button>
                    </div>
                    <div className="col-auto">
                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setDateRange({
                          startDate: startOfMonth(subMonths(new Date(), 1)),
                          endDate: endOfMonth(subMonths(new Date(), 1))
                        })}
                      >
                        Mês Passado
                      </button>
                    </div>
                  </div>

                  <div className="d-flex gap-3 mt-4">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setCurrentStep('upload')}
                    >
                      Voltar
                    </button>
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={generateReport}
                    >
                      <BarChart3 className="me-2" size={20} />
                      Gerar Relatório
                    </button>
                  </div>
                </div>

                <div className="col-lg-4">
                  <div className="card border-warning">
                    <div className="card-header bg-warning bg-opacity-10">
                      <h6 className="text-warning mb-0">
                        <Info size={16} className="me-2" />
                        Configurações do Board:
                      </h6>
                    </div>
                    <div className="card-body">
                      <p className="small mb-2">
                        <strong>Board:</strong> {trelloData.name}
                      </p>
                      <p className="small mb-2">
                        <strong>Total de Cartões:</strong> {trelloData.cards.length}
                      </p>
                      <p className="small mb-2">
                        <strong>Listas:</strong> {trelloData.lists.length}
                      </p>
                      <p className="small mb-0">
                        <strong>Colaboradores:</strong> {trelloData.members.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Passo 3: Visualização do Relatório */}
        {currentStep === 'report' && summary && (
          <>
            {/* Resumo Executivo */}
            <div className="card card-modern animate-fade-in">
              <div className="card-header d-flex justify-content-between align-items-center border-bottom">
                <div>
                  <h2 className="card-title h4 mb-2">
                    <BarChart3 className="me-2" size={24} />
                    3. Relatório Executivo
                  </h2>
                  <p className="text-muted mb-0">
                    Período: {format(dateRange.startDate, 'dd/MM/yyyy')} - {format(dateRange.endDate, 'dd/MM/yyyy')}
                  </p>
                </div>
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => handleExport('text')}
                  >
                    <Download size={16} className="me-1" /> Texto
                  </button>
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => handleExport('compact')}
                  >
                    <Download size={16} className="me-1" /> Texto Compacto
                  </button>
                  <button 
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => handleExport('json')}
                  >
                    <Download size={16} className="me-1" /> JSON
                  </button>
                </div>
              </div>
              <div className="card-body">
                <div className="row g-4 mb-4">
                  <div className="col-lg-8">
                    <div className="row g-3">
                      <div className="col-sm-6">
                        <InfoCard
                          title="Total de Tarefas"
                          value={summary.totalTasks}
                          subtitle="No período selecionado"
                          icon={<Users size={32} />}
                          color="#1e40af"
                        />
                      </div>
                      <div className="col-sm-6">
                        <InfoCard
                          title="Concluídas"
                          value={summary.completedTasks}
                          subtitle={`${summary.totalTasks > 0 ? Math.round((summary.completedTasks / summary.totalTasks) * 100) : 0}% do total`}
                          icon={<CheckCircle size={32} />}
                          color="#16a34a"
                        />
                      </div>
                      <div className="col-sm-6">
                        <InfoCard
                          title="Em Andamento"
                          value={summary.inProgressTasks}
                          subtitle={`${summary.totalTasks > 0 ? Math.round((summary.inProgressTasks / summary.totalTasks) * 100) : 0}% do total`}
                          icon={<Clock size={32} />}
                          color="#d97706"
                        />
                      </div>
                      <div className="col-sm-6">
                        <InfoCard
                          title="Atrasadas"
                          value={summary.lateTasks}
                          subtitle={`${summary.totalTasks > 0 ? Math.round((summary.lateTasks / summary.totalTasks) * 100) : 0}% do total`}
                          icon={<AlertTriangle size={32} />}
                          color="#dc2626"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <div className="card border-primary h-100">
                      <div className="card-header bg-primary bg-opacity-10">
                        <h6 className="text-primary mb-0">Distribuição por Status</h6>
                      </div>
                      <div className="card-body">
                        <StatusPieChart summary={summary} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-lg-3 col-md-6">
                    <ProgressBar 
                      value={summary.completedTasks} 
                      total={summary.totalTasks} 
                      color="#16a34a" 
                      label="Tarefas Concluídas"
                    />
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <ProgressBar 
                      value={summary.inProgressTasks} 
                      total={summary.totalTasks} 
                      color="#1e40af" 
                      label="Tarefas em Andamento"
                    />
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <ProgressBar 
                      value={summary.lateTasks} 
                      total={summary.totalTasks} 
                      color="#dc2626" 
                      label="Tarefas Atrasadas"
                    />
                  </div>
                  <div className="col-lg-3 col-md-6">
                    <ProgressBar 
                      value={summary.blockedTasks} 
                      total={summary.totalTasks} 
                      color="#d97706" 
                      label="Tarefas Bloqueadas"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Navegação por Abas */}
            <div className="card card-modern animate-fade-in">
              <div className="card-header border-bottom-0">
                <ul className="nav nav-tabs card-header-tabs" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button 
                      className={`nav-link ${activeTab === 'summary' ? 'active' : ''}`}
                      onClick={() => setActiveTab('summary')}
                      type="button"
                    >
                      <CheckCircle size={16} className="me-2" />
                      Resumo Geral
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button 
                      className={`nav-link ${activeTab === 'collaborators' ? 'active' : ''}`}
                      onClick={() => setActiveTab('collaborators')}
                      type="button"
                    >
                      <Users size={16} className="me-2" />
                      Por Colaborador
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button 
                      className={`nav-link ${activeTab === 'tasks' ? 'active' : ''}`}
                      onClick={() => setActiveTab('tasks')}
                      type="button"
                    >
                      <FileText size={16} className="me-2" />
                      Todas as Tarefas
                    </button>
                  </li>
                </ul>
              </div>
              <div className="card-body">
                {/* Controles avançados de busca e filtro */}
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <div className="input-group">
                      <span className="input-group-text">
                        <Search size={16} />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar tarefas ou colaboradores..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <select 
                      className="form-select"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Todos os Status</option>
                      <option value="Concluída">Concluída</option>
                      <option value="Em Andamento">Em Andamento</option>
                      <option value="Atrasada">Atrasada</option>
                      <option value="Bloqueada">Bloqueada</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <select 
                      className="form-select"
                      value={collaboratorFilter}
                      onChange={(e) => setCollaboratorFilter(e.target.value)}
                    >
                      <option value="all">Todos os Colaboradores</option>
                      {getUniqueCollaborators().map(collaborator => (
                        <option key={collaborator} value={collaborator}>
                          {collaborator}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-2">
                    <button 
                      className="btn btn-outline-primary w-100"
                      onClick={() => setShowAdvancedView(!showAdvancedView)}
                    >
                      <Eye size={16} className="me-1" />
                      {showAdvancedView ? 'Simples' : 'Avançado'}
                    </button>
                  </div>
                </div>

                {/* Conteúdo das Abas */}
                {activeTab === 'summary' && (
                  <div className="animate-fade-in">
                    {/* Métricas Avançadas */}
                    <div className="mb-4">
                      <AdvancedMetricsCard 
                        summary={summary} 
                        tasks={filteredTasks} 
                        collaborators={filteredCollaborators} 
                      />
                    </div>

                    {showAdvancedView ? (
                      <div className="row g-4">
                        <div className="col-lg-6">
                          <div className="card card-modern">
                            <div className="card-header">
                              <h5 className="card-title mb-0">
                                <BarChart3 size={20} className="me-2" />
                                Distribuição de Status
                              </h5>
                            </div>
                            <div className="card-body">
                              <StatusPieChart summary={summary} />
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-6">
                          <div className="card card-modern">
                            <div className="card-header">
                              <h5 className="card-title mb-0">
                                <TrendingUp size={20} className="me-2" />
                                Tendência de Conclusão
                              </h5>
                            </div>
                            <div className="card-body">
                              <TaskTrendChart tasks={filteredTasks} />
                            </div>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="card card-modern">
                            <div className="card-header">
                              <h5 className="card-title mb-0">
                                <Users size={20} className="me-2" />
                                Produtividade por Colaborador
                              </h5>
                            </div>
                            <div className="card-body">
                              <CollaboratorBarChart collaborators={filteredCollaborators} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="row g-4">
                        <div className="col-lg-8">
                          <div className="card card-modern">
                            <div className="card-header">
                              <h5 className="card-title mb-0">Taxa de Conclusão por Status</h5>
                            </div>
                            <div className="card-body">
                              <div className="row g-3">
                                <div className="col-md-6">
                                  <div className="bg-success bg-opacity-10 p-4 rounded-3 text-center">
                                    <CheckCircle size={32} className="text-success mb-2" />
                                    <h4 className="fw-bold text-success">
                                      {summary.totalTasks > 0 ? Math.round((summary.completedTasks / summary.totalTasks) * 100) : 0}%
                                    </h4>
                                    <p className="text-muted mb-0">Taxa de Conclusão</p>
                                    <small className="text-muted">
                                      {summary.completedTasks} de {summary.totalTasks} tarefas
                                    </small>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <div className="bg-danger bg-opacity-10 p-4 rounded-3 text-center">
                                    <AlertTriangle size={32} className="text-danger mb-2" />
                                    <h4 className="fw-bold text-danger">
                                      {summary.totalTasks > 0 ? Math.round((summary.lateTasks / summary.totalTasks) * 100) : 0}%
                                    </h4>
                                    <p className="text-muted mb-0">Tarefas em Atraso</p>
                                    <small className="text-muted">
                                      {summary.lateTasks} tarefas atrasadas
                                    </small>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-4">
                          <div className="card card-modern">
                            <div className="card-header">
                              <h5 className="card-title mb-0">Distribuição Visual</h5>
                            </div>
                            <div className="card-body">
                              <StatusPieChart summary={summary} />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'collaborators' && (
                  <div className="animate-fade-in">
                    <div className="row g-4 mb-4">
                      <div className="col-12">
                        <div className="alert alert-info d-flex align-items-center">
                          <Info size={20} className="me-2" />
                          <div>
                            <strong>Dica:</strong> Use os filtros acima para refinar a análise por colaborador específico.
                            Mostrando {filteredCollaborators.length} de {collaboratorReports.length} colaboradores.
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row g-4">
                      {filteredCollaborators.map((collaborator, index) => (
                        <div key={index} className="col-xl-6">
                          <div className="card card-modern h-100">
                            <div className="card-header d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center">
                                <Users size={20} className="text-primary me-2" />
                                <h5 className="card-title mb-0">{collaborator.collaboratorName}</h5>
                              </div>
                              <span className={`badge ${
                                collaborator.completionRate >= 80 ? 'bg-success' :
                                collaborator.completionRate >= 60 ? 'bg-warning' : 'bg-danger'
                              }`}>
                                {collaborator.completionRate.toFixed(1)}% conclusão
                              </span>
                            </div>
                            <div className="card-body">
                              <div className="row g-3 mb-3">
                                <div className="col-6">
                                  <div className="text-center p-2 bg-primary bg-opacity-10 rounded">
                                    <h6 className="fw-bold text-primary mb-0">{collaborator.totalTasks}</h6>
                                    <small className="text-muted">Total</small>
                                  </div>
                                </div>
                                <div className="col-6">
                                  <div className="text-center p-2 bg-success bg-opacity-10 rounded">
                                    <h6 className="fw-bold text-success mb-0">{collaborator.completedTasks}</h6>
                                    <small className="text-muted">Concluídas</small>
                                  </div>
                                </div>
                              </div>

                              <div className="mb-3">
                                <ProgressBar 
                                  value={collaborator.completedTasks} 
                                  total={collaborator.totalTasks} 
                                  color="#16a34a" 
                                  label="Progresso de Conclusão"
                                />
                              </div>

                              <div className="row g-2 text-center">
                                <div className="col-4">
                                  <small className="text-muted d-block">Em Andamento</small>
                                  <span className="fw-semibold text-warning">{collaborator.inProgressTasks}</span>
                                </div>
                                <div className="col-4">
                                  <small className="text-muted d-block">Atrasadas</small>
                                  <span className="fw-semibold text-danger">{collaborator.lateTasks}</span>
                                </div>
                                <div className="col-4">
                                  <small className="text-muted d-block">Bloqueadas</small>
                                  <span className="fw-semibold text-warning">{collaborator.blockedTasks}</span>
                                </div>
                              </div>                              {collaborator.averageDaysLate > 0 && (
                                <div className="mt-3 p-2 bg-warning bg-opacity-10 rounded text-center">
                                  <small className="text-warning fw-semibold">
                                    <Clock size={14} className="me-1" />
                                    Média de {collaborator.averageDaysLate.toFixed(1)} dias de atraso
                                  </small>
                                </div>
                              )}

                              {/* Botão para expandir detalhes das tarefas */}
                              <div className="mt-3 d-grid">
                                <button
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() => toggleCollaboratorExpansion(collaborator.collaboratorName)}
                                >
                                  {expandedCollaborators.has(collaborator.collaboratorName) ? (
                                    <>
                                      <ChevronUp size={16} className="me-1" />
                                      Ocultar Detalhes das Tarefas
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown size={16} className="me-1" />
                                      Ver Detalhes das Tarefas ({collaborator.tasks.length})
                                    </>
                                  )}
                                </button>
                              </div>

                              {/* Área expandida com detalhes das tarefas */}
                              {expandedCollaborators.has(collaborator.collaboratorName) && (
                                <div className="mt-3 border-top pt-3 animate-fade-in">
                                  <h6 className="fw-semibold mb-3 text-primary">
                                    <FileText size={16} className="me-1" />
                                    Tarefas Detalhadas
                                  </h6>
                                  
                                  {/* Filtros por status das tarefas */}
                                  <div className="row g-2 mb-3">
                                    <div className="col-6">
                                      <div className="d-flex align-items-center justify-content-between bg-success bg-opacity-10 rounded p-2">
                                        <small className="fw-medium text-success">Concluídas</small>
                                        <span className="badge bg-success">{collaborator.tasks.filter(t => t.status === 'Concluída').length}</span>
                                      </div>
                                    </div>
                                    <div className="col-6">
                                      <div className="d-flex align-items-center justify-content-between bg-primary bg-opacity-10 rounded p-2">
                                        <small className="fw-medium text-primary">Em Andamento</small>
                                        <span className="badge bg-primary">{collaborator.tasks.filter(t => t.status === 'Em Andamento').length}</span>
                                      </div>
                                    </div>
                                    <div className="col-6">
                                      <div className="d-flex align-items-center justify-content-between bg-danger bg-opacity-10 rounded p-2">
                                        <small className="fw-medium text-danger">Atrasadas</small>
                                        <span className="badge bg-danger">{collaborator.tasks.filter(t => t.status === 'Atrasada').length}</span>
                                      </div>
                                    </div>
                                    <div className="col-6">
                                      <div className="d-flex align-items-center justify-content-between bg-warning bg-opacity-10 rounded p-2">
                                        <small className="fw-medium text-warning">Bloqueadas</small>
                                        <span className="badge bg-warning">{collaborator.tasks.filter(t => t.status === 'Bloqueada').length}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Lista de tarefas */}
                                  <div className="max-height-300 overflow-auto">
                                    {collaborator.tasks.length > 0 ? (
                                      collaborator.tasks.map((task, taskIndex) => (
                                        <div key={taskIndex} className="card border-light mb-2">
                                          <div className="card-body p-3">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                              <h6 className="card-title mb-1 fw-medium text-truncate me-2" title={task.taskName}>
                                                {task.taskName}
                                              </h6>
                                              <span className={getStatusBadge(task.status)}>
                                                {task.status}
                                              </span>
                                            </div>
                                            
                                            <div className="row g-2 small text-muted">
                                              <div className="col-sm-6">
                                                <Calendar size={12} className="me-1" />
                                                Prazo: {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                                              </div>
                                              {task.daysLate > 0 && (
                                                <div className="col-sm-6">
                                                  <Clock size={12} className="me-1 text-danger" />
                                                  <span className="text-danger fw-medium">
                                                    {task.daysLate} dias de atraso
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                            
                                            {task.observations && (
                                              <div className="mt-2 p-2 bg-light rounded small">
                                                <strong>Observações:</strong> {task.observations}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="text-center py-3 text-muted">
                                        <FileText size={24} className="mb-2 opacity-50" />
                                        <p className="mb-0 small">Nenhuma tarefa encontrada para este colaborador</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {filteredCollaborators.length === 0 && (
                      <div className="text-center py-5">
                        <Users size={48} className="text-muted mb-3" />
                        <h5 className="text-muted">Nenhum colaborador encontrado</h5>
                        <p className="text-muted">Tente ajustar os filtros de busca</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'tasks' && (
                  <div className="animate-fade-in">
                    <div className="row g-3 mb-4">
                      <div className="col-12">
                        <div className="alert alert-info d-flex align-items-center">
                          <Info size={20} className="me-2" />
                          <div>
                            <strong>Resultado:</strong> Mostrando {filteredTasks.length} de {taskReports.length} tarefas.
                            {searchTerm && ` Filtrado por: "${searchTerm}"`}
                            {statusFilter !== 'all' && ` | Status: ${statusFilter}`}
                            {collaboratorFilter !== 'all' && ` | Colaborador: ${collaboratorFilter}`}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="card card-modern">
                      <div className="card-header">
                        <h5 className="card-title mb-0">
                          <FileText size={20} className="me-2" />
                          Relatório Detalhado de Tarefas
                        </h5>
                      </div>
                      <div className="card-body p-0">
                        <div className="table-responsive">
                          <table className="table table-hover mb-0">
                            <thead className="table-light">
                              <tr>
                                <th className="border-0">Tarefa</th>
                                <th className="border-0">Responsável</th>
                                <th className="border-0">Data Prevista</th>
                                <th className="border-0">Status</th>
                                <th className="border-0">Dias em Atraso</th>
                                <th className="border-0">Observações</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredTasks.map((task, index) => (
                                <tr key={index} className="align-middle">
                                  <td className="fw-medium">{task.taskName}</td>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <Users size={16} className="text-muted me-2" />
                                      {task.collaboratorName}
                                    </div>
                                  </td>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <Calendar size={16} className="text-muted me-2" />
                                      {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                                    </div>
                                  </td>
                                  <td>
                                    <span className={getStatusBadge(task.status)}>
                                      {task.status}
                                    </span>
                                  </td>
                                  <td>
                                    {task.daysLate > 0 ? (
                                      <span className="badge bg-danger">
                                        <Clock size={12} className="me-1" />
                                        {task.daysLate} dias
                                      </span>
                                    ) : (
                                      <span className="text-muted">-</span>
                                    )}
                                  </td>
                                  <td className="text-muted small">
                                    {task.observations || '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {filteredTasks.length === 0 && (
                      <div className="text-center py-5">
                        <FileText size={48} className="text-muted mb-3" />
                        <h5 className="text-muted">Nenhuma tarefa encontrada</h5>
                        <p className="text-muted">Tente ajustar os filtros de busca</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="text-center mt-4">
              <button
                className="btn btn-secondary btn-lg"
                onClick={() => {
                  setCurrentStep('upload');
                  setTrelloData(null);
                  setTaskReports([]);
                  setCollaboratorReports([]);
                  setSummary(null);                  setSearchTerm('');
                  setStatusFilter('all');
                  setCollaboratorFilter('all');
                  setShowAdvancedView(false);
                  setExpandedCollaborators(new Set());
                }}
              >
                Novo Relatório
              </button>
            </div>
          </>
        )}
      </main>

      <footer className="bg-dark text-light py-3">
        <div className="container text-center">
          <small>Ferramenta de Relatórios de Marketing - Desenvolvida para otimizar seu workflow</small>
        </div>
      </footer>
    </div>
  );
}

export default App;
