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
 * Add new item button with simple inline styling
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
  
  // Small table icon button - Light blue background with dark blue icon (32px)
  if (isTableSize && !children) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "h-8 w-8 bg-[#E8F3F8] border border-[#E0E0E0] text-[#016991] hover:bg-[#D1E7F0] rounded-md flex items-center justify-center transition-colors",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <Plus className="h-4 w-4" />
      </button>
    );
  }
  
  // Larger button with text
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-4 py-2 bg-[#016991] text-white hover:bg-[#014f73] rounded-md flex items-center gap-2 transition-colors",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <Plus className="h-4 w-4" />
      {children || "Add"}
    </button>
  );
}

/**
 * Delete item button with simple inline styling
 */
export function DeleteButton({ 
  onClick, 
  disabled = false, 
  className,
  size = "sm" 
}: Omit<ActionButtonProps, 'variant'>) {
  const isTableSize = size === "sm";
  
  // Small table icon button - White background with gray icon (32px)
  if (isTableSize) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "h-8 w-8 bg-white border border-[#E0E0E0] text-gray-600 hover:bg-gray-50 rounded-md flex items-center justify-center transition-colors",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    );
  }
  
  // Larger destructive button
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md flex items-center gap-2 transition-colors",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <Trash2 className="h-4 w-4" />
      <span>Delete</span>
    </button>
  );
}

/**
 * Duplicate item button with simple inline styling
 */
export function DuplicateButton({ 
  onClick, 
  disabled = false, 
  className,
  size = "sm" 
}: Omit<ActionButtonProps, 'variant'>) {
  const isTableSize = size === "sm";
  
  // Small table icon button - White background with gray icon (32px)
  if (isTableSize) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "h-8 w-8 bg-white border border-[#E0E0E0] text-gray-600 hover:bg-gray-50 rounded-md flex items-center justify-center transition-colors",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <Copy className="h-4 w-4" />
      </button>
    );
  }
  
  // Larger secondary button
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-4 py-2 bg-white border border-[#E0E0E0] text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-2 transition-colors",
        disabled && "opacity-50 cursor-not-allowed",
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
  
  // Small table icon button - White background with gray icon (32px)
  if (isTableSize) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "h-8 w-8 bg-white border border-[#E0E0E0] text-gray-600 hover:bg-gray-50 rounded-md flex items-center justify-center transition-colors",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <Edit3 className="h-4 w-4" />
      </button>
    );
  }
  
  // Larger secondary button
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-4 py-2 bg-white border border-[#E0E0E0] text-gray-700 hover:bg-gray-50 rounded-md flex items-center gap-2 transition-colors",
        disabled && "opacity-50 cursor-not-allowed",
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
  
  // Small table icon button - Light blue background with dark blue icon (32px)
  if (isTableSize) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "h-8 w-8 bg-[#E8F3F8] border border-[#E0E0E0] text-[#016991] hover:bg-[#D1E7F0] rounded-md flex items-center justify-center transition-colors",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        <Save className="h-4 w-4" />
      </button>
    );
  }
  
  // Larger primary button
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-4 py-2 bg-[#016991] text-white hover:bg-[#014f73] rounded-md flex items-center gap-2 transition-colors",
        disabled && "opacity-50 cursor-not-allowed",
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