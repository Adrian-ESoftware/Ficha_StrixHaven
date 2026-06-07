import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import fs from "fs";
import { fileURLToPath } from "url";

const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : 5175;

if (rawPort && (Number.isNaN(port) || port <= 0)) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH || "/";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const vercelApiEmulator = () => ({
  name: "vercel-api-emulator",
  configureServer(server: any) {
    server.middlewares.use(async (req: any, res: any, next: any) => {
      const url = req.url ? new URL(req.url, `http://${req.headers.host || 'localhost'}`) : null;
      if (url && url.pathname.startsWith("/api/")) {
        const dbDir = path.resolve(__dirname, ".vercel-local-db");
        
        if (!fs.existsSync(dbDir)) {
          fs.mkdirSync(dbDir, { recursive: true });
        }

        if (url.pathname === "/api/save" && req.method === "PUT") {
          let body = "";
          req.on("data", (chunk: any) => { body += chunk; });
          req.on("end", () => {
            try {
              const { id, data } = JSON.parse(body);
              if (!id || !data) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ error: "Missing id or data" }));
                return;
              }
              const filePath = path.join(dbDir, `${id}.json`);
              fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ url: `/local-db/${id}.json` }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Internal server error" }));
            }
          });
        } else if (url.pathname === "/api/load" && req.method === "GET") {
          const id = url.searchParams.get("id");
          if (!id) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Missing id parameter" }));
            return;
          }
          const filePath = path.join(dbDir, `${id}.json`);
          if (!fs.existsSync(filePath)) {
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Character not found" }));
            return;
          }
          const content = fs.readFileSync(filePath, "utf-8");
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(content);
        } else {
          res.statusCode = 405;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Method not allowed" }));
        }
      } else {
        next();
      }
    });
  }
});

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    vercelApiEmulator(),
    ...(process.env.NODE_ENV !== "production" &&
      process.env.REPL_ID !== undefined
      ? [
        await import("@replit/vite-plugin-cartographer").then((m) =>
          m.cartographer({
            root: path.resolve(import.meta.dirname),
          }),
        ),
        await import("@replit/vite-plugin-dev-banner").then((m) =>
          m.devBanner(),
        ),
      ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: !!rawPort,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
