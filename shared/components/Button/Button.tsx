import React from 'react';
import { twMerge } from 'tailwind-merge';
import { Spinner } from '../Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style of the button */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Whether button should take full width */
  fullWidth?: boolean;
  /** Shows a loading spinner when true */
  isLoading?: boolean;
  /** Optional icon to display */
  icon?: React.ReactNode;
  /** Position of the icon */
  iconPosition?: 'left' | 'right';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Button component for user interactions
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      icon,
      iconPosition = 'left',
      className,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
    
    // Variant styles
    const variantStyles = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-500',
      secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 active:bg-secondary-800 focus:ring-secondary-500',
      outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 active:bg-gray-100 focus:ring-primary-500 dark:border-gray-600 dark:hover:bg-gray-800 dark:active:bg-gray-700',
      text: 'bg-transparent hover:bg-gray-100 active:bg-gray-200 focus:ring-primary-500 dark:hover:bg-gray-800 dark:active:bg-gray-700',
    };
    
    // Size styles
    const sizeStyles = {
      sm: 'text-xs px-3 py-1.5 h-8',
      md: 'text-sm px-4 py-2 h-10',
      lg: 'text-base px-5 py-2.5 h-12',
    };
    
    // Width styles
    const widthStyles = fullWidth ? 'w-full' : '';
    
    // Merge all styles
    const buttonStyles = twMerge(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      widthStyles,
      className
    );

    return (
      <button
        ref={ref}
        type={type}
        className={buttonStyles}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <Spinner 
            size={size === 'lg' ? 'md' : 'sm'} 
            className={children ? 'mr-2' : ''} 
          />
        )}
        
        {!isLoading && icon && iconPosition === 'left' && (
          <span className="mr-2">{icon}</span>
        )}
        
        {children}
        
        {!isLoading && icon && iconPosition === 'right' && (
          <span className="ml-2">{icon}</span>
        )}
      </button>
    );
  }
); 