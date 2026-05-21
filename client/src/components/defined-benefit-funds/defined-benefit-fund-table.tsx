import React from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DefinedBenefitFund, InsertDefinedBenefitFund } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { HybridViewWrapper } from "@/components/common/hybrid-view-wrapper";
import { HybridHeaderBar } from "@/components/common/hybrid-header-bar";
import { HybridSidebar } from "@/components/common/hybrid-sidebar";
import { DefinedBenefitFundDetailForm } from "./defined-benefit-fund-detail-form";
import { DefinedBenefitFundsSummary } from "./defined-benefit-funds-summary";

interface DefinedBenefitFundTableProps {
  onAddFund?: () => void;
  /** Hide the section summary band — used on Retirement routes where the
   *  phase-level projection ribbon already covers these stats. */
  showSummary?: boolean;
}

export function DefinedBenefitFundTable({
  onAddFund,
  showSummary = true,
}: DefinedBenefitFundTableProps) {
  const [location] = useLocation();
  const isRetirementNeed = location.startsWith("/needs/retirement");
  const [selectedFundId, setSelectedFundId] = React.useState<number | null>(
    null
  );

  const { data: funds = [], isLoading } = useQuery<DefinedBenefitFund[]>({
    queryKey: ["/api/defined-benefit-funds"],
  });

  React.useEffect(() => {
    if (funds.length > 0 && selectedFundId === null) {
      setSelectedFundId(funds[0].id);
    }
  }, [funds, selectedFundId]);

  const deleteMutation = useMutation({
    mutationFn: async (id: number) =>
      apiRequest("DELETE", `/api/defined-benefit-funds/${id}`),
    onSuccess: (_, id) => {
      if (id === selectedFundId) setSelectedFundId(null);
      queryClient.invalidateQueries({
        queryKey: ["/api/defined-benefit-funds"],
      });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (source: DefinedBenefitFund) => {
      const { id, ...rest } = source;
      const copy: InsertDefinedBenefitFund = {
        ...rest,
        description: source.description ? `${source.description} (Copy)` : "",
      };
      return apiRequest("POST", "/api/defined-benefit-funds", copy);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/defined-benefit-funds"],
      });
    },
  });

  const handleDelete = (id: number) => {
    if (
      window.confirm("Delete this defined benefit fund? This cannot be undone.")
    ) {
      deleteMutation.mutate(id);
    }
  };

  const handleDuplicate = (fund: DefinedBenefitFund) => {
    duplicateMutation.mutate(fund);
  };

  const isUpdating = deleteMutation.isPending || duplicateMutation.isPending;

  const selectedFund = selectedFundId
    ? funds.find((f) => f.id === selectedFundId) ?? null
    : null;

  const fundIndex = (f: DefinedBenefitFund) =>
    funds.findIndex((x) => x.id === f.id);
  const titleFor = (f: DefinedBenefitFund) =>
    f.description?.trim() || `Fund ${fundIndex(f) + 1}`;

  const summaryCards = (
    <HybridSidebar
      items={funds}
      selectedId={selectedFundId}
      onSelect={setSelectedFundId}
      getId={(f) => f.id}
      getTitle={titleFor}
      renderActive={(f) => {
        const owners = (f.owners || []).filter((o) => o?.trim());
        const lines: string[] = [];
        if (owners.length > 0) lines.push(`Owners: ${owners.join(", ")}`);
        if (isRetirementNeed) {
          // Retirement view — surface savings/income context, not estate
          // figures.
          if (f.finalMonthlySalary && f.finalMonthlySalary !== "R 0") {
            lines.push(`Monthly income: ${f.finalMonthlySalary}`);
          }
          if (f.growthRate) lines.push(`Growth: ${f.growthRate}`);
          return {
            subtitle: lines.join("\n") || "No details entered",
            primaryValue: f.additionalTaxFreeAmount || "R 0",
          };
        }
        if (f.yearsOfService) lines.push(`Service: ${f.yearsOfService}`);
        return {
          subtitle: lines.join("\n") || "No details entered",
          primaryValue: f.deathLumpSum || "R 0",
          secondaryInfo:
            f.pensionIncomeAmount && f.pensionIncomeAmount !== "R 0"
              ? `Pension: ${f.pensionIncomeAmount}`
              : undefined,
        };
      }}
    />
  );

  const detailForms = selectedFund ? (
    <DefinedBenefitFundDetailForm
      key={`form-${selectedFund.id}-${selectedFund.owners?.length ?? 0}`}
      fund={selectedFund}
    />
  ) : null;

  if (isLoading) {
    return (
      <div className="text-center py-4">Loading defined benefit funds...</div>
    );
  }

  // Section summary: DB Funds feed into `Surplus capital` only (not into
  // Voluntary or Income surplus rows), so a per-tab total here is
  // misleading. Hide on Retirement routes; DEL keeps its existing aggregate
  // summary when showSummary is on.
  const sectionSummary = isRetirementNeed ? undefined : showSummary ? (
    <DefinedBenefitFundsSummary />
  ) : undefined;

  return (
    <HybridViewWrapper
      summary={sectionSummary}
      header={
        <HybridHeaderBar
          add={
            onAddFund ? { label: "Add Fund", onClick: onAddFund } : undefined
          }
          title={selectedFund?.description}
          emptyTitle={selectedFund ? "Untitled Fund" : undefined}
          onDuplicate={
            selectedFund ? () => handleDuplicate(selectedFund) : undefined
          }
          onDelete={
            selectedFund ? () => handleDelete(selectedFund.id) : undefined
          }
          disabled={isUpdating}
        />
      }
      summaryCards={summaryCards}
      detailForms={detailForms}
      isEmpty={funds.length === 0}
      emptyStateMessage="No defined benefit funds yet. Click 'Add Fund' to create your first fund."
    />
  );
}
