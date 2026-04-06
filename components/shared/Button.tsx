import React from 'react';

type ButtonProps = {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
};

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  className = '',
  type = 'button',
  disabled = false
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
  };

  const variantClasses = {
    primary: 'text-white bg-primary-gradient shadow-soft-md hover:shadow-soft-lg transform hover:-translate-y-0.5 focus:ring-primaryEnd disabled:opacity-50 disabled:cursor-not-allowed',
    secondary: 'text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200 focus:ring-slate-400 disabled:opacity-50 disabled:cursor-not-allowed',
    ghost: 'text-slate-700 bg-transparent hover:bg-slate-100 focus:ring-slate-400 disabled:opacity-50 disabled:cursor-not-allowed',
    accent: 'text-slate-900 bg-secondary-gradient shadow-soft-md hover:shadow-soft-lg transform hover:-translate-y-0.5 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed',
    danger: 'text-white bg-coral shadow-soft-md hover:bg-red-600 transform hover:-translate-y-0.5 focus:ring-coral disabled:opacity-50 disabled:cursor-not-allowed',
  };

  const combinedClasses = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  return (
    <button type={type} onClick={onClick} className={combinedClasses} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;