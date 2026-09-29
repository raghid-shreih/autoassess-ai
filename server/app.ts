import express, { type Request, type Response, type NextFunction } from "express";
import { createServer } from "node:http";
import path from "node:path";
import { registerRoutes } from "./routes";
import { type IStorage, MemStorage } from "./storage";

export async function createApp(storage: IStorage = new MemStorage()) {
  const app = express();
  app.disable("x-powered-by");
  app.use("/images", express.static(process.env.NODE_ENV === "production"
    ? path.join(__dirname, "images") : path.join(process.cwd(), "attached_assets/generated_images")));
  app.use(express.json({ limit: "14mb" }));
  // Log method/status/timing only; never claim data, notes or image payloads.
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      if (req.path.startsWith("/api")) console.log(`${req.method} API ${res.statusCode} in ${Date.now() - start}ms`);
    });
    next();
  });
  const httpServer = createServer(app);
  await registerRoutes(httpServer, app, storage);
  app.use("/api", (_req, res) => res.status(404).json({ error: "API endpoint not found" }));
  app.use((err: { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status === 413 ? 413 : err.status === 400 ? 400 : 500;
    res.status(status).json({ error: status === 413 ? "Request is too large." : status === 400 ? "Invalid JSON request." : "Internal server error." });
  });
  return { app, httpServer };
}
