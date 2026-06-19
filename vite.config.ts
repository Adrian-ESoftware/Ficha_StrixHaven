import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import fs from "fs";
import { fileURLToPath } from "url";
import { createHash } from "node:crypto";

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

        function readBody(): Promise<Record<string, unknown>> {
          return new Promise((resolve) => {
            let body = "";
            req.on("data", (chunk: any) => { body += chunk; });
            req.on("end", () => {
              try { resolve(JSON.parse(body || "{}")); } catch { resolve({}); }
            });
          });
        }

        function hashPassword(password: string) {
          return createHash("sha256").update(password).digest("hex");
        }

        function getPasswordHash(id: string): string | null {
          const pwPath = path.join(dbDir, `${id}.password`);
          if (!fs.existsSync(pwPath)) return null;
          return fs.readFileSync(pwPath, "utf-8").trim();
        }

        // ── POST /api/create ──
        if (url.pathname === "/api/create" && req.method === "POST") {
          const body = await readBody();
          const { id, data, password } = body as Record<string, unknown>;

          if (typeof id !== "string" || !/^[a-zA-Z0-9_-]{1,64}$/.test(id)) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Invalid id" }));
            return;
          }
          if (!data || typeof data !== "object") {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Invalid data" }));
            return;
          }
          if (typeof password !== "string" || password.length === 0) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Password is required" }));
            return;
          }

          const filePath = path.join(dbDir, `${id}.json`);
          if (fs.existsSync(filePath)) {
            res.statusCode = 409;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Character already exists" }));
            return;
          }

          const pwPath = path.join(dbDir, `${id}.password`);
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
          fs.writeFileSync(pwPath, hashPassword(password));

          res.statusCode = 201;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ url: `/local-db/${id}.json` }));
        }

        // ── POST /api/auth ──
        else if (url.pathname === "/api/auth" && req.method === "POST") {
          const body = await readBody();
          const { id, password } = body as Record<string, unknown>;

          if (typeof id !== "string" || !/^[a-zA-Z0-9_-]{1,64}$/.test(id)) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Invalid id" }));
            return;
          }

          const storedHash = getPasswordHash(id);
          if (!storedHash) {
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Character not found" }));
            return;
          }

          const candidatePass = typeof password === "string" ? password : "";
          const match = hashPassword(candidatePass) === storedHash;

          res.statusCode = match ? 200 : 401;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(match ? { authenticated: true } : { error: "Invalid password" }));
        }

        // ── PUT /api/save ──
        else if (url.pathname === "/api/save" && req.method === "PUT") {
          const body = await readBody();
          const { id, data } = body as Record<string, unknown>;

          if (typeof id !== "string" || !/^[a-zA-Z0-9_-]{1,64}$/.test(id)) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Invalid id" }));
            return;
          }
          if (!data || typeof data !== "object") {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Invalid data" }));
            return;
          }

          const storedHash = getPasswordHash(id);
          if (!storedHash) {
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Character not found" }));
            return;
          }

          const candidatePass = typeof req.headers["x-edit-password"] === "string"
            ? req.headers["x-edit-password"]
            : "";
          if (hashPassword(candidatePass) !== storedHash) {
            res.statusCode = 401;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Invalid password" }));
            return;
          }

          const filePath = path.join(dbDir, `${id}.json`);
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ url: `/local-db/${id}.json` }));
        }

        // ── GET /api/load ──
        else if (url.pathname === "/api/load" && req.method === "GET") {
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
        }

        // ── PUT /api/upload-image ──
        else if (url.pathname === "/api/upload-image" && req.method === "PUT") {
          const body = await readBody();
          const { id, image, type } = body as Record<string, unknown>;

          if (typeof id !== "string" || !/^[a-zA-Z0-9_-]{1,64}$/.test(id)) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Invalid id" }));
            return;
          }
          if (type !== "avatar" && type !== "concept-art") {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Invalid type" }));
            return;
          }
          if (typeof image !== "string" || !image.startsWith("data:image/")) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Invalid image" }));
            return;
          }

          const storedHash = getPasswordHash(id);
          if (!storedHash) {
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Character not found" }));
            return;
          }

          const candidatePass = typeof req.headers["x-edit-password"] === "string"
            ? req.headers["x-edit-password"]
            : "";
          if (hashPassword(candidatePass) !== storedHash) {
            res.statusCode = 401;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Invalid password" }));
            return;
          }

          const match = image.match(/^data:(image\/[a-zA-Z+.-]+);base64,/);
          if (!match) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Invalid data URI" }));
            return;
          }

          const mimeType = match[1];
          const extMap: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif", "image/bmp": "bmp" };
          const ext = extMap[mimeType] || "png";
          const base64 = image.substring(match[0].length);
          const buffer = Buffer.from(base64, "base64");
          const imgPath = path.join(dbDir, `${id}_${type}.${ext}`);
          fs.writeFileSync(imgPath, buffer);

          const imgUrl = `/api/image?id=${encodeURIComponent(id)}&type=${encodeURIComponent(type)}`;
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ url: imgUrl }));
        }

        // ── GET /api/image ──
        else if (url.pathname === "/api/image" && req.method === "GET") {
          const id = url.searchParams.get("id");
          const type = url.searchParams.get("type");
          if (!id || !type) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Missing id or type parameter" }));
            return;
          }
          const extList = ["png", "jpg", "jpeg", "webp", "gif", "avif", "bmp"];
          let imgPath = "";
          for (const ext of extList) {
            const candidate = path.join(dbDir, `${id}_${type}.${ext}`);
            if (fs.existsSync(candidate)) {
              imgPath = candidate;
              break;
            }
          }
          if (!imgPath) {
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Image not found" }));
            return;
          }

          const buffer = fs.readFileSync(imgPath);
          const ext = path.extname(imgPath).substring(1);
          const mimeMap: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif", avif: "image/avif", bmp: "image/bmp" };
          res.statusCode = 200;
          res.setHeader("Content-Type", mimeMap[ext] || "image/png");
          res.setHeader("Cache-Control", "max-age=31536000");
          res.end(buffer);
        }

        else {
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
    watch: {
      ignored: ["**/.vercel-local-db/**"],
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
