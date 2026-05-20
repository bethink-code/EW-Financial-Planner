import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { LumpSumTable } from "@/components/lump-sum-bequests/lump-sum-table";
import { LumpSumSummary } from "@/components/lump-sum-bequests/lump-sum-summary";
import { CalculatorHeader } from "@/components/ui/calculator-header";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertLumpSumBequest } from "@shared/schema";

export default function LumpSumBequests() {

  // Fetch bequests for count
  const { data: bequests = [] } = useQuery({
    queryKey: ["/api/lump-sum-bequests"],  
    queryFn: async () => {
      const response = await fetch("/api/lump-sum-bequests");
      if (!response.ok) throw new Error('Failed to fetch lump sum bequests');
      return response.json();
    }
  });

  // Add new bequest mutation
  const addMutation = useMutation({
    mutationFn: async () => {
      const newBequest: InsertLumpSumBequest = {
        description: "Enter details ...",
        entity: "Enter details ...",
        start: "Enter details ...",
        amount: "R 0",
        increasePercentage: "0%",
        cpi: false,
        valueAtDeath: "R 0"
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
        <CalculatorHeader>
          <div className="max-w-6xl">
            <LumpSumSummary />
          </div>
          <LumpSumTable onAddBequest={handleAddBequest} />
        </CalculatorHeader>
      </div>
    </div>
  );
}