import type { Express } from "express";
import { storage } from "../storage";
import { insertResidueSchema, updateResidueSchema } from "@shared/schema";

export function registerResidueRoutes(app: Express) {
  app.get("/api/residue", async (req, res) => {
    try {
      const { search } = req.query;
      const items = search && typeof search === "string"
        ? await storage.searchResidue(search)
        : await storage.getResidue();
      res.json(items);
    } catch (error) {
      console.error("Error fetching residue:", error);
      res.status(500).json({ message: "Failed to fetch residue" });
    }
  });

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
}
