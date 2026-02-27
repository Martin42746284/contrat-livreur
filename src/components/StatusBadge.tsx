import React from 'react';
import { Clock, CheckCircle2, FileEdit, XCircle } from 'lucide-react';

type AnyStatus = 'brouillon' | 'en_attente' | 'valide' | 'refuse' | 'resilie';

const statusConfig: Record<AnyStatus, { label: string; icon: React.ReactNode; className: string }> = {
  brouillon: {
    label: 'Brouillon',
    icon: <FileEdit size={16} />,
    className: 'bg-muted text-muted-foreground',
  },
  en_attente: {
    label: 'En attente',
    icon: <Clock size={16} />,
    className: 'bg-warning/15 text-warning-foreground border border-warning/30',
  },
  valide: {
    label: 'Validé',
    icon: <CheckCircle2 size={16} />,
    className: 'bg-success/15 text-success border border-success/30',
  },
  refuse: {
    label: 'Refusé',
    icon: <XCircle size={16} />,
    className: 'bg-destructive/15 text-destructive border border-destructive/30',
  },
  resilie: {
    label: 'Résilié',
    icon: <XCircle size={16} />,
    className: 'bg-destructive/15 text-destructive border border-destructive/30',
  },
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config = statusConfig[status as AnyStatus] || statusConfig.brouillon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${config.className}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

export default StatusBadge;
