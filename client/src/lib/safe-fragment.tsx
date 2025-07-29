import React from 'react';

// SafeFragment utility to prevent React metadata warnings
export function SafeFragment({ children, key, ...rest }: { children: React.ReactNode, key?: any, [key: string]: any }) {
  // Filter out any props that aren't valid for React.Fragment
  const { 'data-replit-metadata': _, ...validProps } = rest;
  return <React.Fragment key={key}>{children}</React.Fragment>;
}