import React from 'react';

interface ProgressBarProps {
  value: number;
  total: number;
  color: string;
  label: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, total, color, label }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <small className="fw-medium">{label}</small>
        <small className="text-muted">{value}/{total} ({percentage.toFixed(1)}%)</small>
      </div>
      <div className="progress" style={{ height: '8px' }}>
        <div 
          className="progress-bar"
          style={{ 
            width: `${percentage}%`, 
            backgroundColor: color,
            transition: 'width 1s ease-in-out'
          }}
          role="progressbar"
        />
      </div>
    </div>
  );
};

export default ProgressBar;
