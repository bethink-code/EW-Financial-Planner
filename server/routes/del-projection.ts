import type { Express } from "express";
import { storage } from "../storage";
import { computeDelProjection } from "@shared/del-calculations";

/**
 * GET /api/del-projection/:planId
 * Aggregates all DEL inputs and returns the lean projection result.
 * planId is accepted for parity with retirement-projection but is currently
 * ignored — DEL tables are not plan-scoped yet.
 */
export function registerDelProjectionRoutes(app: Express) {
  app.get("/api/del-projection/:planId", async (req, res) => {
    try {
      const planId = parseInt(req.params.planId);
      if (isNaN(planId)) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }

      const [
        estateParameters,
        assurance,
        retirementFunds,
        definedBenefitFunds,
        voluntaryInvestments,
        liabilities,
        lumpSumBequests,
        incomeNeeds,
        incomeProvisions,
      ] = await Promise.all([
        storage.getEstatePositionParameters(),
        storage.getAssurance(),
        storage.getRetirementFunds(),
        storage.getDefinedBenefitFunds(),
        storage.getVoluntaryInvestments(),
        storage.getLiabilities(),
        storage.getLumpSumBequests(),
        storage.getIncomeNeeds(),
        storage.getIncomeProvisions(),
      ]);

      // estate_position_parameters has at most one row in the current schema.
      const params = Array.isArray(estateParameters) ? (estateParameters[0] ?? null) : (estateParameters ?? null);

      const projection = computeDelProjection({
        estateParameters: params,
        assurance,
        retirementFunds,
        definedBenefitFunds,
        voluntaryInvestments,
        liabilities,
        lumpSumBequests,
        incomeNeeds,
        incomeProvisions,
      });

      res.json(projection);
    } catch (error) {
      console.error("Error computing DEL projection:", error);
      res.status(500).json({ message: "Failed to compute DEL projection" });
    }
  });
}
