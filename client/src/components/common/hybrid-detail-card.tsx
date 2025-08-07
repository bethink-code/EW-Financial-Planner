import React from 'react';
import { ActionButtonGroup, DuplicateButton, DeleteButton } from "@/components/ui/action-buttons";

interface HybridDetailCardProps {
  title: string;
  onDuplicate?: () => void;
  onDelete?: () => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * HybridDetailCard - A reusable detail card component for the hybrid view right side
 * Provides consistent structure for detailed forms with action buttons
 */
export function HybridDetailCard({ 
  title, 
  onDuplicate, 
  onDelete, 
  children, 
  className = "" 
}: HybridDetailCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-neutral-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-800">{title}</h3>
        {(onDuplicate || onDelete) && (
          <ActionButtonGroup>
            {onDuplicate && <DuplicateButton onClick={onDuplicate} />}
            {onDelete && <DeleteButton onClick={onDelete} />}
          </ActionButtonGroup>
        )}
      </div>
      {children}
    </div>
  );
}

export default HybridDetailCard;