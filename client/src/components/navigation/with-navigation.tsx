import React from "react";
import { NavigationLayout } from "./navigation-layout";

export function withNavigation<P = {}>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function WithNavigationComponent(props: P) {
    return (
      <NavigationLayout>
        <Component {...props} />
      </NavigationLayout>
    );
  };
}