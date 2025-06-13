import React, { useRef, useEffect } from 'react';
import type { CollaboratorReport } from '../types/trello';

const CollaboratorBarChart: React.FC<{ collaborators: CollaboratorReport[] }> = ({ collaborators }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    if (!chartRef.current || !collaborators.length) return;
    if (chartInstance.current) chartInstance.current.destroy();
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    const sortedCollaborators = [...collaborators].sort((a, b) => b.completionRate - a.completionRate);
    chartInstance.current = new (window as any).Chart(ctx, {
      type: 'bar',
      data: {
        labels: sortedCollaborators.map(c => c.collaboratorName),
        datasets: [
          {
            label: 'Tarefas Concluídas',
            data: sortedCollaborators.map(c => c.completedTasks),
            backgroundColor: '#16a34a',
            borderRadius: 4,
          },
          {
            label: 'Tarefas Pendentes',
            data: sortedCollaborators.map(c => c.totalTasks - c.completedTasks),
            backgroundColor: '#1e40af',
            borderRadius: 4,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { stacked: true },
          y: { stacked: true, beginAtZero: true }
        },
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              afterLabel: function(context: any) {
                const collab = sortedCollaborators[context.dataIndex];
                return `Taxa de conclusão: ${collab.completionRate.toFixed(1)}%`;
              }
            }
          }
        }
      }
    });
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [collaborators]);
  return <div style={{ position: 'relative', height: '400px' }}><canvas ref={chartRef}></canvas></div>;
};

export default CollaboratorBarChart;
