import React from "react";
import { useLocation } from "wouter";
import { ConsolidatedNavigation } from "./consolidated-navigation";
import { SectionTabs } from "./section-tabs";
import { needs } from "@shared/navigation-config";

interface NavigationLayoutProps {
  children: React.ReactNode;
}

export function NavigationLayout({ children }: NavigationLayoutProps) {
  const [location] = useLocation();
  
  // For now, we're only working with "Death with estate liquidity"
  const currentNeed = needs.find(n => n.id === "death-estate-liquidity");
  
  if (!currentNeed || !currentNeed.steps) {
    return <>{children}</>;
  }
  
  // Determine current step based on URL
  const currentStep = currentNeed.steps.find(step => 
    location.includes(step.path) || 
    step.sections?.some(section => 
      location.includes(section.path) ||
      section.children?.some(child => location.includes(child.path))
    )
  ) || currentNeed.steps[1]; // Default to Build step
  
  // Get sections for current step
  const sections = currentStep.sections || [];
  
  // Transform sections to tabs format
  const tabs = sections.map(section => ({
    id: section.id,
    label: section.label,
    path: section.path,
    hasContent: section.hasContent,
    children: section.children?.map(child => ({
      id: child.id,
      label: child.label,
      path: child.path,
      hasContent: child.hasContent
    }))
  }));
  
  // Find the active section based on current location
  const activeSection = sections.find(section => 
    location.includes(section.path) ||
    section.children?.some(child => location.includes(child.path))
  );
  
  // Get sub-tabs if the active section has children
  const subTabs = activeSection?.children?.map(child => ({
    id: child.id,
    label: child.label,
    path: child.path,
    hasContent: child.hasContent
  })) || [];
  
  // Mark Setup as complete since we have content there
  const stepsWithStatus = currentNeed.steps.map(step => ({
    ...step,
    isComplete: step.id === "setup"
  }));
  
  return (
    <>
      <ConsolidatedNavigation 
        currentNeed={currentNeed}
        currentStep={currentStep}
        stepsWithStatus={stepsWithStatus}
        sections={sections}
      />
      {children}
    </>
  );
}