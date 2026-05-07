import type { Express } from "express";
import { storage } from "../storage";
import { insertPlanNeedSchema } from "@shared/schema";

export function registerNeedsRoutes(app: Express) {
  app.get("/api/needs", async (req, res) => {
    try {
      const needs = await storage.getNeeds();
      res.json(needs);
    } catch (error) {
      console.error("Error fetching needs:", error);
      res.status(500).json({ message: "Failed to fetch needs" });
    }
  });

  app.get("/api/needs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid need ID" });
      }

      const need = await storage.getNeed(id);
      if (!need) {
        return res.status(404).json({ message: "Need not found" });
      }

      res.json(need);
    } catch (error) {
      console.error("Error fetching need:", error);
      res.status(500).json({ message: "Failed to fetch need" });
    }
  });

  app.post("/api/financial-plans/:planId/needs", async (req, res) => {
    try {
      const planId = parseInt(req.params.planId);
      if (isNaN(planId)) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }

      const { needId, sortOrder } = req.body;

      const planNeedData = insertPlanNeedSchema.parse({
        planId,
        needId,
        sortOrder: sortOrder || 0,
      });

      const planNeed = await storage.addNeedToPlan(planNeedData);
      res.status(201).json(planNeed);
    } catch (error) {
      console.error("Error adding need to plan:", error);
      res.status(400).json({ message: "Invalid plan need data" });
    }
  });

  app.delete("/api/financial-plans/:planId/needs/:needId", async (req, res) => {
    try {
      const planId = parseInt(req.params.planId);
      const needId = parseInt(req.params.needId);

      if (isNaN(planId) || isNaN(needId)) {
        return res.status(400).json({ message: "Invalid plan ID or need ID" });
      }

      const deleted = await storage.removeNeedFromPlan(planId, needId);
      if (!deleted) {
        return res.status(404).json({ message: "Plan need relationship not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error removing need from plan:", error);
      res.status(500).json({ message: "Failed to remove need from plan" });
    }
  });

  app.put("/api/financial-plans/:planId/needs", async (req, res) => {
    try {
      const planId = parseInt(req.params.planId);
      if (isNaN(planId)) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }

      const { needKeys } = req.body;
      if (!Array.isArray(needKeys)) {
        return res.status(400).json({ message: "needKeys must be an array" });
      }

      const allNeeds = await storage.getNeeds();
      const validNeedKeys = allNeeds.map(need => need.key);

      const invalidKeys = needKeys.filter(key => !validNeedKeys.includes(key));
      if (invalidKeys.length > 0) {
        return res.status(400).json({ message: `Invalid need keys: ${invalidKeys.join(', ')}` });
      }

      const needsToAdd = allNeeds.filter(need => needKeys.includes(need.key));

      await storage.removeAllNeedsFromPlan(planId);

      for (let i = 0; i < needsToAdd.length; i++) {
        const need = needsToAdd[i];
        const planNeedData = insertPlanNeedSchema.parse({
          planId,
          needId: need.id,
          sortOrder: i,
        });
        await storage.addNeedToPlan(planNeedData);
      }

      res.json({ message: "Plan needs updated successfully" });
    } catch (error) {
      console.error("Error updating plan needs:", error);
      res.status(500).json({ message: "Failed to update plan needs" });
    }
  });
}
