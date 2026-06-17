import { ChevronDown } from "lucide-react";
import { PanelButton } from "./panel-shell";

/**
 * Content-area patterns from the EW "Final Wireframe" page: the section
 * header (a "Total X" metric + a filter dropdown) and the soft "Something
 * missing?" gap nudge. Shared so every concept's content area reads the same.
 */

export interface FilterConfig {
  label?: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

export function ContentHeader({
  label,
  value,
  filter,
}: {
  label: string;
  value: string;
  filter?: FilterConfig;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="text-[13px] text-gray-500">{label}</div>
        <div className="mt-0.5 text-3xl font-semibold tabular-nums text-neutral-900">
          {value}
        </div>
      </div>
      {filter && (
        <div className="w-[260px] max-w-[45%]">
          {filter.label && (
            <label className="block text-[13px] text-gray-500">
              {filter.label}
            </label>
          )}
          <div className="relative mt-1">
            <select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="h-10 w-full appearance-none rounded-md border border-[#E0E0E0] bg-white pl-3 pr-9 text-sm text-neutral-900 focus:border-[var(--ew-blue)] focus:outline-none"
            >
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * The "Something missing?" panel — EW's gentle, inform-never-block treatment
 * for gaps: a dashed amber box stating possible reasons and offering a
 * conversation rather than a hard error.
 */
export function SomethingMissing({
  title = "Something missing?",
  reasons,
  note,
  actions,
}: {
  title?: string;
  reasons: string[];
  note?: string;
  actions: { label: string; primary?: boolean; onClick?: () => void }[];
}) {
  return (
    <div
      className="mt-6 flex flex-wrap items-start gap-x-8 gap-y-4 rounded-lg border border-dashed px-5 py-4"
      style={{ backgroundColor: "#FBF6EF", borderColor: "#E7D4B5" }}
    >
      <div className="text-sm font-semibold" style={{ color: "#B26205" }}>
        {title}
      </div>
      <div className="min-w-[220px] flex-1 text-[13px] leading-relaxed text-neutral-700">
        <div>It could be because:</div>
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          {reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
        {note && <p className="mt-3">{note}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <PanelButton
            key={action.label}
            ghost={!action.primary}
            onClick={action.onClick}
          >
            {action.label}
          </PanelButton>
        ))}
      </div>
    </div>
  );
}
