import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { useLoading } from '@/contexts/loading-context';
import { useEffect, useMemo } from 'react';
import { nanoid } from 'nanoid';

/**
 * Enhanced mutation hook that automatically integrates with the global loading system
 * Provides the same API as useMutation but with automatic loading state management
 */
export function useLoadingMutation<TData, TError, TVariables, TContext>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>
) {
  const { startLoading, stopLoading } = useLoading();
  
  // Generate stable operation ID
  const operationId = useMemo(() => nanoid(8), []);

  const mutation = useMutation({
    ...options,
    onMutate: (...args) => {
      startLoading(operationId);
      return options.onMutate?.(...args);
    },
    onSuccess: (...args) => {
      stopLoading(operationId);
      return options.onSuccess?.(...args);
    },
    onError: (...args) => {
      stopLoading(operationId);
      return options.onError?.(...args);
    },
    onSettled: (...args) => {
      stopLoading(operationId);
      return options.onSettled?.(...args);
    }
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopLoading(operationId);
    };
  }, [operationId, stopLoading]);

  return mutation;
}