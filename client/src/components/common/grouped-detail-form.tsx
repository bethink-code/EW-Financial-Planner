import React from 'react';

interface FieldGroupProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * FieldGroup - A visual grouping component for related form fields
 * Maintains the logical structure from table headers without accordion functionality
 */
export function FieldGroup({ title, children, className = "" }: FieldGroupProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-sm font-medium text-neutral-700 uppercase tracking-wide border-b border-neutral-200 pb-1">
        {title}
      </h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}

/**
 * FormField - A consistent field layout component
 */
export function FormField({ label, children, className = "", required = false }: FormFieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-neutral-600">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

interface GroupedDetailFormProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * GroupedDetailForm - Container for grouped form sections
 * Provides consistent spacing and layout for detail forms in hybrid view
 */
export function GroupedDetailForm({ children, className = "" }: GroupedDetailFormProps) {
  return (
    <div className={`space-y-12 p-6 bg-white border-t border-b border-r border-neutral-200 ${className}`}>
      {children}
    </div>
  );
}