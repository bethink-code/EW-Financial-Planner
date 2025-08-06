import React from 'react';

// SafeFragment utility to prevent React metadata warnings
// This component simply renders React.Fragment without trying to access the key prop
export function SafeFragment({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}