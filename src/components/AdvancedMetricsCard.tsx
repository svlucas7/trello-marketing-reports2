import React from 'react';
import { TrendingUp, Target, Users, Zap, Award } from 'lucide-react';
import type { ReportSummary, TaskReport, CollaboratorReport } from '../types/trello';

const AdvancedMetricsCard: React.FC<{
  summary: ReportSummary;
  tasks: TaskReport[];
  collaborators: CollaboratorReport[];
}> = ({ summary, tasks, collaborators }) => {
  const productivityScore = summary.totalTasks > 0 ? 
    Math.round((summary.completedTasks / summary.totalTasks) * 100) : 0;
  const avgTasksPerCollaborator = collaborators.length > 0 ? 
    Math.round(summary.totalTasks / collaborators.length) : 0;
  const onTimeDeliveryRate = tasks.length > 0 ? 
    Math.round(((tasks.filter(t => t.status === 'Concluída' && t.daysLate <= 0).length) / tasks.length) * 100) : 0;
  const topPerformer = collaborators.length > 0 ? 
    collaborators.reduce((top, current) => 
      current.completionRate > top.completionRate ? current : top
    ) : null;
  return (
    <div className="card card-modern">
      <div className="card-header bg-gradient-primary text-white">
        <h5 className="card-title mb-0 d-flex align-items-center">
          <TrendingUp size={20} className="me-2" />
          Métricas Avançadas
        </h5>
      </div>
      <div className="card-body">
        <div className="row g-4">
          <div className="col-lg-3 col-md-6">
            <div className="text-center p-3 bg-success bg-opacity-10 rounded-3">
              <Target size={32} className="text-success mb-2" />
              <h3 className="fw-bold text-success">{productivityScore}%</h3>
              <small className="text-muted">Score de Produtividade</small>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="text-center p-3 bg-info bg-opacity-10 rounded-3">
              <Users size={32} className="text-info mb-2" />
              <h3 className="fw-bold text-info">{avgTasksPerCollaborator}</h3>
              <small className="text-muted">Tarefas/Colaborador</small>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="text-center p-3 bg-warning bg-opacity-10 rounded-3">
              <Zap size={32} className="text-warning mb-2" />
              <h3 className="fw-bold text-warning">{onTimeDeliveryRate}%</h3>
              <small className="text-muted">Entregas no Prazo</small>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="text-center p-3 bg-primary bg-opacity-10 rounded-3">
              <Award size={32} className="text-primary mb-2" />
              <h3 className="fw-bold text-primary">{topPerformer?.collaboratorName.split(' ')[0] || 'N/A'}</h3>
              <small className="text-muted">Top Performer</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedMetricsCard;
