import React, { useRef, useEffect } from 'react';
import type { TaskReport } from '../types/trello';

const TaskTrendChart: React.FC<{ tasks: TaskReport[] }> = ({ tasks }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  useEffect(() => {
    if (!chartRef.current || !tasks.length) return;
    if (chartInstance.current) chartInstance.current.destroy();
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    const tasksGroupedByDate = tasks.reduce((acc: any, task) => {
      const date = new Date(task.dueDate).toISOString().split('T')[0];
      if (!acc[date]) acc[date] = { completed: 0, total: 0 };
      acc[date].total++;
      if (task.status === 'Concluída') acc[date].completed++;
      return acc;
    }, {});
    const dates = Object.keys(tasksGroupedByDate).sort();
    const completionRates = dates.map(date => {
      const { completed, total } = tasksGroupedByDate[date];
      return (completed / total) * 100;
    });
    chartInstance.current = new (window as any).Chart(ctx, {
      type: 'line',
      data: {
        labels: dates.map(date => new Date(date).toLocaleDateString('pt-BR')),
        datasets: [
          {
            label: 'Taxa de Conclusão (%)',
            data: completionRates,
            borderColor: '#16a34a',
            backgroundColor: 'rgba(22, 163, 74, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#16a34a',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: function(value: any) {
                return value + '%';
              }
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context: any) {
                return `Taxa de conclusão: ${context.raw.toFixed(1)}%`;
              }
            }
          }
        }
      }
    });
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [tasks]);
  return <div style={{ position: 'relative', height: '300px' }}><canvas ref={chartRef}></canvas></div>;
};

export default TaskTrendChart;
