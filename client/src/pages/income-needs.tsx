import React, { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import IncomeNeedsTable from "../components/income-needs/income-needs-table";
import { IncomeNeedsSummary } from "@/components/income-needs/income-needs-summary";
import { RetirementProjectionRibbon } from "@/components/retirement/retirement-projection-ribbon";
import { CalculatorHeader } from "@/components/ui/calculator-header";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { InsertIncomeNeeds } from "@shared/schema";

export default function IncomeNeeds() {
  const [location] = useLocation();
  const isRetirementNeed = location.startsWith("/needs/retirement");

  // Fetch needs for count
  const { data: needs = [] } = useQuery({
    queryKey: ["/api/income-needs"],  
    queryFn: async () => {
      const response = await fetch("/api/income-needs");
      if (!response.ok) throw new Error('Failed to fetch income needs');
      return response.json();
    }
  });

  // Add new need mutation
  const addMutation = useMutation({
    mutationFn: async () => {
      const newNeed = {}; // Send empty object to use database defaults
      return apiRequest("POST", "/api/income-needs", newNeed);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/income-needs"] });
    },
  });

  const handleAddNeed = useCallback(() => {
    addMutation.mutate();
  }, [addMutation]);

  return (
    <div className="w-full px-6 pb-6">
      <div className="w-[1320px] max-w-full">
        <CalculatorHeader>
          {/* Per-domain summary on non-retirement routes only. Retirement
              renders its cross-category ribbon above the tabs. */}
          {!isRetirementNeed && (
            <div className="max-w-6xl">
              <IncomeNeedsSummary />
            </div>
          )}
          <IncomeNeedsTable onAddIncomeNeed={handleAddNeed} />
        </CalculatorHeader>
      </div>
    </div>
  );
}