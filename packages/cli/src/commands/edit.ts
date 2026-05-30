import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadProjectJson,
  saveProjectFile,
  getProjectFileKeyFromApiName,
  validateProject,
} from "@crisiskit/core";
import { copyVendorAssets, getImportMapJson } from "@crisiskit/renderer/copy-vendor";
import { runBuild } from "./build.js";

export interface EditOptions {
  input: string;
  port: number;
  output: string;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const editorDir = join(__dirname, "..", "editor");

function sendJson(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

function serveStatic(res: ServerResponse, filePath: string): boolean {
  if (!existsSync(filePath)) return false;
  const ext = extname(filePath);
  const types: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".map": "application/json; charset=utf-8",
  };
  res.writeHead(200, { "Content-Type": types[ext] ?? "application/octet-stream" });
  res.end(readFileSync(filePath));
  return true;
}

export async function runEdit(options: EditOptions): Promise<void> {
  const inputDir = resolve(options.input);
  const outputDir = resolve(options.output);
  const port = options.port;

  if (!existsSync(inputDir)) {
    throw new Error(`Project directory not found: ${inputDir}`);
  }

  mkdirSync(join(editorDir, "assets"), { recursive: true });
  copyVendorAssets(editorDir);
  const vendorDir = join(editorDir, "assets", "vendor");

  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? "/", `http://localhost:${port}`);
      const method = req.method ?? "GET";

      if (method === "GET" && url.pathname === "/api/project") {
        const data = loadProjectJson(inputDir);
        return sendJson(res, 200, data);
      }

      if (method === "GET" && url.pathname === "/api/importmap") {
        return sendJson(res, 200, JSON.parse(getImportMapJson()));
      }

      if (method === "PUT" && url.pathname.startsWith("/api/files/")) {
        const apiName = url.pathname.replace("/api/files/", "");
        const key = getProjectFileKeyFromApiName(apiName);
        if (!key) {
          return sendJson(res, 400, { error: `Unknown file: ${apiName}` });
        }
        const body = JSON.parse(await readBody(req));
        saveProjectFile(inputDir, key, body);
        const validation = validateProject(loadProjectJson(inputDir));
        return sendJson(res, 200, { ok: true, validation });
      }

      if (method === "POST" && url.pathname === "/api/build") {
        await runBuild({ input: inputDir, output: outputDir, skipPdf: false });
        return sendJson(res, 200, { ok: true, output: outputDir });
      }

      if (method === "GET" && url.pathname === "/") {
        const indexPath = join(editorDir, "index.html");
        if (existsSync(indexPath)) {
          const html = readFileSync(indexPath, "utf-8").replace(
            /<script type="importmap">[\s\S]*?<\/script>/,
            `<script type="importmap">${getImportMapJson()}</script>`,
          );
          res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
          res.end(html);
          return;
        }
      }

      if (method === "GET" && url.pathname.startsWith("/assets/vendor/")) {
        const rel = decodeURIComponent(url.pathname.replace("/assets/vendor/", ""));
        if (serveStatic(res, join(vendorDir, rel))) return;
      }

      if (method === "GET" && url.pathname.startsWith("/assets/")) {
        const assetPath = join(editorDir, decodeURIComponent(url.pathname));
        if (serveStatic(res, assetPath)) return;
      }

      if (method === "GET" && url.pathname.startsWith("/preview/")) {
        const rel = decodeURIComponent(url.pathname.replace(/^\/preview\/?/, ""));
        const previewPath = join(outputDir, rel || "index.html");
        if (serveStatic(res, previewPath)) return;
      }

      sendJson(res, 404, { error: "Not found" });
    } catch (error) {
      sendJson(res, 500, {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  await new Promise<void>((resolvePromise) => {
    server.listen(port, () => {
      console.log(`\n✓ CrisisKit Editor running at http://localhost:${port}`);
      console.log(`  Project: ${inputDir}`);
      console.log(`  Build output: ${outputDir}`);
      console.log("\n  Edit contacts, checklists and more in the browser.");
      console.log("  Changes are saved directly to your YAML files.");
      console.log("  Press Ctrl+C to stop.\n");
      resolvePromise();
    });
  });

  await new Promise(() => {
    /* keep alive */
  });
}
