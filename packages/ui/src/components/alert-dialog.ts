import { mountShadow } from "../base.js";
import { componentBaseCss, emit } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: inline-block; }

  .trigger {
    min-height: 30px;
    padding: 6px 12px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-card);
    color: var(--gk-color-text);
    cursor: pointer;
    font-size: var(--gk-font-size-sm);
  }
  .trigger:hover { background: var(--gk-color-card-hover); }

  .overlay {
    position: fixed;
    z-index: 200;
    inset: 0;
    display: grid;
    place-items: center;
    padding: 20px;
    background: rgba(0, 0, 0, 0.48);
  }
  .overlay[hidden] { display: none !important; }

  .dialog {
    width: min(380px, 100%);
    padding: 20px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-lg);
    background: var(--gk-color-card);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.36);
  }

  h2 { margin: 0; font-size: var(--gk-font-size-lg); letter-spacing: -0.01em; }
  p { margin: 8px 0 0; color: var(--gk-color-text-muted); font-size: var(--gk-font-size-sm); line-height: 1.55; }

  .actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 20px;
  }

  button.action {
    min-height: 32px;
    padding: 6px 14px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-glass-thin);
    color: var(--gk-color-text);
    cursor: pointer;
    font-size: var(--gk-font-size-sm);
    font-weight: var(--gk-font-weight-medium);
  }

  button.confirm {
    border-color: var(--gk-color-accent-stroke);
    background: var(--gk-color-accent-fill);
    color: var(--gk-color-accent);
  }
  button.danger {
    border-color: var(--gk-color-danger);
    background: rgba(255, 69, 58, 0.16);
    color: var(--gk-color-danger);
  }
  button[hidden] { display: none; }
`;

const html = `
  <button type="button" class="trigger" part="trigger"></button>
  <div class="overlay" part="overlay" hidden>
    <div class="dialog" part="dialog" role="alertdialog" aria-modal="true" aria-labelledby="gk-alert-title" aria-describedby="gk-alert-message">
      <h2 id="gk-alert-title" class="title" part="title"></h2>
      <p id="gk-alert-message" class="message" part="message"></p>
      <div class="actions">
        <button type="button" class="action cancel" part="cancel" hidden></button>
        <button type="button" class="action confirm" part="action"></button>
      </div>
    </div>
  </div>`;

export class AlertDialog extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["title", "message", "trigger-label", "action-label", "cancel-label", "tone", "open"];
  }

  #trigger: HTMLButtonElement | null = null;
  #overlay: HTMLElement | null = null;
  #confirm: HTMLButtonElement | null = null;
  #cancel: HTMLButtonElement | null = null;

  get open(): boolean {
    return this.hasAttribute("open");
  }

  set open(next: boolean) {
    this.toggleAttribute("open", next);
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.#trigger = this.shadowRoot!.querySelector<HTMLButtonElement>(".trigger");
      this.#overlay = this.shadowRoot!.querySelector<HTMLElement>(".overlay");
      this.#confirm = this.shadowRoot!.querySelector<HTMLButtonElement>(".confirm");
      this.#cancel = this.shadowRoot!.querySelector<HTMLButtonElement>(".cancel");
      this.#trigger!.addEventListener("click", () => this.show());
      this.#confirm!.addEventListener("click", this.#onConfirm);
      this.#cancel!.addEventListener("click", this.#onCancel);
      this.#overlay!.addEventListener("click", this.#onBackdrop);
      this.shadowRoot!.querySelector<HTMLElement>(".dialog")!.addEventListener("keydown", this.#onDialogKeydown);
      document.addEventListener("keydown", this.#onDocumentKeydown);
    }
    this.#sync();
  }

  disconnectedCallback(): void {
    document.removeEventListener("keydown", this.#onDocumentKeydown);
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  show(): void {
    this.open = true;
    this.#confirm?.focus();
    emit(this, "gk-open", { source: this });
  }

  close(reason: "dismiss" | "confirm" | "cancel" = "dismiss"): void {
    if (!this.open) return;
    this.open = false;
    this.#trigger?.focus();
    emit(this, "gk-close", { reason, source: this });
  }

  #onConfirm = (): void => {
    emit(this, "gk-confirm", { action: this.getAttribute("action-label") ?? "OK", source: this });
    this.close("confirm");
  };

  #onCancel = (): void => {
    emit(this, "gk-cancel", { source: this });
    this.close("cancel");
  };

  #onBackdrop = (event: MouseEvent): void => {
    if (event.target === this.#overlay) this.close("dismiss");
  };

  #onDialogKeydown = (event: KeyboardEvent): void => {
    if (event.key !== "Tab") return;
    const buttons = [this.#cancel, this.#confirm].filter((button): button is HTMLButtonElement => Boolean(button && !button.hidden));
    if (buttons.length < 2) return;
    const first = buttons[0]!;
    const last = buttons[buttons.length - 1]!;
    const active = this.shadowRoot?.activeElement;
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  #onDocumentKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Escape" && this.open) {
      event.preventDefault();
      emit(this, "gk-dismiss", { source: this });
      this.close("dismiss");
    }
  };

  #sync(): void {
    if (!this.shadowRoot || !this.#trigger || !this.#overlay || !this.#confirm || !this.#cancel) return;
    const root = this.shadowRoot;
    const title = this.getAttribute("title") ?? "Are you sure?";
    const message = this.getAttribute("message") ?? "";
    const cancel = this.getAttribute("cancel-label");

    this.#trigger.textContent = this.getAttribute("trigger-label") ?? "Show alert";
    root.querySelector<HTMLElement>(".title")!.textContent = title;
    root.querySelector<HTMLElement>(".message")!.textContent = message;
    this.#confirm.textContent = this.getAttribute("action-label") ?? "OK";
    this.#confirm.classList.toggle("danger", this.getAttribute("tone") === "danger");
    this.#confirm.classList.toggle("confirm", this.getAttribute("tone") !== "danger");
    this.#cancel.hidden = !cancel;
    this.#cancel.textContent = cancel ?? "";
    this.#overlay.hidden = !this.open;
    this.#overlay.querySelector<HTMLElement>(".dialog")!.setAttribute("aria-label", title);
  }
}

export const ALERT_DIALOG_TAG = "gk-alert-dialog";
