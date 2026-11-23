import { mountShadow } from "../base.js";
import { componentBaseCss, emit, parseItems } from "../shared.js";

type LooseRecord = Record<string, unknown>;
type Tab = { id: string; label: string; badge: string };

function normalizeTab(value: unknown, index: number): Tab {
  if (typeof value === "string") return { id: String(index), label: value, badge: "" };
  const record = value && typeof value === "object" && !Array.isArray(value) ? (value as LooseRecord) : {};
  const label = String(record.label ?? record.title ?? record.name ?? `Tab ${index + 1}`);
  return {
    id: String(record.id ?? index),
    label,
    badge: String(record.badge ?? ""),
  };
}

const styles = `
  ${componentBaseCss}
  :host { display: block; }

  .tabs {
    display: flex;
    align-items: stretch;
    gap: var(--gk-space-1);
    border-bottom: 1px solid var(--gk-color-hairline);
  }

  .tab {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: var(--gk-space-2);
    padding: 8px 12px 10px;
    border: 0;
    background: transparent;
    color: var(--gk-color-text-muted);
    cursor: pointer;
  }

  .tab:hover { color: var(--gk-color-text); }

  .tab[aria-selected="true"] { color: var(--gk-color-text); font-weight: var(--gk-font-weight-medium); }

  .tab[aria-selected="true"]::after {
    content: "";
    position: absolute;
    right: 10px;
    bottom: -1px;
    left: 10px;
    height: 2px;
    background: var(--gk-color-accent);
    border-radius: 2px 2px 0 0;
  }
`;

export class TabBar extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["tabs", "active", "label"];
  }

  #bar: HTMLElement | null = null;
  #tabs: Tab[] = [];
  #activeIndex = 0;

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, '<div class="tabs" role="tablist" part="tabs"></div>', styles);
      this.#bar = this.shadowRoot!.querySelector<HTMLElement>(".tabs");
      this.#bar!.addEventListener("keydown", this.#onKeydown);
    }
    this.#sync();
  }

  #sync(): void {
    if (!this.#bar) return;
    this.#tabs = parseItems<unknown>(this.getAttribute("tabs")).map(normalizeTab);
    const active = this.getAttribute("active") ?? this.#tabs[0]?.id ?? "0";
    this.#activeIndex = Math.max(
      0,
      this.#tabs.findIndex((tab) => tab.id === active || tab.label === active || String(this.#tabs.indexOf(tab)) === active),
    );
    this.#bar.setAttribute("aria-label", this.getAttribute("label") ?? "Tabs");
    this.#bar.replaceChildren();

    this.#tabs.forEach((tab, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "tab";
      button.setAttribute("role", "tab");
      button.dataset.index = String(index);
      button.setAttribute("aria-selected", String(index === this.#activeIndex));
      button.tabIndex = index === this.#activeIndex ? 0 : -1;
      button.textContent = tab.label;
      if (tab.badge) {
        const badge = document.createElement("span");
        badge.textContent = tab.badge;
        badge.style.color = "var(--gk-color-accent)";
        badge.style.fontSize = "var(--gk-font-size-xs)";
        button.append(badge);
      }
      button.addEventListener("click", () => this.#activate(index));
      this.#bar!.append(button);
    });
  }

  #activate(index: number): void {
    const tab = this.#tabs[index];
    if (!tab) return;
    this.setAttribute("active", tab.id);
  }

  #onKeydown = (event: KeyboardEvent): void => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let next = this.#activeIndex;
    if (event.key === "ArrowLeft") next = (next - 1 + this.#tabs.length) % this.#tabs.length;
    if (event.key === "ArrowRight") next = (next + 1) % this.#tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = this.#tabs.length - 1;
    this.#activate(next);
    this.#bar?.querySelectorAll<HTMLButtonElement>(".tab")[next]?.focus();
  };

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (name === "active" && oldValue !== newValue) {
      const index = this.#tabs.findIndex((tab) => tab.id === newValue || tab.label === newValue);
      const tab = this.#tabs[index];
      if (tab && oldValue !== null) emit(this, "gk-tab-change", { id: tab.id, label: tab.label, index, source: this });
    }
    this.#sync();
  }
}

export const TAB_BAR_TAG = "gk-tab-bar";
