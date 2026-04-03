import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const axeSourcePath = require.resolve("axe-core/axe.min.js");
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = 4173;

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8"
};

function getContentType(filePath) {
  return MIME_TYPES[path.extname(filePath)] || "application/octet-stream";
}

function createServer(baseDir) {
  return http.createServer(async (request, response) => {
    const url = new URL(request.url || "/", `http://${request.headers.host}`);
    let targetPath = path.join(baseDir, decodeURIComponent(url.pathname));

    if (url.pathname === "/") {
      targetPath = path.join(baseDir, "index.html");
    }

    if (!targetPath.startsWith(baseDir)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    try {
      const fileStat = await stat(targetPath);
      const filePath = fileStat.isDirectory() ? path.join(targetPath, "index.html") : targetPath;

      if (!existsSync(filePath)) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }

      response.writeHead(200, { "Content-Type": getContentType(filePath) });
      createReadStream(filePath).pipe(response);
    } catch {
      response.writeHead(404);
      response.end("Not found");
    }
  });
}

async function injectAxe(target) {
  await target.addScriptTag({ path: axeSourcePath });
}

function formatViolations(label, violations) {
  return violations.flatMap((violation) =>
    violation.nodes.map((node) =>
      `${label}: [${violation.impact || "unknown"}] ${violation.id} - ${violation.help}\n  Target: ${node.target.join(", ")}`
    )
  );
}

async function runAxe(target, label, contextSelector) {
  await injectAxe(target);
  const results = await target.evaluate(async (selector) => {
    const context = selector ? document.querySelector(selector) : document;
    if (!context) {
      return {
        violations: [
          {
            id: "missing-context",
            impact: "serious",
            help: `Could not find axe context: ${selector}`,
            nodes: [{ target: [selector] }]
          }
        ]
      };
    }

    return window.axe.run(context, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa"]
      }
    });
  }, contextSelector);

  return {
    label,
    violations: results.violations || []
  };
}

async function getPreviewFrame(page) {
  const handle = await page.locator("#preview").elementHandle();
  if (!handle) {
    throw new Error("Preview iframe was not found.");
  }

  const frame = await handle.contentFrame();
  if (!frame) {
    throw new Error("Preview iframe content was not available.");
  }

  return frame;
}

async function waitForPreviewRefresh(page) {
  await page.waitForTimeout(700);
  return getPreviewFrame(page);
}

async function main() {
  const server = createServer(rootDir);
  await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const findings = [];

  try {
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
    await page.waitForSelector("#editor");
    await page.waitForTimeout(1200);

    findings.push(await runAxe(page, "app shell default", null));

    await page.click("#appThemeToggle");
    await page.waitForTimeout(300);
    findings.push(await runAxe(page, "app shell light mode", null));

    let previewFrame = await getPreviewFrame(page);
    findings.push(await runAxe(previewFrame, "preview default", "#playground-root"));

    await page.click('[data-theme-option="dark"]');
    previewFrame = await waitForPreviewRefresh(page);
    findings.push(await runAxe(previewFrame, "preview dark mode", "#playground-root"));

    await page.click('[data-viewport-option="mobile"]');
    previewFrame = await waitForPreviewRefresh(page);
    findings.push(await runAxe(previewFrame, "preview mobile", "#playground-root"));
  } finally {
    await browser.close();
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }

  const violations = findings.flatMap((result) => formatViolations(result.label, result.violations));

  if (violations.length > 0) {
    console.error("Axe accessibility violations found:\n");
    console.error(violations.join("\n"));
    process.exitCode = 1;
    return;
  }

  console.log("Axe accessibility scan passed for app shell and preview states.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
