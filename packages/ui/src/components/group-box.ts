import { mountShadow } from "../base.js";
import { componentBaseCss, emit, parseItems } from "../shared.js";

interface GroupAction {
  label: string;
  value?: string;
  variant?: "primary" | "quiet" | "default";
}

const styles = `
  ${componentBaseCss}
  :host { display: block; min-width: 0; }

  .box {
    display: grid;
    gap: 8px;
    min-width: 0;
    padding: 12px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-md);
    background: var(--gk-color-card);
  }

  .head {
    display: flex;
    align-items: baseline;
    gap: 10px;
    min-width: 0;
  }
  .titles { display: grid; gap: 2px; min-width: 0; }
  .title { margin: 0; font-size: var(--gk-font-size-sm); font-weight: var(--gk-font-weight-semibold); }
  .title:empty { display: none; }
  .caption { margin: 0; color: var(--gk-color-text-muted); font-size: var(--gk-font-size-xs); line-height: 1.45; }
  .caption:empty { display: none; }

  .actions { display: flex; flex: 0 0 auto; gap: 6px; margin-left: auto; }
  .actions:empty { display: none; }

  .content { display: grid; gap: 6px; min-width: 0; }
  .copy { margin: 0; color: var(--gk-color-text-muted); font-size: var(--gk-font-size-xs); line-height: 1.55; }
  .copy:empty { display: none; }
`;

const html = `
  <section class="box" part="box">
    <header class="head" part="head">
      <div class="titles">
        <h2 class="title" part="title"></h2>
        <p class="caption" part="caption"></p>
      </div>
      <div class="actions" part="actions"></div>
    </header>
    <div class="content" part="content">
      <p class="copy" part="copy"></p>
      <slot></slot>
    </div>
  </section>`;

const esc = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export class GroupBox extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "caption", "content", "actions"];
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.shadowRoot!.querySelector<HTMLElement>(".actions")!.addEventListener("gk-activate", this.#onAction);
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #onAction = (event: Event): void => {
    const button = (event.target as HTMLElement).closest<HTMLElement>("[data-group-action]");
    if (!button) return;
    emit(this, "gk-group-action", {
      value: button.dataset.groupAction ?? "",
      label: button.textContent?.trim() ?? button.dataset.groupAction ?? "",
      source: this,
    });
  };

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    root.querySelector<HTMLElement>(".title")!.textContent = this.getAttribute("label") ?? "";
    root.querySelector<HTMLElement>(".caption")!.textContent = this.getAttribute("caption") ?? "";
    root.querySelector<HTMLElement>(".copy")!.textContent = this.getAttribute("content") ?? "";

    const actions = parseItems<GroupAction>(this.getAttribute("actions"));
    root.querySelector<HTMLElement>(".actions")!.innerHTML = actions
      .map((action, index) => {
        const label = String(action.label ?? `Action ${index + 1}`);
        const variant = action.variant === "primary" || action.variant === "quiet" ? action.variant : "";
        return `<gk-button size="small" data-group-action="${esc(String(action.value ?? label))}"
          ${variant ? `variant="${variant}"` : ""}>${esc(label)}</gk-button>`;
      })
      .join("");
  }
}

export const GROUP_BOX_TAG = "gk-group-box";
