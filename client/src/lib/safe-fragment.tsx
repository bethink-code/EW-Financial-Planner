import React from 'react';

// SafeFragment utility to prevent React metadata warnings
export function SafeFragment({ children, key }: { children: React.ReactNode, key?: any }) {
  return <React.Fragment key={key}>{children}</React.Fragment>;
}