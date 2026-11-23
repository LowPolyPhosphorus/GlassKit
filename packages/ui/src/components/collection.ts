import { mountShadow } from "../base.js";
import { componentBaseCss, toNumber } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: block; }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(var(--gk-collection-min, 160px), 1fr));
    gap: var(--gk-collection-gap, var(--gk-space-3));
  }
`;

export class Collection extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["columns", "min-column-width", "gap"];
  }

  #grid: HTMLElement | null = null;

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, '<div class="grid" part="grid"><slot></slot></div>', styles);
      this.#grid = this.shadowRoot!.querySelector<HTMLElement>(".grid");
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #sync(): void {
    if (!this.#grid) return;
    const columns = toNumber(this.getAttribute("columns"), 0);
    const minWidth = this.getAttribute("min-column-width") ?? "160px";
    const gap = this.getAttribute("gap") ?? "var(--gk-space-3)";
    this.#grid.style.gridTemplateColumns =
      columns > 0 ? `repeat(${columns}, minmax(0, 1fr))` : `repeat(auto-fit, minmax(${minWidth}, 1fr))`;
    this.#grid.style.setProperty("--gk-collection-gap", gap);
  }
}

export const COLLECTION_TAG = "gk-collection";
