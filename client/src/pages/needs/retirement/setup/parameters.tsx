import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldGroup, FormField, GroupedDetailForm } from "@/components/common/grouped-detail-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { RetirementParameters } from "@shared/schema";

const PLAN_ID = 1; // Aligned with the hardcoded planId in NavigationLayout — replace when plan-scoped routing is built.

export default function RetirementSetupParameters() {
  const { data: params } = useQuery<RetirementParameters>({
    queryKey: [`/api/retirement-parameters/${PLAN_ID}`],
    queryFn: () => fetch(`/api/retirement-parameters/${PLAN_ID}`).then(r => r.json()),
  });

  const [retirementAge, setRetirementAge] = useState(65);
  const [retirementPlanningAge, setRetirementPlanningAge] = useState(90);
  const [autoCalculateTax, setAutoCalculateTax] = useState(true);

  useEffect(() => {
    if (params) {
      setRetirementAge(params.retirementAge);
      setRetirementPlanningAge(params.retirementPlanningAge);
      setAutoCalculateTax(params.autoCalculateTax);
    }
  }, [params]);

  const saveMutation = useMutation({
    mutationFn: async (next: { retirementAge: number; retirementPlanningAge: number; autoCalculateTax: boolean }) => {
      const res = await apiRequest("PUT", `/api/retirement-parameters/${PLAN_ID}`, {
        ...next,
        // Preserve the existing annual taxable income — field no longer
        // surfaces on this page but the Implement-page tax-saving calc
        // still reads it.
        currentAnnualIncome: params?.currentAnnualIncome ?? "R 0",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/retirement-parameters/${PLAN_ID}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/retirement-projection/${PLAN_ID}`] });
    },
  });

  // Save current state — used by every input on blur/onCheckedChange so
  // there's no explicit Save button.
  const saveLatest = (overrides: Partial<{ retirementAge: number; retirementPlanningAge: number; autoCalculateTax: boolean }> = {}) => {
    saveMutation.mutate({
      retirementAge,
      retirementPlanningAge,
      autoCalculateTax,
      ...overrides,
    });
  };

  const yearsToRetirement = Math.max(0, retirementAge - 52); // primary entity stub age; refine when client-age wiring lands.
  const yearsAfterRetirement = Math.max(0, retirementPlanningAge - retirementAge);

  return (
    <div className="w-full px-6 pb-6">
      <div className="w-[1320px] max-w-full">
        <div className="rounded-lg shadow-sm border border-neutral-200 overflow-hidden bg-white">
          <GroupedDetailForm>
            <FieldGroup title="Retirement parameters">
              <div className="flex gap-6 flex-wrap items-end">
                <FormField label="Retire at age">
                  <input
                    type="number"
                    min={40}
                    max={100}
                    value={retirementAge}
                    onChange={(e) => setRetirementAge(parseInt(e.target.value) || 65)}
                    onBlur={() => saveLatest()}
                    className="table-input"
                    style={{ width: '80px' }}
                  />
                </FormField>
                <FormField label="Years to retirement">
                  <div className="calculated-field" style={{ width: '80px' }}>
                    {yearsToRetirement}
                  </div>
                </FormField>
                <FormField label="Retirement planning to age">
                  <input
                    type="number"
                    min={50}
                    max={120}
                    value={retirementPlanningAge}
                    onChange={(e) => setRetirementPlanningAge(parseInt(e.target.value) || 90)}
                    onBlur={() => saveLatest()}
                    className="table-input"
                    style={{ width: '80px' }}
                  />
                </FormField>
                <FormField label="Years after retirement">
                  <div className="calculated-field" style={{ width: '80px' }}>
                    {yearsAfterRetirement}
                  </div>
                </FormField>
                <label className="flex items-center gap-2 cursor-pointer ml-auto" style={{ paddingBottom: '0.4rem' }}>
                  <Checkbox
                    checked={autoCalculateTax}
                    onCheckedChange={(c) => {
                      const next = !!c;
                      setAutoCalculateTax(next);
                      saveLatest({ autoCalculateTax: next });
                    }}
                  />
                  <span className="text-sm font-medium" style={{ color: 'var(--ew-primary-navy)' }}>
                    Auto calculate tax
                  </span>
                </label>
              </div>
              <p className="text-xs italic" style={{ color: 'var(--ew-gray-700)' }}>
                All terms are in years. 'Start' refers to years after retirement.
              </p>
            </FieldGroup>
          </GroupedDetailForm>
        </div>
      </div>
    </div>
  );
}
