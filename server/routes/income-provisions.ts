import type { Express } from "express";
import { storage } from "../storage";
import {
  insertIncomeProvisionsSchema,
  updateIncomeProvisionsSchema,
} from "@shared/schema";

export function registerIncomeProvisionsRoutes(app: Express) {
  app.get("/api/income-provisions", async (req, res) => {
    try {
      const { search } = req.query;
      const provisions = search && typeof search === "string"
        ? await storage.searchIncomeProvisions(search)
        : await storage.getIncomeProvisions();
      res.json(provisions);
    } catch (error) {
      console.error("Error fetching income provisions:", error);
      res.status(500).json({ message: "Failed to fetch income provisions" });
    }
  });

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
}
