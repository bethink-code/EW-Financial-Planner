import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit3, Save, X, Copy } from "lucide-react";

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "lg" | "default" | "icon";
  variant?: "default" | "secondary" | "destructive" | "ghost";
  children?: React.ReactNode;
}

/**
 * Add new item button with consistent styling - Primary Blue
 */
export function AddButton({ 
  onClick, 
  disabled = false, 
  className,
  size = "sm",
  variant = "default",
  children
}: ActionButtonProps) {
  const isTableSize = size === "sm";
  
  // Use icon button blue for small sizes (table icons)
  if (isTableSize && !children) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "btn-icon-blue rounded-md",
          className
        )}
      >
        <Plus className="h-4 w-4" />
      </button>
    );
  }
  
  // Use primary button for larger sizes with text
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "btn-primary px-4 rounded-md flex items-center gap-2",
        className
      )}
    >
      <Plus className="h-4 w-4" />
      {children || "Add"}
    </button>
  );
}

/**
 * Delete item button with consistent styling
 */
export function DeleteButton({ 
  onClick, 
  disabled = false, 
  className,
  size = "sm" 
}: Omit<ActionButtonProps, 'variant'>) {
  const isTableSize = size === "sm";
  
  // Use icon button white for small sizes (matching duplicate button style)
  if (isTableSize) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "btn-icon-white rounded-md",
          className
        )}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    );
  }
  
  // Use destructive button for larger sizes
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "btn-destructive px-4 rounded-md flex items-center gap-2",
        className
      )}
    >
      <Trash2 className="h-4 w-4" />
      <span>Delete</span>
    </button>
  );
}

/**
 * Duplicate item button with consistent styling
 */
export function DuplicateButton({ 
  onClick, 
  disabled = false, 
  className,
  size = "sm" 
}: Omit<ActionButtonProps, 'variant'>) {
  const isTableSize = size === "sm";
  
  // Use icon button white for small sizes
  if (isTableSize) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "btn-icon-white rounded-md",
          className
        )}
      >
        <Copy className="h-4 w-4" />
      </button>
    );
  }
  
  // Use secondary button for larger sizes
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "btn-secondary px-4 rounded-md flex items-center gap-2",
        className
      )}
    >
      <Copy className="h-4 w-4" />
      <span>Duplicate</span>
    </button>
  );
}

/**
 * Edit button with consistent styling
 */
export function EditButton({ 
  onClick, 
  disabled = false, 
  className,
  size = "sm" 
}: Omit<ActionButtonProps, 'variant'>) {
  const isTableSize = size === "sm";
  
  // Use icon button white for small sizes
  if (isTableSize) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "btn-icon-white rounded-md",
          className
        )}
      >
        <Edit3 className="h-4 w-4" />
      </button>
    );
  }
  
  // Use secondary button for larger sizes
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "btn-secondary px-4 rounded-md flex items-center gap-2",
        className
      )}
    >
      <Edit3 className="h-4 w-4" />
      <span>Edit</span>
    </button>
  );
}

/**
 * Save button with consistent styling - Primary Blue
 */
export function SaveButton({ 
  onClick, 
  disabled = false, 
  className,
  size = "sm" 
}: Omit<ActionButtonProps, 'variant'>) {
  const isTableSize = size === "sm";
  
  // Use icon button blue for small sizes
  if (isTableSize) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "btn-icon-blue rounded-md",
          className
        )}
      >
        <Save className="h-4 w-4" />
      </button>
    );
  }
  
  // Use primary button for larger sizes
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "btn-primary px-4 rounded-md flex items-center gap-2",
        className
      )}
    >
      <Save className="h-4 w-4" />
      <span>Save</span>
    </button>
  );
}

/**
 * Cancel button with consistent styling
 */
export function CancelButton({ 
  onClick, 
  disabled = false, 
  className,
  size = "sm" 
}: Omit<ActionButtonProps, 'variant'>) {
  const isTableSize = size === "sm";
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size={size}
      variant="ghost"
      className={cn(
        "flex items-center gap-1",
        isTableSize && "h-6 w-6 p-0",
        className
      )}
    >
      <X className={isTableSize ? "h-3 w-3" : "h-4 w-4"} />
      {!isTableSize && "Cancel"}
    </Button>
  );
}

interface ActionButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Action button group with consistent spacing
 */
export function ActionButtonGroup({ children, className }: ActionButtonGroupProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {children}
    </div>
  );
}