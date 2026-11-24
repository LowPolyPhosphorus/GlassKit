import { mountShadow } from "../base.js";
import { clamp, componentBaseCss, emit, parseList, toNumber } from "../shared.js";

/**
 * Declarative implementations of every component topic in Apple's HIG
 * "Components" section. These are visual and behavioural translations for
 * Glass Kit: no Apple artwork, symbols, fonts, or platform chrome are used.
 */

export interface HigPatternMeta {
  slug: string;
  tag: string;
  className: string;
  title: string;
  group: string;
  description: string;
  practices: string[];
  higPage: string;
}

export interface HigPatternSpec extends HigPatternMeta {
  body: (host: HTMLElement) => string;
  attributes?: string[];
  sync?: (host: HTMLElement, root: ShadowRoot) => void;
  wire?: (host: HTMLElement, root: ShadowRoot) => void;
}

type Body = (host: HTMLElement) => string;

const esc = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const val = (host: HTMLElement, name: string, fallback = ""): string => host.getAttribute(name) ?? fallback;
const num = (host: HTMLElement, name: string, fallback: number): number => toNumber(host.getAttribute(name), fallback);
const list = (host: HTMLElement, name: string, fallback: string[] = []): string[] => {
  const parsed = parseList(host.getAttribute(name));
  return parsed.length ? parsed : fallback;
};

const note = (text: string): string => `<p class="note">${esc(text)}</p>`;

const select = (options: string[], selected?: string): string =>
  `<label class="field"><span>${esc(selected || options[0] || "Choose")}</span><select>${options
    .map((option) => `<option${option === selected ? " selected" : ""}>${esc(option)}</option>`)
    .join("")}</select></label>`;

const optionList = (items: string[], action = "select"): string =>
  `<div class="menu">${items
    .map(
      (item, index) =>
        `<button type="button" class="menu-item" data-gk-action="${action}" data-gk-value="${esc(item)}"><span>${esc(
          item,
        )}</span><span class="menu-meta">${index === 0 ? "⌘1" : ""}</span></button>`,
    )
    .join("")}</div>`;

const starRow = (count: number): string =>
  `<div class="rating" aria-label="${count} of 5">${[1, 2, 3, 4, 5]
    .map(
      (star) =>
        `<button type="button" class="star${star <= count ? " is-on" : ""}" data-gk-action="rate" data-gk-value="${star}" aria-label="${star} stars">★</button>`,
    )
    .join("")}</div>`;

const keys = (rows: string[][]): string =>
  `<div class="keyboard">${rows
    .map((row) => `<div class="key-row">${row.map((key) => `<span class="key">${esc(key)}</span>`).join("")}</div>`)
    .join("")}</div>`;

const button = (label: string, action = "activate", value = label, variant = ""): string =>
  `<button type="button" class="mini-button ${variant}" data-gk-action="${action}" data-gk-value="${esc(value)}">${esc(
    label,
  )}</button>`;

const swatches = (colors: string[]): string =>
  `<div class="swatch-line">${colors
    .map(
      (color) =>
        `<button type="button" class="swatch-chip" style="--swatch:${esc(color)}" data-gk-action="color" data-gk-value="${esc(
          color,
        )}" aria-label="${esc(color)}"></button>`,
    )
    .join("")}</div>`;

function wireActions(host: HTMLElement, root: ShadowRoot): void {
  root.addEventListener("click", (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-gk-action]");
    if (!target) return;
    const action = target.dataset.gkAction ?? "activate";
    const value = target.dataset.gkValue ?? target.textContent?.trim() ?? action;

    if (action === "step-up" || action === "step-down") {
      const next = num(host, "value", 0) + (action === "step-up" ? 1 : -1);
      host.setAttribute("value", String(next));
      emit(host, "gk-change", { value: next });
      return;
    }

    if (action === "rate") {
      host.setAttribute("value", value);
      emit(host, "gk-change", { value: Number(value) });
      return;
    }

    if (action === "color") {
      host.setAttribute("value", value);
      emit(host, "gk-change", { value });
      return;
    }

    if (action === "select" || action === "tab") {
      root.querySelectorAll<HTMLElement>("[data-gk-action='select'],[data-gk-action='tab']").forEach((item) => {
        item.classList.toggle("is-selected", item === target);
        item.setAttribute("aria-selected", String(item === target));
      });
      const sibling = root.querySelector<HTMLElement>("[data-view]");
      if (sibling) sibling.textContent = `${value} view`;
      emit(host, "gk-select", { value, label: target.textContent?.trim() ?? value });
      return;
    }

    if (action === "open" || action === "close") {
      const stage = root.querySelector<HTMLElement>(".stage");
      stage?.classList.toggle("is-open", action === "open");
      emit(host, action === "open" ? "gk-open" : "gk-close", { value });
      return;
    }

    emit(host, target.dataset.gkEvent ?? "gk-activate", { value, label: target.textContent?.trim() ?? value });
  });

  root.addEventListener("input", (event) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (!("value" in target)) return;
    emit(host, "gk-input", { value: target.value });
  });

  root.addEventListener("change", (event) => {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (!("value" in target)) return;
    emit(host, "gk-change", { value: target.value });
  });
}

function syncValue(selector: string, fallback = ""): NonNullable<HigPatternSpec["sync"]> {
  return (host, root) => {
    const target = root.querySelector<HTMLElement>(selector);
    if (target) target.textContent = val(host, "value", fallback);
  };
}

function syncProgress(host: HTMLElement, root: ShadowRoot): void {
  const value = clamp(num(host, "value", 60), 0, 100);
  root.querySelector<HTMLElement>(".progress-fill")?.style.setProperty("--progress", `${value}%`);
  syncValue(".progress-value", "60%")(host, root);
}

function syncRating(host: HTMLElement, root: ShadowRoot): void {
  const value = clamp(num(host, "value", 4), 0, 5);
  root.querySelectorAll<HTMLElement>(".star").forEach((star, index) => star.classList.toggle("is-on", index < value));
}

function syncColor(host: HTMLElement, root: ShadowRoot): void {
  const value = val(host, "value", "#0a84ff");
  const swatch = root.querySelector<HTMLElement>(".color-swatch");
  const label = root.querySelector<HTMLElement>(".color-value");
  if (swatch) swatch.style.setProperty("--swatch", value);
  if (label) label.textContent = value;
  const input = root.querySelector<HTMLInputElement>("input[type='color']");
  if (input && input.value !== value) input.value = value;
}

function syncStepper(host: HTMLElement, root: ShadowRoot): void {
  syncValue(".stepper-value", "0")(host, root);
  const minus = root.querySelector<HTMLButtonElement>("[data-gk-action='step-down']");
  const plus = root.querySelector<HTMLButtonElement>("[data-gk-action='step-up']");
  const value = num(host, "value", 0);
  const min = num(host, "min", -Infinity);
  const max = num(host, "max", Infinity);
  if (minus) minus.disabled = value <= min;
  if (plus) plus.disabled = value >= max;
}

const styles = `
  ${componentBaseCss}
  :host {
    display: block;
    min-width: 0;
  }

  .pattern {
    display: grid;
    align-content: start;
    gap: 10px;
    min-width: 0;
    padding: 14px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-md);
    background: var(--gk-color-card);
  }

  .pattern-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .pattern-head strong {
    color: var(--gk-color-text);
    font-size: var(--gk-font-size-md);
    font-weight: var(--gk-font-weight-semibold);
    letter-spacing: var(--gk-font-tracking-tight);
  }

  .eyebrow {
    color: var(--gk-color-accent);
    font-size: var(--gk-font-size-xs);
    font-weight: var(--gk-font-weight-semibold);
    letter-spacing: var(--gk-font-tracking-wide);
    text-transform: uppercase;
  }

  .note,
  .meta {
    margin: 0;
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-sm);
  }

  .stage {
    position: relative;
    min-width: 0;
    padding: 12px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-glass-thin);
  }

  .practices {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .practices li {
    padding: 3px 7px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-pill);
    color: var(--gk-color-text-muted);
    font-size: 10px;
  }

  .stack,
  .row,
  .key-row,
  .swatch-line {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .stack { flex-direction: column; align-items: stretch; }
  .row--between { justify-content: space-between; }

  .mini-button,
  .menu-item,
  .tab,
  .quick-action {
    appearance: none;
    min-height: 30px;
    padding: 6px 10px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-card);
    color: var(--gk-color-text);
    cursor: pointer;
    font: inherit;
    font-size: var(--gk-font-size-sm);
  }

  .mini-button:hover,
  .menu-item:hover,
  .tab:hover,
  .quick-action:hover { background: var(--gk-color-card-hover); }

  .mini-button.is-selected,
  .tab.is-selected,
  .menu-item.is-selected {
    border-color: var(--gk-color-accent-stroke);
    background: var(--gk-color-accent-fill);
    color: var(--gk-color-text);
  }

  .mini-button--primary {
    border-color: var(--gk-color-accent);
    background: var(--gk-color-accent);
    color: #fff;
  }

  .mini-button:disabled { opacity: 0.4; cursor: default; }

  .menu {
    display: grid;
    gap: 2px;
    min-width: 150px;
    padding: 4px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-card);
  }

  .menu-item {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    width: 100%;
    border: 0;
    border-radius: var(--gk-radius-xs);
    background: transparent;
    text-align: left;
  }

  .menu-meta { color: var(--gk-color-text-dim); font-size: 10px; }

  .field {
    display: grid;
    gap: 4px;
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-xs);
  }

  .field input,
  .field select,
  .field textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 7px 9px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-card);
    color: var(--gk-color-text);
    font: inherit;
    font-size: var(--gk-font-size-sm);
  }

  .surface {
    padding: 10px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-card);
  }

  .surface strong { display: block; margin-bottom: 2px; font-size: var(--gk-font-size-sm); }
  .surface small { color: var(--gk-color-text-muted); font-size: 10px; }

  .table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--gk-font-size-sm);
  }

  .table th,
  .table td {
    padding: 6px 8px;
    border-bottom: 1px solid var(--gk-color-hairline);
    text-align: left;
  }

  .table th { color: var(--gk-color-text-muted); font-weight: var(--gk-font-weight-medium); }
  .table tr:last-child td { border-bottom: 0; }

  .tree-item {
    padding: 5px 8px;
    border-left: 1px solid var(--gk-color-hairline);
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-sm);
  }

  .tree-item.is-root { border-left: 0; color: var(--gk-color-text); }

  .lockup {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .mark {
    display: grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border: 1px solid var(--gk-color-accent-stroke);
    border-radius: 10px;
    background: var(--gk-color-accent-fill);
    color: var(--gk-color-accent);
    font-size: 16px;
  }

  .popover {
    width: min(100%, 210px);
    padding: 12px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-card);
  }

  .popover::after {
    content: "";
    position: absolute;
    top: -5px;
    left: 26px;
    width: 8px;
    height: 8px;
    border-left: 1px solid var(--gk-color-hairline);
    border-top: 1px solid var(--gk-color-hairline);
    background: var(--gk-color-card);
    transform: rotate(45deg);
  }

  .sheet,
  .alert,
  .action-sheet,
  .window-card {
    display: grid;
    gap: 8px;
    padding: 14px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-md);
    background: var(--gk-color-card);
  }

  .window-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--gk-color-hairline);
  }

  .window-controls { display: flex; gap: 2px; margin-left: auto; }
  .window-controls span {
    display: grid;
    place-items: center;
    width: 20px;
    height: 18px;
    border: 1px solid var(--gk-color-hairline);
    color: var(--gk-color-text-muted);
    font-size: 11px;
    line-height: 1;
  }

  .sheet-handle {
    width: 34px;
    height: 4px;
    margin: -4px auto 4px;
    border-radius: var(--gk-radius-pill);
    background: var(--gk-color-text-dim);
  }

  .action-option {
    width: 100%;
    min-height: 30px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-card);
    color: var(--gk-color-text);
    font: inherit;
    font-size: var(--gk-font-size-sm);
  }

  .scroll-box {
    max-height: 92px;
    overflow: auto;
    padding-right: 8px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
  }

  .scroll-box p { margin: 0 0 10px; color: var(--gk-color-text-muted); font-size: var(--gk-font-size-sm); }
  .scroll-thumb { width: 4px; border-radius: var(--gk-radius-pill); background: var(--gk-color-accent); }

  .dots { display: flex; justify-content: center; gap: 7px; margin-top: 8px; }
  .dot { width: 7px; height: 7px; padding: 0; border: 1px solid var(--gk-color-accent); border-radius: 50%; background: transparent; }
  .dot.is-selected { background: var(--gk-color-accent); }

  .stepper {
    display: inline-flex;
    align-items: center;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    overflow: hidden;
  }

  .stepper button {
    width: 34px;
    height: 30px;
    border: 0;
    background: var(--gk-color-card);
    color: var(--gk-color-text);
    font-size: 16px;
    cursor: pointer;
  }

  .stepper-value {
    min-width: 38px;
    padding: 0 8px;
    border-inline: 1px solid var(--gk-color-hairline);
    color: var(--gk-color-text);
    font-size: var(--gk-font-size-sm);
    text-align: center;
  }

  .digit-row { display: flex; gap: 6px; }
  .digit {
    width: 34px;
    height: 38px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-card);
    color: var(--gk-color-text);
    font: inherit;
    font-size: 18px;
    text-align: center;
  }

  .swatch-chip {
    width: 28px;
    height: 28px;
    padding: 0;
    border: 1px solid var(--gk-color-hairline);
    border-radius: 8px;
    background: var(--swatch);
    cursor: pointer;
  }

  .color-well {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .color-swatch {
    width: 44px;
    height: 30px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: 8px;
    background: var(--swatch);
    box-shadow: inset 0 0 0 2px var(--gk-color-card);
  }

  .color-well input { position: absolute; width: 1px; height: 1px; opacity: 0; }
  .color-value { color: var(--gk-color-text-muted); font-size: var(--gk-font-size-xs); }

  .rating { display: flex; gap: 2px; }
  .star { padding: 0; border: 0; background: none; color: var(--gk-color-text-dim); font-size: 18px; cursor: pointer; }
  .star.is-on { color: var(--gk-color-accent); }

  .progress-track {
    height: 8px;
    border-radius: var(--gk-radius-pill);
    background: var(--gk-color-hairline);
    overflow: hidden;
  }

  .progress-fill {
    width: var(--progress, 60%);
    height: 100%;
    border-radius: inherit;
    background: var(--gk-color-accent);
  }

  .gauge svg,
  .ring svg { width: 72px; height: 72px; }
  .gauge circle,
  .ring circle { fill: none; stroke-width: 7; }
  .gauge .base,
  .ring .base { stroke: var(--gk-color-hairline); }
  .gauge .value,
  .ring .value { stroke: var(--gk-color-accent); stroke-linecap: round; }

  .widget,
  .watch-face,
  .top-shelf-card,
  .complication,
  .shortcut {
    display: grid;
    gap: 4px;
    padding: 10px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-card);
  }

  .widget strong,
  .top-shelf-card strong,
  .shortcut strong { font-size: var(--gk-font-size-sm); }
  .widget span,
  .top-shelf-card span,
  .shortcut span { color: var(--gk-color-text-muted); font-size: 10px; }

  .watch-face {
    place-items: center;
    width: 76px;
    height: 76px;
    padding: 0;
    border-radius: 50%;
    font-size: 13px;
    font-weight: var(--gk-font-weight-semibold);
  }

  .complication {
    place-items: center;
    width: 48px;
    height: 48px;
    padding: 0;
    border-radius: 50%;
    font-size: 10px;
  }

  .shelf-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; }

  .d-pad {
    display: grid;
    grid-template-columns: repeat(3, 24px);
    grid-template-rows: repeat(3, 24px);
    gap: 3px;
  }

  .d-pad i,
  .pad-button {
    display: grid;
    place-items: center;
    border: 1px solid var(--gk-color-hairline);
    border-radius: 7px;
    background: var(--gk-color-card);
    color: var(--gk-color-text-muted);
    font-size: 11px;
  }

  .d-pad i:empty { background: transparent; border-color: transparent; }
  .pad-button { width: 26px; height: 26px; border-radius: 50%; }

  .pointer {
    position: relative;
    width: 56px;
    height: 56px;
    border: 1px solid var(--gk-color-accent-stroke);
    border-radius: 50%;
  }

  .pointer::before,
  .pointer::after {
    content: "";
    position: absolute;
    background: var(--gk-color-accent);
  }

  .pointer::before { top: 50%; left: 10px; width: 36px; height: 1px; }
  .pointer::after { left: 50%; top: 10px; width: 1px; height: 36px; }

  .axes { position: relative; width: 76px; height: 76px; border: 1px solid var(--gk-color-hairline); border-radius: 50%; }
  .axes i { position: absolute; left: 50%; top: 50%; width: 1px; height: 30px; background: var(--gk-color-hairline); transform-origin: bottom; }
  .axes i:nth-child(2) { transform: rotate(90deg); }
  .axes i:nth-child(3) { background: var(--gk-color-accent); transform: rotate(35deg); }

  .swipe {
    position: relative;
    width: 120px;
    height: 26px;
    border-bottom: 1px solid var(--gk-color-hairline);
  }

  .swipe i {
    position: absolute;
    left: 8px;
    bottom: -4px;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: var(--gk-color-accent);
  }

  .swipe span { position: absolute; right: 0; bottom: 2px; color: var(--gk-color-text-dim); font-size: 13px; }

  .crown {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: 50%;
    color: var(--gk-color-text-muted);
    font-size: 10px;
  }

  .shutter {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    border: 2px solid var(--gk-color-hairline);
    border-radius: 50%;
  }

  .shutter i { width: 22px; height: 22px; border: 1px solid var(--gk-color-accent); border-radius: 50%; background: var(--gk-color-accent-fill); }

  .scribble svg { width: 110px; height: 42px; }
  .scribble path { fill: none; stroke: var(--gk-color-accent); stroke-width: 2; stroke-linecap: round; }

  .action-button {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .action-button i {
    width: 12px;
    height: 34px;
    border: 1px solid var(--gk-color-accent-stroke);
    border-radius: var(--gk-radius-pill);
    background: var(--gk-color-accent-fill);
  }
`;

function createPatternClass(spec: HigPatternSpec): CustomElementConstructor {
  class PatternElement extends HTMLElement {
    static get observedAttributes(): string[] {
      return spec.attributes ?? ["value", "label", "selected", "open"];
    }

    connectedCallback(): void {
      if (!this.shadowRoot) {
        const html = `
          <div class="pattern" data-pattern="${esc(spec.slug)}">
            <div class="pattern-head">
              <span class="eyebrow">${esc(spec.group)}</span>
              <strong>${esc(spec.title)}</strong>
            </div>
            <p class="note">${esc(spec.description)}</p>
            <div class="stage">${spec.body(this)}<slot></slot></div>
            <ul class="practices">${spec.practices.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
          </div>`;
        mountShadow(this, html, styles);
        wireActions(this, this.shadowRoot!);
        spec.wire?.(this, this.shadowRoot!);
      }
      spec.sync?.(this, this.shadowRoot!);
    }

    attributeChangedCallback(): void {
      if (this.shadowRoot) spec.sync?.(this, this.shadowRoot);
    }
  }

  Object.defineProperty(PatternElement, "name", { value: spec.className });
  return PatternElement;
}

const spec = (
  slug: string,
  title: string,
  group: string,
  description: string,
  practices: string[],
  body: Body,
  extra: Partial<Omit<HigPatternSpec, "slug" | "tag" | "className" | "title" | "group" | "description" | "practices" | "body">> = {},
): HigPatternSpec => ({
  slug,
  tag: `gk-${slug}`,
  className: slug
    .split("-")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(""),
  title,
  group,
  description,
  practices,
  body,
  higPage: `https://developer.apple.com/design/human-interface-guidelines/${slug}`,
  ...extra,
});

export const HIG_PATTERNS: HigPatternSpec[] = [
  spec("text-view", "Text views", "Content", "A multiline area for longer, editable text.", ["Match height to content", "Wrap or scroll", "Keep labels visible"], () => `<label class="field"><span>Notes</span><textarea rows="3" placeholder="Write a note…"></textarea></label>`),
  spec("tab-view", "Tab views", "Layout", "Switch between peer views without leaving the context.", ["Keep tabs peer-level", "Use clear labels", "Preserve state"], () => `<div class="stack"><div class="row"><button type="button" class="tab is-selected" data-gk-action="tab" data-gk-value="Overview" aria-selected="true">Overview</button><button type="button" class="tab" data-gk-action="tab" data-gk-value="Details" aria-selected="false">Details</button><button type="button" class="tab" data-gk-action="tab" data-gk-value="Activity" aria-selected="false">Activity</button></div><div class="surface"><strong data-view>Overview view</strong><small>Tabs keep navigation local.</small></div></div>`),
  spec("split-view", "Split views", "Layout", "A primary and secondary pane with a clear emphasis.", ["Show one primary pane", "Collapse gracefully", "Keep selection visible"], () => `<div class="row"><div class="surface" style="flex:1"><strong>Primary</strong><small>Main content</small></div><div class="surface" style="flex:1"><strong>Secondary</strong><small>Details and controls</small></div></div>`),
  spec("outline-view", "Outline views", "Layout", "A expandable hierarchy with disclosure affordances.", ["Indent consistently", "Reveal on demand", "Keep depth readable"], () => `<div class="stack"><div class="tree-item is-root">▾ Home</div><div class="tree-item">&nbsp;&nbsp;▾ Living Room</div><div class="tree-item">&nbsp;&nbsp;&nbsp;&nbsp;Lamp</div><div class="tree-item">&nbsp;&nbsp;▸ Kitchen</div></div>`),
  spec("lockup", "Lockups", "Layout", "A mark and title paired as a single identity unit.", ["Keep spacing fixed", "Do not stretch the mark", "Use one baseline"], () => `<div class="lockup"><span class="mark">◈</span><span><strong>Glass Kit</strong><br /><small class="meta">Windows-native design system</small></span></div>`),
  spec("list-table", "Lists and tables", "Layout", "Structured rows with aligned columns and clear hierarchy.", ["Align columns", "Use inset separators", "Keep trailing actions consistent"], () => `<table class="table"><thead><tr><th>Device</th><th>Room</th><th>State</th></tr></thead><tbody><tr><td>Lamp</td><td>Living Room</td><td>On</td></tr><tr><td>Sensor</td><td>Hallway</td><td>Ready</td></tr></tbody></table>`),

  spec("menu-bar", "The menu bar", "Menus and actions", "A compact command strip translated to Windows chrome.", ["Group related commands", "Keep labels short", "Respect keyboard access"], () => `<div class="row"><button type="button" class="mini-button" data-gk-action="activate" data-gk-value="File">File</button><button type="button" class="mini-button" data-gk-action="activate" data-gk-value="Edit">Edit</button><button type="button" class="mini-button" data-gk-action="activate" data-gk-value="View">View</button><button type="button" class="mini-button" data-gk-action="activate" data-gk-value="Help">Help</button></div>`),
  spec("pull-down-button", "Pull-down buttons", "Menus and actions", "A button that reveals a contextual list of choices.", ["Label the action", "Show the current context", "Keep menu items few"], () => `<div class="stack">${button("Actions ▾", "open")}${optionList(["Duplicate", "Move", "Archive"])}</div>`),
  spec("pop-up-button", "Pop-up buttons", "Menus and actions", "A compact control that selects one value from a list.", ["Show current value", "Use for mutually exclusive choices", "Avoid long lists"], () => `<div class="stack">${button("Sort: Recent ▾", "open")}${optionList(["Recent", "Name", "Size"])}</div>`),
  spec("ornament", "Ornaments", "Menus and actions", "A small attached affordance that stays near its target.", ["Attach to content", "Stay unobtrusive", "Keep hit targets usable"], () => `<div class="surface" style="position:relative">Map preview<span class="mini-button" style="position:absolute;right:8px;bottom:8px">Layers</span></div>`),
  spec("menu", "Menus", "Menus and actions", "A temporary list of commands anchored to an action.", ["Use separators for groups", "Keep destructive items distinct", "Support keyboard dismissal"], () => optionList(["New item", "Rename", "Duplicate", "Delete"])),
  spec("home-screen-quick-action", "Home Screen quick actions", "Menus and actions", "Shortcuts to common tasks exposed before the app opens.", ["Limit to a few actions", "Use verb phrases", "Deep-link directly"], () => `<div class="row">${["New note", "Scan", "Play"].map((item) => `<button type="button" class="quick-action" data-gk-action="activate" data-gk-value="${esc(item)}">${esc(item)}</button>`).join("")}</div>`),
  spec("edit-menu", "Edit menus", "Menus and actions", "A contextual menu for modifying selected content.", ["Mirror available commands", "Reflect current selection", "Keep undo prominent"], () => optionList(["Undo", "Redo", "Cut", "Copy", "Paste"])),
  spec("dock-menu", "Dock menus", "Menus and actions", "Taskbar-style jump list translated to a Windows app.", ["Use Windows taskbar semantics", "Expose recent items", "Keep labels plain"], () => optionList(["Open Home Control", "Recent: Living Room", "Recent: Climate", "Pin to taskbar"])),
  spec("context-menu", "Context menus", "Menus and actions", "A menu revealed by a secondary click or long press.", ["Show only relevant commands", "Place near pointer", "Dismiss on outside click"], () => optionList(["Open", "Rename", "Move to…", "Delete"])),
  spec("activity-view", "Activity views", "Menus and actions", "Share and extension actions for the current content.", ["Group by destination", "Keep custom actions minimal", "Preview shared content"], () => `<div class="row">${["Copy", "Save", "Share"].map((item) => button(item, "activate", item)).join("")}</div>`),

  spec("window", "Windows", "Presentation", "A resizable surface with a native Windows title bar and content region.", ["Use native window controls", "Keep focus obvious", "Resize without clipping"], () => `<div class="window-card"><div class="window-bar"><strong class="meta">Home Control</strong><div class="window-controls" aria-hidden="true"><span>—</span><span>□</span><span>×</span></div></div><div class="surface"><strong>Window content</strong><small>Native behaviour stays Windows-first.</small></div></div>`),
  spec("sheet", "Sheets", "Presentation", "A modal surface that stays attached to its parent task.", ["Keep one clear purpose", "Use a cancel path", "Avoid nested sheets"], () => `<div class="sheet"><span class="sheet-handle"></span><strong>Add a room</strong><span class="meta">Name the space you want to control.</span><div class="row">${button("Cancel", "close")}${button("Add", "activate", "Add", "mini-button--primary")}</div></div>`),
  spec("scroll-view", "Scroll views", "Presentation", "A viewport that reveals content beyond its bounds.", ["Keep scroll direction natural", "Show scroll affordance", "Avoid nested scrolling"], () => `<div class="scroll-box"><p>Recent activity</p><p>Sensor updates</p><p>Automation history</p><p>Device status</p></div><div class="scroll-thumb"></div>`),
  spec("popover", "Popovers", "Presentation", "A transient card anchored to the control that opened it.", ["Anchor to the source", "Keep content compact", "Close on outside click"], () => `<div class="popover"><strong>Device details</strong><p class="meta">Lamp · Living Room · On</p>${button("Done", "close")}</div>`),
  spec("panel", "Panels", "Presentation", "A secondary surface for inspection and controls.", ["Keep selection in sync", "Group related settings", "Allow dismissal"], () => `<div class="surface"><strong>Inspector</strong><small>Brightness, schedule, and energy use.</small><div class="row" style="margin-top:8px">${button("Details", "activate")}${button("Close", "close")}</div></div>`),
  spec("page-control", "Page controls", "Presentation", "A row of dots that shows position in a paged view.", ["Show current page", "Keep dot count small", "Make dots tappable"], () => `<div class="dots">${[1, 2, 3, 4]
    .map((page) => `<button type="button" class="dot${page === 1 ? " is-selected" : ""}" data-gk-action="select" data-gk-value="Page ${page}" aria-label="Page ${page}"></button>`)
    .join("")}</div>`),
  spec("alert", "Alerts", "Presentation", "A focused interruption that requires a decision.", ["State the consequence", "Use plain verbs", "Keep choices limited"], () => `<div class="alert"><strong>Turn off all lights?</strong><span class="meta">This affects 6 devices.</span><div class="row">${button("Cancel", "close")}${button("Turn Off", "activate", "Turn Off", "mini-button--primary")}</div></div>`),
  spec("action-sheet", "Action sheets", "Presentation", "A stacked list of choices relevant to the current context.", ["Put cancel last", "Use short labels", "Mark destructive actions clearly"], () => `<div class="action-sheet"><button type="button" class="action-option" data-gk-action="activate" data-gk-value="Add to scene">Add to scene</button><button type="button" class="action-option" data-gk-action="activate" data-gk-value="Rename">Rename</button><button type="button" class="action-option" data-gk-action="close" data-gk-value="Cancel">Cancel</button></div>`),

  spec("virtual-keyboard", "Virtual keyboards", "Selection and input", "An on-screen keyboard adapted to the expected input.", ["Match keyboard type", "Keep keys labelled", "Support predictive text"], () => keys([["q", "w", "e", "r", "t", "y", "u"], ["a", "s", "d", "f", "g", "h"], ["⇧", "z", "x", "c", "v", "⌫"]])),
  spec("stepper", "Steppers", "Selection and input", "A pair of buttons that increments or decrements a value.", ["Pair with a value", "Disable at bounds", "Use whole steps"], (host) => `<div class="stepper"><button type="button" data-gk-action="step-down" aria-label="Decrease">−</button><span class="stepper-value">${esc(val(host, "value", "0"))}</span><button type="button" data-gk-action="step-up" aria-label="Increase">+</button></div>`, { attributes: ["value", "min", "max"], sync: syncStepper }),
  spec("picker", "Pickers", "Selection and input", "A wheel-style choice surface for a bounded set of values.", ["Show selected value", "Keep options predictable", "Avoid deep hierarchies"], () => `<div class="row"><span class="meta">Room</span>${select(["Living Room", "Kitchen", "Climate"], "Living Room")}</div>`),
  spec("image-well", "Image wells", "Selection and input", "A drop target that displays a chosen image.", ["Show a clear placeholder", "Accept drag and drop", "Keep aspect ratio"], () => `<div class="surface"><div class="mark" style="width:64px;height:64px;border-radius:12px">▧</div><small class="meta">Drop an image or choose a file.</small></div>`),
  spec("digit-entry-view", "Digit entry views", "Selection and input", "A row of bounded cells for short numeric codes.", ["One digit per cell", "Move focus automatically", "Mask sensitive values"], () => `<div class="digit-row"><input class="digit" inputmode="numeric" maxlength="1" aria-label="Digit 1" /><input class="digit" inputmode="numeric" maxlength="1" aria-label="Digit 2" /><input class="digit" inputmode="numeric" maxlength="1" aria-label="Digit 3" /><input class="digit" inputmode="numeric" maxlength="1" aria-label="Digit 4" /></div>`),
  spec("combo-box", "Combo boxes", "Selection and input", "Text entry paired with a list of suggested values.", ["Allow custom text", "Filter suggestions", "Keep list dismissible"], () => `<label class="field"><span>Device</span><input list="gk-combo-devices" placeholder="Choose or type a device" /><datalist id="gk-combo-devices"><option value="Living Room Lamp"></option><option value="Kitchen Sensor"></option><option value="Hallway Camera"></option></datalist></label>`),
  spec("color-well", "Color wells", "Selection and input", "A swatch that opens a color picker and accepts dropped colors.", ["Show the active color", "Highlight on activation", "Support drag and drop"], (host) => `<label class="color-well"><span class="color-swatch"></span><input type="color" value="${esc(val(host, "value", "#0a84ff"))}" aria-label="Choose color" /><span class="color-value">${esc(val(host, "value", "#0a84ff"))}</span></label>${swatches(["#0a84ff", "#30d158", "#ff9f0a", "#bf5af2"])}`, {
    attributes: ["value"],
    sync: syncColor,
    wire: (host, root) => {
      const setColor = (event: Event): void => {
        const input = event.target as HTMLInputElement;
        if (input instanceof HTMLInputElement && input.type === "color") host.setAttribute("value", input.value);
      };
      root.addEventListener("input", setColor);
      root.addEventListener("change", setColor);

      const stage = root.querySelector<HTMLElement>(".stage")!;
      stage.addEventListener("dragover", (event) => event.preventDefault());
      stage.addEventListener("drop", (event) => {
        const color = event.dataTransfer?.getData("text/plain")?.trim();
        if (!color || !/^#[0-9a-f]{6}$/i.test(color)) return;
        event.preventDefault();
        host.setAttribute("value", color);
        emit(host, "gk-change", { value: color });
      });
    },
  }),

  spec("rating-indicator", "Rating indicators", "Status", "A row of symbols that communicates a rating.", ["Use a fixed scale", "Keep symbols uniform", "Show the current value"], (host) => starRow(clamp(num(host, "value", 4), 0, 5)), { attributes: ["value"], sync: syncRating }),
  spec("progress-indicator", "Progress indicators", "Status", "A determinate bar that shows how much work remains.", ["Show determinate progress", "Avoid false completion", "Keep label nearby"], (host) => `<div class="row"><div class="progress-track"><div class="progress-fill"></div></div><span class="progress-value">${esc(val(host, "value", "60%"))}</span></div>`, { attributes: ["value"], sync: syncProgress }),
  spec("gauge", "Gauges", "Status", "A circular measure with a bounded start and end.", ["Use familiar bounds", "Keep labels legible", "Avoid implying precision"], () => `<div class="row"><div class="gauge"><svg viewBox="0 0 40 40" aria-hidden="true"><circle class="base" cx="20" cy="20" r="15" stroke-dasharray="70 94" transform="rotate(135 20 20)"></circle><circle class="value" cx="20" cy="20" r="15" stroke-dasharray="48 94" transform="rotate(135 20 20)"></circle></svg></div><span class="meta">Comfort · 68%</span></div>`),
  spec("activity-ring", "Activity rings", "Status", "Concentric rings that compare progress across measures.", ["Keep ring order stable", "Use contrast, not color alone", "Label each ring"], () => `<div class="row"><div class="ring"><svg viewBox="0 0 40 40" aria-hidden="true"><circle class="base" cx="20" cy="20" r="16"></circle><circle class="value" cx="20" cy="20" r="16" stroke-dasharray="74 100" transform="rotate(-90 20 20)"></circle><circle class="base" cx="20" cy="20" r="11"></circle><circle class="value" cx="20" cy="20" r="11" stroke-dasharray="48 70" transform="rotate(-90 20 20)"></circle></svg></div><span class="meta">Move · Exercise</span></div>`),

  spec("widget", "Widgets", "System experiences", "A glanceable surface that surfaces timely content.", ["Show one idea", "Keep content current", "Deep-link on tap"], () => `<div class="widget"><strong>Home</strong><span>3 lights on · 21°C</span><strong>21°</strong></div>`),
  spec("watch-face", "Watch faces", "System experiences", "A compact glanceable time surface.", ["Prioritize time", "Keep complications legible", "Use high contrast"], () => `<div class="watch-face">09:41</div>`),
  spec("top-shelf", "Top Shelf", "System experiences", "A broad row of high-value content cards.", ["Use large targets", "Keep titles short", "Refresh content often"], () => `<div class="shelf-grid"><div class="top-shelf-card"><strong>Living Room</strong><span>6 devices</span></div><div class="top-shelf-card"><strong>Scene</strong><span>Evening</span></div><div class="top-shelf-card"><strong>Energy</strong><span>12 kWh</span></div></div>`),
  spec("complication", "Complications", "System experiences", "A tiny glanceable element attached to a face.", ["Show one value", "Use high contrast", "Update in place"], () => `<div class="row"><div class="complication">21°</div><span class="meta">Temperature</span></div>`),
  spec("app-shortcut", "App Shortcuts", "System experiences", "A named phrase that launches a specific app action.", ["Use natural language", "Keep phrases short", "Expose only frequent actions"], () => `<div class="shortcut"><strong>“Turn off the lights”</strong><span>Opens Home Control · Living Room</span></div>`),

  spec("remote", "Remotes", "Inputs", "A directional and action pad for ten-foot interaction.", ["Keep focus visible", "Use large targets", "Support move and select"], () => `<div class="row"><div class="d-pad"><i></i><i>↑</i><i></i><i>←</i><i>OK</i><i>→</i><i></i><i>↓</i><i></i></div><div class="stack"><span class="pad-button">▶</span><span class="pad-button">↩</span></div></div>`),
  spec("pointing-device", "Pointing devices", "Inputs", "Pointer, click, and scroll behaviour translated for Windows.", ["Keep hover states", "Support right-click", "Respect pointer precision"], () => `<div class="row"><span class="pointer"></span><span class="meta">Move · click · secondary click · scroll</span></div>`),
  spec("nearby-interaction", "Nearby interactions", "Inputs", "Short-range handoff between nearby devices.", ["Confirm before transfer", "Show both endpoints", "Fail gracefully"], () => `<div class="row"><div class="surface"><strong>This PC</strong><small>Home Control</small></div><span class="meta">→</span><div class="surface"><strong>Nearby</strong><small>Living Room Hub</small></div></div>`),
  spec("keyboard", "Keyboards", "Inputs", "Physical keyboard handling with visible focus and shortcuts.", ["Show focus", "Support standard shortcuts", "Avoid trapping keys"], () => keys([["Esc", "Tab", "⇧", "⌘"], ["A", "S", "D", "F"], ["←", "↓", "↑", "→"]])),
  spec("gyro-and-accelerometer", "Gyroscope and accelerometer", "Inputs", "Motion sensing mapped to bounded, optional interactions.", ["Make motion optional", "Keep ranges bounded", "Provide a fallback"], () => `<div class="row"><div class="axes"><i></i><i></i><i></i></div><span class="meta">Tilt · rotate · orientation</span></div>`),
  spec("gesture", "Gestures", "Inputs", "Direct manipulation patterns such as swipe and drag.", ["Use familiar directions", "Show feedback", "Allow cancel"], () => `<div class="swipe"><i></i><span>→</span></div>`),
  spec("game-control", "Game controls", "Inputs", "Controller input with a focusable D-pad and action buttons.", ["Map to focus", "Keep actions labelled", "Avoid conflicting bindings"], () => `<div class="row"><div class="d-pad"><i></i><i>↑</i><i></i><i>←</i><i>OK</i><i>→</i><i></i><i>↓</i><i></i></div><div class="stack"><span class="pad-button">A</span><span class="pad-button">B</span></div></div>`),
  spec("focus-and-selection", "Focus and selection", "Inputs", "A clear distinction between the focused and selected item.", ["Show focus ring", "Keep selection distinct", "Support arrow keys"], () => `<div class="row"><div class="mini-button is-selected">Selected</div><div class="mini-button" style="outline:2px solid var(--gk-color-accent);outline-offset:2px">Focused</div></div>`),
  spec("eyes", "Eyes", "Inputs", "Gaze-aware interaction with explicit confirmation.", ["Require confirmation", "Use large targets", "Offer another input"], () => `<div class="row"><span class="pointer" style="width:44px;height:28px;border-radius:14px"></span><span class="meta">Gaze target · dwell to confirm</span></div>`),
  spec("digital-crown", "Digital Crown", "Inputs", "A rotary input mapped to precise, incremental changes.", ["Use fine steps", "Show live value", "Support direct input"], () => `<div class="row"><div class="crown">↻</div><span class="meta">Rotate to adjust</span></div>`),
  spec("camera-control", "Camera Control", "Inputs", "A dedicated capture control with clear press feedback.", ["Show capture state", "Support press and hold", "Keep shutter obvious"], () => `<div class="row"><div class="shutter"><i></i></div><span class="meta">Capture · press and hold for video</span></div>`),
  spec("apple-pencil-and-scribble", "Apple Pencil and Scribble", "Inputs", "Direct handwriting input translated to a stylus-friendly canvas.", ["Keep strokes visible", "Allow erase and undo", "Provide typed fallback"], () => `<div class="scribble"><svg viewBox="0 0 110 42" aria-hidden="true"><path d="M8 30 C 22 8, 34 8, 44 28 S 64 40, 72 18 S 92 8, 104 26"></path></svg></div>`),
  spec("action-button", "Action button", "Inputs", "A configurable physical control with a visible state.", ["Explain the action", "Show pressed state", "Allow remapping"], () => `<div class="action-button"><i></i><span class="meta">Press to toggle Focus · configurable</span></div>`),
];

const HIG_PAGE_OVERRIDES: Record<string, string> = {
  "tab-view": "tab-views",
  "split-view": "split-views",
  "outline-view": "outline-views",
  "pull-down-button": "pull-down-buttons",
  "pop-up-button": "pop-up-buttons",
  "home-screen-quick-action": "home-screen-quick-actions",
  "edit-menu": "edit-menus",
  "dock-menu": "dock-menus",
  "context-menu": "context-menus",
  "activity-view": "activity-views",
  "scroll-view": "scroll-views",
  "popover": "popovers",
  "panel": "panels",
  "page-control": "page-controls",
  "action-sheet": "action-sheets",
  "virtual-keyboard": "virtual-keyboards",
  "stepper": "steppers",
  "picker": "pickers",
  "image-well": "image-wells",
  "digit-entry-view": "digit-entry-views",
  "combo-box": "combo-boxes",
  "color-well": "color-wells",
  "rating-indicator": "rating-indicators",
  "progress-indicator": "progress-indicators",
  "gauge": "gauges",
  "activity-ring": "activity-rings",
  "watch-face": "watch-faces",
  "complication": "complications",
  "app-shortcut": "app-shortcuts",
  "remote": "remotes",
  "pointing-device": "pointing-devices",
  "nearby-interaction": "nearby-interactions",
  "keyboard": "keyboards",
  "gesture": "gestures",
  "game-control": "game-controls",
};

for (const pattern of HIG_PATTERNS) {
  const page = HIG_PAGE_OVERRIDES[pattern.slug];
  if (page) pattern.higPage = `https://developer.apple.com/design/human-interface-guidelines/${page}`;
}

export const HIG_PATTERN_MAP: Map<string, { spec: HigPatternSpec; ctor: CustomElementConstructor }> = new Map(
  HIG_PATTERNS.map((pattern) => [pattern.tag, { spec: pattern, ctor: createPatternClass(pattern) }]),
);

export function higPatternClass(tag: string): CustomElementConstructor | undefined {
  return HIG_PATTERN_MAP.get(tag)?.ctor;
}

export const HIG_PATTERN_TAGS: string[] = HIG_PATTERNS.map((pattern) => pattern.tag);

export const TextView = HIG_PATTERN_MAP.get("gk-text-view")!.ctor;
export const TabView = HIG_PATTERN_MAP.get("gk-tab-view")!.ctor;
export const SplitView = HIG_PATTERN_MAP.get("gk-split-view")!.ctor;
export const OutlineView = HIG_PATTERN_MAP.get("gk-outline-view")!.ctor;
export const Lockup = HIG_PATTERN_MAP.get("gk-lockup")!.ctor;
export const ListTable = HIG_PATTERN_MAP.get("gk-list-table")!.ctor;
export const MenuBar = HIG_PATTERN_MAP.get("gk-menu-bar")!.ctor;
export const PullDownButton = HIG_PATTERN_MAP.get("gk-pull-down-button")!.ctor;
export const PopUpButton = HIG_PATTERN_MAP.get("gk-pop-up-button")!.ctor;
export const Ornament = HIG_PATTERN_MAP.get("gk-ornament")!.ctor;
export const Menu = HIG_PATTERN_MAP.get("gk-menu")!.ctor;
export const HomeScreenQuickAction = HIG_PATTERN_MAP.get("gk-home-screen-quick-action")!.ctor;
export const EditMenu = HIG_PATTERN_MAP.get("gk-edit-menu")!.ctor;
export const DockMenu = HIG_PATTERN_MAP.get("gk-dock-menu")!.ctor;
export const ContextMenu = HIG_PATTERN_MAP.get("gk-context-menu")!.ctor;
export const ActivityView = HIG_PATTERN_MAP.get("gk-activity-view")!.ctor;
export const Window = HIG_PATTERN_MAP.get("gk-window")!.ctor;
export const Sheet = HIG_PATTERN_MAP.get("gk-sheet")!.ctor;
export const ScrollView = HIG_PATTERN_MAP.get("gk-scroll-view")!.ctor;
export const Popover = HIG_PATTERN_MAP.get("gk-popover")!.ctor;
export const Panel = HIG_PATTERN_MAP.get("gk-panel")!.ctor;
export const PageControl = HIG_PATTERN_MAP.get("gk-page-control")!.ctor;
export const Alert = HIG_PATTERN_MAP.get("gk-alert")!.ctor;
export const ActionSheet = HIG_PATTERN_MAP.get("gk-action-sheet")!.ctor;
export const VirtualKeyboard = HIG_PATTERN_MAP.get("gk-virtual-keyboard")!.ctor;
export const Stepper = HIG_PATTERN_MAP.get("gk-stepper")!.ctor;
export const Picker = HIG_PATTERN_MAP.get("gk-picker")!.ctor;
export const ImageWell = HIG_PATTERN_MAP.get("gk-image-well")!.ctor;
export const DigitEntryView = HIG_PATTERN_MAP.get("gk-digit-entry-view")!.ctor;
export const ComboBox = HIG_PATTERN_MAP.get("gk-combo-box")!.ctor;
export const ColorWell = HIG_PATTERN_MAP.get("gk-color-well")!.ctor;
export const RatingIndicator = HIG_PATTERN_MAP.get("gk-rating-indicator")!.ctor;
export const ProgressIndicator = HIG_PATTERN_MAP.get("gk-progress-indicator")!.ctor;
export const Gauge = HIG_PATTERN_MAP.get("gk-gauge")!.ctor;
export const ActivityRing = HIG_PATTERN_MAP.get("gk-activity-ring")!.ctor;
export const Widget = HIG_PATTERN_MAP.get("gk-widget")!.ctor;
export const WatchFace = HIG_PATTERN_MAP.get("gk-watch-face")!.ctor;
export const TopShelf = HIG_PATTERN_MAP.get("gk-top-shelf")!.ctor;
export const Complication = HIG_PATTERN_MAP.get("gk-complication")!.ctor;
export const AppShortcut = HIG_PATTERN_MAP.get("gk-app-shortcut")!.ctor;
export const Remote = HIG_PATTERN_MAP.get("gk-remote")!.ctor;
export const PointingDevice = HIG_PATTERN_MAP.get("gk-pointing-device")!.ctor;
export const NearbyInteraction = HIG_PATTERN_MAP.get("gk-nearby-interaction")!.ctor;
export const Keyboard = HIG_PATTERN_MAP.get("gk-keyboard")!.ctor;
export const GyroAndAccelerometer = HIG_PATTERN_MAP.get("gk-gyro-and-accelerometer")!.ctor;
export const Gesture = HIG_PATTERN_MAP.get("gk-gesture")!.ctor;
export const GameControl = HIG_PATTERN_MAP.get("gk-game-control")!.ctor;
export const FocusAndSelection = HIG_PATTERN_MAP.get("gk-focus-and-selection")!.ctor;
export const Eyes = HIG_PATTERN_MAP.get("gk-eyes")!.ctor;
export const DigitalCrown = HIG_PATTERN_MAP.get("gk-digital-crown")!.ctor;
export const CameraControl = HIG_PATTERN_MAP.get("gk-camera-control")!.ctor;
export const ApplePencilAndScribble = HIG_PATTERN_MAP.get("gk-apple-pencil-and-scribble")!.ctor;
export const ActionButton = HIG_PATTERN_MAP.get("gk-action-button")!.ctor;
