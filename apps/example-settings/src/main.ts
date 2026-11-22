import "@glasskit/tokens/tokens.css";
import "./styles.css";

import { animateRecipe } from "@glasskit/motion";
import { installGlassKit } from "@glasskit/ui";

installGlassKit();

function must<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element: ${selector}`);
  return element;
}

const root = document.documentElement;
const themeToggle = must<HTMLElement>("#theme-toggle");
const status = must<HTMLElement>("#status");
const content = must<HTMLElement>("#content");
const thickness = must<HTMLElement>("#thickness");

themeToggle.addEventListener("gk-activate", () => {
  const light = root.dataset.gkTheme !== "light";
  root.dataset.gkTheme = light ? "light" : "dark";
  themeToggle.textContent = light ? "Dark" : "Light";
  status.textContent = `Theme: ${light ? "light" : "dark"}`;
});

thickness.addEventListener("gk-change", (event) => {
  const detail = (event as CustomEvent<{ value: string }>).detail;
  status.textContent = `Material thickness: ${detail.value}`;
});

for (const item of document.querySelectorAll<HTMLButtonElement>(".nav-item")) {
  item.addEventListener("click", () => {
    for (const other of document.querySelectorAll(".nav-item")) {
      other.classList.remove("is-active");
    }
    item.classList.add("is-active");
    status.textContent = `${item.textContent} selected`;
  });
}

animateRecipe(content, "panel-in");
