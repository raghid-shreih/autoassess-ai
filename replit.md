# AutoAssess AI — development notes

This is a simulated claims workflow, not a deployed vision model. See [README.md](README.md) for the current architecture, API, setup instructions and limitations.

- Replit starts `npm run dev` and exposes port 5000.
- Use Node 22.12+ or Node 20.19+; no database or model API credentials are needed.
- Storage is a bounded `MemStorage` instance with seven seeded claims. Restarting resets data.
- `server/db.ts` and `drizzle.config.ts` are unused persistence scaffolding. Running `db:push` requires a separately configured `DATABASE_URL` and does not switch the application to database storage.
- Uploaded images are normalized with Sharp; assessment output is simulated independently of pixels.
- Run `npm run check`, `npm test`, and `npm run build` before publishing changes.
- The original draft PRD describes aspirational features, not implemented capability.
