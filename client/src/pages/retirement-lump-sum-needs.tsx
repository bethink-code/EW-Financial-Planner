import React, { useCallback, useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HybridViewWrapper } from "@/components/common/hybrid-view-wrapper";
import { HybridHeaderBar } from "@/components/common/hybrid-header-bar";
import { HybridSidebar } from "@/components/common/hybrid-sidebar";
import { SectionCapitalSummary } from "@/components/common/section-capital-summary";
import {
  FieldGroup,
  FormField,
  GroupedDetailForm,
} from "@/components/common/grouped-detail-form";
import { useDebouncedUpdate } from "@/hooks/use-debounced-update";
import { useRetirementProjection } from "@/hooks/use-retirement-projection";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  formatCurrencyValue,
  formatPercentageValue,
  getValueClass,
  handleDefaultValueFocus,
} from "@/lib/formatting";
import type {
  RetirementLumpSumNeed,
  InsertRetirementLumpSumNeed,
} from "@shared/schema";

const FREQUENCIES = ["Single", "Monthly", "Quarterly", "Annual"] as const;

export default function RetirementLumpSumNeedsPage() {
  const [selectedNeedId, setSelectedNeedId] = useState<number | null>(null);

  const { data: needs = [], isLoading } = useQuery<RetirementLumpSumNeed[]>({
    queryKey: ["/api/retirement-lump-sum-needs"],
  });
  const { data: projection } = useRetirementProjection();

  useEffect(() => {
    if (needs.length > 0 && selectedNeedId === null) {
      setSelectedNeedId(needs[0].id);
    }
  }, [needs, selectedNeedId]);

  const addMutation = useMutation({
    mutationFn: async () => {
      const newNeed: InsertRetirementLumpSumNeed = {
        description: "",
        startYears: 0,
        termYears: 0,
        increasePercentage: "0%",
        frequency: "Single",
        frequencyValue: 1,
        amount: "R 0",
      };
      return apiRequest("POST", "/api/retirement-lump-sum-needs", newNeed);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["/api/retirement-lump-sum-needs"],
      }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: number;
      updates: Partial<RetirementLumpSumNeed>;
    }) => apiRequest("PATCH", `/api/retirement-lump-sum-needs/${id}`, updates),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["/api/retirement-lump-sum-needs"],
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) =>
      apiRequest("DELETE", `/api/retirement-lump-sum-needs/${id}`),
    onSuccess: (_, id) => {
      if (id === selectedNeedId) setSelectedNeedId(null);
      queryClient.invalidateQueries({
        queryKey: ["/api/retirement-lump-sum-needs"],
      });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (source: RetirementLumpSumNeed) => {
      const { id, ...rest } = source;
      return apiRequest("POST", "/api/retirement-lump-sum-needs", {
        ...rest,
        description: source.description ? `${source.description} (Copy)` : "",
      });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["/api/retirement-lump-sum-needs"],
      }),
  });

  const debouncedUpdate = useDebouncedUpdate(
    (
      id: number,
      field: keyof RetirementLumpSumNeed,
      value: string | number
    ) => {
      updateMutation.mutate({ id, updates: { [field]: value } });
    }
  );

  const handleTextBlur = (
    id: number,
    field: keyof RetirementLumpSumNeed,
    value: string
  ) => {
    let formatted: string = value;
    if (field === "amount") formatted = formatCurrencyValue(value);
    else if (field === "increasePercentage")
      formatted = formatPercentageValue(value);
    debouncedUpdate(id, field, formatted);
  };

  const handleNumberBlur = (
    id: number,
    field: keyof RetirementLumpSumNeed,
    value: string
  ) => {
    debouncedUpdate(id, field, parseInt(value) || 0);
  };

  const handleImmediateUpdate = (
    id: number,
    field: keyof RetirementLumpSumNeed,
    value: string
  ) => {
    updateMutation.mutate({ id, updates: { [field]: value } });
  };

  const handleAdd = useCallback(() => addMutation.mutate(), [addMutation]);

  const handleDelete = (id: number) => {
    if (window.confirm("Delete this lump sum need? This cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDuplicate = (need: RetirementLumpSumNeed) => {
    duplicateMutation.mutate(need);
  };

  const isUpdating =
    deleteMutation.isPending ||
    duplicateMutation.isPending ||
    addMutation.isPending;

  const selectedNeed = selectedNeedId
    ? needs.find((n) => n.id === selectedNeedId) ?? null
    : null;

  const formatRand = (n: number | undefined) =>
    formatCurrencyValue(Math.round(n ?? 0).toString());

  const needIndex = (n: RetirementLumpSumNeed) =>
    needs.findIndex((x) => x.id === n.id);
  const titleFor = (n: RetirementLumpSumNeed) =>
    n.description?.trim() || `Need ${needIndex(n) + 1}`;

  const summaryCards = (
    <HybridSidebar
      items={needs}
      selectedId={selectedNeedId}
      onSelect={setSelectedNeedId}
      getId={(n) => n.id}
      getTitle={titleFor}
      renderActive={(n) => {
        const lines: string[] = [];
        lines.push(`Frequency: ${n.frequency}`);
        lines.push(`Start: +${n.startYears} yrs · Term: ${n.termYears} yrs`);
        return {
          subtitle: lines.join("\n"),
          primaryValue: n.amount || "R 0",
        };
      }}
    />
  );

  const detailForms = selectedNeed
    ? (() => {
        const proj = projection?.lumpSumNeeds.find(
          (p) => p.id === selectedNeed.id
        );
        const termDisabled = selectedNeed.frequency === "Single";
        const nameValue = selectedNeed.description || "Lump sum need";
        return (
          <GroupedDetailForm>
            <FieldGroup title="Lump sum needs">
              <div className="flex gap-3 flex-wrap items-end">
                <FormField label="Name">
                  <input
                    type="text"
                    defaultValue={nameValue}
                    className="table-input"
                    style={{ minWidth: "200px" }}
                    onFocus={handleDefaultValueFocus}
                    onBlur={(e) =>
                      handleTextBlur(
                        selectedNeed.id,
                        "description",
                        e.target.value
                      )
                    }
                  />
                </FormField>

                <FormField label="Start">
                  <input
                    type="number"
                    defaultValue={selectedNeed.startYears}
                    className="table-input"
                    style={{ width: "80px" }}
                    onBlur={(e) =>
                      handleNumberBlur(
                        selectedNeed.id,
                        "startYears",
                        e.target.value
                      )
                    }
                  />
                </FormField>

                <FormField label="Term">
                  <input
                    type="number"
                    defaultValue={selectedNeed.termYears}
                    className="table-input"
                    style={{ width: "80px" }}
                    onBlur={(e) =>
                      handleNumberBlur(
                        selectedNeed.id,
                        "termYears",
                        e.target.value
                      )
                    }
                    disabled={termDisabled}
                  />
                </FormField>

                <FormField label="Increase %">
                  <input
                    type="text"
                    defaultValue={formatPercentageValue(
                      selectedNeed.increasePercentage
                    )}
                    className={`table-input ${getValueClass(
                      selectedNeed.increasePercentage || "0%",
                      "percentage"
                    )}`}
                    style={{ width: "90px" }}
                    onFocus={handleDefaultValueFocus}
                    onBlur={(e) =>
                      handleTextBlur(
                        selectedNeed.id,
                        "increasePercentage",
                        e.target.value
                      )
                    }
                  />
                </FormField>

                <FormField label="Frequency (every)">
                  <div className="flex gap-2 items-center">
                    <Select
                      value={selectedNeed.frequency}
                      onValueChange={(v) =>
                        handleImmediateUpdate(selectedNeed.id, "frequency", v)
                      }
                    >
                      <SelectTrigger
                        className="table-input"
                        style={{ minWidth: "110px" }}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FREQUENCIES.map((f) => (
                          <SelectItem key={f} value={f}>
                            {f}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input
                      type="number"
                      defaultValue={selectedNeed.frequencyValue ?? 1}
                      className="table-input"
                      style={{ width: "60px" }}
                      onBlur={(e) =>
                        handleNumberBlur(
                          selectedNeed.id,
                          "frequencyValue",
                          e.target.value
                        )
                      }
                      disabled={termDisabled}
                    />
                  </div>
                </FormField>

                <FormField label="Amount">
                  <input
                    type="text"
                    defaultValue={selectedNeed.amount || "R 0"}
                    className={`table-input ${getValueClass(
                      selectedNeed.amount || "R 0",
                      "currency"
                    )}`}
                    style={{ width: "120px" }}
                    onFocus={handleDefaultValueFocus}
                    onBlur={(e) =>
                      handleTextBlur(selectedNeed.id, "amount", e.target.value)
                    }
                  />
                </FormField>
              </div>

              <div className="flex gap-3 flex-wrap items-end">
                <FormField label="Capital at retirement">
                  <div
                    className="calculated-field"
                    style={{ minWidth: "140px" }}
                  >
                    {formatRand(proj?.capitalAtRetirement)}
                  </div>
                </FormField>

                <FormField label="Value in current terms">
                  <div
                    className="calculated-field"
                    style={{ minWidth: "140px" }}
                  >
                    {formatRand(proj?.valueInCurrentTerms)}
                  </div>
                </FormField>
              </div>
            </FieldGroup>
          </GroupedDetailForm>
        );
      })()
    : null;

  const aggregateNeeds = projection?.lumpSumNeeds ?? [];
  const totalCapital = aggregateNeeds.reduce(
    (sum, n) => sum + (n.capitalAtRetirement ?? 0),
    0
  );
  const totalInCurrentTerms = aggregateNeeds.reduce(
    (sum, n) => sum + (n.valueInCurrentTerms ?? 0),
    0
  );
  const needCount = needs.length;
  const sectionSummary = (
    <SectionCapitalSummary
      capitalAtRetirement={totalCapital}
      valueInCurrentTerms={totalInCurrentTerms}
      count={needCount}
      noun="need"
    />
  );

  if (isLoading) {
    return <div className="text-center py-4">Loading lump sum needs...</div>;
  }

  return (
    <div className="w-full px-6 pb-6">
      <div className="w-[1320px] max-w-full">
        <HybridViewWrapper
          summary={sectionSummary}
          header={
            <HybridHeaderBar
              add={{ label: "Add Need", onClick: handleAdd }}
              title={selectedNeed?.description}
              emptyTitle={selectedNeed ? "Untitled Need" : undefined}
              onDuplicate={
                selectedNeed ? () => handleDuplicate(selectedNeed) : undefined
              }
              onDelete={
                selectedNeed ? () => handleDelete(selectedNeed.id) : undefined
              }
              disabled={isUpdating}
            />
          }
          summaryCards={summaryCards}
          detailForms={detailForms}
          isEmpty={needs.length === 0}
          emptyStateMessage="No lump sum needs yet. Click 'Add Need' to create your first need."
        />
      </div>
    </div>
  );
}
