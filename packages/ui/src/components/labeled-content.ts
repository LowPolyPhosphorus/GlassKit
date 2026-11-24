import { mountShadow } from "../base.js";
import { componentBaseCss, emit, parseItems } from "../shared.js";

interface LabeledRow {
  label: string;
  value?: string;
  detail?: string;
  copy?: boolean;
  action?: string;
}

const styles = `
  ${componentBaseCss}
  :host { display: block; min-width: 0; }

  .panel {
    display: grid;
    gap: 8px;
    min-width: 0;
    padding: 10px 12px;
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

  .rows { display: grid; gap: 0; min-width: 0; margin: 0; }

  .row {
    display: grid;
    grid-template-columns: minmax(96px, 0.7fr) minmax(0, 1.3fr);
    align-items: baseline;
    gap: 10px;
    min-width: 0;
    padding: 8px 0;
    border-bottom: 1px solid var(--gk-color-hairline);
  }
  .row:last-child { border-bottom: 0; }

  dt { color: var(--gk-color-text-muted); font-size: var(--gk-font-size-xs); }
  dd { display: flex; align-items: baseline; gap: 6px; min-width: 0; margin: 0; }
  .value { min-width: 0; overflow-wrap: anywhere; font-size: var(--gk-font-size-xs); font-weight: var(--gk-font-weight-medium); }
  .detail { color: var(--gk-color-text-dim); font-size: 10px; }

  .mini {
    flex: 0 0 auto;
    padding: 2px 6px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-xs);
    background: transparent;
    color: var(--gk-color-accent);
    cursor: pointer;
    font-size: 10px;
  }
  .mini:hover { background: var(--gk-color-accent-fill); }
`;

const html = `
  <section class="panel" part="panel">
    <div class="heading" part="heading"></div>
    <dl class="rows" part="rows"></dl>
  </section>`;

const esc = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export class LabeledContent extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "rows"];
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.shadowRoot!.querySelector<HTMLElement>(".rows")!.addEventListener("click", this.#onClick);
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #onClick = (event: MouseEvent): void => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>("button[data-row-action]");
    if (!button) return;
    const row = button.closest<HTMLElement>(".row")!;
    const value = row.querySelector<HTMLElement>(".value")?.textContent ?? "";
    const label = row.querySelector<HTMLElement>("dt")?.textContent ?? "";

    if (button.dataset.rowAction === "copy") {
      const clipboard = (navigator as Navigator & { clipboard?: Clipboard }).clipboard;
      if (clipboard?.writeText) {
        void clipboard
          .writeText(value)
          .then(() => emit(this, "gk-copy", { value, label, success: true, source: this }))
          .catch(() => emit(this, "gk-copy", { value, label, success: false, source: this }));
      } else {
        emit(this, "gk-copy", { value, label, success: false, source: this });
      }
      return;
    }

    emit(this, "gk-labeled-action", {
      value: button.dataset.rowAction,
      label,
      source: this,
    });
  };

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    root.querySelector<HTMLElement>(".heading")!.textContent = this.getAttribute("label") ?? "";
    const rows = parseItems<LabeledRow>(this.getAttribute("rows"));
    root.querySelector<HTMLElement>(".rows")!.innerHTML = rows
      .map((row, index) => {
        const label = String(row.label ?? `Field ${index + 1}`);
        const value = String(row.value ?? "");
        return `<div class="row" data-row="${index}">
          <dt>${esc(label)}</dt>
          <dd>
            <span class="value">${esc(value)}</span>
            ${row.detail ? `<span class="detail">${esc(String(row.detail))}</span>` : ""}
            ${row.copy ? `<button type="button" class="mini" data-row-action="copy" aria-label="Copy ${esc(label)}">Copy</button>` : ""}
            ${
              row.action
                ? `<button type="button" class="mini" data-row-action="${esc(String(row.action))}">${esc(String(row.action))}</button>`
                : ""
            }
          </dd>
        </div>`;
      })
      .join("");
  }
}

export const LABELED_CONTENT_TAG = "gk-labeled-content";
