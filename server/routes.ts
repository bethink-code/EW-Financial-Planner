import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRetirementFundSchema, updateRetirementFundSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all retirement funds
  app.get("/api/retirement-funds", async (req, res) => {
    try {
      const { search } = req.query;
      let funds;
      
      if (search && typeof search === "string") {
        funds = await storage.searchRetirementFunds(search);
      } else {
        funds = await storage.getRetirementFunds();
      }
      
      res.json(funds);
    } catch (error) {
      console.error("Error fetching retirement funds:", error);
      res.status(500).json({ message: "Failed to fetch retirement funds" });
    }
  });

  // Get single retirement fund
  app.get("/api/retirement-funds/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid fund ID" });
      }

      const fund = await storage.getRetirementFund(id);
      if (!fund) {
        return res.status(404).json({ message: "Retirement fund not found" });
      }

      res.json(fund);
    } catch (error) {
      console.error("Error fetching retirement fund:", error);
      res.status(500).json({ message: "Failed to fetch retirement fund" });
    }
  });

  // Create new retirement fund
  app.post("/api/retirement-funds", async (req, res) => {
    try {
      const validatedData = insertRetirementFundSchema.parse(req.body);
      const fund = await storage.createRetirementFund(validatedData);
      res.status(201).json(fund);
    } catch (error) {
      console.error("Error creating retirement fund:", error);
      res.status(400).json({ message: "Invalid fund data" });
    }
  });

  // Update retirement fund
  app.patch("/api/retirement-funds/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid fund ID" });
      }

      const validatedData = updateRetirementFundSchema.parse(req.body);
      const fund = await storage.updateRetirementFund(id, validatedData);
      
      if (!fund) {
        return res.status(404).json({ message: "Retirement fund not found" });
      }

      res.json(fund);
    } catch (error) {
      console.error("Error updating retirement fund:", error);
      res.status(400).json({ message: "Invalid fund data" });
    }
  });

  // Delete retirement fund
  app.delete("/api/retirement-funds/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid fund ID" });
      }

      const deleted = await storage.deleteRetirementFund(id);
      if (!deleted) {
        return res.status(404).json({ message: "Retirement fund not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting retirement fund:", error);
      res.status(500).json({ message: "Failed to delete retirement fund" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
