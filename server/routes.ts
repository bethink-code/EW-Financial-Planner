import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertRetirementFundSchema,
  updateRetirementFundSchema,
  insertLumpSumBequestSchema,
  updateLumpSumBequestSchema,
  insertAssuranceSchema,
  updateAssuranceSchema,
  insertDefinedBenefitFundSchema,
  updateDefinedBenefitFundSchema,
  insertVoluntaryInvestmentSchema,
  updateVoluntaryInvestmentSchema,
  insertIncomeNeedsSchema,
  updateIncomeNeedsSchema,
  insertIncomeProvisionsSchema,
  updateIncomeProvisionsSchema,
  insertResidueSchema,
  updateResidueSchema,
  insertAdditionalEstateDutyItemsSchema,
  updateAdditionalEstateDutyItemsSchema,
  insertLiabilitiesSchema,
  updateLiabilitiesSchema,
  insertClientDetailsSchema,
  updateClientDetailsSchema,
  insertEstatePositionParametersSchema,
  updateEstatePositionParametersSchema,
  insertFinancialPlanSchema,
  updateFinancialPlanSchema,
} from "@shared/schema";
import { insertAssetsSchema } from "@shared/assets-schema";
import { insertCommentSchema, updateCommentSchema } from "@shared/schema";
import { entityIdsToNames, entityNamesToIds } from "./entity-resolver";

export async function registerRoutes(app: Express): Promise<Server> {

  // Financial Plans
  app.get("/api/financial-plans", async (req, res) => {
    try {
      const plans = await storage.getFinancialPlans();
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

  app.post("/api/financial-plans", async (req, res) => {
    try {
      const now = new Date().toISOString().split("T")[0];
      const validatedData = insertFinancialPlanSchema.parse({
        ...req.body,
        createdAt: now,
        updatedAt: now,
      });
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

      const now = new Date().toISOString().split("T")[0];
      const validatedData = updateFinancialPlanSchema.parse({
        ...req.body,
        updatedAt: now,
      });
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

  // Entity conversion endpoints
  app.post("/api/entities/resolve", async (req, res) => {
    try {
      const { names } = req.body; // array of entity names
      const clientDetails = await storage.getClientDetails();
      const entityIds = entityNamesToIds(names, clientDetails);
      res.json({ entityIds });
    } catch (error) {
      console.error("Error resolving entities:", error);
      res.status(500).json({ message: "Failed to resolve entities" });
    }
  });

  app.post("/api/entities/names", async (req, res) => {
    try {
      const { entityIds } = req.body; // array of entity IDs
      const clientDetails = await storage.getClientDetails();
      const names = entityIdsToNames(entityIds, clientDetails);
      res.json({ names });
    } catch (error) {
      console.error("Error converting entity IDs to names:", error);
      res.status(500).json({ message: "Failed to convert entity IDs" });
    }
  });

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
      res
        .status(500)
        .json({ message: "Failed to fetch defined benefit funds" });
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
        return res
          .status(404)
          .json({ message: "Defined benefit fund not found" });
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
        return res
          .status(404)
          .json({ message: "Defined benefit fund not found" });
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
        return res
          .status(404)
          .json({ message: "Defined benefit fund not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting defined benefit fund:", error);
      res
        .status(500)
        .json({ message: "Failed to delete defined benefit fund" });
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
      res
        .status(500)
        .json({ message: "Failed to fetch voluntary investments" });
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
        return res
          .status(404)
          .json({ message: "Voluntary investment not found" });
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
      console.log("Received request body:", req.body);
      const validatedData = insertVoluntaryInvestmentSchema.parse(req.body);
      console.log("Validated data:", validatedData);
      const investment = await storage.createVoluntaryInvestment(validatedData);
      res.status(201).json(investment);
    } catch (error) {
      console.error("Error creating voluntary investment:", error);
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Invalid voluntary investment data" });
      }
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
      const investment = await storage.updateVoluntaryInvestment(
        id,
        validatedData,
      );

      if (!investment) {
        return res
          .status(404)
          .json({ message: "Voluntary investment not found" });
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
        return res
          .status(404)
          .json({ message: "Voluntary investment not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting voluntary investment:", error);
      res
        .status(500)
        .json({ message: "Failed to delete voluntary investment" });
    }
  });

  // Income Needs Routes

  // Get all income needs
  app.get("/api/income-needs", async (req, res) => {
    try {
      const { search } = req.query;
      let needs;

      if (search && typeof search === "string") {
        needs = await storage.searchIncomeNeeds(search);
      } else {
        needs = await storage.getIncomeNeeds();
      }

      res.json(needs);
    } catch (error) {
      console.error("Error fetching income needs:", error);
      res.status(500).json({ message: "Failed to fetch income needs" });
    }
  });

  // Get single income need
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

  // Create new income need
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

  // Update income need
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

  // Delete income need
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

  // Income Provisions Routes

  // Get all income provisions
  app.get("/api/income-provisions", async (req, res) => {
    try {
      const { search } = req.query;
      let provisions;

      if (search && typeof search === "string") {
        provisions = await storage.searchIncomeProvisions(search);
      } else {
        provisions = await storage.getIncomeProvisions();
      }

      res.json(provisions);
    } catch (error) {
      console.error("Error fetching income provisions:", error);
      res.status(500).json({ message: "Failed to fetch income provisions" });
    }
  });

  // Get single income provision
  app.get("/api/income-provisions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid provision ID" });
      }

      const provision = await storage.getIncomeProvision(id);
      if (!provision) {
        return res.status(404).json({ message: "Income provision not found" });
      }

      res.json(provision);
    } catch (error) {
      console.error("Error fetching income provision:", error);
      res.status(500).json({ message: "Failed to fetch income provision" });
    }
  });

  // Create new income provision
  app.post("/api/income-provisions", async (req, res) => {
    try {
      const validatedData = insertIncomeProvisionsSchema.parse(req.body);
      const provision = await storage.createIncomeProvision(validatedData);
      res.status(201).json(provision);
    } catch (error) {
      console.error("Error creating income provision:", error);
      res.status(400).json({ message: "Invalid income provision data" });
    }
  });

  // Update income provision
  app.patch("/api/income-provisions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid provision ID" });
      }

      const validatedData = updateIncomeProvisionsSchema.parse(req.body);
      const provision = await storage.updateIncomeProvision(id, validatedData);

      if (!provision) {
        return res.status(404).json({ message: "Income provision not found" });
      }

      res.json(provision);
    } catch (error) {
      console.error("Error updating income provision:", error);
      res.status(400).json({ message: "Invalid income provision data" });
    }
  });

  // Delete income provision
  app.delete("/api/income-provisions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid provision ID" });
      }

      const success = await storage.deleteIncomeProvision(id);
      if (!success) {
        return res.status(404).json({ message: "Income provision not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting income provision:", error);
      res.status(500).json({ message: "Failed to delete income provision" });
    }
  });

  // Residue Routes

  // Get all residue items
  app.get("/api/residue", async (req, res) => {
    try {
      const { search } = req.query;
      let items;

      if (search && typeof search === "string") {
        items = await storage.searchResidue(search);
      } else {
        items = await storage.getResidue();
      }

      res.json(items);
    } catch (error) {
      console.error("Error fetching residue:", error);
      res.status(500).json({ message: "Failed to fetch residue" });
    }
  });

  // Get single residue item
  app.get("/api/residue/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid residue ID" });
      }

      const item = await storage.getResidueItem(id);
      if (!item) {
        return res.status(404).json({ message: "Residue item not found" });
      }

      res.json(item);
    } catch (error) {
      console.error("Error fetching residue item:", error);
      res.status(500).json({ message: "Failed to fetch residue item" });
    }
  });

  // Create new residue item
  app.post("/api/residue", async (req, res) => {
    try {
      const validatedData = insertResidueSchema.parse(req.body);
      const item = await storage.createResidueItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating residue item:", error);
      res.status(400).json({ message: "Invalid residue data" });
    }
  });

  // Update residue item
  app.patch("/api/residue/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid residue ID" });
      }

      const validatedData = updateResidueSchema.parse(req.body);
      const item = await storage.updateResidueItem(id, validatedData);

      if (!item) {
        return res.status(404).json({ message: "Residue item not found" });
      }

      res.json(item);
    } catch (error) {
      console.error("Error updating residue item:", error);
      res.status(400).json({ message: "Invalid residue data" });
    }
  });

  // Delete residue item
  app.delete("/api/residue/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid residue ID" });
      }

      const success = await storage.deleteResidueItem(id);
      if (!success) {
        return res.status(404).json({ message: "Residue item not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting residue item:", error);
      res.status(500).json({ message: "Failed to delete residue item" });
    }
  });

  // Additional Estate Duty Items Routes

  // Get all additional estate duty items
  app.get("/api/additional-estate-duty-items", async (req, res) => {
    try {
      const { search } = req.query;
      let items;

      if (search && typeof search === "string") {
        items = await storage.searchAdditionalEstateDutyItems(search);
      } else {
        items = await storage.getAdditionalEstateDutyItems();
      }

      res.json(items);
    } catch (error) {
      console.error("Error fetching additional estate duty items:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch additional estate duty items" });
    }
  });

  // Get single additional estate duty item
  app.get("/api/additional-estate-duty-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid estate duty item ID" });
      }

      const item = await storage.getAdditionalEstateDutyItem(id);
      if (!item) {
        return res
          .status(404)
          .json({ message: "Additional estate duty item not found" });
      }

      res.json(item);
    } catch (error) {
      console.error("Error fetching additional estate duty item:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch additional estate duty item" });
    }
  });

  // Create new additional estate duty item
  app.post("/api/additional-estate-duty-items", async (req, res) => {
    try {
      const validatedData = insertAdditionalEstateDutyItemsSchema.parse(
        req.body,
      );
      const item = await storage.createAdditionalEstateDutyItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating additional estate duty item:", error);
      res
        .status(400)
        .json({ message: "Invalid additional estate duty item data" });
    }
  });

  // Update additional estate duty item
  app.patch("/api/additional-estate-duty-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid estate duty item ID" });
      }

      const validatedData = updateAdditionalEstateDutyItemsSchema.parse(
        req.body,
      );
      const item = await storage.updateAdditionalEstateDutyItem(
        id,
        validatedData,
      );

      if (!item) {
        return res
          .status(404)
          .json({ message: "Additional estate duty item not found" });
      }

      res.json(item);
    } catch (error) {
      console.error("Error updating additional estate duty item:", error);
      res
        .status(400)
        .json({ message: "Invalid additional estate duty item data" });
    }
  });

  // Delete additional estate duty item
  app.delete("/api/additional-estate-duty-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid estate duty item ID" });
      }

      const success = await storage.deleteAdditionalEstateDutyItem(id);
      if (!success) {
        return res
          .status(404)
          .json({ message: "Additional estate duty item not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting additional estate duty item:", error);
      res
        .status(500)
        .json({ message: "Failed to delete additional estate duty item" });
    }
  });

  // Get all liabilities
  app.get("/api/liabilities", async (req, res) => {
    try {
      const { search } = req.query;
      let liabilities;

      if (search && typeof search === "string") {
        liabilities = await storage.searchLiabilities(search);
      } else {
        liabilities = await storage.getLiabilities();
      }

      res.json(liabilities);
    } catch (error) {
      console.error("Error fetching liabilities:", error);
      res.status(500).json({ message: "Failed to fetch liabilities" });
    }
  });

  // Get single liability
  app.get("/api/liabilities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid liability ID" });
      }

      const liability = await storage.getLiability(id);
      if (!liability) {
        return res.status(404).json({ message: "Liability not found" });
      }

      res.json(liability);
    } catch (error) {
      console.error("Error fetching liability:", error);
      res.status(500).json({ message: "Failed to fetch liability" });
    }
  });

  // Create new liability
  app.post("/api/liabilities", async (req, res) => {
    try {
      const validatedData = insertLiabilitiesSchema.parse(req.body);
      const liability = await storage.createLiability(validatedData);
      res.status(201).json(liability);
    } catch (error) {
      console.error("Error creating liability:", error);
      res.status(400).json({ message: "Invalid liability data" });
    }
  });

  // Update liability
  app.patch("/api/liabilities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid liability ID" });
      }

      const validatedData = updateLiabilitiesSchema.parse(req.body);
      const liability = await storage.updateLiability(id, validatedData);

      if (!liability) {
        return res.status(404).json({ message: "Liability not found" });
      }

      res.json(liability);
    } catch (error) {
      console.error("Error updating liability:", error);
      res.status(400).json({ message: "Invalid liability data" });
    }
  });

  // Delete liability
  app.delete("/api/liabilities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid liability ID" });
      }

      const success = await storage.deleteLiability(id);
      if (!success) {
        return res.status(404).json({ message: "Liability not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting liability:", error);
      res.status(500).json({ message: "Failed to delete liability" });
    }
  });

  // Assets Routes

  // Get all assets
  app.get("/api/assets", async (req, res) => {
    try {
      const { search } = req.query;
      let assets;

      if (search && typeof search === "string") {
        assets = await storage.searchAssets(search);
      } else {
        assets = await storage.getAssets();
      }

      res.json(assets);
    } catch (error) {
      console.error("Error fetching assets:", error);
      res.status(500).json({ message: "Failed to fetch assets" });
    }
  });

  // Get single asset
  app.get("/api/assets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid asset ID" });
      }

      const asset = await storage.getAsset(id);
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }

      res.json(asset);
    } catch (error) {
      console.error("Error fetching asset:", error);
      res.status(500).json({ message: "Failed to fetch asset" });
    }
  });

  // Create new asset
  app.post("/api/assets", async (req, res) => {
    try {
      const validatedData = insertAssetsSchema.parse(req.body);
      const asset = await storage.createAsset(validatedData);
      res.status(201).json(asset);
    } catch (error) {
      console.error("Error creating asset:", error);
      res.status(400).json({ message: "Invalid asset data" });
    }
  });

  // Update asset
  app.patch("/api/assets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid asset ID" });
      }

      const validatedData = insertAssetsSchema.partial().parse(req.body);
      const asset = await storage.updateAsset(id, validatedData);

      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }

      res.json(asset);
    } catch (error) {
      console.error("Error updating asset:", error);
      res.status(400).json({ message: "Invalid asset data" });
    }
  });

  // Delete asset
  app.delete("/api/assets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid asset ID" });
      }

      const success = await storage.deleteAsset(id);
      if (!success) {
        return res.status(404).json({ message: "Asset not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting asset:", error);
      res.status(500).json({ message: "Failed to delete asset" });
    }
  });

  // Assets API routes
  app.get("/api/assets", async (req, res) => {
    try {
      const assets = await storage.getAssets();
      res.json(assets);
    } catch (error) {
      console.error("Error fetching assets:", error);
      res.status(500).json({ message: "Failed to fetch assets" });
    }
  });

  app.post("/api/assets", async (req, res) => {
    try {
      const validatedData = insertAssetsSchema.parse(req.body);
      const asset = await storage.createAsset(validatedData);
      res.status(201).json(asset);
    } catch (error) {
      console.error("Error creating asset:", error);
      res.status(400).json({ message: "Invalid asset data" });
    }
  });

  app.patch("/api/assets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid asset ID" });
      }

      const updates = req.body;
      const asset = await storage.updateAsset(id, updates);
      res.json(asset);
    } catch (error) {
      console.error("Error updating asset:", error);
      res.status(400).json({ message: "Invalid asset data" });
    }
  });

  app.delete("/api/assets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid asset ID" });
      }

      await storage.deleteAsset(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting asset:", error);
      res.status(500).json({ message: "Failed to delete asset" });
    }
  });

  // Liabilities API routes
  app.get("/api/liabilities", async (req, res) => {
    try {
      const liabilities = await storage.getLiabilities();
      res.json(liabilities);
    } catch (error) {
      console.error("Error fetching liabilities:", error);
      res.status(500).json({ message: "Failed to fetch liabilities" });
    }
  });

  app.post("/api/liabilities", async (req, res) => {
    try {
      const validatedData = insertLiabilitiesSchema.parse(req.body);
      const liability = await storage.createLiability(validatedData);
      res.status(201).json(liability);
    } catch (error) {
      console.error("Error creating liability:", error);
      res.status(400).json({ message: "Invalid liability data" });
    }
  });

  app.patch("/api/liabilities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid liability ID" });
      }

      const updates = req.body;
      const liability = await storage.updateLiability(id, updates);
      res.json(liability);
    } catch (error) {
      console.error("Error updating liability:", error);
      res.status(400).json({ message: "Invalid liability data" });
    }
  });

  app.delete("/api/liabilities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid liability ID" });
      }

      await storage.deleteLiability(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting liability:", error);
      res.status(500).json({ message: "Failed to delete liability" });
    }
  });

  // Client Details API routes
  app.get("/api/client-details", async (req, res) => {
    try {
      const clientDetails = await storage.getClientDetails();
      res.json(clientDetails);
    } catch (error) {
      console.error("Error fetching client details:", error);
      res.status(500).json({ message: "Failed to fetch client details" });
    }
  });

  app.post("/api/client-details", async (req, res) => {
    try {
      const validatedData = insertClientDetailsSchema.parse(req.body);
      const clientDetail = await storage.createClientDetail(validatedData);
      res.status(201).json(clientDetail);
    } catch (error) {
      console.error("Error creating client detail:", error);
      res.status(400).json({ message: "Invalid client detail data" });
    }
  });

  app.patch("/api/client-details/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client detail ID" });
      }

      const updates = req.body;
      const clientDetail = await storage.updateClientDetail(id, updates);
      res.json(clientDetail);
    } catch (error) {
      console.error("Error updating client detail:", error);
      res.status(400).json({ message: "Invalid client detail data" });
    }
  });

  app.delete("/api/client-details/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client detail ID" });
      }

      await storage.deleteClientDetail(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting client detail:", error);
      res.status(500).json({ message: "Failed to delete client detail" });
    }
  });

  // Estate Position Parameters API routes
  app.get("/api/estate-position-parameters", async (req, res) => {
    try {
      const parameters = await storage.getOrCreateEstatePositionParameter();
      res.json(parameters);
    } catch (error) {
      console.error("Error fetching estate position parameters:", error);
      res.status(500).json({ message: "Failed to fetch estate position parameters" });
    }
  });

  app.patch("/api/estate-position-parameters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid parameter ID" });
      }

      const validatedData = updateEstatePositionParametersSchema.parse(req.body);
      
      // Add current timestamp
      const updatesWithTimestamp = {
        ...validatedData,
        lastUpdated: new Date().toISOString(),
      };

      const parameter = await storage.updateEstatePositionParameter(id, updatesWithTimestamp);
      res.json(parameter);
    } catch (error) {
      console.error("Error updating estate position parameters:", error);
      res.status(400).json({ message: "Invalid parameter data" });
    }
  });

  // Comments Routes

  app.get("/api/comments", async (req, res) => {
    try {
      const page = req.query.page as string;
      if (!page) {
        return res.json([]);
      }
      const items = await storage.getCommentsByPage(page);
      res.json(items);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/comments", async (req, res) => {
    try {
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        createdAt: new Date().toISOString(),
      });
      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(400).json({ message: "Invalid comment data" });
    }
  });

  app.patch("/api/comments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid comment ID" });
      }
      const validatedData = updateCommentSchema.parse(req.body);
      const comment = await storage.updateComment(id, validatedData);
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      res.json(comment);
    } catch (error) {
      console.error("Error updating comment:", error);
      res.status(400).json({ message: "Invalid comment data" });
    }
  });

  app.delete("/api/comments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid comment ID" });
      }
      const success = await storage.deleteComment(id);
      if (!success) {
        return res.status(404).json({ message: "Comment not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting comment:", error);
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
