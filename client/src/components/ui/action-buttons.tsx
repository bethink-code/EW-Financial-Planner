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
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size={size}
      variant={variant}
      className={cn(
        "flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground",
        className
      )}
    >
      <Plus className="h-4 w-4" />
      {children || "Add"}
    </Button>
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
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size={size}
      variant="destructive"
      className={cn(
        "flex items-center gap-1",
        className
      )}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
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
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size={size}
      variant="ghost"
      className={cn(
        "flex items-center gap-1 bg-white text-primary hover:text-primary hover:bg-blue-50 border border-primary",
        className
      )}
    >
      <Copy className="h-4 w-4" />
    </Button>
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
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size={size}
      variant="ghost"
      className={cn(
        "flex items-center gap-1 text-neutral-600 hover:text-neutral-900",
        className
      )}
    >
      <Edit3 className="h-4 w-4" />
    </Button>
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
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size={size}
      variant="default"
      className={cn(
        "flex items-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground",
        className
      )}
    >
      <Save className="h-4 w-4" />
      Save
    </Button>
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
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size={size}
      variant="ghost"
      className={cn(
        "flex items-center gap-1",
        className
      )}
    >
      <X className="h-4 w-4" />
      Cancel
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