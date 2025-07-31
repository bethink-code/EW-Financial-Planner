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
      {/* Client Header Section */}
      <div className="w-full bg-[#B8D4E3] border-b border-gray-200">
        <div className="px-4 py-3">
          {/* Client Info Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-6 w-6 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs">📊</span>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Donald Edward</h1>
                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                    <span>Demo/112345</span>
                    <span>/</span>
                    <span>Client</span>
                    <span>/</span>
                    <span>Client's company</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-700">
                52 years old / Married ANC with accrual
              </div>
              <button className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800">
                <span>Related entities</span>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">
                Choose another client
              </button>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm">
                New client
              </button>
              <button className="text-gray-500 hover:text-gray-700 p-1">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Navigation Tabs Row */}
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-blue-600 hover:text-blue-800 pb-1">Home</a>
            <a href="#" className="text-blue-600 hover:text-blue-800 pb-1">Activity dashboard</a>
            <a href="#" className="text-blue-600 hover:text-blue-800 pb-1">Work portal</a>
            <a href="#" className="text-blue-600 hover:text-blue-800 pb-1">Client info</a>
            <a href="#" className="text-blue-600 hover:text-blue-800 pb-1">Portfolio</a>
            <a href="#" className="text-blue-600 hover:text-blue-800 pb-1">Assets and liabilities</a>
            <a href="#" className="text-blue-600 hover:text-blue-800 pb-1">Budget</a>
            <a href="#" className="text-blue-600 hover:text-blue-800 pb-1 border-b-2 border-blue-600 font-medium">Financial planning</a>
            <a href="#" className="text-blue-600 hover:text-blue-800 pb-1">Bna</a>
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