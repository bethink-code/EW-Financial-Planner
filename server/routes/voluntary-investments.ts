import type { Express } from "express";
import { storage } from "../storage";
import {
  insertVoluntaryInvestmentSchema,
  updateVoluntaryInvestmentSchema,
} from "@shared/schema";

export function registerVoluntaryInvestmentRoutes(app: Express) {
  app.get("/api/voluntary-investments", async (req, res) => {
    try {
      const { search } = req.query;
      const investments = search && typeof search === "string"
        ? await storage.searchVoluntaryInvestments(search)
        : await storage.getVoluntaryInvestments();
      res.json(investments);
    } catch (error) {
      console.error("Error fetching voluntary investments:", error);
      res.status(500).json({ message: "Failed to fetch voluntary investments" });
    }
  });

  app.get("/api/voluntary-investments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid investment ID" });
      }

      const investment = await storage.getVoluntaryInvestment(id);
      if (!investment) {
        return res.status(404).json({ message: "Voluntary investment not found" });
      }

      res.json(investment);
    } catch (error) {
      console.error("Error fetching voluntary investment:", error);
      res.status(500).json({ message: "Failed to fetch voluntary investment" });
    }
  });

  app.post("/api/voluntary-investments", async (req, res) => {
    try {
      const validatedData = insertVoluntaryInvestmentSchema.parse(req.body);
      const investment = await storage.createVoluntaryInvestment(validatedData);
      res.status(201).json(investment);
    } catch (error) {
      console.error("Error creating voluntary investment:", error);
      const message = error instanceof Error ? error.message : "Invalid voluntary investment data";
      res.status(400).json({ message });
    }
  });

  app.patch("/api/voluntary-investments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid investment ID" });
      }

      const validatedData = updateVoluntaryInvestmentSchema.parse(req.body);
      const investment = await storage.updateVoluntaryInvestment(id, validatedData);

      if (!investment) {
        return res.status(404).json({ message: "Voluntary investment not found" });
      }

      res.json(investment);
    } catch (error) {
      console.error("Error updating voluntary investment:", error);
      res.status(400).json({ message: "Invalid voluntary investment data" });
    }
  });

  app.delete("/api/voluntary-investments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid investment ID" });
      }

      const success = await storage.deleteVoluntaryInvestment(id);
      if (!success) {
        return res.status(404).json({ message: "Voluntary investment not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting voluntary investment:", error);
      res.status(500).json({ message: "Failed to delete voluntary investment" });
    }
  });
}
