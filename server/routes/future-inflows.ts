import type { Express } from "express";
import { storage } from "../storage";
import {
  insertFutureInflowSchema,
  updateFutureInflowSchema,
} from "@shared/schema";

export function registerFutureInflowRoutes(app: Express) {
  app.get("/api/future-inflows", async (_req, res) => {
    try {
      const inflows = await storage.getFutureInflows();
      res.json(inflows);
    } catch (error) {
      console.error("Error fetching future inflows:", error);
      res.status(500).json({ message: "Failed to fetch future inflows" });
    }
  });

  app.get("/api/future-inflows/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid inflow ID" });
      }

      const inflow = await storage.getFutureInflow(id);
      if (!inflow) {
        return res.status(404).json({ message: "Future inflow not found" });
      }

      res.json(inflow);
    } catch (error) {
      console.error("Error fetching future inflow:", error);
      res.status(500).json({ message: "Failed to fetch future inflow" });
    }
  });

  app.post("/api/future-inflows", async (req, res) => {
    try {
      const validated = insertFutureInflowSchema.parse(req.body);
      const inflow = await storage.createFutureInflow(validated);
      res.status(201).json(inflow);
    } catch (error) {
      console.error("Error creating future inflow:", error);
      res.status(400).json({ message: "Invalid future inflow data" });
    }
  });

  app.patch("/api/future-inflows/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid inflow ID" });
      }

      const validated = updateFutureInflowSchema.parse(req.body);
      const inflow = await storage.updateFutureInflow(id, validated);

      if (!inflow) {
        return res.status(404).json({ message: "Future inflow not found" });
      }

      res.json(inflow);
    } catch (error) {
      console.error("Error updating future inflow:", error);
      res.status(400).json({ message: "Invalid future inflow data" });
    }
  });

  app.delete("/api/future-inflows/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid inflow ID" });
      }

      const success = await storage.deleteFutureInflow(id);
      if (!success) {
        return res.status(404).json({ message: "Future inflow not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting future inflow:", error);
      res.status(500).json({ message: "Failed to delete future inflow" });
    }
  });
}
