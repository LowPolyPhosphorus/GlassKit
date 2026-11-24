import { mountShadow } from "../base.js";
import { componentBaseCss, emit } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: block; min-width: 0; }

  .panel {
    display: grid;
    gap: 7px;
    min-width: 0;
    padding: 10px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-md);
    background: var(--gk-color-card);
  }
  .head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
  .label {
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-xs);
    font-weight: var(--gk-font-weight-semibold);
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .label:empty { display: none; }
  .status { color: var(--gk-color-text-dim); font-size: 10px; }

  .row { display: flex; gap: 7px; }
  .paste {
    min-height: 28px;
    padding: 4px 10px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-card);
    color: var(--gk-color-text);
    cursor: pointer;
    font-size: var(--gk-font-size-xs);
  }
  .paste:hover { background: var(--gk-color-card-hover); }
  .value {
    flex: 1;
    min-width: 0;
    min-height: 28px;
    padding: 5px 8px;
    border: 1px solid var(--gk-color-soft-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-glass-thin);
    color: var(--gk-color-text);
    font: inherit;
    font-size: var(--gk-font-size-xs);
  }
`;

const html = `
  <section class="panel" part="panel">
    <header class="head"><span class="label" part="label"></span><span class="status" part="status" aria-live="polite"></span></header>
    <div class="row">
      <button type="button" class="paste" part="paste">Paste</button>
      <input class="value" part="value" type="text" />
    </div>
  </section>`;

export class PasteButton extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "value", "placeholder", "sample"];
  }

  get value(): string {
    return this.shadowRoot?.querySelector<HTMLInputElement>(".value")?.value ?? this.getAttribute("value") ?? "";
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.shadowRoot!.querySelector<HTMLButtonElement>(".paste")!.addEventListener("click", this.#onPaste);
      const input = this.shadowRoot!.querySelector<HTMLInputElement>(".value")!;
      input.addEventListener("input", this.#onInput);
      input.addEventListener("change", this.#onChange);
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #setStatus(message: string): void {
    if (this.shadowRoot) this.shadowRoot.querySelector<HTMLElement>(".status")!.textContent = message;
  }

  #apply(text: string, success: boolean, source: "clipboard" | "sample"): void {
    const input = this.shadowRoot?.querySelector<HTMLInputElement>(".value");
    if (input) input.value = text;
    this.#setStatus(success ? "Pasted from clipboard" : "Using sample value");
    emit(this, "gk-paste", { value: text, success, source, host: this });
  }

  #onPaste = (): void => {
    const read = navigator.clipboard?.readText?.();
    if (read && typeof read.then === "function") {
      read.then(
        (text) => this.#apply(text, true, "clipboard"),
        () => this.#apply(this.getAttribute("sample") ?? "", false, "sample"),
      );
    } else {
      this.#apply(this.getAttribute("sample") ?? "", false, "sample");
    }
  };

  #onInput = (): void => {
    this.#setStatus("");
  };

  #onChange = (): void => {
    emit(this, "gk-change", { value: this.value, host: this });
  };

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    root.querySelector<HTMLElement>(".label")!.textContent = this.getAttribute("label") ?? "Clipboard";
    const input = root.querySelector<HTMLInputElement>(".value")!;
    const authored = this.getAttribute("value");
    if (authored !== null && input.value !== authored) input.value = authored;
    input.placeholder = this.getAttribute("placeholder") ?? "Choose Paste or type a value";
    this.#setStatus("");
  }
}

export const PASTE_BUTTON_TAG = "gk-paste-button";
