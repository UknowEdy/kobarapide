import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children, className = '', actions }) => {
  return (
    <div className={`bg-koba-card rounded-lg shadow-lg p-4 md:p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
        {actions && <div>{actions}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
};

export default Card;