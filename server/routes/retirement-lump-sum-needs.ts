import type { Express } from "express";
import { storage } from "../storage";
import {
  insertRetirementLumpSumNeedSchema,
  updateRetirementLumpSumNeedSchema,
} from "@shared/schema";

export function registerRetirementLumpSumNeedRoutes(app: Express) {
  app.get("/api/retirement-lump-sum-needs", async (_req, res) => {
    try {
      const items = await storage.getRetirementLumpSumNeeds();
      res.json(items);
    } catch (error) {
      console.error("Error fetching retirement lump sum needs:", error);
      res.status(500).json({ message: "Failed to fetch retirement lump sum needs" });
    }
  });

  app.get("/api/retirement-lump-sum-needs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid need ID" });
      }

      const item = await storage.getRetirementLumpSumNeed(id);
      if (!item) {
        return res.status(404).json({ message: "Retirement lump sum need not found" });
      }

      res.json(item);
    } catch (error) {
      console.error("Error fetching retirement lump sum need:", error);
      res.status(500).json({ message: "Failed to fetch retirement lump sum need" });
    }
  });

  app.post("/api/retirement-lump-sum-needs", async (req, res) => {
    try {
      const validated = insertRetirementLumpSumNeedSchema.parse(req.body);
      const item = await storage.createRetirementLumpSumNeed(validated);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating retirement lump sum need:", error);
      res.status(400).json({ message: "Invalid retirement lump sum need data" });
    }
  });

  app.patch("/api/retirement-lump-sum-needs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid need ID" });
      }

      const validated = updateRetirementLumpSumNeedSchema.parse(req.body);
      const item = await storage.updateRetirementLumpSumNeed(id, validated);

      if (!item) {
        return res.status(404).json({ message: "Retirement lump sum need not found" });
      }

      res.json(item);
    } catch (error) {
      console.error("Error updating retirement lump sum need:", error);
      res.status(400).json({ message: "Invalid retirement lump sum need data" });
    }
  });

  app.delete("/api/retirement-lump-sum-needs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid need ID" });
      }

      const success = await storage.deleteRetirementLumpSumNeed(id);
      if (!success) {
        return res.status(404).json({ message: "Retirement lump sum need not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting retirement lump sum need:", error);
      res.status(500).json({ message: "Failed to delete retirement lump sum need" });
    }
  });
}
