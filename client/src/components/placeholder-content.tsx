import React from "react";
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface PlaceholderContentProps {
  title: string;
}

export function PlaceholderContent({ title }: PlaceholderContentProps) {
  const [, setLocation] = useLocation();
  
  const handleBack = () => {
    // Navigate back to the main Death with estate liquidity need
    setLocation('/assurance');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Death with estate liquidity
        </Button>
        
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-3xl font-semibold text-gray-900 mb-4">{title}</h1>
            <p className="text-lg text-gray-600">Content to come</p>
          </div>
        </div>
      </div>
    </div>
  );
}