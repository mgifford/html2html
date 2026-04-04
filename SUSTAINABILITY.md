# SUSTAINABILITY.md

> **Project instructions for reducing digital emissions, resource use, and waste across product, code, and operations.**

> **Status:** Draft (work in progress).
>
> **AI disclosure:** This repository has been developed with AI-assisted drafting and implementation support, with human review and editing.

Use this file like `SECURITY.md` or `AGENTS.md`: as an operational policy for humans and AI agents.

---

## Why this exists

- Set a single source of truth for web sustainability decisions in this project.
- Make sustainability visible and measurable directly inside the tool.
- Turn the playground itself into a demonstration of lightweight, accessible, sustainable web practice.
- Map implementation choices to relevant [Web Sustainability Guidelines (WSG)](https://www.w3.org/TR/web-sustainability-guidelines/) references.
- Make trade-offs explicit (performance, UX, and impact).

---

## Core policy

### 1) Transparency and disclosure

- This is a single-file static app with no server-side code, no build pipeline, and no runtime dependencies beyond what the browser provides.
- Page weight, request counts, and transfer sizes are surfaced directly in the app UI as the user types.
- An in-browser CO2 estimate (transmission layer, SWD model) is shown when the user is on Firefox.
- Known gaps are listed in the [Known limitations](#known-limitations) section below.

### 2) Operational governance

- Keep the app self-contained in a single HTML file unless there is a clear accessibility or sustainability reason to split it.
- Do not add third-party scripts, analytics, tracking pixels, or social embeds.
- Validate all changes against existing accessibility CI before merging.

### 3) Automation and guardrails

- Axe accessibility scans run in CI on every push and pull request.
- No page-weight CI budget is currently enforced; see [Known limitations](#known-limitations).
- There is no server to instrument; transmission-layer estimation happens client-side.

### 4) Third-party assessment (WSG 4.10)

The only approved third-party resource is:

| Resource | Justification | Transfer weight | Fallback |
| :--- | :--- | :--- | :--- |
| [Sa11y](https://sa11y.netlify.app) via CDN | In-preview accessibility checker; core to the app's purpose | ~150 KB (minified + gzipped) | Preview still renders; Sa11y section is hidden if CDN fails |

For any proposed new third-party dependency, require explicit answers to:

- **Is it necessary?** Can the need be met with first-party or self-hosted code?
- **What is the transfer weight?**
- **Where does it run?** Is the host region and energy mix acceptable?
- **What data does it send?**
- **What is the fallback?**

### 5) Browser support guarantees (device longevity)

- Support: latest major release plus previous 3 major releases for Chrome, Firefox, and Safari.
- Core editing and preview features use progressive enhancement; they do not require JavaScript-heavy APIs.
- The CO2 estimate banner is a Firefox-only enhancement; absence in other browsers is intentional and silent.

---

## In-browser CO2 estimation feature

This section documents the transmission-layer CO2 estimate built into the app.

### What it does

When the user opens the app in Firefox, a dismissable banner appears above the metrics bar showing a real-time estimate of the CO2 equivalent for the HTML they have typed. The estimate updates on every preview refresh.

Example display:

```
🦊 CO2 estimate for this preview: 0.37 mg CO₂  (SWD model, HTML bytes only)  [✕]
```

The estimate covers the **transmission layer only**: it converts the byte count of the raw HTML input into a CO2 equivalent using the Sustainable Web Design (SWD) model. It does not cover server compute, external assets, JavaScript execution, or engagement costs.

### Why Firefox only

The banner is shown exclusively in Firefox for two reasons:

1. **Firefox Profiler pairing.** The Firefox Profiler (`profiler.firefox.com`) is the primary tool recommended for cross-browser execution profiling on this platform. When a user is already in Firefox, they have direct access to a complementary execution-layer profiler. The CO2 banner makes the transmission-layer cost visible at the same time.
2. **Intentional scope.** The estimate is a directional signal, not a precise measurement. Showing it in only one browser reduces the risk of users over-interpreting it, and keeps the UI clean in other browsers.

### Model and constants

The estimate uses the **Sustainable Web Design (SWD) model** ([sustainablewebdesign.org/estimating-digital-emissions](https://sustainablewebdesign.org/estimating-digital-emissions/)):

| Constant | Value | Meaning |
| :--- | :--- | :--- |
| `SWD_KWH_PER_GB` | `0.81` | kWh consumed per GB transferred across the full system (client, network, server) |
| `SWD_GRID_INTENSITY` | `442` | grams CO2 per kWh (global average grid carbon intensity) |
| `CO2_G_PER_BYTE` | `SWD_KWH_PER_GB × SWD_GRID_INTENSITY / (1024³)` | grams CO2 per byte transferred |

The derived constant `CO2_G_PER_BYTE` is approximately `3.34 × 10⁻⁷` g CO2 per byte.

### Implementation (from `index.html`)

**Browser detection:**

```js
// UA sniff is intentional: Firefox Profiler CO2 feature is Firefox-only
const isFirefox = /firefox/i.test(navigator.userAgent);
```

**SWD model constants:**

```js
// Sustainable Web Design model (https://sustainablewebdesign.org/estimating-digital-emissions/)
const SWD_KWH_PER_GB = 0.81;       // kWh per GB transferred across the full system
const SWD_GRID_INTENSITY = 442;     // g CO2 per kWh (global average)
const BYTES_PER_GB = 1024 * 1024 * 1024;
const CO2_G_PER_BYTE = (SWD_KWH_PER_GB * SWD_GRID_INTENSITY) / BYTES_PER_GB;
```

**Formatting helper** (auto-scales from micrograms to grams):

```js
function formatCO2(bytes) {
  const g = bytes * CO2_G_PER_BYTE;
  if (g < 0.001) return (g * 1e6).toFixed(2) + "\u00a0\u03bcg CO\u2082";  // µg
  if (g < 1)    return (g * 1e3).toFixed(2) + "\u00a0mg CO\u2082";        // mg
  return g.toFixed(3) + "\u00a0g CO\u2082";                                // g
}
```

**Display in the metrics update callback:**

```js
if (isFirefox) {
  firefoxCO2.textContent = formatCO2(rawBytes);
}
```

**Banner markup** (visible in Firefox, hidden in all other browsers):

```html
<div class="firefox-banner" id="firefoxBanner" hidden>
  <span aria-live="polite">
    🦊 CO2 estimate for this preview:
    <strong id="firefoxCO2">—</strong>
    <small>(SWD model, HTML bytes only)</small>
  </span>
  <button type="button" id="dismissFirefoxBanner"
          aria-label="Dismiss Firefox CO2 estimate">✕</button>
</div>
```

**Banner is revealed on page load if Firefox is detected:**

```js
if (isFirefox) {
  firefoxBanner.hidden = false;
}
dismissFirefoxBanner.addEventListener("click", () => {
  firefoxBanner.hidden = true;
});
```

### Accessibility notes

- The `<span>` containing the estimate carries `aria-live="polite"` so screen readers announce the updated value on each preview refresh without interrupting the user.
- The dismiss button has an explicit `aria-label` because its visible text is only a close symbol (`✕`).
- The banner uses the same CSS custom property system as the rest of the app and adjusts for both dark and light app themes.

### Limitations of this estimate

- **HTML bytes only.** External CSS, JavaScript, images, fonts, and third-party resources loaded by the preview are not counted.
- **SWD is a system average.** The model assumes a global average grid carbon intensity (`442 g CO2/kWh`) and a system-wide energy coefficient (`0.81 kWh/GB`). Real values vary by country, time of day, and ISP.
- **No execution cost.** CPU/GPU energy for rendering, JavaScript execution, and layout is not captured. Use the Firefox Profiler for that layer.
- **No repeat-visit caching.** The estimate treats every load as a cold (uncached) transfer.

---

## Using Firefox Profiler for execution-layer profiling

The Firefox Profiler (`profiler.firefox.com`) complements the in-browser CO2 estimate by covering the execution layer:

1. Open the app in Firefox.
2. Open **Firefox Profiler**: go to `about:profiling` or use the browser toolbar button.
3. Start a recording, interact with the editor (type markup, trigger a preview refresh), then stop.
4. Inspect the flame chart for:
   - **JavaScript execution time** (parsing, compilation, runtime calls)
   - **Layout and style recalculation** triggered by preview updates
   - **Main-thread blocking** during the debounced refresh
5. Cross-reference the execution profile with the transmission-layer CO2 estimate in the banner to get a more complete picture of the cost of the content you are authoring.

For a full guide to execution-layer profiling, see [Measuring Web Energy Use — Execution layer](https://mgifford.github.io/SUSTAINABILITY.md/measuring-energy/#execution-layer).

---

## Reusable in-browser CO2 estimation pattern

This section defines the pattern so it can be referenced in the SUSTAINABILITY.md documentation repo.

### Pattern name

**Inline SWD CO2 estimate banner**

### Intent

Show a lightweight, real-time transmission-layer CO2 estimate directly in the browser, updated as the user works, without any server calls or third-party libraries.

### Applicability

Use this pattern when:

- The page or tool generates or measures HTML/markup of variable length.
- You want to make the transmission cost of that markup visible to the user.
- You do not want to add a third-party CO2.js dependency.
- The estimate is a directional signal, not a regulatory disclosure.

### Structure

1. **Constants**: Define the three SWD model constants (`SWD_KWH_PER_GB`, `SWD_GRID_INTENSITY`, `BYTES_PER_GB`) and derive `CO2_G_PER_BYTE` from them. Keep them as named constants with comments pointing to the source specification.
2. **Formatter**: Implement a `formatCO2(bytes)` function that auto-scales the output from micrograms through milligrams to grams as content grows, using Unicode units (`µg`, `mg`, `g`).
3. **Byte count**: Use `new TextEncoder().encode(input).length` to get an accurate UTF-8 byte count of the user's input.
4. **Display**: Update a live region (`aria-live="polite"`) with the formatted estimate on each meaningful content change.
5. **Dismissal**: Provide a clearly labelled dismiss control so the banner does not permanently occupy space.
6. **Scope label**: Always include a parenthetical clarifying the scope of the estimate — for example, `(SWD model, HTML bytes only)` — so users know the estimate does not cover the full page.

### Constraints

- Do not present the estimate as precise or authoritative. Label it clearly as a model-based estimate.
- Update the constants when the SWD specification publishes a new version.
- If restricting to a specific browser, document the reason explicitly in the code with a comment (see the `isFirefox` constant above).

### Collaborating tools

| Layer | Tool | Notes |
| :--- | :--- | :--- |
| Transmission | This pattern (SWD inline estimate) | Byte-count proxy; no external API needed |
| Execution | Firefox Profiler | Flame chart for JS, layout, paint |
| Execution | Chrome DevTools Performance panel | Cross-browser alternative |
| Full-page audit | Google Lighthouse | Page weight, unused JS, image optimization |
| CI budget | Lighthouse CI, size-limit | Block weight regressions in pull requests |

---

## Living metrics

| Metric | Target | Current | Owner |
| :--- | :--- | :--- | :--- |
| Page weight (`index.html`) | <= current baseline | ~45 KB | @mgifford |
| Third-party requests | 1 (Sa11y CDN only) | 1 | @mgifford |
| External scripts | 0 (Sa11y injected in iframe only) | 0 in shell | @mgifford |
| Axe violations | 0 | 0 (CI enforced) | @mgifford |

---

## Known limitations

| Issue | Status | Owner | Target date | Notes |
| :--- | :--- | :--- | :--- | :--- |
| No formal page-weight CI budget | open | @mgifford | 2026-12-31 | Run baseline Lighthouse; set initial threshold |
| CO2 estimate covers HTML bytes only — external assets not counted | by design | @mgifford | — | Document scope clearly; label in UI |
| Green hosting status unknown — GitHub Pages CDN energy mix not published | open | @mgifford | 2026-06-30 | Monitor GitHub/Azure sustainability disclosures |
| SWD model constants may become outdated | open | @mgifford | Review annually | Check sustainablewebdesign.org for updated model versions |

---

## Trusted references

- [Web Sustainability Guidelines (WSG) — W3C editor draft](https://www.w3.org/TR/web-sustainability-guidelines/)
- [Sustainable Web Design model — estimating digital emissions](https://sustainablewebdesign.org/estimating-digital-emissions/)
- [CO2.js — Green Web Foundation](https://developers.thegreenwebfoundation.org/co2js/overview/)
- [Firefox Profiler](https://profiler.firefox.com/)
- [SUSTAINABILITY.md reference policy](https://mgifford.github.io/SUSTAINABILITY.md/)
- [Measuring Web Energy Use — SUSTAINABILITY.md](https://mgifford.github.io/SUSTAINABILITY.md/measuring-energy/)

---

## AI usage policy

### Default stance

- Prefer non-AI solutions first: static rules, deterministic scripts, and cached results.
- Use AI only when it clearly reduces total lifecycle impact.

### Allowed uses

- Drafting and summarizing documentation where equivalent tooling does not exist.
- One-time refactoring or migration support.
- Triage and analysis tasks that reduce repeated manual work.

### Disallowed uses

- No always-on AI generation in CI for routine checks.
- No AI use for trivial formatting, boilerplate, or deterministic transformations.
- Do not activate browser built-in AI features automatically; they must be opt-in.

---

## AI Disclosure

### In building

- Content drafting, structural editing, and documentation were assisted by AI (GitHub Copilot / Claude-class models).
- Code suggestions used AI assistance with human review and editing.

### In execution

- No AI runs automatically at runtime or page load. The app is a static HTML file.
- No AI-powered features are activated in the browser automatically.

### Models used

| Purpose | Model / tool | When used |
| :--- | :--- | :--- |
| Code assistance and PR support | GitHub Copilot (OpenAI Codex / GPT-4-class) | During development |
| Firefox CO2 banner and SWD model integration | GitHub Copilot Coding Agent (Claude / Anthropic) | During development |
| SUSTAINABILITY.md initial draft | GitHub Copilot Coding Agent (Claude / Anthropic) | 2026-04-04 |
