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
      {/* Placeholder for unbuilt section */}
      <div className="w-full bg-gray-100 border-b border-gray-200 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">?</span>
              </div>
              <div className="text-gray-600">
                <h3 className="text-lg font-medium text-gray-900">Financial Planning Dashboard</h3>
                <p className="text-sm text-gray-500">This section will contain client overview, progress tracking, and summary metrics</p>
              </div>
              <div className="ml-auto">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
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