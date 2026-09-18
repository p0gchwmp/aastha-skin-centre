import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const baseURL = process.env.VISUAL_QA_BASE_URL || "http://127.0.0.1:4173";
const outputRoot = process.env.VISUAL_QA_OUTPUT || "audit-artifacts/editorial-visual-qa";

const routes = [
  { slug: "home", path: "/" },
  { slug: "doctor", path: "/concept/dr-cheena-langer/" },
  { slug: "treatments", path: "/concept/treatments/" },
  { slug: "conditions", path: "/concept/conditions/" },
  { slug: "acne", path: "/concept/acne-treatment/" },
  { slug: "pigmentation", path: "/concept/pigmentation-treatment/" },
  { slug: "booking", path: "/concept/book-appointment/" },
  { slug: "karan-nagar", path: "/concept/locations/karan-nagar/" },
  { slug: "blog", path: "/concept/blog/" },
];

const viewports = [
  { name: "desktop", width: 1440, height: 1000, deviceScaleFactor: 1 },
  { name: "tablet", width: 1024, height: 900, deviceScaleFactor: 1 },
  { name: "mobile", width: 390, height: 844, deviceScaleFactor: 1 },
];

const severeImpacts = new Set(["serious", "critical"]);
const summary = {
  baseURL,
  generatedAt: new Date().toISOString(),
  routes: [],
  failures: [],
  warnings: [],
};

await fs.mkdir(outputRoot, { recursive: true });

const browser = await chromium.launch({ headless: true });

async function settle(page) {
  await page.waitForLoadState("domcontentloaded");
  await page.evaluate(async () => {
    try {
      await document.fonts?.ready;
    } catch {}
  });
  await page.waitForTimeout(650);
}

async function inspectRoute(viewport, route) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: viewport.deviceScaleFactor,
    reducedMotion: "no-preference",
    colorScheme: "light",
  });
  const page = await context.newPage();

  const response = await page.goto(baseURL + route.path, {
    waitUntil: "domcontentloaded",
    timeout: 45_000,
  });
  await settle(page);

  const httpStatus = response?.status() ?? 0;
  const metrics = await page.evaluate(() => {
    const body = document.body;
    const root = document.documentElement;
    const offenders = [...document.querySelectorAll("body *")]
      .filter((el) => {
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        if (style.position === "fixed" && rect.width > innerWidth + 2) return true;
        return rect.right > innerWidth + 2 || rect.left < -2;
      })
      .slice(0, 20)
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        id: el.id || "",
        className: typeof el.className === "string" ? el.className.slice(0, 120) : "",
        rect: {
          left: Math.round(el.getBoundingClientRect().left),
          right: Math.round(el.getBoundingClientRect().right),
          width: Math.round(el.getBoundingClientRect().width),
        },
      }));

    const robots = document.querySelector('meta[name="robots"]')?.getAttribute("content") || "";
    return {
      title: document.title,
      h1Count: document.querySelectorAll("h1").length,
      documentWidth: root.scrollWidth,
      viewportWidth: innerWidth,
      horizontalOverflow: root.scrollWidth > innerWidth + 2,
      offenders,
      robots,
      bodyClass: body.className,
    };
  });

  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();

  const severe = axe.violations.filter((v) => severeImpacts.has(v.impact));
  const moderate = axe.violations.filter((v) => v.impact === "moderate");

  const screenshotDir = path.join(outputRoot, "screenshots", viewport.name);
  await fs.mkdir(screenshotDir, { recursive: true });
  const screenshotPath = path.join(screenshotDir, `${route.slug}.png`);
  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
    animations: "disabled",
  });

  if (httpStatus < 200 || httpStatus >= 400) {
    summary.failures.push(`${viewport.name}/${route.slug}: HTTP ${httpStatus}`);
  }
  if (metrics.h1Count !== 1) {
    summary.failures.push(`${viewport.name}/${route.slug}: expected 1 H1, found ${metrics.h1Count}`);
  }
  if (!metrics.robots.toLowerCase().includes("noindex")) {
    summary.failures.push(`${viewport.name}/${route.slug}: concept page lost robots noindex`);
  }
  if (metrics.horizontalOverflow) {
    summary.failures.push(
      `${viewport.name}/${route.slug}: horizontal overflow ${metrics.documentWidth}px > ${metrics.viewportWidth}px`
    );
  }
  if (severe.length) {
    summary.failures.push(
      `${viewport.name}/${route.slug}: ${severe.length} serious/critical axe violation(s)`
    );
  }
  if (moderate.length) {
    summary.warnings.push(
      `${viewport.name}/${route.slug}: ${moderate.length} moderate axe violation(s)`
    );
  }

  summary.routes.push({
    viewport: viewport.name,
    route: route.path,
    slug: route.slug,
    httpStatus,
    metrics,
    axe: {
      seriousOrCritical: severe.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        nodes: v.nodes.length,
      })),
      moderate: moderate.map((v) => ({
        id: v.id,
        help: v.help,
        nodes: v.nodes.length,
      })),
    },
    screenshot: screenshotPath,
  });

  await context.close();
}

for (const viewport of viewports) {
  for (const route of routes) {
    await inspectRoute(viewport, route);
  }
}

// Interaction smoke test on the homepage.
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "no-preference",
  });
  const page = await context.newPage();
  await page.goto(baseURL + "/", { waitUntil: "domcontentloaded", timeout: 45_000 });
  await settle(page);

  await page.keyboard.press(process.platform === "darwin" ? "Meta+K" : "Control+K");
  const dialog = page.locator(".v39-command:not([hidden])");
  if ((await dialog.count()) !== 1) {
    summary.failures.push("interaction/home: Explore command palette did not open");
  } else {
    const search = dialog.locator('input[type="search"]');
    await search.fill("acne");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Escape");
    if ((await page.locator(".v39-command:not([hidden])").count()) !== 0) {
      summary.failures.push("interaction/home: Explore command palette did not close on Escape");
    }
  }

  const rail = page.locator("#treatments [data-drag-rail]");
  if ((await rail.count()) === 1) {
    await rail.focus();
    const before = await rail.evaluate((el) => el.scrollLeft);
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(450);
    const after = await rail.evaluate((el) => el.scrollLeft);
    if (after <= before) {
      summary.failures.push("interaction/home: treatment rail did not respond to ArrowRight");
    }
  }

  await context.close();
}

// Reduced-motion smoke test.
{
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(baseURL + "/", { waitUntil: "domcontentloaded", timeout: 45_000 });
  await settle(page);
  const reduced = await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
  if (!reduced) summary.failures.push("reduced-motion: browser emulation not active");
  await context.close();
}

await browser.close();

await fs.writeFile(
  path.join(outputRoot, "visual-qa-summary.json"),
  JSON.stringify(summary, null, 2),
  "utf8"
);

const markdown = [
  "# Editorial visual QA",
  "",
  `Generated: ${summary.generatedAt}`,
  `Routes × viewports: ${summary.routes.length}`,
  `Failures: ${summary.failures.length}`,
  `Warnings: ${summary.warnings.length}`,
  "",
  "## Failures",
  ...(summary.failures.length ? summary.failures.map((x) => `- ${x}`) : ["- None"]),
  "",
  "## Warnings",
  ...(summary.warnings.length ? summary.warnings.map((x) => `- ${x}`) : ["- None"]),
  "",
].join("\n");

await fs.writeFile(path.join(outputRoot, "summary.md"), markdown, "utf8");
process.stdout.write(markdown);

if (summary.failures.length) {
  process.exitCode = 1;
}
