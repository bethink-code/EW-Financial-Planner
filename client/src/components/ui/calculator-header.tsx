import { cn } from "@/lib/utils";

interface CalculatorHeaderProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Page card wrapper for calculator content — a white rounded-border card
 * around the children. The page title is announced by the step section tab
 * strip above (rendered by the framework `NeedLayout`), and the Add button
 * lives inside each hybrid editor's left sidebar. The historical title +
 * Add + Refresh band on this component is gone; the name is kept so call
 * sites read consistently.
 */
export function CalculatorHeader({ className = "", children }: CalculatorHeaderProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border border-neutral-200 pt-[30px] px-6 pb-6 space-y-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
