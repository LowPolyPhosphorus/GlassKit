import { mountShadow } from "../base.js";
import { componentBaseCss, slotHasContent } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: inline; }

  .label {
    color: var(--gk-color-text);
    line-height: 1.45;
    user-select: text;
  }

  .fallback:empty { display: none; }

  .label[data-variant="caption"] { color: var(--gk-color-text-muted); font-size: var(--gk-font-size-xs); }
  .label[data-variant="body"] { font-size: var(--gk-font-size-md); }
  .label[data-variant="headline"] { font-size: var(--gk-font-size-lg); font-weight: var(--gk-font-weight-semibold); }
  .label[data-variant="title"] { font-size: var(--gk-font-size-xl); font-weight: var(--gk-font-weight-semibold); }

  .label[data-tone="muted"] { color: var(--gk-color-text-muted); }
  .label[data-tone="dim"] { color: var(--gk-color-text-dim); }
  .label[data-tone="accent"] { color: var(--gk-color-accent); }
  .label[data-tone="success"] { color: var(--gk-color-success); }
  .label[data-tone="warning"] { color: var(--gk-color-warning); }
  .label[data-tone="danger"] { color: var(--gk-color-danger); }
`;

const html = `<span class="label" part="label"><span class="fallback"></span><slot></slot></span>`;

export class Label extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["text", "variant", "tone"];
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.shadowRoot!.querySelector("slot")!.addEventListener("slotchange", () => this.#sync());
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #sync(): void {
    if (!this.shadowRoot) return;
    const label = this.shadowRoot.querySelector<HTMLElement>(".label")!;
    label.dataset.variant = this.getAttribute("variant") ?? "body";
    label.dataset.tone = this.getAttribute("tone") ?? "default";
    const hasContent = slotHasContent(this.shadowRoot, "");
    label.querySelector<HTMLElement>(".fallback")!.textContent = hasContent ? "" : this.getAttribute("text") ?? "";
  }
}

export const LABEL_TAG = "gk-label";
