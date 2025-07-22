import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRetirementFundSchema, updateRetirementFundSchema, insertLumpSumBequestSchema, updateLumpSumBequestSchema, insertAssuranceSchema, updateAssuranceSchema, insertDefinedBenefitFundSchema, updateDefinedBenefitFundSchema, insertVoluntaryInvestmentSchema, updateVoluntaryInvestmentSchema, insertAssetAndLiabilitySchema, updateAssetAndLiabilitySchema } from "@shared/schema";

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

  // Defined Benefit Funds Routes
  
  // Get all defined benefit funds
  app.get("/api/defined-benefit-funds", async (req, res) => {
    try {
      const { search } = req.query;
      let funds;
      
      if (search && typeof search === "string") {
        funds = await storage.searchDefinedBenefitFunds(search);
      } else {
        funds = await storage.getDefinedBenefitFunds();
      }
      
      res.json(funds);
    } catch (error) {
      console.error("Error fetching defined benefit funds:", error);
      res.status(500).json({ message: "Failed to fetch defined benefit funds" });
    }
  });

  // Get single defined benefit fund
  app.get("/api/defined-benefit-funds/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid fund ID" });
      }

      const fund = await storage.getDefinedBenefitFund(id);
      if (!fund) {
        return res.status(404).json({ message: "Defined benefit fund not found" });
      }

      res.json(fund);
    } catch (error) {
      console.error("Error fetching defined benefit fund:", error);
      res.status(500).json({ message: "Failed to fetch defined benefit fund" });
    }
  });

  // Create new defined benefit fund
  app.post("/api/defined-benefit-funds", async (req, res) => {
    try {
      const validatedData = insertDefinedBenefitFundSchema.parse(req.body);
      const fund = await storage.createDefinedBenefitFund(validatedData);
      res.status(201).json(fund);
    } catch (error) {
      console.error("Error creating defined benefit fund:", error);
      res.status(400).json({ message: "Invalid defined benefit fund data" });
    }
  });

  // Update defined benefit fund
  app.patch("/api/defined-benefit-funds/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid fund ID" });
      }

      const validatedData = updateDefinedBenefitFundSchema.parse(req.body);
      const fund = await storage.updateDefinedBenefitFund(id, validatedData);
      
      if (!fund) {
        return res.status(404).json({ message: "Defined benefit fund not found" });
      }

      res.json(fund);
    } catch (error) {
      console.error("Error updating defined benefit fund:", error);
      res.status(400).json({ message: "Invalid defined benefit fund data" });
    }
  });

  // Delete defined benefit fund
  app.delete("/api/defined-benefit-funds/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid fund ID" });
      }

      const success = await storage.deleteDefinedBenefitFund(id);
      if (!success) {
        return res.status(404).json({ message: "Defined benefit fund not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting defined benefit fund:", error);
      res.status(500).json({ message: "Failed to delete defined benefit fund" });
    }
  });

  // Voluntary Investments Routes
  
  // Get all voluntary investments
  app.get("/api/voluntary-investments", async (req, res) => {
    try {
      const { search } = req.query;
      let investments;
      
      if (search && typeof search === "string") {
        investments = await storage.searchVoluntaryInvestments(search);
      } else {
        investments = await storage.getVoluntaryInvestments();
      }
      
      res.json(investments);
    } catch (error) {
      console.error("Error fetching voluntary investments:", error);
      res.status(500).json({ message: "Failed to fetch voluntary investments" });
    }
  });

  // Get single voluntary investment
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

  // Create new voluntary investment
  app.post("/api/voluntary-investments", async (req, res) => {
    try {
      const validatedData = insertVoluntaryInvestmentSchema.parse(req.body);
      const investment = await storage.createVoluntaryInvestment(validatedData);
      res.status(201).json(investment);
    } catch (error) {
      console.error("Error creating voluntary investment:", error);
      res.status(400).json({ message: "Invalid voluntary investment data" });
    }
  });

  // Update voluntary investment
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

  // Delete voluntary investment
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

  // Assets and Liabilities Routes
  
  // Get all assets and liabilities
  app.get("/api/assets-and-liabilities", async (req, res) => {
    try {
      const { search } = req.query;
      let assets;
      
      if (search && typeof search === "string") {
        assets = await storage.searchAssetsAndLiabilities(search);
      } else {
        assets = await storage.getAssetsAndLiabilities();
      }
      
      res.json(assets);
    } catch (error) {
      console.error("Error fetching assets and liabilities:", error);
      res.status(500).json({ message: "Failed to fetch assets and liabilities" });
    }
  });

  // Get single asset and liability
  app.get("/api/assets-and-liabilities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid asset ID" });
      }

      const asset = await storage.getAssetAndLiability(id);
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }

      res.json(asset);
    } catch (error) {
      console.error("Error fetching asset:", error);
      res.status(500).json({ message: "Failed to fetch asset" });
    }
  });

  // Create new asset and liability
  app.post("/api/assets-and-liabilities", async (req, res) => {
    try {
      const validatedData = insertAssetAndLiabilitySchema.parse(req.body);
      const asset = await storage.createAssetAndLiability(validatedData);
      res.status(201).json(asset);
    } catch (error) {
      console.error("Error creating asset:", error);
      res.status(400).json({ message: "Invalid asset data" });
    }
  });

  // Update asset and liability
  app.patch("/api/assets-and-liabilities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid asset ID" });
      }

      const validatedData = updateAssetAndLiabilitySchema.parse(req.body);
      const asset = await storage.updateAssetAndLiability(id, validatedData);
      
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }

      res.json(asset);
    } catch (error) {
      console.error("Error updating asset:", error);
      res.status(400).json({ message: "Invalid asset data" });
    }
  });

  // Delete asset and liability
  app.delete("/api/assets-and-liabilities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid asset ID" });
      }

      const success = await storage.deleteAssetAndLiability(id);
      if (!success) {
        return res.status(404).json({ message: "Asset not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting asset:", error);
      res.status(500).json({ message: "Failed to delete asset" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
