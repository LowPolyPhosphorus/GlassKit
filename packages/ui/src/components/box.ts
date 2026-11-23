import { mountShadow } from "../base.js";
import { componentBaseCss, slotHasContent } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: block; }

  .box {
    background: var(--gk-color-card);
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-md);
    overflow: hidden;
  }

  .head {
    display: flex;
    align-items: center;
    gap: var(--gk-space-3);
    padding: 10px 14px;
    border-bottom: 1px solid var(--gk-color-hairline);
  }

  .head[hidden] { display: none; }

  .titles { min-width: 0; flex: 1; }

  .title {
    font-size: var(--gk-font-size-sm);
    font-weight: var(--gk-font-weight-semibold);
  }

  .subtitle {
    margin-top: 2px;
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-xs);
  }

  .title:empty, .subtitle:empty { display: none; }

  .action { display: flex; align-items: center; }

  .body { padding: 14px; }
`;

const html = `
  <section class="box" part="box">
    <header class="head" part="header">
      <span class="titles">
        <span class="title" part="title"></span>
        <span class="subtitle" part="subtitle"></span>
      </span>
      <span class="action"><slot name="action"></slot></span>
    </header>
    <div class="body" part="body"><slot></slot></div>
  </section>`;

export class Box extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["title", "subtitle"];
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.shadowRoot!.querySelector('slot[name="action"]')!.addEventListener("slotchange", () => this.#sync());
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #sync(): void {
    const root = this.shadowRoot;
    if (!root) return;
    root.querySelector<HTMLElement>(".title")!.textContent = this.getAttribute("title") ?? "";
    root.querySelector<HTMLElement>(".subtitle")!.textContent = this.getAttribute("subtitle") ?? "";
    const hasHeader =
      Boolean(this.getAttribute("title")) ||
      Boolean(this.getAttribute("subtitle")) ||
      slotHasContent(root, "action");
    root.querySelector<HTMLElement>(".head")!.hidden = !hasHeader;
  }
}

export const BOX_TAG = "gk-box";
