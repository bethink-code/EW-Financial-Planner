import React from "react";
import { useLocation } from "wouter";
import { ConsolidatedNavigation } from "./consolidated-navigation";
import { SectionTabs } from "./section-tabs";
import { SequentialNavigationBar } from "./sequential-navigation-bar";
import { needs } from "@shared/navigation-config";
import headerImage from "@assets/EW Header_1753945516780.png";

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
  
  // Determine current step based on URL with better calculator route matching
  const currentStep = currentNeed.steps.find(step => {
    // Direct path match
    if (location.includes(step.path)) return true;
    
    // Check sections
    if (step.sections?.some(section => {
      if (location.includes(section.path)) return true;
      // Check children
      if (section.children?.some(child => location.includes(child.path))) return true;
      return false;
    })) return true;
    
    // Special case for setup step - check if we're on any setup-related pages
    if (step.id === 'setup' && (
      location === '/client-details' || 
      location.includes('/residue') || 
      location.includes('/additional-estate-duty-items')
    )) return true;
    
    // Special case for build step - check if we're on any calculator pages
    if (step.id === 'build' && (
      location === '/assurance' ||
      location === '/new-retirement-funds' ||
      location === '/defined-benefit-funds' ||
      location === '/voluntary-investments' ||
      location === '/assets' ||
      location === '/liabilities' ||
      location === '/income-needs' ||
      location === '/lump-sum-bequests' ||
      location === '/income-provisions'
    )) return true;
    
    return false;
  }) || currentNeed.steps[1]; // Default to Build step
  
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
      {/* Client Header Image */}
      <div className="w-full overflow-x-auto">
        <div className="pl-6">
          <img 
            src={headerImage} 
            alt="Client Header - Donald Edward" 
            className="block"
            style={{ width: 'auto', height: 'auto' }}
          />
        </div>
      </div>
      
      <ConsolidatedNavigation 
        currentNeed={currentNeed}
        currentStep={currentStep}
        stepsWithStatus={stepsWithStatus}
        sections={sections}
        planId="1"
      />
      
      {/* Main content with bottom padding to avoid overlap with fixed navigation bar */}
      <div style={{ paddingBottom: '80px' }}>
        {children}
      </div>
      
      {/* Sequential Navigation Bar */}
      <SequentialNavigationBar />
    </>
  );
}