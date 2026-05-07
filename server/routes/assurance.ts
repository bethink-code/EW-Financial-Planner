import type { Express } from "express";
import { storage } from "../storage";
import {
  insertAssuranceSchema,
  updateAssuranceSchema,
} from "@shared/schema";

export function registerAssuranceRoutes(app: Express) {
  app.get("/api/assurance", async (req, res) => {
    try {
      const { search } = req.query;
      const policies = search && typeof search === "string"
        ? await storage.searchAssurance(search)
        : await storage.getAssurance();
      res.json(policies);
    } catch (error) {
      console.error("Error fetching assurance policies:", error);
      res.status(500).json({ message: "Failed to fetch assurance policies" });
    }
  });

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
}
