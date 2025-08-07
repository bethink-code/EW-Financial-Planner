import React, { useEffect, useState } from 'react';
import { useLoading } from '@/contexts/loading-context';

/**
 * Global loading bar that appears at the top of the page during CRUD operations
 * Uses a smooth progress animation similar to GitHub/YouTube loading indicators
 */
export function GlobalLoadingBar() {
  const { isLoading } = useLoading();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

    if (isLoading) {
      // Show the bar immediately
      setVisible(true);
      setProgress(20);

      // Gradually increase progress
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) {
            return prev + Math.random() * 10;
          }
          return prev;
        });
      }, 200);

      // Hide after a delay if loading state doesn't clear
      timeout = setTimeout(() => {
        if (isLoading) {
          setProgress(90);
        }
      }, 5000);
    } else {
      // Complete the progress bar
      setProgress(100);
      
      // Hide after animation completes
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 200);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
    };
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div 
        className="h-1 bg-primary transition-all duration-200 ease-out"
        style={{ 
          width: `${progress}%`,
          background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(198, 99%, 25%))',
          boxShadow: '0 0 10px hsla(var(--primary), 0.5)'
        }}
      />
    </div>
  );
}