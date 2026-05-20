import { useCallback } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { IncomeProvisionsTable } from "@/components/income-provisions/income-provisions-table";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function IncomeProvisions() {
  const [location] = useLocation();
  const isRetirementNeed = location.startsWith("/needs/retirement");

  const addMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/income-provisions", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/income-provisions"] });
    },
  });

  const handleAddProvision = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  return (
    <div className="w-full px-6 pb-6">
      <div className="w-[1320px] max-w-full">
        <IncomeProvisionsTable
          onAddProvision={handleAddProvision}
          // Retirement renders a cross-category projection ribbon at the
          // phase level — suppress the section summary there to avoid two
          // overlapping summaries.
          showSummary={!isRetirementNeed}
        />
      </div>
    </div>
  );
}
