import React from 'react';

// SafeFragment utility to prevent React metadata warnings
export function SafeFragment({ children, ...props }: { children: React.ReactNode } & Record<string, any>) {
  // Only allow 'key' prop for React.Fragment - filter out everything else including data-replit-metadata
  const cleanProps: Record<string, any> = {};
  
  // React.Fragment only accepts 'key' and 'children'
  if ('key' in props) {
    cleanProps.key = props.key;
  }
  
  return React.createElement(React.Fragment, cleanProps, children);
}