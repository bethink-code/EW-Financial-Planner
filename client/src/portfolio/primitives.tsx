import { cn } from "@/lib/utils";
import type { Tone } from "./data";

/**
 * Small visual primitives for the portfolio concept deck, mapped onto the
 * financial-planning design language (EW tokens; sentence case throughout).
 */

/** Tone → solid colour (dots, bars, coloured value text). */
export const TONE_COLOR: Record<Tone, string> = {
  good: "#1DB247",
  warn: "#EA8A2E",
  bad: "#E4410D",
  neutral: "#828282",
};

/** Tone → tinted background/border pairs (pills, strips, flags). */
export const TONE_TINT: Record<
  Tone,
  { bg: string; border: string; text: string }
> = {
  good: { bg: "#C3F1C8", border: "#A9E5B0", text: "#157A38" },
  warn: { bg: "#FDF0E0", border: "#F2DFC4", text: "#B26205" },
  bad: { bg: "#FFE2D9", border: "#F8CDC0", text: "#E4410D" },
  neutral: { bg: "#E6F0F5", border: "#D0E5F0", text: "#4B5563" },
};

export function FreshnessDot({ tone, title }: { tone: Tone; title?: string }) {
  return (
    <span
      title={title}
      className="inline-block h-2 w-2 shrink-0 rounded-full"
      style={{ backgroundColor: TONE_COLOR[tone] }}
    />
  );
}

/** Status as a tiny card (border + tone dot) — EW doesn't use pill badges. */
export function StatusCard({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border bg-white px-2 py-1 text-xs font-medium text-neutral-700"
      style={{ borderColor: "var(--ew-border)" }}
    >
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: TONE_COLOR[tone] }}
      />
      {label}
    </span>
  );
}

export function ProgressBar({
  pct,
  tone,
  className,
}: {
  pct: number;
  tone: Tone;
  className?: string;
}) {
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full", className)}
      style={{ backgroundColor: "#E6F0F5" }}
    >
      <div
        className="h-full rounded-full"
        style={{ width: `${pct}%`, backgroundColor: TONE_COLOR[tone] }}
      />
    </div>
  );
}

export function SectionHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn("text-sm font-bold", className)}
      style={{ color: "var(--ew-blue)" }}
    >
      {children}
    </h2>
  );
}

export function KpiTile({
  label,
  value,
  foot,
  accent,
}: {
  label: string;
  value: string;
  foot: string;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-lg border px-4 py-4"
      style={
        accent
          ? { backgroundColor: "#FAF5EA", borderColor: "#ECE5D3" }
          : {
              backgroundColor: "#F4F8FB",
              borderColor: "var(--ew-blue-tertiary-50)",
            }
      }
    >
      <div
        className="text-sm font-medium"
        style={{ color: accent ? "#A55A2A" : "var(--ew-blue)" }}
      >
        {label}
      </div>
      <div className="mt-1 text-[22px] font-semibold tabular-nums text-neutral-900">
        {value}
      </div>
      <div className="mt-0.5 text-xs text-gray-500">{foot}</div>
    </div>
  );
}

/** Conic-gradient readiness ring — tangerine below 70%, green at or above. */
export function ReadinessRing({ pct }: { pct: number }) {
  const color = pct >= 70 ? TONE_COLOR.good : TONE_COLOR.warn;
  return (
    <div
      className="flex h-[74px] w-[74px] shrink-0 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(${color} ${pct * 3.6}deg, #E6F0F5 0deg)`,
      }}
    >
      <div className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-white text-sm font-semibold tabular-nums text-neutral-900">
        {pct}%
      </div>
    </div>
  );
}
