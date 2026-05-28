import type { Express } from "express";
import { storage } from "../storage";
import { updateRetirementParametersSchema } from "@shared/schema";

export function registerRetirementParametersRoutes(app: Express) {
  app.get("/api/retirement-parameters/:planId", async (req, res) => {
    try {
      const planId = parseInt(req.params.planId);
      if (isNaN(planId)) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }

      const params = await storage.getRetirementParameters(planId);
      // Return a default-shaped object if not yet created (so the form has defaults to render).
      res.json(
        params ?? {
          planId,
          retirementAge: 65,
          retirementPlanningAge: 90,
          autoCalculateTax: true,
          currentAnnualIncome: "R 0",
          cpi: "4.5%",
          yieldPremium: "3%",
        }
      );
    } catch (error) {
      console.error("Error fetching retirement parameters:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch retirement parameters" });
    }
  });

  app.put("/api/retirement-parameters/:planId", async (req, res) => {
    try {
      const planId = parseInt(req.params.planId);
      if (isNaN(planId)) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }

      const validated = updateRetirementParametersSchema.parse(req.body);
      const params = await storage.upsertRetirementParameters(
        planId,
        validated
      );
      res.json(params);
    } catch (error) {
      console.error("Error saving retirement parameters:", error);
      res.status(400).json({ message: "Invalid retirement parameters data" });
    }
  });
}
