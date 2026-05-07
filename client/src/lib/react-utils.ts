import React from "react";

/**
 * Safe React Fragment that filters out metadata props to prevent warnings.
 * Dev tooling sometimes injects non-standard props that React.Fragment rejects.
 */
export function SafeFragment({ children, ...props }: { children: React.ReactNode } & Record<string, any>) {
  const safeProps = Object.fromEntries(
    Object.entries(props).filter(([key]) =>
      key === 'key' || key === 'children'
    )
  );

  return React.createElement(React.Fragment, safeProps, children);
}
