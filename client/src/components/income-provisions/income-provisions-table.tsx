import React from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { IncomeProvisions, ClientDetails } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
import { IncomeProvisionsSummary } from "@/components/income-provisions/income-provisions-summary";
import { useDebouncedUpdate } from "@/hooks/use-debounced-update";
import { useRetirementProjection } from "@/hooks/use-retirement-projection";
import { useValueMode } from "@/components/common/value-mode";
import {
  formatCurrencyValue,
  formatPercentageValue,
  formatYearsValue,
  getValueClass,
  handleDefaultValueFocus,
} from "@/lib/formatting";
import { parseAmount, parsePercent } from "@shared/retirement-calculations";

interface IncomeProvisionsTableProps {
  onAddProvision?: () => void;
  /** Hide the section summary band — used on Retirement routes where the
   *  phase-level projection ribbon already covers these stats. */
  showSummary?: boolean;
}

export function IncomeProvisionsTable({
  onAddProvision,
  showSummary = true,
}: IncomeProvisionsTableProps) {
  const [location] = useLocation();
  const isRetirementNeed = location.startsWith("/needs/retirement");
  const [selectedProvisionId, setSelectedProvisionId] = React.useState<
    number | null
  >(null);

  const { data: provisions = [], isLoading } = useQuery<IncomeProvisions[]>({
    queryKey: ["/api/income-provisions"],
  });
  const { data: entities = [] } = useQuery<ClientDetails[]>({
    queryKey: ["/api/client-details"],
  });
  const { data: projection } = useRetirementProjection();
  const { mode } = useValueMode();
  const atRetirement = mode === "atRetirement";
  const formatRand = (n: number | undefined) =>
    formatCurrencyValue(Math.round(n ?? 0).toString());

  React.useEffect(() => {
    if (provisions.length > 0 && selectedProvisionId === null) {
      setSelectedProvisionId(provisions[0].id);
    }
  }, [provisions, selectedProvisionId]);

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: number;
      updates: Partial<IncomeProvisions>;
    }) => {
      return apiRequest("PATCH", `/api/income-provisions/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/income-provisions"] });
    },
  });

  const debouncedUpdate = useDebouncedUpdate(
    (id: number, field: keyof IncomeProvisions, value: string | boolean) => {
      updateMutation.mutate({ id, updates: { [field]: value } });
    }
  );

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/income-provisions/${id}`);
    },
    onSuccess: (_, id) => {
      if (id === selectedProvisionId) setSelectedProvisionId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/income-provisions"] });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (source: IncomeProvisions) => {
      const { id, ...rest } = source;
      return apiRequest("POST", "/api/income-provisions", {
        ...rest,
        name: source.name ? `${source.name} (Copy)` : "",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/income-provisions"] });
    },
  });

  const handleTextBlur = (
    id: number,
    field: keyof IncomeProvisions,
    value: string
  ) => {
    let formatted: string = value;
    if (field === "amount") formatted = formatCurrencyValue(value);
    else if (field === "increasePercentage" || field === "taxPercentage")
      formatted = formatPercentageValue(value);
    else if (field === "termYears") formatted = formatYearsValue(value);
    debouncedUpdate(id, field, formatted);
  };

  const handleCheckbox = (
    id: number,
    field: keyof IncomeProvisions,
    checked: boolean
  ) => {
    updateMutation.mutate({ id, updates: { [field]: checked } });
  };

  const handleImmediateUpdate = (
    id: number,
    field: keyof IncomeProvisions,
    value: string
  ) => {
    updateMutation.mutate({ id, updates: { [field]: value } });
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Delete this provision? This cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDuplicate = (p: IncomeProvisions) => {
    duplicateMutation.mutate(p);
  };

  const isUpdating = deleteMutation.isPending || duplicateMutation.isPending;

  const selectedProvision = selectedProvisionId
    ? provisions.find((p) => p.id === selectedProvisionId) ?? null
    : null;

  const provisionIndex = (p: IncomeProvisions) =>
    provisions.findIndex((x) => x.id === p.id);
  const titleFor = (p: IncomeProvisions) =>
    p.name?.trim() || `Provision ${provisionIndex(p) + 1}`;

  const summaryCards = (
    <HybridSidebar
      items={provisions}
      selectedId={selectedProvisionId}
      onSelect={setSelectedProvisionId}
      getId={(p) => p.id}
      getTitle={titleFor}
      renderActive={(p) => {
        const lines: string[] = [];
        if (p.personName?.trim()) lines.push(`Entity: ${p.personName}`);
        if (p.frequency?.trim()) lines.push(`Frequency: ${p.frequency}`);
        if (p.termYears?.trim() && p.termYears !== "0")
          lines.push(`Term: ${p.termYears}`);
        return {
          subtitle: lines.join("\n") || "No details entered",
          primaryValue: p.amount || "R 0",
        };
      }}
    />
  );

  // Retirement-need view: minimal single-row form matching the client's
  // reference. DEL-specific groups (separate Tax FieldGroup, description, etc.)
  // are hidden — same component, route-driven.
  const retirementDetailForm = selectedProvision
    ? (() => {
        const entityList = entities.filter(
          (e) => e.entityName && e.entityName.trim()
        );
        const primaryEntity = entityList.find(
          (e) => e.entityType === "Primary entity"
        );
        const proj = projection?.incomeProvided.find(
          (p) => p.id === selectedProvision.id
        );
        const termNum = parseInt(selectedProvision.termYears) || 0;
        // Amount after tax = amount × (1 − taxableFraction × taxRate). Same formula
        // the calc uses; we don't re-export it from the engine because it's a
        // single-line derivation tied to display.
        const taxableFraction = parsePercent(selectedProvision.taxPercentage);
        const taxRate = parsePercent(selectedProvision.taxRate);
        const amountBeforeTax = parseAmount(selectedProvision.amount);
        const amountAfterTax =
          amountBeforeTax * (1 - taxableFraction * taxRate);
        const nameValue = selectedProvision.name || "Income provision";
        const entityValue =
          selectedProvision.personName || primaryEntity?.entityName || "";
        return (
          <GroupedDetailForm>
            <FieldGroup
              title="Regular income provided (current value)"
              outcomes={[
                {
                  label: atRetirement
                    ? "Capital at retirement"
                    : "Value in current terms",
                  value: formatRand(
                    atRetirement
                      ? proj?.capitalAtRetirement
                      : proj?.valueInCurrentTerms
                  ),
                },
              ]}
            >
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
                        selectedProvision.id,
                        "name",
                        e.target.value
                      )
                    }
                  />
                </FormField>

                <FormField label="Entity">
                  <Select
                    value={entityValue || "none"}
                    onValueChange={(v) =>
                      handleImmediateUpdate(
                        selectedProvision.id,
                        "personName",
                        v === "none" ? "" : v
                      )
                    }
                  >
                    <SelectTrigger
                      className="table-input"
                      style={{ minWidth: "180px" }}
                    >
                      <SelectValue placeholder="Select entity..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select entity...</SelectItem>
                      {entityList.map((e) => (
                        <SelectItem key={e.id} value={e.entityName ?? ""}>
                          {e.entityName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Start">
                  <input
                    type="number"
                    defaultValue={parseInt(selectedProvision.startDate) || 0}
                    className="table-input"
                    style={{ width: "80px" }}
                    onBlur={(e) =>
                      handleTextBlur(
                        selectedProvision.id,
                        "startDate",
                        e.target.value
                      )
                    }
                  />
                </FormField>

                <FormField label="Term">
                  <input
                    type="number"
                    defaultValue={termNum}
                    className="table-input"
                    style={{ width: "80px" }}
                    onBlur={(e) =>
                      handleTextBlur(
                        selectedProvision.id,
                        "termYears",
                        e.target.value
                      )
                    }
                  />
                </FormField>

                <FormField label="Increase %">
                  <input
                    type="text"
                    defaultValue={formatPercentageValue(
                      selectedProvision.increasePercentage
                    )}
                    className={`table-input ${getValueClass(
                      selectedProvision.increasePercentage || "0%",
                      "percentage"
                    )}`}
                    style={{ width: "90px" }}
                    onFocus={handleDefaultValueFocus}
                    onBlur={(e) =>
                      handleTextBlur(
                        selectedProvision.id,
                        "increasePercentage",
                        e.target.value
                      )
                    }
                  />
                </FormField>

                <FormField label="Taxable %">
                  <input
                    type="text"
                    defaultValue={formatPercentageValue(
                      selectedProvision.taxPercentage
                    )}
                    className={`table-input ${getValueClass(
                      selectedProvision.taxPercentage || "0%",
                      "percentage"
                    )}`}
                    style={{ width: "90px" }}
                    onFocus={handleDefaultValueFocus}
                    onBlur={(e) =>
                      handleTextBlur(
                        selectedProvision.id,
                        "taxPercentage",
                        e.target.value
                      )
                    }
                  />
                </FormField>

                <FormField label="Tax %">
                  <div className="calculated-field" style={{ width: "90px" }}>
                    {formatPercentageValue(selectedProvision.taxRate)}
                  </div>
                </FormField>

                <FormField label="Frequency">
                  <Select
                    value={selectedProvision.frequency || "monthly"}
                    onValueChange={(v) =>
                      handleImmediateUpdate(
                        selectedProvision.id,
                        "frequency",
                        v
                      )
                    }
                  >
                    <SelectTrigger
                      className="table-input"
                      style={{ minWidth: "120px" }}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Amount Before Tax">
                  <input
                    type="text"
                    defaultValue={selectedProvision.amount || "R 0"}
                    className={`table-input ${getValueClass(
                      selectedProvision.amount || "R 0",
                      "currency"
                    )}`}
                    style={{ width: "140px" }}
                    onFocus={handleDefaultValueFocus}
                    onBlur={(e) =>
                      handleTextBlur(
                        selectedProvision.id,
                        "amount",
                        e.target.value
                      )
                    }
                  />
                </FormField>

                <FormField label="Amount After Tax">
                  <div className="calculated-field" style={{ width: "140px" }}>
                    {formatRand(amountAfterTax)}
                  </div>
                </FormField>
              </div>
            </FieldGroup>
          </GroupedDetailForm>
        );
      })()
    : null;

  const detailForms = isRetirementNeed ? (
    retirementDetailForm
  ) : selectedProvision ? (
    <GroupedDetailForm>
      <div key={selectedProvision.id} className="space-y-10">
        <FieldGroup title="Overview">
          <div className="flex gap-3 flex-wrap">
            <FormField label="Name">
              <input
                type="text"
                defaultValue={selectedProvision.name}
                className={`table-input ${getValueClass(
                  selectedProvision.name,
                  "text"
                )}`}
                style={{ width: "100%", minWidth: "200px" }}
                onBlur={(e) =>
                  handleTextBlur(selectedProvision.id, "name", e.target.value)
                }
              />
            </FormField>
            <FormField label="Description">
              <input
                type="text"
                defaultValue={selectedProvision.description}
                className={`table-input ${getValueClass(
                  selectedProvision.description,
                  "text"
                )}`}
                style={{ width: "100%", minWidth: "280px" }}
                onBlur={(e) =>
                  handleTextBlur(
                    selectedProvision.id,
                    "description",
                    e.target.value
                  )
                }
              />
            </FormField>
          </div>
          <FormField label="Entity">
            <input
              type="text"
              defaultValue={selectedProvision.personName}
              className={`table-input ${getValueClass(
                selectedProvision.personName,
                "text"
              )}`}
              style={{ width: "fit-content", minWidth: "200px" }}
              onBlur={(e) =>
                handleTextBlur(
                  selectedProvision.id,
                  "personName",
                  e.target.value
                )
              }
            />
          </FormField>
        </FieldGroup>

        <FieldGroup title="Provision Details">
          <div className="flex gap-3 flex-wrap">
            <FormField label="Amount">
              <input
                type="text"
                defaultValue={selectedProvision.amount || "R 0"}
                className={`table-input ${getValueClass(
                  selectedProvision.amount,
                  "currency"
                )}`}
                style={{ width: "fit-content", minWidth: "140px" }}
                onFocus={handleDefaultValueFocus}
                onBlur={(e) =>
                  handleTextBlur(selectedProvision.id, "amount", e.target.value)
                }
              />
            </FormField>
            <FormField label="Frequency">
              <select
                className="table-input table-dropdown"
                defaultValue={selectedProvision.frequency || "monthly"}
                onChange={(e) =>
                  handleImmediateUpdate(
                    selectedProvision.id,
                    "frequency",
                    e.target.value
                  )
                }
                style={{ minWidth: "140px" }}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </FormField>
            <FormField label="Start">
              <input
                type="text"
                defaultValue={selectedProvision.startDate}
                className={`table-input ${getValueClass(
                  selectedProvision.startDate,
                  "text"
                )}`}
                style={{ width: "fit-content", minWidth: "120px" }}
                onBlur={(e) =>
                  handleTextBlur(
                    selectedProvision.id,
                    "startDate",
                    e.target.value
                  )
                }
              />
            </FormField>
            <FormField label="Term (years)">
              <input
                type="text"
                defaultValue={selectedProvision.termYears}
                className={`table-input ${getValueClass(
                  selectedProvision.termYears,
                  "years"
                )}`}
                style={{ width: "fit-content", minWidth: "100px" }}
                onFocus={handleDefaultValueFocus}
                onBlur={(e) =>
                  handleTextBlur(
                    selectedProvision.id,
                    "termYears",
                    e.target.value
                  )
                }
              />
            </FormField>
            <FormField label="Increase %">
              <input
                type="text"
                defaultValue={formatPercentageValue(
                  selectedProvision.increasePercentage
                )}
                className={`table-input ${getValueClass(
                  selectedProvision.increasePercentage,
                  "percentage"
                )}`}
                style={{ width: "fit-content", minWidth: "80px" }}
                onFocus={handleDefaultValueFocus}
                onBlur={(e) =>
                  handleTextBlur(
                    selectedProvision.id,
                    "increasePercentage",
                    e.target.value
                  )
                }
              />
            </FormField>
            <FormField label="CPI linked">
              <label
                className="inline-flex items-center gap-2 text-sm"
                style={{ color: "var(--ew-primary-navy)" }}
              >
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  checked={selectedProvision.cpi}
                  onChange={(e) =>
                    handleCheckbox(
                      selectedProvision.id,
                      "cpi",
                      e.target.checked
                    )
                  }
                />
                Increase with inflation
              </label>
            </FormField>
          </div>
        </FieldGroup>

        <FieldGroup title="Tax">
          <div className="flex gap-3 flex-wrap">
            <FormField label="Tax %">
              <input
                type="text"
                defaultValue={formatPercentageValue(
                  selectedProvision.taxPercentage
                )}
                className={`table-input ${getValueClass(
                  selectedProvision.taxPercentage,
                  "percentage"
                )}`}
                style={{ width: "fit-content", minWidth: "80px" }}
                onFocus={handleDefaultValueFocus}
                onBlur={(e) =>
                  handleTextBlur(
                    selectedProvision.id,
                    "taxPercentage",
                    e.target.value
                  )
                }
              />
            </FormField>
            <FormField label="Tax rate">
              <input
                type="text"
                defaultValue={selectedProvision.taxRate}
                className={`table-input ${getValueClass(
                  selectedProvision.taxRate,
                  "text"
                )}`}
                style={{ width: "fit-content", minWidth: "120px" }}
                onBlur={(e) =>
                  handleTextBlur(
                    selectedProvision.id,
                    "taxRate",
                    e.target.value
                  )
                }
              />
            </FormField>
          </div>
        </FieldGroup>
      </div>
    </GroupedDetailForm>
  ) : null;

  const aggregateProvided = projection?.incomeProvided ?? [];
  const totalCapital = aggregateProvided.reduce(
    (sum, p) => sum + (p.capitalAtRetirement ?? 0),
    0
  );
  const totalInCurrentTerms = aggregateProvided.reduce(
    (sum, p) => sum + (p.valueInCurrentTerms ?? 0),
    0
  );
  const provisionCount = provisions.length;
  const sectionSummary = isRetirementNeed ? (
    <SectionCapitalSummary
      capitalAtRetirement={totalCapital}
      valueInCurrentTerms={totalInCurrentTerms}
      count={provisionCount}
      noun="provision"
    />
  ) : showSummary ? (
    <IncomeProvisionsSummary />
  ) : undefined;

  if (isLoading) {
    return <div className="text-center py-4">Loading provisions...</div>;
  }

  return (
    <HybridViewWrapper
      summary={sectionSummary}
      header={
        <HybridHeaderBar
          add={
            onAddProvision
              ? { label: "Add Provision", onClick: onAddProvision }
              : undefined
          }
          title={selectedProvision?.name}
          emptyTitle={selectedProvision ? "Unnamed Provision" : undefined}
          onDuplicate={
            selectedProvision
              ? () => handleDuplicate(selectedProvision)
              : undefined
          }
          onDelete={
            selectedProvision
              ? () => handleDelete(selectedProvision.id)
              : undefined
          }
          disabled={isUpdating}
        />
      }
      summaryCards={summaryCards}
      detailForms={detailForms}
      isEmpty={provisions.length === 0}
      emptyStateMessage="No provisions added yet. Click 'Add Provision' to create your first provision."
    />
  );
}
