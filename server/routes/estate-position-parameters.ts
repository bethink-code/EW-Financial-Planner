import type { Express } from "express";
import { storage } from "../storage";
import { updateEstatePositionParametersSchema } from "@shared/schema";

export function registerEstatePositionParameterRoutes(app: Express) {
  app.get("/api/estate-position-parameters", async (req, res) => {
    try {
      const parameters = await storage.getOrCreateEstatePositionParameter();
      res.json(parameters);
    } catch (error) {
      console.error("Error fetching estate position parameters:", error);
      res.status(500).json({ message: "Failed to fetch estate position parameters" });
    }
  });

  app.patch("/api/estate-position-parameters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid parameter ID" });
      }

      const validatedData = updateEstatePositionParametersSchema.parse(req.body);

      const updatesWithTimestamp = {
        ...validatedData,
        lastUpdated: new Date().toISOString(),
      };

      const parameter = await storage.updateEstatePositionParameter(id, updatesWithTimestamp);
      res.json(parameter);
    } catch (error) {
      console.error("Error updating estate position parameters:", error);
      res.status(400).json({ message: "Invalid parameter data" });
    }
  });
}
