import type { Express } from "express";
import { storage } from "../storage";
import {
  insertIncomeNeedsSchema,
  updateIncomeNeedsSchema,
} from "@shared/schema";

export function registerIncomeNeedsRoutes(app: Express) {
  app.get("/api/income-needs", async (req, res) => {
    try {
      const { search } = req.query;
      const needs = search && typeof search === "string"
        ? await storage.searchIncomeNeeds(search)
        : await storage.getIncomeNeeds();
      res.json(needs);
    } catch (error) {
      console.error("Error fetching income needs:", error);
      res.status(500).json({ message: "Failed to fetch income needs" });
    }
  });

  app.get("/api/income-needs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid need ID" });
      }

      const need = await storage.getIncomeNeed(id);
      if (!need) {
        return res.status(404).json({ message: "Income need not found" });
      }

      res.json(need);
    } catch (error) {
      console.error("Error fetching income need:", error);
      res.status(500).json({ message: "Failed to fetch income need" });
    }
  });

  app.post("/api/income-needs", async (req, res) => {
    try {
      const validatedData = insertIncomeNeedsSchema.parse(req.body);
      const need = await storage.createIncomeNeed(validatedData);
      res.status(201).json(need);
    } catch (error) {
      console.error("Error creating income need:", error);
      res.status(400).json({ message: "Invalid income need data" });
    }
  });

  app.patch("/api/income-needs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid need ID" });
      }

      const validatedData = updateIncomeNeedsSchema.parse(req.body);
      const need = await storage.updateIncomeNeed(id, validatedData);

      if (!need) {
        return res.status(404).json({ message: "Income need not found" });
      }

      res.json(need);
    } catch (error) {
      console.error("Error updating income need:", error);
      res.status(400).json({ message: "Invalid income need data" });
    }
  });

  app.delete("/api/income-needs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid need ID" });
      }

      const success = await storage.deleteIncomeNeed(id);
      if (!success) {
        return res.status(404).json({ message: "Income need not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting income need:", error);
      res.status(500).json({ message: "Failed to delete income need" });
    }
  });
}
