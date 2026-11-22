import "@glasskit/tokens/tokens.css";
import "./styles.css";

import { animateRecipe, springValue, springs } from "@glasskit/motion";
import type { SpringPresetName } from "@glasskit/motion";
import { installGlassKit } from "@glasskit/ui";

installGlassKit();

function must<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
}

const root = document.documentElement;
const themeToggle = must<HTMLElement>("#theme-toggle");
const demoPanel = must<HTMLElement>("#demo-panel");
const replay = must<HTMLElement>("#replay");
const focusMe = must<HTMLElement>("#focus-me");
const segment = must<HTMLElement>("#material-segment");
const motionStatus = must<HTMLElement>("#motion-status");
const motionBars = must<HTMLElement>("#motion-bars");

themeToggle.addEventListener("gk-activate", () => {
  const light = root.dataset.gkTheme !== "light";
  root.dataset.gkTheme = light ? "light" : "dark";
  themeToggle.textContent = light ? "Dark" : "Light";
});

replay.addEventListener("gk-activate", () => {
  animateRecipe(demoPanel, "sheet-in");
});

focusMe.addEventListener("gk-activate", () => {
  motionStatus.textContent = "Focus ring uses --gk-color-accent and Windows keyboard focus.";
  focusMe.focus();
});

segment.addEventListener("gk-change", (event) => {
  const detail = (event as CustomEvent<{ value: string }>).detail;
  motionStatus.textContent = `Material: ${detail.value} · change event delivered`;
});

function renderMotionBars(): void {
  motionBars.replaceChildren();

  for (const name of Object.keys(springs) as SpringPresetName[]) {
    const row = document.createElement("div");
    row.className = "motion-row";

    const label = document.createElement("span");
    label.className = "motion-label";
    label.textContent = name;
    row.append(label);

    const track = document.createElement("div");
    track.className = "motion-track";
    const config = springs[name];
    for (let index = 0; index < 48; index += 1) {
      const tick = document.createElement("span");
      const value = springValue(config, (index / 47) * 600, 0, 1);
      tick.style.height = `${Math.max(4, Math.min(100, Math.abs(value) * 100))}%`;
      track.append(tick);
    }
    row.append(track);
    motionBars.append(row);
  }
}

renderMotionBars();
animateRecipe(demoPanel, "panel-in");
