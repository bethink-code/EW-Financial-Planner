import React, { useCallback, useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { HybridViewWrapper } from "@/components/common/hybrid-view-wrapper";
import { HybridHeaderBar } from "@/components/common/hybrid-header-bar";
import { HybridSidebar } from "@/components/common/hybrid-sidebar";
import { FieldGroup, FormField, GroupedDetailForm } from "@/components/common/grouped-detail-form";
import { useDebouncedUpdate } from "@/hooks/use-debounced-update";
import { useRetirementProjection } from "@/hooks/use-retirement-projection";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrencyValue, formatPercentageValue, getValueClass, handleDefaultValueFocus } from "@/lib/formatting";
import type { FutureInflow, InsertFutureInflow } from "@shared/schema";

export default function FutureInflowsPage() {
  const [selectedInflowId, setSelectedInflowId] = useState<number | null>(null);

  const { data: inflows = [], isLoading } = useQuery<FutureInflow[]>({
    queryKey: ["/api/future-inflows"],
  });
  const { data: projection } = useRetirementProjection();

  useEffect(() => {
    if (inflows.length > 0 && selectedInflowId === null) {
      setSelectedInflowId(inflows[0].id);
    }
  }, [inflows, selectedInflowId]);

  const addMutation = useMutation({
    mutationFn: async () => {
      const newInflow: InsertFutureInflow = {
        description: "",
        entity: "Donald Edwards",
        startYearsAfterRetirement: 0,
        currentValue: "R 0",
        calculateCgt: false,
        growthRate: "10%",
      };
      return apiRequest("POST", "/api/future-inflows", newInflow);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/future-inflows"] }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<FutureInflow> }) =>
      apiRequest("PATCH", `/api/future-inflows/${id}`, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/future-inflows"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => apiRequest("DELETE", `/api/future-inflows/${id}`),
    onSuccess: (_, id) => {
      if (id === selectedInflowId) setSelectedInflowId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/future-inflows"] });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (source: FutureInflow) => {
      const { id, ...rest } = source;
      return apiRequest("POST", "/api/future-inflows", {
        ...rest,
        description: source.description ? `${source.description} (Copy)` : "",
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/future-inflows"] }),
  });

  const debouncedUpdate = useDebouncedUpdate(
    (id: number, field: keyof FutureInflow, value: string | number | boolean) => {
      updateMutation.mutate({ id, updates: { [field]: value } });
    },
  );

  const handleTextBlur = (id: number, field: keyof FutureInflow, value: string) => {
    let formatted: string = value;
    if (field === "currentValue") formatted = formatCurrencyValue(value);
    else if (field === "growthRate") formatted = formatPercentageValue(value);
    debouncedUpdate(id, field, formatted);
  };

  const handleNumberBlur = (id: number, field: keyof FutureInflow, value: string) => {
    debouncedUpdate(id, field, parseInt(value) || 0);
  };

  const handleCheckbox = (id: number, field: keyof FutureInflow, checked: boolean) => {
    updateMutation.mutate({ id, updates: { [field]: checked } });
  };

  const handleAdd = useCallback(() => addMutation.mutate(), [addMutation]);

  const handleDelete = (id: number) => {
    if (window.confirm("Delete this future inflow? This cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDuplicate = (inflow: FutureInflow) => {
    duplicateMutation.mutate(inflow);
  };

  const isUpdating = deleteMutation.isPending || duplicateMutation.isPending || addMutation.isPending;

  const selectedInflow = selectedInflowId
    ? inflows.find(i => i.id === selectedInflowId) ?? null
    : null;

  const formatRand = (n: number | undefined) =>
    formatCurrencyValue(Math.round(n ?? 0).toString());

  const inflowIndex = (i: FutureInflow) => inflows.findIndex(x => x.id === i.id);
  const titleFor = (i: FutureInflow) =>
    i.description?.trim() || `Inflow ${inflowIndex(i) + 1}`;

  const summaryCards = (
    <HybridSidebar
      items={inflows}
      selectedId={selectedInflowId}
      onSelect={setSelectedInflowId}
      getId={(i) => i.id}
      getTitle={titleFor}
      renderActive={(i) => {
        const lines: string[] = [];
        if (i.entity?.trim()) lines.push(`Entity: ${i.entity}`);
        lines.push(`Start: +${i.startYearsAfterRetirement} yrs`);
        return {
          subtitle: lines.join("\n"),
          primaryValue: i.currentValue || "R 0",
          secondaryInfo: i.growthRate ? `Growth: ${i.growthRate}` : undefined,
        };
      }}
    />
  );

  const detailForms = selectedInflow ? (() => {
    const proj = projection?.futureInflows.find(f => f.id === selectedInflow.id);
    return (
      <GroupedDetailForm>
        <div key={selectedInflow.id} className="space-y-10">
          <FieldGroup title="Overview">
            <div className="flex gap-3 flex-wrap items-end">
              <FormField label="Name">
                <input
                  type="text"
                  defaultValue={selectedInflow.description}
                  className={`table-input ${getValueClass(selectedInflow.description, "text")}`}
                  style={{ minWidth: "240px" }}
                  onBlur={(e) => handleTextBlur(selectedInflow.id, "description", e.target.value)}
                />
              </FormField>
              <FormField label="Entity">
                <input
                  type="text"
                  defaultValue={selectedInflow.entity}
                  className={`table-input ${getValueClass(selectedInflow.entity, "text")}`}
                  style={{ minWidth: "180px" }}
                  onBlur={(e) => handleTextBlur(selectedInflow.id, "entity", e.target.value)}
                />
              </FormField>
            </div>
          </FieldGroup>

          <FieldGroup title="Inflow details">
            <div className="flex gap-3 flex-wrap items-end">
              <FormField label="Current value">
                <input
                  type="text"
                  defaultValue={selectedInflow.currentValue || "R 0"}
                  className={`table-input ${getValueClass(selectedInflow.currentValue, "currency")}`}
                  style={{ minWidth: "140px" }}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleTextBlur(selectedInflow.id, "currentValue", e.target.value)}
                />
              </FormField>
              <FormField label="Start (yrs after retirement)">
                <input
                  type="number"
                  defaultValue={selectedInflow.startYearsAfterRetirement}
                  className="table-input"
                  style={{ width: "100px" }}
                  onBlur={(e) => handleNumberBlur(selectedInflow.id, "startYearsAfterRetirement", e.target.value)}
                />
              </FormField>
              <FormField label="Growth rate">
                <input
                  type="text"
                  defaultValue={formatPercentageValue(selectedInflow.growthRate)}
                  className={`table-input ${getValueClass(selectedInflow.growthRate, "percentage")}`}
                  style={{ minWidth: "80px" }}
                  onFocus={handleDefaultValueFocus}
                  onBlur={(e) => handleTextBlur(selectedInflow.id, "growthRate", e.target.value)}
                />
              </FormField>
              <FormField label="Calculate CGT">
                <label className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--ew-primary-navy)" }}>
                  <Checkbox
                    checked={selectedInflow.calculateCgt}
                    onCheckedChange={(c) => handleCheckbox(selectedInflow.id, "calculateCgt", !!c)}
                  />
                  Apply capital gains tax
                </label>
              </FormField>
            </div>
          </FieldGroup>

          <FieldGroup title="Projection">
            <div className="flex gap-3 flex-wrap items-end">
              <FormField label="Capital at retirement">
                <div className="calculated-field" style={{ minWidth: "160px" }}>
                  {formatRand(proj?.capitalAtRetirement)}
                </div>
              </FormField>
              <FormField label="Value in current terms">
                <div className="calculated-field" style={{ minWidth: "160px" }}>
                  {formatRand(proj?.valueInCurrentTerms)}
                </div>
              </FormField>
            </div>
          </FieldGroup>
        </div>
      </GroupedDetailForm>
    );
  })() : null;

  if (isLoading) {
    return <div className="text-center py-4">Loading future inflows...</div>;
  }

  return (
    <div className="w-full px-6 pb-6">
      <div className="w-[1320px] max-w-full">
        <HybridViewWrapper
          header={
            <HybridHeaderBar
              add={{ label: "Add Inflow", onClick: handleAdd }}
              title={selectedInflow?.description}
              emptyTitle={selectedInflow ? "Untitled Inflow" : undefined}
              onDuplicate={selectedInflow ? () => handleDuplicate(selectedInflow) : undefined}
              onDelete={selectedInflow ? () => handleDelete(selectedInflow.id) : undefined}
              disabled={isUpdating}
            />
          }
          summaryCards={summaryCards}
          detailForms={detailForms}
          isEmpty={inflows.length === 0}
          emptyStateMessage="No future inflows yet. Click 'Add Inflow' to create your first inflow."
        />
      </div>
    </div>
  );
}
