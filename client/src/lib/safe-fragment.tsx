import React from 'react';

// SafeFragment utility to prevent React metadata warnings
export function SafeFragment({ children, key, ...props }: { children: React.ReactNode, key?: any } & Record<string, any>) {
  // Filter out any non-standard props that could cause warnings
  const safeProps = Object.fromEntries(
    Object.entries({ key, ...props }).filter(([key]) => 
      key === 'key' || key === 'children'
    )
  );
  
  return React.createElement(React.Fragment, safeProps, children);
}