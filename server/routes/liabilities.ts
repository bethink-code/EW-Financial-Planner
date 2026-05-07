import type { Express } from "express";
import { storage } from "../storage";
import {
  insertLiabilitiesSchema,
  updateLiabilitiesSchema,
} from "@shared/schema";

export function registerLiabilitiesRoutes(app: Express) {
  app.get("/api/liabilities", async (req, res) => {
    try {
      const { search } = req.query;
      const liabilities = search && typeof search === "string"
        ? await storage.searchLiabilities(search)
        : await storage.getLiabilities();
      res.json(liabilities);
    } catch (error) {
      console.error("Error fetching liabilities:", error);
      res.status(500).json({ message: "Failed to fetch liabilities" });
    }
  });

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
}
