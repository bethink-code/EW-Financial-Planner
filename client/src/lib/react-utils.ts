import React from "react";

/**
 * Safe React Fragment that filters out metadata props to prevent warnings
 * This utility is needed because development tools may inject metadata props
 * that React Fragment doesn't accept
 */
export function SafeFragment({ children, ...props }: { children: React.ReactNode } & Record<string, any>) {
  // Filter out any non-standard props that could cause warnings
  const safeProps = Object.fromEntries(
    Object.entries(props).filter(([key]) => 
      key === 'key' || key === 'children'
    )
  );
  
  return React.createElement(React.Fragment, safeProps, children);
}

/**
 * Safe wrapper for table rows that handles metadata props
 */
export function SafeTableRow({ 
  children, 
  className,
  onClick,
  ...otherProps 
}: { 
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
} & Record<string, any>) {
  // Clean props to only include valid HTML attributes
  const validProps = {
    className,
    onClick,
    // Only include standard HTML tr attributes
    ...(otherProps.role && { role: otherProps.role }),
    ...(otherProps.id && { id: otherProps.id }),
    ...(otherProps['aria-label'] && { 'aria-label': otherProps['aria-label'] }),
  };

  return React.createElement('tr', validProps, children);
}

/**
 * Safe wrapper for table cells that handles metadata props
 */
export function SafeTableCell({ 
  children, 
  className,
  colSpan,
  ...otherProps 
}: { 
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
} & Record<string, any>) {
  // Clean props to only include valid HTML attributes
  const validProps = {
    className,
    colSpan,
    // Only include standard HTML td/th attributes
    ...(otherProps.role && { role: otherProps.role }),
    ...(otherProps.id && { id: otherProps.id }),
    ...(otherProps['aria-label'] && { 'aria-label': otherProps['aria-label'] }),
  };

  return React.createElement('td', validProps, children);
}