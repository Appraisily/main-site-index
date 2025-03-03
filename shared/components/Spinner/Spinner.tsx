import React from 'react';
import { twMerge } from 'tailwind-merge';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';

export interface SpinnerProps {
  /** Size of the spinner */
  size?: SpinnerSize;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Spinner component for loading states
 */
export const Spinner = ({ size = 'md', className }: SpinnerProps) => {
  // Size-based dimensions
  const sizeStyles = {
    xs: 'w-3 h-3 border-[1.5px]',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-[3px]',
  };

  const spinnerStyles = twMerge(
    'inline-block rounded-full border-current border-r-transparent animate-spin text-inherit opacity-75',
    sizeStyles[size],
    className
  );

  return (
    <div role="status" aria-live="polite">
      <div className={spinnerStyles} />
      <span className="sr-only">Loading...</span>
    </div>
  );
}; 