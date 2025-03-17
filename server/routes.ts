import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertImageSchema, insertCartItemSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Images routes
  app.get("/api/images", async (_req, res) => {
    const images = await storage.getImages();
    res.json(images);
  });

  app.get("/api/images/:type", async (req, res) => {
    const images = await storage.getImagesByType(req.params.type);
    res.json(images);
  });

  app.get("/api/images/detail/:id", async (req, res) => {
    const image = await storage.getImageById(parseInt(req.params.id));
    if (!image) return res.status(404).send("Image not found");
    res.json(image);
  });

  // Cart routes
  app.get("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const items = await storage.getCartItems(req.user!.id);
    res.json(items);
  });

  app.post("/api/cart", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const parsed = insertCartItemSchema.safeParse({
      ...req.body,
      userId: req.user!.id,
      addedAt: new Date().toISOString()
    });
    
    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }

    const item = await storage.addToCart(parsed.data);
    res.status(201).json(item);
  });

  app.delete("/api/cart/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    await storage.removeFromCart(parseInt(req.params.id));
    res.sendStatus(200);
  });

  const httpServer = createServer(app);
  return httpServer;
}
