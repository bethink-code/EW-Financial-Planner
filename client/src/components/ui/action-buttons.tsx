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
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size={size}
      variant={variant}
      className={cn(
        "flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground",
        isTableSize && children === undefined && "h-6 w-6 p-0 gap-0",
        className
      )}
    >
      <Plus className={isTableSize && children === undefined ? "h-3 w-3" : "h-4 w-4"} />
      {children || (isTableSize ? "" : "Add")}
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
  const isTableSize = size === "sm";
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size={size}
      variant="destructive"
      className={cn(
        "flex items-center gap-1",
        isTableSize && "h-6 w-6 p-0",
        className
      )}
    >
      <Trash2 className={isTableSize ? "h-3 w-3" : "h-4 w-4"} />
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
  const isTableSize = size === "sm";
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size={size}
      variant="ghost"
      className={cn(
        "flex items-center gap-1 bg-white text-primary hover:text-primary hover:bg-blue-50 border border-primary",
        isTableSize && "h-6 w-6 p-0",
        className
      )}
    >
      <Copy className={isTableSize ? "h-3 w-3" : "h-4 w-4"} />
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
  const isTableSize = size === "sm";
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size={size}
      variant="ghost"
      className={cn(
        "flex items-center gap-1 text-neutral-600 hover:text-neutral-900",
        isTableSize && "h-6 w-6 p-0",
        className
      )}
    >
      <Edit3 className={isTableSize ? "h-3 w-3" : "h-4 w-4"} />
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
  const isTableSize = size === "sm";
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size={size}
      variant="default"
      className={cn(
        "flex items-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground",
        isTableSize && "h-6 w-6 p-0",
        className
      )}
    >
      <Save className={isTableSize ? "h-3 w-3" : "h-4 w-4"} />
      {!isTableSize && "Save"}
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