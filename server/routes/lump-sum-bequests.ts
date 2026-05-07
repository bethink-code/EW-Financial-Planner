import type { Express } from "express";
import { storage } from "../storage";
import {
  insertLumpSumBequestSchema,
  updateLumpSumBequestSchema,
} from "@shared/schema";

export function registerLumpSumBequestRoutes(app: Express) {
  app.get("/api/lump-sum-bequests", async (req, res) => {
    try {
      const { search } = req.query;
      const bequests = search && typeof search === "string"
        ? await storage.searchLumpSumBequests(search)
        : await storage.getLumpSumBequests();
      res.json(bequests);
    } catch (error) {
      console.error("Error fetching lump sum bequests:", error);
      res.status(500).json({ message: "Failed to fetch lump sum bequests" });
    }
  });

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
}
