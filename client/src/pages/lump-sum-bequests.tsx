import { useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { LumpSumTable } from "@/components/lump-sum-bequests/lump-sum-table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertLumpSumBequest } from "@shared/schema";

export default function LumpSumBequests() {
  const addMutation = useMutation({
    mutationFn: async () => {
      const newBequest: InsertLumpSumBequest = {
        description: "",
        entity: "",
        start: "",
        amount: "R 0",
        increasePercentage: "0%",
        cpi: false,
        valueAtDeath: "R 0",
      };
      return apiRequest("POST", "/api/lump-sum-bequests", newBequest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lump-sum-bequests"] });
    },
  });

  const handleAddBequest = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  return (
    <div className="w-full px-6 pb-6">
      <div className="w-[1320px] max-w-full">
        <LumpSumTable onAddBequest={handleAddBequest} />
      </div>
    </div>
  );
}
