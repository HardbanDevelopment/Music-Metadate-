
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({ children, className = '', style }) => {
  return (
    <div 
      className={`bg-light-card dark:bg-dark-card rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-accent-violet/30 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

export default Card;
