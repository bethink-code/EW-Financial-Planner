import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldGroup, FormField, GroupedDetailForm } from "@/components/common/grouped-detail-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrencyValue, handleDefaultValueFocus } from "@/lib/formatting";
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
  const [currentAnnualIncome, setCurrentAnnualIncome] = useState("R 0");

  useEffect(() => {
    if (params) {
      setRetirementAge(params.retirementAge);
      setRetirementPlanningAge(params.retirementPlanningAge);
      setAutoCalculateTax(params.autoCalculateTax);
      setCurrentAnnualIncome(params.currentAnnualIncome ?? "R 0");
    }
  }, [params]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PUT", `/api/retirement-parameters/${PLAN_ID}`, {
        retirementAge,
        retirementPlanningAge,
        autoCalculateTax,
        currentAnnualIncome,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/retirement-parameters/${PLAN_ID}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/retirement-projection/${PLAN_ID}`] });
    },
  });

  const yearsToRetirement = Math.max(0, retirementAge - 52); // primary entity stub age; refine when client-age wiring lands.
  const yearsAfterRetirement = Math.max(0, retirementPlanningAge - retirementAge);

  return (
    <div className="w-full px-6 pb-6">
      <div className="w-[1320px] max-w-full">
        <div className="rounded-lg shadow-sm border border-neutral-200 overflow-hidden bg-white">
          <GroupedDetailForm>
            <FieldGroup title="Retirement horizon">
              <div className="flex gap-3 flex-wrap items-end">
                <FormField label="Retire at age">
                  <input
                    type="number"
                    min={40}
                    max={100}
                    value={retirementAge}
                    onChange={(e) => setRetirementAge(parseInt(e.target.value) || 65)}
                    className="table-input"
                    style={{ width: '100px' }}
                  />
                </FormField>
                <FormField label="Planning to age">
                  <input
                    type="number"
                    min={50}
                    max={120}
                    value={retirementPlanningAge}
                    onChange={(e) => setRetirementPlanningAge(parseInt(e.target.value) || 90)}
                    className="table-input"
                    style={{ width: '100px' }}
                  />
                </FormField>
                <FormField label="Years to retirement">
                  <div className="calculated-field" style={{ minWidth: '100px' }}>
                    {yearsToRetirement}
                  </div>
                </FormField>
                <FormField label="Years after retirement">
                  <div className="calculated-field" style={{ minWidth: '100px' }}>
                    {yearsAfterRetirement}
                  </div>
                </FormField>
              </div>
            </FieldGroup>

            <FieldGroup title="Tax">
              <div className="flex gap-3 flex-wrap items-end">
                <FormField label="Current annual taxable income">
                  <input
                    type="text"
                    value={currentAnnualIncome}
                    placeholder="R 0"
                    onFocus={handleDefaultValueFocus}
                    onChange={(e) => setCurrentAnnualIncome(e.target.value)}
                    onBlur={(e) => setCurrentAnnualIncome(formatCurrencyValue(e.target.value))}
                    className="table-input"
                    style={{ minWidth: '180px' }}
                  />
                </FormField>
              </div>
              <p className="text-xs" style={{ color: 'var(--ew-gray-700)' }}>
                Used to compute the tax-deductible portion of any recommended retirement top-up
                (SA 2025/26 brackets).
              </p>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={autoCalculateTax}
                  onCheckedChange={(c) => setAutoCalculateTax(!!c)}
                />
                <span className="text-sm font-medium" style={{ color: 'var(--ew-primary-navy)' }}>
                  Auto-calculate tax on income provisions
                </span>
              </label>
            </FieldGroup>

            <div className="flex items-center gap-3">
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
              {saveMutation.isSuccess && (
                <span className="text-sm" style={{ color: 'var(--ew-positive-symbol)' }}>Saved.</span>
              )}
            </div>
          </GroupedDetailForm>
        </div>
      </div>
    </div>
  );
}
