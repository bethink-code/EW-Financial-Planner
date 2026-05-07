/**
 * Generic types for a self-contained need module.
 *
 * Every financial-planning need (Death with estate liquidity, Retirement,
 * Permanent disability, etc.) declares a NeedConfig that this framework
 * consumes to render the chrome (top bar) and the action bar (Previous /
 * Next at the bottom). Pages live wherever the need wants — the framework
 * doesn't care.
 *
 * Two levels of nesting are supported:
 *  - step.sections          (e.g. Setup → Client details, Setup → Parameters)
 *  - section.children       (e.g. Setup → Parameters → Residue)
 *
 * Three levels deep is intentionally unsupported — flatten the deepest layer
 * into the parent if a need needs it.
 */

export interface NeedSubStep {
  id: string;
  label: string;
  path: string;
  /** Optional grandchildren for two-level-deep sub-steps (e.g. DEL Setup → Parameters → Residue). */
  children?: NeedSubStep[];
}

export interface NeedStep {
  id: string;
  number: number;
  label: string;
  /** The step's own URL — used when the chrome's step button is a flat link (no sections). */
  path: string;
  sections: NeedSubStep[];
}

export interface NeedConfig {
  /** Stable id, also used in URLs. e.g. "retirement", "death-estate-liquidity". */
  id: string;
  /** Display name for the chrome's NEED pill and the need-switcher dropdown. */
  label: string;
  /** Base URL for this need. Conventionally `/needs/<id>`. */
  basePath: string;
  steps: NeedStep[];
}

/**
 * One linear step in the action bar. Built by flattening a NeedConfig.
 */
export interface FlatNeedItem {
  step: NeedStep;
  section?: NeedSubStep;
  child?: NeedSubStep;
  path: string;
  breadcrumb: string;
}
