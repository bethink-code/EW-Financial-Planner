import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  RetirementFund,
  DefinedBenefitFund,
  VoluntaryInvestment,
  FutureInflow,
  RetirementLumpSumNeed,
  IncomeNeeds,
  IncomeProvisions,
  RetirementParameters,
  ClientDetails,
} from "@shared/schema";
import {
  computeRetirementProjection,
  isRetirementReadyToProject,
  type RetirementProjection,
} from "@shared/retirement-calculations";

const PLAN_ID = 1;

/**
 * Cross-category retirement projection feed. Fetches all 7 source queries
 * + parameters + client details via React Query, then runs the pure engine
 * client-side. Any mutation that invalidates one of the source queries
 * triggers an automatic re-run — the ribbon and row-adjacent outputs update
 * without a manual refresh.
 */
export function useRetirementProjection(): {
  data: RetirementProjection | undefined;
  isLoading: boolean;
} {
  const params = useQuery<RetirementParameters>({
    queryKey: [`/api/retirement-parameters/${PLAN_ID}`],
    queryFn: () => fetch(`/api/retirement-parameters/${PLAN_ID}`).then(r => r.json()),
  });
  const clientDetails = useQuery<ClientDetails[]>({
    queryKey: ["/api/client-details"],
  });
  const retirementFunds = useQuery<RetirementFund[]>({
    queryKey: ["/api/retirement-funds"],
  });
  const dbFunds = useQuery<DefinedBenefitFund[]>({
    queryKey: ["/api/defined-benefit-funds"],
  });
  const voluntary = useQuery<VoluntaryInvestment[]>({
    queryKey: ["/api/voluntary-investments"],
  });
  const futureInflows = useQuery<FutureInflow[]>({
    queryKey: ["/api/future-inflows"],
  });
  const lumpSumNeeds = useQuery<RetirementLumpSumNeed[]>({
    queryKey: ["/api/retirement-lump-sum-needs"],
  });
  const incomeNeeds = useQuery<IncomeNeeds[]>({
    queryKey: ["/api/income-needs"],
  });
  const incomeProvisions = useQuery<IncomeProvisions[]>({
    queryKey: ["/api/income-provisions"],
  });

  const isLoading =
    params.isLoading ||
    clientDetails.isLoading ||
    retirementFunds.isLoading ||
    dbFunds.isLoading ||
    voluntary.isLoading ||
    futureInflows.isLoading ||
    lumpSumNeeds.isLoading ||
    incomeNeeds.isLoading ||
    incomeProvisions.isLoading;

  const data = useMemo<RetirementProjection | undefined>(() => {
    if (isLoading) return undefined;
    const primary = (clientDetails.data ?? []).find(c => c.entityType === "Primary entity")
      ?? (clientDetails.data ?? [])[0];
    const clientAge = primary ? parseInt(primary.age) || 0 : 0;
    const input = {
      parameters: params.data ?? null,
      clientAge,
      retirementFunds: retirementFunds.data ?? [],
      definedBenefitFunds: dbFunds.data ?? [],
      voluntaryInvestments: voluntary.data ?? [],
      futureInflows: futureInflows.data ?? [],
      lumpSumNeeds: lumpSumNeeds.data ?? [],
      incomeNeeds: incomeNeeds.data ?? [],
      incomeProvisions: incomeProvisions.data ?? [],
    };
    const projection = computeRetirementProjection(input);
    return { ...projection, ready: isRetirementReadyToProject(input) };
  }, [
    isLoading,
    params.data,
    clientDetails.data,
    retirementFunds.data,
    dbFunds.data,
    voluntary.data,
    futureInflows.data,
    lumpSumNeeds.data,
    incomeNeeds.data,
    incomeProvisions.data,
  ]);

  return { data, isLoading };
}

/**
 * Force a refetch of all upstream inputs the engine reads. Wired to the
 * ribbon's Refresh button so planners get the legacy "Refresh" affordance —
 * pulls anything that may have changed outside this workspace.
 */
export function useRefreshRetirementProjection() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: [`/api/retirement-parameters/${PLAN_ID}`] });
    qc.invalidateQueries({ queryKey: ["/api/client-details"] });
    qc.invalidateQueries({ queryKey: ["/api/retirement-funds"] });
    qc.invalidateQueries({ queryKey: ["/api/defined-benefit-funds"] });
    qc.invalidateQueries({ queryKey: ["/api/voluntary-investments"] });
    qc.invalidateQueries({ queryKey: ["/api/future-inflows"] });
    qc.invalidateQueries({ queryKey: ["/api/retirement-lump-sum-needs"] });
    qc.invalidateQueries({ queryKey: ["/api/income-needs"] });
    qc.invalidateQueries({ queryKey: ["/api/income-provisions"] });
  };
}
