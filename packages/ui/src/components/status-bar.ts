import { mountShadow } from "../base.js";
import { componentBaseCss, slotHasContent } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: block; }

  .bar {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: center;
    gap: var(--gk-space-3);
    min-height: 26px;
    padding: 0 12px;
    border-bottom: 1px solid var(--gk-color-hairline);
    background: transparent;
    font-size: var(--gk-font-size-xs);
    color: var(--gk-color-text-muted);
  }

  .center { color: var(--gk-color-text); font-weight: var(--gk-font-weight-medium); }
  .trailing { justify-self: end; display: flex; gap: var(--gk-space-3); }
  .fallback:empty { display: none; }
`;

const html = `
  <div class="bar" part="bar" role="status">
    <span class="leading"><span class="fallback"></span><slot name="leading"></slot></span>
    <span class="center"><span class="fallback"></span><slot name="center"></slot></span>
    <span class="trailing">
      <span class="network fallback"></span>
      <span class="battery fallback"></span>
      <span class="time fallback"></span>
      <slot name="trailing"></slot>
    </span>
  </div>`;

export class StatusBar extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["time", "network", "battery", "label", "status"];
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      for (const name of ["leading", "center", "trailing"]) {
        this.shadowRoot!.querySelector(`slot[name="${name}"]`)!.addEventListener("slotchange", () => this.#sync());
      }
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    root.querySelector<HTMLElement>(".bar")!.setAttribute("aria-label", this.getAttribute("label") ?? "Status");
    const leading = root.querySelector<HTMLElement>(".leading .fallback")!;
    leading.textContent = slotHasContent(root, "leading") ? "" : this.getAttribute("label") ?? "";
    const center = root.querySelector<HTMLElement>(".center .fallback")!;
    center.textContent = slotHasContent(root, "center") ? "" : this.getAttribute("status") ?? "";
    root.querySelector<HTMLElement>(".trailing .network")!.textContent = slotHasContent(root, "trailing")
      ? ""
      : this.getAttribute("network") ?? "";
    root.querySelector<HTMLElement>(".trailing .battery")!.textContent = slotHasContent(root, "trailing")
      ? ""
      : this.getAttribute("battery") ?? "";
    root.querySelector<HTMLElement>(".trailing .time")!.textContent = slotHasContent(root, "trailing")
      ? ""
      : this.getAttribute("time") ?? "";
  }
}

export const STATUS_BAR_TAG = "gk-status-bar";
