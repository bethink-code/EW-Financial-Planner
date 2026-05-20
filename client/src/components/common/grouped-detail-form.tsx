import React from 'react';

interface FieldGroupProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * FieldGroup — section heading per the EW Figma reference: flat brand-blue
 * uppercase title on white, with a thin EW border underneath spanning the
 * full content width. No tinted pill, no rounded corners.
 */
export function FieldGroup({ title, children, className = "" }: FieldGroupProps) {
  return (
    <div className={`space-y-5 ${className}`}>
      <h3
        className="text-sm font-bold uppercase pb-2 w-fit"
        style={{
          color: "var(--ew-blue)",
          letterSpacing: "0.06em",
          borderBottom: "1px solid var(--ew-border)",
        }}
      >
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
 * FormField — label + child input. Label is navy weight-500 to feel intentional.
 */
export function FormField({ label, children, className = "", required = false }: FormFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label
        className="block text-sm font-medium"
        style={{ color: "var(--ew-primary-navy)" }}
      >
        {label}
        {required && <span className="ml-1" style={{ color: "var(--ew-negative-symbol)" }}>*</span>}
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
 * GroupedDetailForm — container for grouped detail-form sections.
 * Uses generous vertical spacing to match the rest of the EW visual language.
 */
export function GroupedDetailForm({ children, className = "" }: GroupedDetailFormProps) {
  return (
    <div className={`space-y-10 px-6 pt-6 pb-16 bg-white ${className}`}>
      {children}
    </div>
  );
}

