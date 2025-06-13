import React, { useRef, useEffect } from 'react';
import type { ReportSummary } from '../types/trello';

const StatusPieChart: React.FC<{ summary: ReportSummary }> = ({ summary }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    chartInstance.current = new (window as any).Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Concluídas', 'Em Andamento', 'Atrasadas', 'Bloqueadas'],
        datasets: [{
          data: [summary.completedTasks, summary.inProgressTasks, summary.lateTasks, summary.blockedTasks],
          backgroundColor: [
            '#16a34a', '#1e40af', '#dc2626', '#d97706'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                const total = summary.totalTasks;
                const percentage = ((context.raw / total) * 100).toFixed(1);
                return `${context.label}: ${context.raw} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [summary]);
  return <div style={{ position: 'relative', height: '300px' }}><canvas ref={chartRef}></canvas></div>;
};

export default StatusPieChart;
