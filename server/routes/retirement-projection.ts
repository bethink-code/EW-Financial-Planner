import type { Express } from "express";
import { storage } from "../storage";
import { computeRetirementProjection, isRetirementReadyToProject } from "@shared/retirement-calculations";

/**
 * GET /api/retirement-projection/:planId
 * Aggregates all client + plan retirement inputs and runs the pure projection engine.
 * Returns the structured projection result for the Project / Implement / plan-dashboard cards.
 */
export function registerRetirementProjectionRoutes(app: Express) {
  app.get("/api/retirement-projection/:planId", async (req, res) => {
    try {
      const planId = parseInt(req.params.planId);
      if (isNaN(planId)) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }

      const [
        parameters,
        clientDetails,
        retirementFunds,
        definedBenefitFunds,
        voluntaryInvestments,
        futureInflows,
        lumpSumNeeds,
        incomeNeeds,
        incomeProvisions,
      ] = await Promise.all([
        storage.getRetirementParameters(planId),
        storage.getClientDetails(),
        storage.getRetirementFunds(),
        storage.getDefinedBenefitFunds(),
        storage.getVoluntaryInvestments(),
        storage.getFutureInflows(),
        storage.getRetirementLumpSumNeeds(),
        storage.getIncomeNeeds(),
        storage.getIncomeProvisions(),
      ]);

      // Use the primary entity's age as the client age. Fall back to first row.
      const primary = clientDetails.find(c => c.entityType === "Primary entity") ?? clientDetails[0];
      const clientAge = primary ? parseInt(primary.age) || 0 : 0;

      const input = {
        parameters: parameters ?? null,
        clientAge,
        retirementFunds,
        definedBenefitFunds,
        voluntaryInvestments,
        futureInflows,
        lumpSumNeeds,
        incomeNeeds,
        incomeProvisions,
      };

      const projection = computeRetirementProjection(input);
      const ready = isRetirementReadyToProject(input);

      res.json({ ...projection, ready });
    } catch (error) {
      console.error("Error computing retirement projection:", error);
      res.status(500).json({ message: "Failed to compute retirement projection" });
    }
  });
}
