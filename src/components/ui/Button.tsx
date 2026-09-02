import React, { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.625rem 1.25rem',
    borderRadius: 'var(--radius-md)',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '1px solid transparent',
    width: fullWidth ? '100%' : 'auto',
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--primary)',
      color: 'white',
      border: '1px solid var(--primary)',
    },
    secondary: {
      backgroundColor: 'var(--surface-color)',
      color: 'var(--text-main)',
      border: '1px solid var(--border-color)',
    },
    danger: {
      backgroundColor: 'var(--danger)',
      color: 'white',
      border: '1px solid var(--danger)',
    },
    outline: {
      backgroundColor: 'transparent',
      color: 'var(--primary)',
      border: '1px solid var(--primary)',
    }
  };

  const hoverStyles = `
    .btn:hover:not(:disabled) {
      filter: brightness(0.95);
    }
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `;

  return (
    <>
      <style>{hoverStyles}</style>
      <button 
        className={`btn ${className}`}
        style={{ ...baseStyle, ...variants[variant] }}
        {...props}
      >
        {children}
      </button>
    </>
  );
};
