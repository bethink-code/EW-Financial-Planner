import React from "react";

export interface OutcomeItem {
  label: string;
  value: React.ReactNode;
}

interface FieldGroupProps {
  title: string;
  children: React.ReactNode;
  outcomes?: OutcomeItem[];
  className?: string;
}

export function FieldGroup({
  title,
  children,
  outcomes,
  className = "",
}: FieldGroupProps) {
  return (
    <div className={className}>
      <h3
        className="text-sm font-bold pb-2 w-fit ml-6"
        style={{
          color: "var(--ew-blue)",
        }}
      >
        {title}
      </h3>
      <div className="rounded-lg p-6" style={{ backgroundColor: "#F4F8FB" }}>
        <div className="space-y-4">{children}</div>
        {outcomes && outcomes.length > 0 && (
          <div className="mt-6 flex gap-3 flex-wrap">
            {outcomes.map((item, i) => (
              <div
                key={i}
                className="rounded-md px-4 py-3 flex-1 min-w-[140px] max-w-[220px]"
                style={{ backgroundColor: "#E5ECF3" }}
              >
                <div
                  className="text-xs font-medium"
                  style={{ color: "var(--ew-primary-navy)", opacity: 0.7 }}
                >
                  {item.label}
                </div>
                <div
                  className="text-base font-semibold mt-0.5"
                  style={{ color: "var(--ew-primary-navy)" }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        )}
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
export function FormField({
  label,
  children,
  className = "",
  required = false,
}: FormFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label
        className="block text-sm font-medium"
        style={{ color: "var(--ew-primary-navy)" }}
      >
        {label}
        {required && (
          <span className="ml-1" style={{ color: "var(--ew-negative-symbol)" }}>
            *
          </span>
        )}
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
export function GroupedDetailForm({
  children,
  className = "",
}: GroupedDetailFormProps) {
  return (
    <div className={`space-y-10 px-6 pt-6 pb-16 bg-white ${className}`}>
      {children}
    </div>
  );
}
