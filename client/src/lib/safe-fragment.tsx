import React from 'react';

// SafeFragment utility to prevent React metadata warnings
export function SafeFragment({ children, ...props }: { children: React.ReactNode, [key: string]: any }) {
  // Filter out any props that aren't 'key' or 'children'
  const safeProps: { key?: any } = {};
  if (props.key !== undefined) {
    safeProps.key = props.key;
  }
  
  return <React.Fragment {...safeProps}>{children}</React.Fragment>;
}