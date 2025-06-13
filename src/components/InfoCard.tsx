import React from 'react';
import { Info } from 'lucide-react';

interface InfoCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  tooltip?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, value, subtitle, icon, color, tooltip }) => (
  <div className="card card-modern text-center border-start border-4" style={{ borderLeftColor: color }}>
    <div className="card-body">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div style={{ color }}>{icon}</div>
        {tooltip && (
          <Info 
            size={16} 
            className="text-muted" 
            data-bs-toggle="tooltip" 
            data-bs-placement="top" 
          />
        )}
      </div>
      <h3 className="display-6 fw-bold mb-0" style={{ color }}>{value}</h3>
      <p className="text-muted small mb-1">{title}</p>
      <small className="text-muted">{subtitle}</small>
    </div>
  </div>
);

export default InfoCard;
