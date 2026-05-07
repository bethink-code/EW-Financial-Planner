import type { Express } from "express";
import { storage } from "../storage";
import {
  insertFinancialPlanSchema,
  updateFinancialPlanSchema,
} from "@shared/schema";

export function registerFinancialPlanRoutes(app: Express) {
  app.get("/api/financial-plans", async (req, res) => {
    try {
      const { search } = req.query;
      const plans = search && typeof search === "string"
        ? await storage.searchFinancialPlans(search)
        : await storage.getFinancialPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching financial plans:", error);
      res.status(500).json({ message: "Failed to fetch financial plans" });
    }
  });

  app.get("/api/financial-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }

      const plan = await storage.getFinancialPlan(id);
      if (!plan) {
        return res.status(404).json({ message: "Financial plan not found" });
      }

      res.json(plan);
    } catch (error) {
      console.error("Error fetching financial plan:", error);
      res.status(500).json({ message: "Failed to fetch financial plan" });
    }
  });

  app.get("/api/financial-plans/:id/with-needs", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }

      const planWithNeeds = await storage.getFinancialPlanWithNeeds(id);
      if (!planWithNeeds) {
        return res.status(404).json({ message: "Financial plan not found" });
      }

      res.json(planWithNeeds);
    } catch (error) {
      console.error("Error fetching financial plan with needs:", error);
      res.status(500).json({ message: "Failed to fetch financial plan with needs" });
    }
  });

  app.post("/api/financial-plans", async (req, res) => {
    try {
      const validatedData = insertFinancialPlanSchema.parse(req.body);
      const plan = await storage.createFinancialPlan(validatedData);
      res.status(201).json(plan);
    } catch (error) {
      console.error("Error creating financial plan:", error);
      res.status(400).json({ message: "Invalid financial plan data" });
    }
  });

  app.patch("/api/financial-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }

      const validatedData = updateFinancialPlanSchema.parse(req.body);
      const plan = await storage.updateFinancialPlan(id, validatedData);

      if (!plan) {
        return res.status(404).json({ message: "Financial plan not found" });
      }

      res.json(plan);
    } catch (error) {
      console.error("Error updating financial plan:", error);
      res.status(400).json({ message: "Invalid financial plan data" });
    }
  });

  app.delete("/api/financial-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }

      const deleted = await storage.deleteFinancialPlan(id);
      if (!deleted) {
        return res.status(404).json({ message: "Financial plan not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting financial plan:", error);
      res.status(500).json({ message: "Failed to delete financial plan" });
    }
  });
}
