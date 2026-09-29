import { createApp } from "./app";
import { serveStatic } from "./static";

async function start() {
  const { app, httpServer } = await createApp();
  if (process.env.NODE_ENV === "production") serveStatic(app);
  else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }
  const port = Number(process.env.PORT || 5000);
  httpServer.listen({ port, host: "0.0.0.0" }, () => console.log(`AutoAssess demo serving on port ${port}; data resets on restart.`));
}
start().catch((error) => { console.error("Server startup failed:", error); process.exitCode = 1; });
