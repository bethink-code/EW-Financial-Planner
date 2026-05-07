import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
    mutationFn: async () => {
      const res = await apiRequest("PUT", `/api/retirement-parameters/${PLAN_ID}`, {
        retirementAge,
        retirementPlanningAge,
        autoCalculateTax,
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
    <div className="w-full px-6 py-6">
      <Card className="max-w-3xl p-6">
        <h2 className="text-xl font-semibold mb-2">Retirement parameters</h2>
        <p className="text-sm text-neutral-600 mb-6">Set the retirement horizon for this plan. All terms are in years.</p>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label htmlFor="retirementAge">Retire at age</Label>
            <Input
              id="retirementAge"
              type="number"
              min={40}
              max={100}
              value={retirementAge}
              onChange={(e) => setRetirementAge(parseInt(e.target.value) || 65)}
            />
          </div>
          <div>
            <Label htmlFor="planningAge">Retirement planning to age</Label>
            <Input
              id="planningAge"
              type="number"
              min={50}
              max={120}
              value={retirementPlanningAge}
              onChange={(e) => setRetirementPlanningAge(parseInt(e.target.value) || 90)}
            />
          </div>
          <div>
            <Label className="text-neutral-500">Years to retirement</Label>
            <div className="px-3 py-2 bg-neutral-50 rounded text-neutral-700 text-sm">{yearsToRetirement}</div>
          </div>
          <div>
            <Label className="text-neutral-500">Years after retirement</Label>
            <div className="px-3 py-2 bg-neutral-50 rounded text-neutral-700 text-sm">{yearsAfterRetirement}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-6">
          <Checkbox
            id="autoCalcTax"
            checked={autoCalculateTax}
            onCheckedChange={(c) => setAutoCalculateTax(!!c)}
          />
          <Label htmlFor="autoCalcTax" className="cursor-pointer">Auto-calculate tax on income provisions</Label>
        </div>

        <div className="mt-6">
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving..." : "Save"}
          </Button>
          {saveMutation.isSuccess && (
            <span className="ml-3 text-sm text-green-600">Saved.</span>
          )}
        </div>
      </Card>
    </div>
  );
}
