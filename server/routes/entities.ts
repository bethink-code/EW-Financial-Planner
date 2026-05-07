import type { Express } from "express";
import { storage } from "../storage";
import { entityIdsToNames, entityNamesToIds } from "../entity-resolver";

export function registerEntityRoutes(app: Express) {
  app.post("/api/entities/resolve", async (req, res) => {
    try {
      const { names } = req.body;
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
      const { entityIds } = req.body;
      const clientDetails = await storage.getClientDetails();
      const names = entityIdsToNames(entityIds, clientDetails);
      res.json({ names });
    } catch (error) {
      console.error("Error converting entity IDs to names:", error);
      res.status(500).json({ message: "Failed to convert entity IDs" });
    }
  });
}
