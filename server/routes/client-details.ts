import type { Express } from "express";
import { storage } from "../storage";
import { insertClientDetailsSchema } from "@shared/schema";

export function registerClientDetailsRoutes(app: Express) {
  app.get("/api/client-details", async (req, res) => {
    try {
      const clientDetails = await storage.getClientDetails();
      res.json(clientDetails);
    } catch (error) {
      console.error("Error fetching client details:", error);
      res.status(500).json({ message: "Failed to fetch client details" });
    }
  });

  app.post("/api/client-details", async (req, res) => {
    try {
      const validatedData = insertClientDetailsSchema.parse(req.body);
      const clientDetail = await storage.createClientDetail(validatedData);
      res.status(201).json(clientDetail);
    } catch (error) {
      console.error("Error creating client detail:", error);
      res.status(400).json({ message: "Invalid client detail data" });
    }
  });

  app.patch("/api/client-details/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client detail ID" });
      }

      const updates = req.body;
      const clientDetail = await storage.updateClientDetail(id, updates);
      res.json(clientDetail);
    } catch (error) {
      console.error("Error updating client detail:", error);
      res.status(400).json({ message: "Invalid client detail data" });
    }
  });

  app.delete("/api/client-details/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client detail ID" });
      }

      await storage.deleteClientDetail(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting client detail:", error);
      res.status(500).json({ message: "Failed to delete client detail" });
    }
  });
}
