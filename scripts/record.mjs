// Record each showcase scene as a seamless looping MP4 for X.
//
// Pipeline: build → `vite preview` → drive Chromium per scene → CDP screencast
// a single aligned loop → assemble timestamp-accurate frames → H.264 MP4 (+ a
// repeated "X" cut + a poster). Frame capture uses CDP (not Playwright's ~25fps
// recordVideo) for smooth ~60fps output.
//
// Usage:
//   node scripts/record.mjs                 # all scenes
//   node scripts/record.mjs --scene copy-button
//   node scripts/record.mjs --fps 60 --repeat 3 --no-build

import { chromium } from "playwright";
import { spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  rmSync,
  readdirSync,
  copyFileSync,
} from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "out");
const TMP = path.join(OUT, ".frames");

const PREVIEW_PORT = 4188;
const BASE = `http://127.0.0.1:${PREVIEW_PORT}`;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- args ----------
const argv = process.argv.slice(2);
const getFlag = (name) => argv.includes(`--${name}`);
const getOpt = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i !== -1 && argv[i + 1] ? argv[i + 1] : fallback;
};
const onlyScene = getOpt("scene", null);
const FPS = Number(getOpt("fps", 60));
const REPEAT = Number(getOpt("repeat", 3)); // extra "X" cut repeats the loop to feel comfortable
const NO_BUILD = getFlag("no-build");

// ---------- ffmpeg ----------
function resolveFfmpeg() {
  if (process.env.FFMPEG_PATH && existsSync(process.env.FFMPEG_PATH)) {
    return process.env.FFMPEG_PATH;
  }
  // Prefer a full static build (has libx264 + concat). Playwright's bundled
  // ffmpeg-linux is a stripped webm-only build and can't encode H.264.
  try {
    const installer = require("@ffmpeg-installer/ffmpeg");
    if (installer?.path && existsSync(installer.path)) return installer.path;
  } catch {
    /* not installed — fall through */
  }
  return "ffmpeg"; // hope a full build is on PATH
}
const FFMPEG = resolveFfmpeg();

// The pre-installed Chromium may not match Playwright's expected build number,
// so point at the binary directly instead of Playwright's managed download.
function resolveChromium() {
  if (process.env.CHROMIUM_PATH && existsSync(process.env.CHROMIUM_PATH)) {
    return process.env.CHROMIUM_PATH;
  }
  const pwRoot = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
  const symlink = path.join(pwRoot, "chromium");
  if (existsSync(symlink)) return symlink;
  if (existsSync(pwRoot)) {
    const dir = readdirSync(pwRoot).find((d) => /^chromium-\d+$/.test(d));
    if (dir) {
      const bin = path.join(pwRoot, dir, "chrome-linux", "chrome");
      if (existsSync(bin)) return bin;
    }
  }
  return undefined; // fall back to Playwright's own resolution
}
const CHROMIUM = resolveChromium();

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: "inherit", ...opts });
    p.on("error", reject);
    p.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`)),
    );
  });
}

function ffmpeg(args) {
  // quiet ffmpeg unless it fails
  return new Promise((resolve, reject) => {
    const p = spawn(FFMPEG, ["-hide_banner", "-loglevel", "error", ...args], {
      stdio: ["ignore", "inherit", "inherit"],
    });
    p.on("error", reject);
    p.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}`)),
    );
  });
}

function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on("error", () => {
        if (Date.now() - start > timeoutMs) reject(new Error("server timeout"));
        else setTimeout(tick, 250);
      });
    };
    tick();
  });
}

// ---------- scene list (read from window.__scenes on the built app) ----------
async function readScenes(page) {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForFunction(() => Array.isArray(window.__scenes), null, {
    timeout: 15000,
  });
  return page.evaluate(() => window.__scenes);
}

async function waitReady(page, timeoutMs = 20000) {
  // Manual node-side poll — Playwright's own waitForFunction polls via the
  // page's rAF/timers, which are frozen by the fake clock.
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await page.evaluate(() => document.body.dataset.ready === "1")) return;
    await sleep(40);
  }
  throw new Error("scene never signalled ready");
}

async function recordScene(browser, scene) {
  const { width, height } = scene;
  const loopSec = scene.loopMs / 1000;
  const frameCount = Math.round(scene.loopMs / (1000 / FPS));
  const framesDir = path.join(TMP, scene.id);
  rmSync(framesDir, { recursive: true, force: true });
  mkdirSync(framesDir, { recursive: true });

  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    colorScheme: "light",
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();

  // Freeze time BEFORE load so every rAF/timer/performance.now is driven by us.
  // install() alone still auto-advances with wall-clock; pauseAt() truly freezes
  // it so the clock only moves when we call runFor() — otherwise capture latency
  // leaks real time in and the animation races ahead of the frame index.
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(0);
  await page.goto(`${BASE}/?scene=${scene.id}&record=1`, { waitUntil: "load" });
  await waitReady(page);

  // Align the loop to t=0, then step the animation one exact frame at a time.
  await page.evaluate(() => window.__scene?.restart());

  const clip = { x: 0, y: 0, width, height };
  let virtual = 0;
  for (let i = 0; i < frameCount; i++) {
    if (i > 0) {
      const next = Math.round((i * scene.loopMs) / frameCount);
      await page.clock.runFor(next - virtual);
      virtual = next;
    }
    // Force React to commit the faked-timer state update before capturing —
    // any page.evaluate yields the event loop so the scheduler flushes.
    // Without this, screenshots capture the pre-commit (idle) tree.
    await page.evaluate(() => void document.body.offsetHeight);
    const file = path.join(framesDir, `f${String(i).padStart(5, "0")}.png`);
    await page.screenshot({ path: file, clip, animations: "allow" });
    if (i === 0) copyFileSync(file, path.join(OUT, `${scene.id}.poster.png`));
  }
  await context.close();

  const mp4 = path.join(OUT, `${scene.id}.mp4`);
  const xmp4 = path.join(OUT, `${scene.id}.x.mp4`);

  // Uniform frames → straight CFR encode. yuv420p + faststart = X-ready.
  await ffmpeg([
    "-y", "-framerate", String(FPS), "-i", path.join(framesDir, "f%05d.png"),
    "-vf", `scale=${width}:${height}:flags=lanczos,format=yuv420p`,
    "-c:v", "libx264", "-profile:v", "high", "-crf", "18", "-preset", "slow",
    "-movflags", "+faststart", "-an", mp4,
  ]);

  // X cut: the loop repeated a few times so it plays long enough to feel deliberate.
  if (REPEAT > 1) {
    await ffmpeg([
      "-y", "-stream_loop", String(REPEAT - 1), "-i", mp4,
      "-c", "copy", "-movflags", "+faststart", xmp4,
    ]);
  }

  rmSync(framesDir, { recursive: true, force: true });
  return { id: scene.id, width, height, loopSec, frames: frameCount, mp4, xmp4 };
}

async function main() {
  mkdirSync(OUT, { recursive: true });

  if (!NO_BUILD) {
    console.log("→ building…");
    await run("npm", ["run", "build"], { cwd: ROOT });
  } else if (!existsSync(path.join(ROOT, "dist", "index.html"))) {
    throw new Error("no dist/ — run without --no-build first");
  }

  console.log("→ starting preview server…");
  const server = spawn("npm", ["run", "preview"], { cwd: ROOT, stdio: "ignore" });
  const cleanup = () => server.kill("SIGTERM");
  process.on("exit", cleanup);
  process.on("SIGINT", () => { cleanup(); process.exit(1); });

  try {
    await waitForServer(`${BASE}/`);
    const browser = await chromium.launch({
      headless: true,
      executablePath: CHROMIUM,
      args: ["--force-color-profile=srgb", "--hide-scrollbars"],
    });

    const listPage = await browser.newPage();
    let scenes = await readScenes(listPage);
    await listPage.close();
    if (!scenes) throw new Error("could not read scene registry from the page");
    if (onlyScene) scenes = scenes.filter((s) => s.id === onlyScene);
    if (scenes.length === 0) throw new Error(`no scene matched --scene ${onlyScene}`);

    console.log(`→ recording ${scenes.length} scene(s) with ${FFMPEG.split("/").pop()}\n`);
    const results = [];
    for (const scene of scenes) {
      process.stdout.write(`   • ${scene.id} … `);
      const r = await recordScene(browser, scene);
      results.push(r);
      console.log(
        `${r.width}×${r.height}, ${r.frames} frames, ${r.loopSec}s loop → out/${scene.id}.mp4`,
      );
    }
    await browser.close();

    console.log(`\n✓ done — ${results.length} clip(s) in ./out`);
  } finally {
    cleanup();
  }
}

main().catch((err) => {
  console.error("\n✗ record failed:", err.message);
  process.exit(1);
});
