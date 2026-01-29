/**
 * Button component
 * Accessible, calm buttons
 */

import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'medium', className = '', children, ...props }, ref) => {
    const variantClasses = {
      primary: 'bg-theme-accent text-white hover:opacity-90',
      secondary: 'bg-theme-panel text-theme-text border border-theme-border hover:bg-theme-sidebar',
      ghost: 'bg-transparent text-theme-accent hover:bg-theme-bg',
    };
    
    const sizeClasses = {
      small: 'px-4 py-2 text-sm',
      medium: 'px-5 py-3 text-base',
      large: 'px-6 py-4 text-lg',
    };

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-ring ${
          variantClasses[variant]
        } ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
