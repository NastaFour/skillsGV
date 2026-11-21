#!/usr/bin/env node
/**
 * ui-diff.mjs — Zero-dependency DOM-Geometry Probe, Contact Sheet & Visual Diff.
 *
 * Self-contained Node ESM script (no external npm dependencies, no shared imports):
 *   - Runs deterministically from source catalog (`05-frontend/ui-diff/scripts/`)
 *     and installed `.agents/skills/ui-diff/scripts/`.
 *   - Mode `capture` (greenfield): captures desktop (1280x800) + mobile (390x844)
 *     light/dark views, writes baseline PNGs + 1 stitched 2x2 Contact Sheet, and
 *     computes quantitative DOM geometry checks.
 *   - Mode `diff` (PR / refactor): compares `--url` vs `--before-url` or
 *     saved `.ui-diff/baseline/` using in-browser HTML5 `<canvas>` `getImageData`
 *     (no pixelmatch/pngjs required) and outputs changed-pixel masks + UX summary.
 *   - Degrades cleanly when Playwright is not installed in the target workspace
 *     (status: "degraded", exit 0 by default, exit 3 under --strict-browser).
 *
 * Usage:
 *   node ui-diff.mjs --url <url> [--before-url <url>] [--cmd "<dev>"] [--port <n>]
 *                    [--mode auto|capture|diff] [--outDir .ui-diff] [--strict-browser] [--json]
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const isCliEntry =
  Boolean(process.argv[1]) &&
  resolve(process.argv[1]).toLowerCase() === resolve(fileURLToPath(import.meta.url)).toLowerCase();

function printHelp() {
  console.log(`ui-diff.mjs — DOM-Geometry Probe, Contact Sheet & Visual Pixel Diff

Usage:
  node ui-diff.mjs --url <url> [options]
  node ui-diff.mjs --cmd "<dev-cmd>" --port <n> [options]

Options:
  --url <url>          Live URL to audit (after/current state)
  --before-url <url>   Optional baseline URL for side-by-side pixel diff
  --cmd "<cmd>"        Optional dev server command to launch and auto-stop
  --port <n>           Port when using --cmd (default: 4321)
  --mode <m>           auto | capture | diff (default: auto)
  --outDir <dir>       Output directory for PNGs & report (default: .ui-diff)
  --viewports <list>   Comma-separated presets: desktop,mobile (default: desktop,mobile)
  --themes <list>      Comma-separated themes: light,dark (default: light,dark)
  --ready-timeout <ms> Dev server HTTP timeout in ms (default: 30000)
  --strict-browser     Exit 3 instead of 0 when Playwright is unavailable
  --json               Emit machine-readable JSON report
  --help, -h           Show this help

Exit codes:
  0 = pass (or degraded when Playwright absent without --strict-browser)
  1 = DOM geometry or visual regression errors detected
  2 = invalid CLI arguments
  3 = Playwright unavailable under --strict-browser`);
}

function usageError(msg) {
  console.error(`error: ${msg}`);
  process.exit(2);
}

/**
 * Pure deterministic DOM geometry evaluator (unit-testable without a browser).
 */
export function evaluateDomGeometry(metrics) {
  const issues = [];
  const vp = metrics?.viewport || { width: 1280, height: 800 };
  const vpName = metrics?.viewportName || `${vp.width}x${vp.height}`;

  if (typeof metrics?.scrollWidth === "number" && typeof metrics?.clientWidth === "number") {
    if (metrics.scrollWidth > metrics.clientWidth + 1) {
      issues.push({
        severity: "error",
        check: "horizontal-overflow",
        viewport: vpName,
        msg: `Horizontal overflow detected: scrollWidth (${metrics.scrollWidth}px) > clientWidth (${metrics.clientWidth}px).`,
      });
    }
  }

  for (const item of metrics?.heroFoldItems || []) {
    if (typeof item.top === "number" && typeof item.bottom === "number" && item.top < vp.height && item.bottom > vp.height + 2) {
      issues.push({
        severity: "error",
        check: "above-fold-clipping",
        viewport: vpName,
        selector: item.selector,
        msg: `${item.selector} clips below ${vp.height}px viewport fold (bottom=${Math.round(item.bottom)}px).`,
      });
    }
  }

  for (const group of metrics?.siblingGroups || []) {
    const items = Array.isArray(group?.items) ? group.items : [];
    if (items.length < 2) continue;

    if (group.kind === "stat-strip") {
      const tops = items.map((i) => i.top).filter((n) => typeof n === "number");
      if (tops.length >= 2) {
        const delta = Math.max(...tops) - Math.min(...tops);
        if (delta > 4) {
          issues.push({
            severity: "error",
            check: "sibling-alignment-drift",
            viewport: vpName,
            selector: group.selector,
            msg: `Stat/metric strip "${group.selector}" has ${delta.toFixed(1)}px vertical alignment drift (> 4px threshold).`,
          });
        }
      }
    }

    if (group.kind === "uniform-grid") {
      const heights = items.map((i) => i.height).filter((n) => typeof n === "number");
      if (heights.length >= 2) {
        const deltaH = Math.max(...heights) - Math.min(...heights);
        if (deltaH > 16) {
          issues.push({
            severity: "error",
            check: "grid-height-variance",
            viewport: vpName,
            selector: group.selector,
            msg: `Grid/bento "${group.selector}" cards vary by ${deltaH.toFixed(1)}px (> 16px threshold).`,
          });
        }
      }
    }
  }

  for (const target of metrics?.tapTargets || []) {
    if (target.inlineTextLink) continue;
    const minDim = Math.min(target.width ?? 0, target.height ?? 0);
    const tapFloor = vp.width <= 480 ? 40 : 24;
    if (minDim < tapFloor) {
      issues.push({
        severity: "error",
        check: "small-tap-target",
        viewport: vpName,
        selector: target.selector,
        msg: `Interactive element ${target.selector} is ${Math.round(target.width)}x${Math.round(target.height)}px (< ${tapFloor}px floor).`,
      });
    } else if (minDim < 44 && vp.width <= 480) {
      issues.push({
        severity: "warning",
        check: "tap-target-below-recommended",
        viewport: vpName,
        selector: target.selector,
        msg: `Mobile target ${target.selector} is ${Math.round(target.width)}x${Math.round(target.height)}px (recommend >= 44px).`,
      });
    }
  }

  for (const img of metrics?.brokenImages || []) {
    issues.push({
      severity: "error",
      check: "broken-image",
      viewport: vpName,
      msg: `Broken or unloaded image "${img.src || "(no src)"}" (naturalWidth === 0).`,
    });
  }

  for (const mono of metrics?.monoProseNodes || []) {
    issues.push({
      severity: "error",
      check: "mono-prose",
      viewport: vpName,
      selector: mono.selector,
      msg: `Narrative paragraph ${mono.selector} uses monospace font ("${(mono.textPreview || "").slice(0, 40)}").`,
    });
  }

  for (const err of metrics?.consoleErrors || []) {
    issues.push({
      severity: "error",
      check: "console-error",
      viewport: vpName,
      msg: `Browser/hydration error: ${String(err).slice(0, 200)}`,
    });
  }

  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  return { ok: errors === 0, errors, warnings, issues };
}

export async function resolvePlaywright(cwd = process.cwd()) {
  const candidates = [cwd, process.cwd(), __dirname];
  for (const base of candidates) {
    try {
      const req = createRequire(join(base, "package.json"));
      const resolved = req.resolve("playwright");
      const mod = await import(pathToFileURL(resolved).href);
      return mod.chromium ? mod : mod.default || null;
    } catch {
      try {
        const req = createRequire(join(base, "package.json"));
        const resolved = req.resolve("playwright-core");
        const mod = await import(pathToFileURL(resolved).href);
        return mod.chromium ? mod : mod.default || null;
      } catch {}
    }
  }
  return null;
}

async function waitForHttpReady(url, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`Timed out after ${timeoutMs}ms waiting for ${url}`);
}

function killProcessTree(child) {
  if (!child || !child.pid) return;
  try {
    if (process.platform === "win32") {
      spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    } else {
      try {
        process.kill(-child.pid, "SIGTERM");
      } catch {
        child.kill("SIGTERM");
      }
    }
  } catch {}
}

async function collectPageMetrics(page, viewportName, viewport) {
  return page.evaluate(({ vpName, vp }) => {
    const doc = document.documentElement;
    const isVisible = (el) => {
      const st = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return st.display !== "none" && st.visibility !== "hidden" && r.width > 0 && r.height > 0;
    };

    const heroFoldItems = [];
    const hero = document.querySelector("[data-hero]") || document.querySelector("main section, main > div");
    if (hero) {
      for (const el of hero.querySelectorAll("h1, a, button, dl")) {
        if (!isVisible(el)) continue;
        const r = el.getBoundingClientRect();
        heroFoldItems.push({
          selector: el.tagName.toLowerCase() + (el.className ? `.${String(el.className).trim().split(/\s+/)[0]}` : ""),
          top: r.top,
          bottom: r.bottom,
        });
      }
    }

    const siblingGroups = [];
    for (const dl of document.querySelectorAll("dl")) {
      if (!isVisible(dl)) continue;
      const children = [...dl.children].filter(isVisible);
      if (children.length < 2) continue;
      const firstRowTops = children.map((c) => {
        const val = c.querySelector("dd, strong, span") || c;
        return val.getBoundingClientRect().top;
      });
      const xs = children.map((c) => c.getBoundingClientRect().left);
      if (new Set(xs.map((x) => Math.round(x / 10))).size > 1) {
        siblingGroups.push({
          kind: "stat-strip",
          selector: "dl" + (dl.className ? `.${String(dl.className).trim().split(/\s+/)[0]}` : ""),
          items: firstRowTops.map((top, idx) => ({ label: String(idx), top, height: children[idx].getBoundingClientRect().height })),
        });
      }
    }

    for (const grid of document.querySelectorAll("[data-uniform-grid]")) {
      if (!isVisible(grid)) continue;
      const children = [...grid.children].filter(isVisible);
      if (children.length < 2) continue;
      // Group children by horizontal row (top offset within 8px) so multi-row grids compare same-row peers only
      const rows = [];
      for (let idx = 0; idx < children.length; idx++) {
        const r = children[idx].getBoundingClientRect();
        let row = rows.find((grp) => Math.abs(grp.top - r.top) <= 8);
        if (!row) {
          row = { top: r.top, items: [] };
          rows.push(row);
        }
        row.items.push({ label: String(idx), top: r.top, left: r.left, height: r.height });
      }
      const baseSel = grid.tagName.toLowerCase() + (grid.className ? `.${String(grid.className).trim().split(/\s+/)[0]}` : "");
      for (let rIdx = 0; rIdx < rows.length; rIdx++) {
        const row = rows[rIdx];
        if (row.items.length < 2) continue;
        if (new Set(row.items.map((it) => Math.round(it.left / 10))).size > 1) {
          siblingGroups.push({
            kind: "uniform-grid",
            selector: `${baseSel}[row=${rIdx}]`,
            items: row.items.map(({ label, top, height }) => ({ label, top, height })),
          });
        }
      }
    }

    const tapTargets = [];
    for (const el of document.querySelectorAll("a, button, input, select, textarea")) {
      if (!isVisible(el)) continue;
      const r = el.getBoundingClientRect();
      const inlineTextLink =
        el.tagName.toLowerCase() === "a" &&
        getComputedStyle(el).display === "inline" &&
        Boolean(el.closest("p, li, dd, blockquote, small"));
      tapTargets.push({
        selector: el.tagName.toLowerCase() + (el.id ? `#${el.id}` : ""),
        width: r.width,
        height: r.height,
        inlineTextLink,
      });
    }

    const brokenImages = [];
    for (const img of document.querySelectorAll("img")) {
      if (img.loading === "lazy") continue;
      if (img.complete && img.naturalWidth === 0) {
        brokenImages.push({ src: img.getAttribute("src"), alt: img.getAttribute("alt") });
      }
    }

    const monoProseNodes = [];
    for (const p of document.querySelectorAll("p")) {
      if (!isVisible(p)) continue;
      const ff = getComputedStyle(p).fontFamily || "";
      const txt = (p.textContent || "").trim();
      if (txt.length > 20 && /\b(mono|courier|consolas|fira\s*code|jetbrains)\b/i.test(ff)) {
        monoProseNodes.push({ selector: "p", textPreview: txt.slice(0, 60) });
      }
    }

    return {
      viewportName: vpName,
      viewport: vp,
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      heroFoldItems,
      siblingGroups,
      tapTargets,
      brokenImages,
      monoProseNodes,
    };
  }, { vpName: viewportName, vp: viewport });
}

async function computeCanvasDiffAndSheet(browser, pairs, sheetTiles) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const diffResults = [];
  let contactSheetB64 = null;

  try {
    for (const pair of pairs) {
      const beforeB64 = readFileSync(pair.beforePath).toString("base64");
      const afterB64 = readFileSync(pair.afterPath).toString("base64");
      const res = await page.evaluate(async ({ b64A, b64B }) => {
        const load = (b64) =>
          new Promise((resLoad, rejLoad) => {
            const img = new Image();
            img.onload = () => resLoad(img);
            img.onerror = rejLoad;
            img.src = `data:image/png;base64,${b64}`;
          });
        const [imgA, imgB] = await Promise.all([load(b64A), load(b64B)]);
        const w = Math.max(imgA.width, imgB.width);
        const h = Math.max(imgA.height, imgB.height);
        const cA = Object.assign(document.createElement("canvas"), { width: w, height: h });
        const cB = Object.assign(document.createElement("canvas"), { width: w, height: h });
        const cD = Object.assign(document.createElement("canvas"), { width: w, height: h });
        const xA = cA.getContext("2d");
        const xB = cB.getContext("2d");
        const xD = cD.getContext("2d");
        xA.drawImage(imgA, 0, 0);
        xB.drawImage(imgB, 0, 0);
        const dA = xA.getImageData(0, 0, w, h).data;
        const dB = xB.getImageData(0, 0, w, h).data;
        const out = xD.createImageData(w, h);
        let changed = 0;
        const total = w * h;
        for (let i = 0; i < dA.length; i += 4) {
          const diff =
            Math.abs(dA[i] - dB[i]) +
            Math.abs(dA[i + 1] - dB[i + 1]) +
            Math.abs(dA[i + 2] - dB[i + 2]);
          if (diff > 36) {
            changed++;
            out.data[i] = 255;
            out.data[i + 1] = 48;
            out.data[i + 2] = 90;
            out.data[i + 3] = 235;
          } else {
            out.data[i] = Math.round(dB[i] * 0.35);
            out.data[i + 1] = Math.round(dB[i + 1] * 0.35);
            out.data[i + 2] = Math.round(dB[i + 2] * 0.35);
            out.data[i + 3] = 255;
          }
        }
        xD.putImageData(out, 0, 0);
        return {
          changedPixels: changed,
          totalPixels: total,
          changedPercent: Number(((changed / total) * 100).toFixed(2)),
          diffPngB64: cD.toDataURL("image/png").split(",")[1],
        };
      }, { b64A: beforeB64, b64B: afterB64 });

      writeFileSync(pair.diffPath, Buffer.from(res.diffPngB64, "base64"));
      diffResults.push({
        label: pair.label,
        changedPixels: res.changedPixels,
        totalPixels: res.totalPixels,
        changedPercent: res.changedPercent,
        diffPath: pair.diffPath,
      });
    }

    if (sheetTiles.length > 0) {
      const tilesData = sheetTiles.slice(0, 4).map((t) => ({
        label: t.label,
        b64: readFileSync(t.path).toString("base64"),
      }));
      contactSheetB64 = await page.evaluate(async (tiles) => {
        const imgs = await Promise.all(
          tiles.map(
            (t) =>
              new Promise((resLoad, rejLoad) => {
                const img = new Image();
                img.onload = () => resLoad({ label: t.label, img });
                img.onerror = rejLoad;
                img.src = `data:image/png;base64,${t.b64}`;
              })
          )
        );
        const cellW = 760;
        const cellH = 480;
        const cols = imgs.length > 1 ? 2 : 1;
        const rows = Math.ceil(imgs.length / 2);
        const sheet = Object.assign(document.createElement("canvas"), {
          width: cellW * cols,
          height: cellH * rows,
        });
        const g = sheet.getContext("2d");
        g.fillStyle = "#111115";
        g.fillRect(0, 0, sheet.width, sheet.height);
        imgs.forEach(({ label, img }, i) => {
          const x = (i % 2) * cellW;
          const y = Math.floor(i / 2) * cellH;
          const scale = Math.min((cellW - 24) / img.width, (cellH - 36) / img.height);
          const dw = Math.round(img.width * scale);
          const dh = Math.round(img.height * scale);
          g.drawImage(img, x + 12, y + 28, dw, dh);
          g.fillStyle = "#e4e4e7";
          g.font = "14px system-ui, sans-serif";
          g.fillText(label, x + 14, y + 20);
        });
        return sheet.toDataURL("image/png").split(",")[1];
      }, tilesData);
    }
  } finally {
    await ctx.close();
  }

  return { diffResults, contactSheetB64 };
}

async function main() {
  const args = process.argv.slice(2);
  let url = null;
  let beforeUrl = null;
  let cmd = null;
  let port = 4321;
  let mode = "auto";
  let outDir = ".ui-diff";
  let viewports = ["desktop", "mobile"];
  let themes = ["light", "dark"];
  let readyTimeout = 30000;
  let strictBrowser = false;
  let jsonOut = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--url") url = args[++i];
    else if (a === "--before-url") beforeUrl = args[++i];
    else if (a === "--cmd") cmd = args[++i];
    else if (a === "--port") port = Number(args[++i]);
    else if (a === "--mode") mode = args[++i];
    else if (a === "--outDir") outDir = args[++i];
    else if (a === "--viewports") viewports = args[++i].split(",").map((s) => s.trim()).filter(Boolean);
    else if (a === "--themes") themes = args[++i].split(",").map((s) => s.trim()).filter(Boolean);
    else if (a === "--ready-timeout") readyTimeout = Number(args[++i]);
    else if (a === "--strict-browser") strictBrowser = true;
    else if (a === "--json") jsonOut = true;
    else if (a === "--help" || a === "-h") {
      printHelp();
      process.exit(0);
    } else {
      usageError(`unknown argument: ${a}`);
    }
  }

  if (!["auto", "capture", "diff"].includes(mode)) {
    usageError(`--mode must be auto | capture | diff (got "${mode}")`);
  }
  if (!url && !cmd) {
    usageError("pass --url <url> or --cmd \"<dev-server>\"");
  }

  const pw = await resolvePlaywright(process.cwd());
  if (!pw) {
    const degraded = {
      status: "degraded",
      reason: "playwright-unavailable",
      mode,
      ok: !strictBrowser,
      errors: 0,
      warnings: 1,
      issues: [
        {
          severity: "warning",
          check: "playwright-unavailable",
          msg: "Playwright not installed in workspace; skipping headless browser geometry & pixel diff.",
        },
      ],
    };
    if (jsonOut) console.log(JSON.stringify(degraded, null, 2));
    else console.log("⚠️  ui-diff degraded: Playwright unavailable (install playwright in target app for live DOM/pixel audit).");
    process.exit(strictBrowser ? 3 : 0);
  }

  let serverProc = null;
  let browser = null;
  const resolvedOut = resolve(outDir);
  const baselineDir = join(resolvedOut, "baseline");
  const currentDir = join(resolvedOut, "current");
  const diffDir = join(resolvedOut, "diff");

  try {
    if (cmd) {
      serverProc = spawn(cmd, { shell: true, stdio: "ignore", detached: process.platform !== "win32" });
      if (!url) url = `http://127.0.0.1:${port}`;
      await waitForHttpReady(url, readyTimeout);
    }

    const effectiveMode =
      mode === "auto"
        ? (beforeUrl || existsSync(baselineDir) ? "diff" : "capture")
        : mode;

    mkdirSync(effectiveMode === "capture" ? baselineDir : currentDir, { recursive: true });
    if (effectiveMode === "diff") mkdirSync(diffDir, { recursive: true });

    const VP_MAP = {
      desktop: { width: 1280, height: 800 },
      mobile: { width: 390, height: 844 },
    };

    browser = await pw.chromium.launch({ headless: true });
    const allIssues = [];
    const sheetTiles = [];
    const diffPairs = [];

    for (const vpName of viewports) {
      const vp = VP_MAP[vpName] || VP_MAP.desktop;
      for (const theme of themes) {
        const label = `${vpName}-${theme}`;
        const context = await browser.newContext({ viewport: vp, colorScheme: theme, reducedMotion: "reduce" });
        const page = await context.newPage();
        const consoleErrors = [];
        page.on("pageerror", (e) => consoleErrors.push(e.message));
        page.on("console", (msg) => {
          if (msg.type() === "error") consoleErrors.push(msg.text());
        });

        try {
          await page.goto(url, { waitUntil: "networkidle", timeout: readyTimeout });
          await page.evaluate(() => document.fonts?.ready);
          const metrics = await collectPageMetrics(page, label, vp);
          metrics.consoleErrors = consoleErrors;
          const evalRes = evaluateDomGeometry(metrics);
          allIssues.push(...evalRes.issues);

          const targetPath = join(effectiveMode === "capture" ? baselineDir : currentDir, `${label}.png`);
          await page.screenshot({ path: targetPath, animations: "disabled", fullPage: false });
          sheetTiles.push({ label, path: targetPath });

          if (effectiveMode === "diff") {
            let beforePath = join(baselineDir, `${label}.png`);
            if (beforeUrl) {
              const bPage = await context.newPage();
              await bPage.goto(beforeUrl, { waitUntil: "networkidle", timeout: readyTimeout });
              await bPage.evaluate(() => document.fonts?.ready);
              mkdirSync(baselineDir, { recursive: true });
              await bPage.screenshot({ path: beforePath, animations: "disabled", fullPage: false });
              await bPage.close();
            }
            if (existsSync(beforePath)) {
              diffPairs.push({ label, beforePath, afterPath: targetPath, diffPath: join(diffDir, `${label}-diff.png`) });
            }
          }
        } finally {
          await context.close();
        }
      }
    }

    const { diffResults, contactSheetB64 } = await computeCanvasDiffAndSheet(browser, diffPairs, sheetTiles);
    const contactSheetPath = contactSheetB64 ? join(resolvedOut, "contact-sheet-2x2.png") : null;
    if (contactSheetPath && contactSheetB64) {
      writeFileSync(contactSheetPath, Buffer.from(contactSheetB64, "base64"));
    }

    const errors = allIssues.filter((i) => i.severity === "error").length;
    const warnings = allIssues.filter((i) => i.severity === "warning").length;
    const report = {
      status: errors === 0 ? "pass" : "fail",
      mode: effectiveMode,
      url,
      ok: errors === 0,
      errors,
      warnings,
      issues: allIssues,
      contactSheetPath,
      diffs: diffResults,
    };

    if (jsonOut) console.log(JSON.stringify(report, null, 2));
    else {
      console.log(`\n🖼️  ui-diff (${effectiveMode}): ${errors} errors · ${warnings} warnings`);
      if (contactSheetPath) console.log(`   Contact sheet: ${contactSheetPath}`);
      for (const d of diffResults) {
        console.log(`   Diff [${d.label}]: ${d.changedPercent}% changed (${d.changedPixels} px) -> ${d.diffPath}`);
      }
    }
    process.exit(errors > 0 ? 1 : 0);
  } finally {
    if (browser) await browser.close().catch(() => {});
    killProcessTree(serverProc);
  }
}

if (isCliEntry) {
  main().catch((err) => {
    console.error(`ui-diff fatal error: ${err?.message || err}`);
    process.exit(1);
  });
}
