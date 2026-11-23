import { mountShadow } from "../base.js";
import { componentBaseCss, emit, slotHasContent } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: block; }

  .snippet {
    display: grid;
    grid-template-columns: 24px minmax(0, 1fr) auto;
    gap: var(--gk-space-3);
    align-items: start;
    padding: 12px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-md);
    background: var(--gk-color-card);
  }

  .icon { display: grid; place-items: center; width: 24px; height: 24px; color: var(--gk-color-accent); }
  .fallback:empty { display: none; }
  .title { display: block; font-size: var(--gk-font-size-sm); font-weight: var(--gk-font-weight-semibold); }
  .message { display: block; margin-top: 2px; color: var(--gk-color-text-muted); font-size: var(--gk-font-size-xs); }
  .content { margin-top: 6px; }
  .actions { display: flex; flex-wrap: wrap; gap: 6px; justify-content: flex-end; }

  .button {
    padding: 5px 11px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-xs);
    background: var(--gk-color-card);
    color: inherit;
    font-size: var(--gk-font-size-xs);
    cursor: pointer;
  }

  .button[data-primary="true"] {
    background: var(--gk-color-accent-fill);
    border-color: var(--gk-color-accent-stroke);
    color: var(--gk-color-accent);
  }

  .button[hidden] { display: none; }
`;

const html = `
  <section class="snippet" part="snippet" role="group">
    <span class="icon"><span class="fallback">✓</span><slot name="icon"></slot></span>
    <span class="body">
      <strong class="title" part="title"></strong>
      <span class="message" part="message"></span>
      <span class="content"><slot></slot></span>
    </span>
    <span class="actions">
      <button type="button" class="button cancel" hidden></button>
      <button type="button" class="button confirm" data-primary="true" hidden></button>
    </span>
  </section>`;

export class Snippet extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["kind", "title", "message", "confirm-label", "cancel-label"];
  }

  #confirm: HTMLButtonElement | null = null;
  #cancel: HTMLButtonElement | null = null;

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.#confirm = this.shadowRoot!.querySelector<HTMLButtonElement>(".confirm");
      this.#cancel = this.shadowRoot!.querySelector<HTMLButtonElement>(".cancel");
      this.#confirm!.addEventListener("click", this.#onConfirm);
      this.#cancel!.addEventListener("click", this.#onCancel);
      this.shadowRoot!.querySelector('slot[name="icon"]')!.addEventListener("slotchange", () => this.#sync());
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #onConfirm = (): void => {
    emit(this, "gk-snippet-action", { action: "confirm", source: this });
    emit(this, "gk-confirm", { source: this });
  };

  #onCancel = (): void => {
    emit(this, "gk-snippet-action", { action: "cancel", source: this });
    emit(this, "gk-cancel", { source: this });
  };

  #sync(): void {
    if (!this.#confirm || !this.#cancel || !this.shadowRoot) return;
    const root = this.shadowRoot;
    const kind = this.getAttribute("kind") ?? "confirmation";
    root.querySelector<HTMLElement>(".title")!.textContent = this.getAttribute("title") ?? "";
    root.querySelector<HTMLElement>(".message")!.textContent = this.getAttribute("message") ?? "";
    root.querySelector<HTMLElement>(".icon .fallback")!.hidden = slotHasContent(root, "icon");
    root.querySelector<HTMLElement>(".content")!.hidden = !slotHasContent(root, "");

    const confirmLabel = this.getAttribute("confirm-label") ?? (kind === "confirmation" ? "Done" : "OK");
    const cancelLabel = this.getAttribute("cancel-label") ?? "Cancel";
    this.#confirm.textContent = confirmLabel;
    this.#cancel.textContent = cancelLabel;
    this.#confirm.hidden = kind === "result" && !this.hasAttribute("confirm-label");
    this.#cancel.hidden = kind === "result" && !this.hasAttribute("cancel-label");
  }
}

export const SNIPPET_TAG = "gk-snippet";
