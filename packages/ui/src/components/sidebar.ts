import { mountShadow } from "../base.js";
import { componentBaseCss, emit, slotHasContent } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: block; }

  .sidebar {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    background: var(--gk-color-glass-thin);
    border-right: 1px solid var(--gk-color-hairline);
  }

  .head, .foot { padding: var(--gk-space-3); }
  .head[hidden], .foot[hidden] { display: none; }
  .head { border-bottom: 1px solid var(--gk-color-hairline); }
  .foot { margin-top: auto; border-top: 1px solid var(--gk-color-hairline); }
  .nav { display: flex; flex-direction: column; gap: 2px; padding: var(--gk-space-3); }
`;

const html = `
  <aside class="sidebar" part="sidebar">
    <div class="head" part="header"><slot name="header"></slot></div>
    <nav class="nav" part="nav"><slot></slot></nav>
    <div class="foot" part="footer"><slot name="footer"></slot></div>
  </aside>`;

export class Sidebar extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["active", "label"];
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      for (const name of ["header", "footer"]) {
        this.shadowRoot!.querySelector(`slot[name="${name}"]`)!.addEventListener("slotchange", () => this.#sync());
      }
      this.addEventListener("gk-select", this.#onSelect);
    }
    this.#sync();
  }

  disconnectedCallback(): void {
    this.removeEventListener("gk-select", this.#onSelect);
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #onSelect = (event: Event): void => {
    const detail = (event as CustomEvent<{ value?: string; label?: string; source?: HTMLElement }>).detail;
    const source = detail?.source;
    if (!source) return;
    this.querySelectorAll<HTMLElement & { selected: boolean }>("gk-sidebar-item").forEach((item) => {
      item.selected = item === source;
    });
    if (detail.value !== undefined) this.setAttribute("active", detail.value);
    emit(this, "gk-navigate", { value: detail.value, label: detail.label, source: this });
  };

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    root.querySelector<HTMLElement>(".head")!.hidden = !slotHasContent(root, "header");
    root.querySelector<HTMLElement>(".foot")!.hidden = !slotHasContent(root, "footer");
    root.querySelector<HTMLElement>(".nav")!.setAttribute("aria-label", this.getAttribute("label") ?? "Sidebar");
    const active = this.getAttribute("active");
    if (active === null) return;
    this.querySelectorAll<HTMLElement & { value: string; selected: boolean }>("gk-sidebar-item").forEach((item) => {
      item.selected = item.value === active;
    });
  }
}

export const SIDEBAR_TAG = "gk-sidebar";
