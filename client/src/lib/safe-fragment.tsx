import React from 'react';

// SafeFragment utility to prevent React metadata warnings
export function SafeFragment({ children, ...props }: { children: React.ReactNode, [key: string]: any }) {
  // Only pass valid React.Fragment props (key and children)
  const { key } = props;
  return <React.Fragment key={key}>{children}</React.Fragment>;
}