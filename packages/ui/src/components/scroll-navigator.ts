import { mountShadow } from "../base.js";
import { componentBaseCss, emit, parseItems } from "../shared.js";

interface ScrollTarget {
  label?: string;
  value?: string;
}

const styles = `
  ${componentBaseCss}
  :host { display: block; min-width: 0; }

  .panel {
    display: grid;
    gap: 8px;
    min-width: 0;
    padding: 10px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-md);
    background: var(--gk-color-card);
  }

  .head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
  .label {
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-xs);
    font-weight: var(--gk-font-weight-semibold);
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .label:empty { display: none; }
  .position { color: var(--gk-color-text-dim); font-size: 10px; font-variant-numeric: tabular-nums; }

  .targets { display: flex; flex-wrap: wrap; gap: 5px; }
  .target {
    min-height: 25px;
    padding: 3px 8px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-xs);
    background: transparent;
    color: var(--gk-color-text-muted);
    cursor: pointer;
    font-size: 10px;
  }
  .target:hover { background: var(--gk-color-card-hover); color: var(--gk-color-text); }
  .target[aria-current="true"] {
    border-color: var(--gk-color-accent);
    background: var(--gk-color-accent-fill);
    color: var(--gk-color-text);
  }

  .viewport {
    overflow-y: auto;
    max-height: 132px;
    border: 1px solid var(--gk-color-soft-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-glass-thin);
    scrollbar-width: thin;
  }
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 32px;
    padding: 6px 9px;
    border-bottom: 1px solid var(--gk-color-soft-hairline);
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-xs);
  }
  .row:last-child { border-bottom: 0; }
  .row[data-active="true"] { color: var(--gk-color-text); background: var(--gk-color-accent-fill); }
  .row .value { color: var(--gk-color-text-dim); font-size: 10px; }
`;

const html = `
  <section class="panel" part="panel">
    <header class="head"><span class="label" part="label"></span><span class="position" part="position">0%</span></header>
    <div class="targets" part="targets" role="group" aria-label="Scroll targets"></div>
    <div class="viewport" part="viewport" tabindex="0"><div class="rows" part="rows"></div></div>
  </section>`;

const esc = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export class ScrollNavigator extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "targets", "value"];
  }

  #active = "";
  #onViewportScroll = (): void => this.#emitPosition();

  get value(): string {
    return this.#active;
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.shadowRoot!.querySelector<HTMLElement>(".targets")!.addEventListener("click", this.#onTargetClick);
      const viewport = this.shadowRoot!.querySelector<HTMLElement>(".viewport")!;
      viewport.addEventListener("scroll", this.#onViewportScroll, { passive: true });
    }
    this.#sync();
  }

  disconnectedCallback(): void {
    const viewport = this.shadowRoot?.querySelector<HTMLElement>(".viewport");
    viewport?.removeEventListener("scroll", this.#onViewportScroll);
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #targets(): ScrollTarget[] {
    const targets = parseItems<ScrollTarget>(this.getAttribute("targets"));
    if (targets.length) return targets;
    return Array.from({ length: 8 }, (_, index) => ({ label: `Section ${index + 1}`, value: `section-${index + 1}` }));
  }

  #scrollTo(value: string, emitEvent = true): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    const row = root.querySelector<HTMLElement>(`.row[data-value="${CSS.escape(value)}"]`);
    if (row) {
      const viewport = root.querySelector<HTMLElement>(".viewport")!;
      viewport.scrollTop = row.offsetTop - viewport.offsetTop;
    }
    this.#active = value;
    root.querySelectorAll<HTMLElement>(".target").forEach((target) => {
      target.setAttribute("aria-current", String(target.dataset.value === value));
    });
    root.querySelectorAll<HTMLElement>(".row").forEach((item) => {
      item.dataset.active = String(item.dataset.value === value);
    });
    this.#emitPosition();
    if (emitEvent) emit(this, "gk-scroll-to", { value, label: row?.querySelector(".text")?.textContent ?? value, source: this });
  }

  #emitPosition(): void {
    if (!this.shadowRoot) return;
    const viewport = this.shadowRoot.querySelector<HTMLElement>(".viewport")!;
    const range = Math.max(1, viewport.scrollHeight - viewport.clientHeight);
    const ratio = Math.min(1, Math.max(0, viewport.scrollTop / range));
    this.shadowRoot.querySelector<HTMLElement>(".position")!.textContent = `${Math.round(ratio * 100)}%`;
    emit(this, "gk-scroll-position", { ratio, offset: viewport.scrollTop, source: this });
  }

  #onTargetClick = (event: MouseEvent): void => {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>(".target");
    if (target?.dataset.value) this.#scrollTo(target.dataset.value);
  };

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    const targets = this.#targets();
    root.querySelector<HTMLElement>(".label")!.textContent = this.getAttribute("label") ?? "Scroll to";
    root.querySelector<HTMLElement>(".targets")!.innerHTML = targets
      .map((target) => {
        const value = String(target.value ?? target.label ?? "");
        return `<button type="button" class="target" data-value="${esc(value)}">${esc(target.label ?? value)}</button>`;
      })
      .join("");
    root.querySelector<HTMLElement>(".rows")!.innerHTML = targets
      .map((target, index) => {
        const value = String(target.value ?? target.label ?? `item-${index + 1}`);
        return `<div class="row" data-value="${esc(value)}"><span class="text">${esc(target.label ?? value)}</span><span class="value">${index + 1} of ${targets.length}</span></div>`;
      })
      .join("");
    const requested = this.getAttribute("value") ?? targets[0]?.value ?? targets[0]?.label ?? "";
    this.#scrollTo(String(requested), false);
  }
}

export const SCROLL_NAVIGATOR_TAG = "gk-scroll-navigator";
