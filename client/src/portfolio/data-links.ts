/**
 * Goal↔product linkage for the Ben Meander demo. Invented for the prototype —
 * enforces the rule that every product shows its linked goals (View A) and every
 * goal shows its linked products (View B). Both directions are derived from this
 * single source of truth.
 */

export type ProductId =
  | "absa"
  | "pension"
  | "momentum"
  | "ut"
  | "liberty"
  | "myriad"
  | "oldmutual"
  | "discovery"
  | "santam";

export type GoalId =
  | "retirement"
  | "education"
  | "life-cover"
  | "medical"
  | "short-term"
  | "emergency";

/** Every product mapped to its linked goals. */
export const PRODUCT_GOALS: Record<ProductId, GoalId[]> = {
  absa: ["retirement"],
  pension: ["retirement"],
  momentum: ["retirement"],
  ut: ["education"],
  liberty: ["life-cover"],
  myriad: ["life-cover"],
  oldmutual: ["life-cover"],
  discovery: ["medical"],
  santam: ["short-term"],
};

export const GOAL_LABELS: Record<GoalId, string> = {
  retirement: "Retirement",
  education: "Education — Fudge",
  "life-cover": "Life cover",
  medical: "Medical aid",
  "short-term": "Short-term insurance",
  emergency: "Emergency fund",
};

/** Returns the goal label chips for a given product. */
export function productGoalLabels(productId: ProductId): string[] {
  return (PRODUCT_GOALS[productId] ?? []).map((g) => GOAL_LABELS[g]);
}

/** Returns the product IDs linked to a given goal. */
export function goalProducts(goalId: GoalId): ProductId[] {
  return (Object.entries(PRODUCT_GOALS) as [ProductId, GoalId[]][])
    .filter(([, goals]) => goals.includes(goalId))
    .map(([id]) => id);
}
