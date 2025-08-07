import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

/**
 * Enhanced Button component with built-in loading state
 * Shows spinner and optional loading text when loading prop is true
 */
export function LoadingButton({ 
  loading = false, 
  loadingText, 
  children, 
  disabled, 
  ...props 
}: LoadingButtonProps) {
  return (
    <Button 
      disabled={disabled || loading} 
      {...props}
    >
      {loading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {loading && loadingText ? loadingText : children}
    </Button>
  );
}