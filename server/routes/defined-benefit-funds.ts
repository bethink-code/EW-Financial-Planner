import type { Express } from "express";
import { storage } from "../storage";
import {
  insertDefinedBenefitFundSchema,
  updateDefinedBenefitFundSchema,
} from "@shared/schema";

export function registerDefinedBenefitFundRoutes(app: Express) {
  app.get("/api/defined-benefit-funds", async (req, res) => {
    try {
      const { search } = req.query;
      const funds = search && typeof search === "string"
        ? await storage.searchDefinedBenefitFunds(search)
        : await storage.getDefinedBenefitFunds();
      res.json(funds);
    } catch (error) {
      console.error("Error fetching defined benefit funds:", error);
      res.status(500).json({ message: "Failed to fetch defined benefit funds" });
    }
  });

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
}
