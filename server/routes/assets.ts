import type { Express } from "express";
import { storage } from "../storage";
import { insertAssetsSchema } from "@shared/assets-schema";

export function registerAssetsRoutes(app: Express) {
  app.get("/api/assets", async (req, res) => {
    try {
      const { search } = req.query;
      const assets = search && typeof search === "string"
        ? await storage.searchAssets(search)
        : await storage.getAssets();
      res.json(assets);
    } catch (error) {
      console.error("Error fetching assets:", error);
      res.status(500).json({ message: "Failed to fetch assets" });
    }
  });

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
}
