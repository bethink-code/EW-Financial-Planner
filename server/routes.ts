import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRetirementFundSchema, updateRetirementFundSchema, insertLumpSumBequestSchema, updateLumpSumBequestSchema, insertAssuranceSchema, updateAssuranceSchema } from "@shared/schema";

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

  // Lump Sum Bequests Routes
  
  // Get all lump sum bequests
  app.get("/api/lump-sum-bequests", async (req, res) => {
    try {
      const { search } = req.query;
      let bequests;
      
      if (search && typeof search === "string") {
        bequests = await storage.searchLumpSumBequests(search);
      } else {
        bequests = await storage.getLumpSumBequests();
      }
      
      res.json(bequests);
    } catch (error) {
      console.error("Error fetching lump sum bequests:", error);
      res.status(500).json({ message: "Failed to fetch lump sum bequests" });
    }
  });

  // Get single lump sum bequest
  app.get("/api/lump-sum-bequests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid bequest ID" });
      }

      const bequest = await storage.getLumpSumBequest(id);
      if (!bequest) {
        return res.status(404).json({ message: "Lump sum bequest not found" });
      }

      res.json(bequest);
    } catch (error) {
      console.error("Error fetching lump sum bequest:", error);
      res.status(500).json({ message: "Failed to fetch lump sum bequest" });
    }
  });

  // Create new lump sum bequest
  app.post("/api/lump-sum-bequests", async (req, res) => {
    try {
      const validatedData = insertLumpSumBequestSchema.parse(req.body);
      const bequest = await storage.createLumpSumBequest(validatedData);
      res.status(201).json(bequest);
    } catch (error) {
      console.error("Error creating lump sum bequest:", error);
      res.status(400).json({ message: "Invalid bequest data" });
    }
  });

  // Update lump sum bequest
  app.patch("/api/lump-sum-bequests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid bequest ID" });
      }

      const validatedData = updateLumpSumBequestSchema.parse(req.body);
      const bequest = await storage.updateLumpSumBequest(id, validatedData);
      
      if (!bequest) {
        return res.status(404).json({ message: "Lump sum bequest not found" });
      }

      res.json(bequest);
    } catch (error) {
      console.error("Error updating lump sum bequest:", error);
      res.status(400).json({ message: "Invalid bequest data" });
    }
  });

  // Delete lump sum bequest
  app.delete("/api/lump-sum-bequests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid bequest ID" });
      }

      const deleted = await storage.deleteLumpSumBequest(id);
      if (!deleted) {
        return res.status(404).json({ message: "Lump sum bequest not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting lump sum bequest:", error);
      res.status(500).json({ message: "Failed to delete lump sum bequest" });
    }
  });

  // Assurance API routes
  
  // Get all assurance policies
  app.get("/api/assurance", async (req, res) => {
    try {
      const { search } = req.query;
      let policies;
      
      if (search && typeof search === "string") {
        policies = await storage.searchAssurance(search);
      } else {
        policies = await storage.getAssurance();
      }
      
      res.json(policies);
    } catch (error) {
      console.error("Error fetching assurance policies:", error);
      res.status(500).json({ message: "Failed to fetch assurance policies" });
    }
  });

  // Get single assurance policy
  app.get("/api/assurance/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid assurance policy ID" });
      }

      const policy = await storage.getAssuranceById(id);
      if (!policy) {
        return res.status(404).json({ message: "Assurance policy not found" });
      }

      res.json(policy);
    } catch (error) {
      console.error("Error fetching assurance policy:", error);
      res.status(500).json({ message: "Failed to fetch assurance policy" });
    }
  });

  // Create new assurance policy
  app.post("/api/assurance", async (req, res) => {
    try {
      const validatedData = insertAssuranceSchema.parse(req.body);
      const policy = await storage.createAssurance(validatedData);
      res.status(201).json(policy);
    } catch (error) {
      console.error("Error creating assurance policy:", error);
      res.status(400).json({ message: "Invalid assurance policy data" });
    }
  });

  // Update assurance policy
  app.patch("/api/assurance/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid assurance policy ID" });
      }

      const validatedData = updateAssuranceSchema.parse(req.body);
      const policy = await storage.updateAssurance(id, validatedData);
      
      if (!policy) {
        return res.status(404).json({ message: "Assurance policy not found" });
      }

      res.json(policy);
    } catch (error) {
      console.error("Error updating assurance policy:", error);
      res.status(400).json({ message: "Invalid assurance policy data" });
    }
  });

  // Delete assurance policy
  app.delete("/api/assurance/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid assurance policy ID" });
      }

      const success = await storage.deleteAssurance(id);
      if (!success) {
        return res.status(404).json({ message: "Assurance policy not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting assurance policy:", error);
      res.status(500).json({ message: "Failed to delete assurance policy" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
