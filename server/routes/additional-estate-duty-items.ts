import type { Express } from "express";
import { storage } from "../storage";
import {
  insertAdditionalEstateDutyItemsSchema,
  updateAdditionalEstateDutyItemsSchema,
} from "@shared/schema";

export function registerAdditionalEstateDutyItemRoutes(app: Express) {
  app.get("/api/additional-estate-duty-items", async (req, res) => {
    try {
      const { search } = req.query;
      const items = search && typeof search === "string"
        ? await storage.searchAdditionalEstateDutyItems(search)
        : await storage.getAdditionalEstateDutyItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching additional estate duty items:", error);
      res.status(500).json({ message: "Failed to fetch additional estate duty items" });
    }
  });

  app.get("/api/additional-estate-duty-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid estate duty item ID" });
      }

      const item = await storage.getAdditionalEstateDutyItem(id);
      if (!item) {
        return res.status(404).json({ message: "Additional estate duty item not found" });
      }

      res.json(item);
    } catch (error) {
      console.error("Error fetching additional estate duty item:", error);
      res.status(500).json({ message: "Failed to fetch additional estate duty item" });
    }
  });

  app.post("/api/additional-estate-duty-items", async (req, res) => {
    try {
      const validatedData = insertAdditionalEstateDutyItemsSchema.parse(req.body);
      const item = await storage.createAdditionalEstateDutyItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating additional estate duty item:", error);
      res.status(400).json({ message: "Invalid additional estate duty item data" });
    }
  });

  app.patch("/api/additional-estate-duty-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid estate duty item ID" });
      }

      const validatedData = updateAdditionalEstateDutyItemsSchema.parse(req.body);
      const item = await storage.updateAdditionalEstateDutyItem(id, validatedData);

      if (!item) {
        return res.status(404).json({ message: "Additional estate duty item not found" });
      }

      res.json(item);
    } catch (error) {
      console.error("Error updating additional estate duty item:", error);
      res.status(400).json({ message: "Invalid additional estate duty item data" });
    }
  });

  app.delete("/api/additional-estate-duty-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid estate duty item ID" });
      }

      const success = await storage.deleteAdditionalEstateDutyItem(id);
      if (!success) {
        return res.status(404).json({ message: "Additional estate duty item not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting additional estate duty item:", error);
      res.status(500).json({ message: "Failed to delete additional estate duty item" });
    }
  });
}
