import { ClientHeader } from "@/components/navigation/client-header";

/**
 * Client header band — the strip at the very top of every needs workspace.
 * Delegates to the shared responsive ClientHeader (identity card + section
 * menu strip) with "Financial planning" active, since the needs workspaces
 * are part of the financial planning section.
 */
export function ClientCard() {
  return (
    <section className="w-full" aria-label="Client card">
      <ClientHeader active="financial-planning" />
    </section>
  );
}
