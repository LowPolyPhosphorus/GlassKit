import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, "..");
const tokens = JSON.parse(await readFile(path.join(root, "tokens.json"), "utf8"));

const kebab = (value) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();

function flatten(value, prefix = "", out = {}) {
  for (const [key, child] of Object.entries(value)) {
    const next = prefix ? `${prefix}-${kebab(key)}` : kebab(key);
    if (child && typeof child === "object" && !Array.isArray(child)) {
      flatten(child, next, out);
    } else {
      out[`--gk-${next}`] = String(child);
    }
  }
  return out;
}

function channel(hex, index) {
  return Number.parseInt(hex.slice(index, index + 2), 16);
}

/** Alpha-compose a foreground colour over a background; returns #rrggbb. */
function composite(background, foreground, alpha) {
  const bg = background.replace("#", "");
  const fg = foreground.replace("#", "");
  const mix = (index) =>
    Math.floor(channel(fg, index) * alpha + channel(bg, index) * (1 - alpha))
      .toString(16)
      .padStart(2, "0");
  return `#${mix(0)}${mix(2)}${mix(4)}`;
}

const common = { ...tokens };
delete common.theme;
const variables = {
  ...flatten(common),
  ...flatten(tokens.theme.dark, "color"),
  "--gk-color-composite-example": composite("#c83b41", "#000000", 0.5),
};
const lightVariables = flatten(tokens.theme.light, "color");
const liquidDark = flatten(tokens.theme.liquid.dark, "color");
const liquidLight = flatten(tokens.theme.liquid.light, "color");

function block(selector, values, indent = "  ") {
  const lines = Object.entries(values).map(([name, value]) => `${indent}${name}: ${value};`);
  return `${selector} {\n${lines.join("\n")}\n}`;
}

const css = [
  "/* Generated from tokens.json. Do not edit by hand. */",
  ":root {",
  "  color-scheme: dark;",
  "  --gk-material-filter: var(--gk-material-filter-flat);",
  ...Object.entries(variables).map(([name, value]) => `  ${name}: ${value};`),
  "}",
  "",
  block('[data-gk-theme="light"]', { "color-scheme": "light", ...lightVariables }),
  "",
  block('[data-gk-material="liquid"]', { "--gk-material-filter": "var(--gk-material-filter-liquid)", ...liquidDark }),
  "",
  block('[data-gk-theme="light"][data-gk-material="liquid"]', liquidLight),
  "",
].join("\n");

const generatedTs = [
  "/* Generated from tokens.json. Do not edit by hand. */",
  `export const tokens = ${JSON.stringify(tokens, null, 2)} as const;`,
  "export type Tokens = typeof tokens;",
  "export default tokens;",
  "",
].join("\n");

await writeFile(path.join(root, "tokens.css"), css, "utf8");
await writeFile(path.join(root, "src", "generated.ts"), generatedTs, "utf8");

console.log(`generated ${Object.keys(variables).length} CSS variables`);
