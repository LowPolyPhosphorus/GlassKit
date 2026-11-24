import { mountShadow } from "../base.js";
import { componentBaseCss, emit, parseItems } from "../shared.js";

interface ControlItem {
  label: string;
  value?: string;
  variant?: "primary" | "quiet" | "default";
  disabled?: boolean;
}

const styles = `
  ${componentBaseCss}
  :host { display: block; min-width: 0; }

  .group {
    display: grid;
    gap: 8px;
    min-width: 0;
    padding: 10px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-md);
    background: var(--gk-color-card);
  }

  .heading {
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-xs);
    font-weight: var(--gk-font-weight-semibold);
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .heading:empty { display: none; }

  .items {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }
  :host([orientation="vertical"]) .items { flex-direction: column; align-items: stretch; }
  :host([orientation="vertical"]) gk-button { width: 100%; }
`;

const html = `
  <div class="group" part="group">
    <div class="heading" part="heading"></div>
    <div class="items" part="items" role="group"></div>
  </div>`;

const esc = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export class ControlGroup extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "items", "orientation"];
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.shadowRoot!.querySelector<HTMLElement>(".items")!.addEventListener("gk-activate", this.#onActivate);
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #onActivate = (event: Event): void => {
    const button = (event.target as HTMLElement).closest<HTMLElement>("[data-control]");
    if (!button || button.hasAttribute("disabled")) return;
    emit(this, "gk-control", {
      value: button.dataset.control,
      label: button.textContent?.trim() ?? button.dataset.control ?? "",
      source: this,
    });
  };

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    root.querySelector<HTMLElement>(".heading")!.textContent = this.getAttribute("label") ?? "";
    const items = parseItems<ControlItem>(this.getAttribute("items"));
    root.querySelector<HTMLElement>(".items")!.innerHTML = items
      .map((item, index) => {
        const label = String(item.label ?? `Control ${index + 1}`);
        const value = String(item.value ?? label);
        const variant = item.variant === "primary" || item.variant === "quiet" ? item.variant : "";
        return `<gk-button
          size="small"
          data-control="${esc(value)}"
          ${variant ? `variant="${variant}"` : ""}
          ${item.disabled ? "disabled" : ""}
        >${esc(label)}</gk-button>`;
      })
      .join("");
  }
}

export const CONTROL_GROUP_TAG = "gk-control-group";
