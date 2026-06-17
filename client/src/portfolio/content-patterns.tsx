import { PanelButton } from "./panel-shell";
import { SegmentedControl } from "./view";

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
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <div className="text-[13px] text-gray-500">{label}</div>
        <div className="mt-0.5 text-3xl font-semibold tabular-nums text-neutral-900">
          {value}
        </div>
      </div>
      {filter && (
        <SegmentedControl
          label={filter.label}
          options={filter.options}
          value={filter.value}
          onChange={filter.onChange}
        />
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
