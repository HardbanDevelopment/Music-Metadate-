import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'lg' | 'default' | 'sm';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'default',
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:ring-offset-dark-card focus:ring-accent-violet disabled:opacity-50 disabled:cursor-wait';

  const variantClasses = {
    primary: 'text-white bg-gradient-to-r from-accent-violet to-accent-blue shadow-md hover:opacity-90',
    secondary: 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-light-text dark:text-dark-text',
  };

  const sizeClasses = {
    lg: 'px-6 py-4 text-lg',
    default: 'px-4 py-3 text-sm',
    sm: 'px-3 py-2 text-sm',
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;