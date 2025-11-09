
import React from 'react';

interface StatusBadgeProps {
  text: string;
  color: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ text, color }) => {
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${color}`}>
      {text}
    </span>
  );
};

export default StatusBadge;
