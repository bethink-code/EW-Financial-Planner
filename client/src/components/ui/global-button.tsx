import React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon-sm' | 'icon-md' | 'icon-lg';

interface GlobalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: React.ReactNode;
}

/**
 * GlobalButton - A button component that uses the global button style system
 * 
 * @example
 * // Primary button
 * <GlobalButton variant="primary" size="md">Save Changes</GlobalButton>
 * 
 * // Secondary button
 * <GlobalButton variant="secondary" size="sm">Cancel</GlobalButton>
 * 
 * // Icon button
 * <GlobalButton variant="ghost" size="icon-sm"><Plus /></GlobalButton>
 */
export function GlobalButton({
  variant = 'secondary',
  size = 'md',
  className,
  children,
  ...props
}: GlobalButtonProps) {
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    destructive: 'btn-destructive',
    ghost: 'btn-ghost'
  };

  const sizeClasses = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
    'icon-sm': 'btn-icon-sm',
    'icon-md': 'btn-icon-md',
    'icon-lg': 'btn-icon-lg'
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md transition-all',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * ButtonGroup - Container for grouped buttons
 * 
 * @example
 * <ButtonGroup>
 *   <GlobalButton variant="secondary">Option 1</GlobalButton>
 *   <GlobalButton variant="secondary">Option 2</GlobalButton>
 *   <GlobalButton variant="secondary">Option 3</GlobalButton>
 * </ButtonGroup>
 */
export function ButtonGroup({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('btn-group', className)}>
      {children}
    </div>
  );
}