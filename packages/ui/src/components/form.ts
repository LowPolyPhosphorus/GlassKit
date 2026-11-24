import { mountShadow } from "../base.js";
import { componentBaseCss, emit, parseItems } from "../shared.js";

interface FormRow {
  label: string;
  control: "toggle" | "text" | "stepper" | "picker" | "button" | "color";
  value?: string;
  checked?: boolean;
  min?: string;
  max?: string;
  step?: string;
  options?: Array<{ label: string; value: string; detail?: string }>;
  caption?: string;
}

interface FormSection {
  title?: string;
  footer?: string;
  rows?: FormRow[];
}

const styles = `
  ${componentBaseCss}
  :host { display: block; min-width: 0; }

  .form {
    display: grid;
    gap: 12px;
    min-width: 0;
    padding: 12px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-md);
    background: var(--gk-color-card);
  }

  .legend {
    color: var(--gk-color-text);
    font-size: var(--gk-font-size-sm);
    font-weight: var(--gk-font-weight-semibold);
  }
  .legend:empty { display: none; }

  .sections { display: grid; gap: 12px; min-width: 0; }

  .section {
    display: grid;
    gap: 8px;
    min-width: 0;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--gk-color-hairline);
  }
  .section:last-child { padding-bottom: 0; border-bottom: 0; }

  .section-title {
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-xs);
    font-weight: var(--gk-font-weight-semibold);
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .section-title:empty { display: none; }

  .rows { display: grid; gap: 9px; min-width: 0; }

  .footer {
    color: var(--gk-color-text-dim);
    font-size: var(--gk-font-size-xs);
    line-height: 1.45;
  }
  .footer:empty { display: none; }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
  .actions[hidden] { display: none; }
`;

const html = `
  <form class="form" part="form">
    <span class="legend" part="legend"></span>
    <div class="sections" part="sections"></div>
    <div class="actions" part="actions" hidden>
      <gk-button size="small" data-form-action="reset">Reset</gk-button>
      <gk-button size="small" variant="primary" data-form-action="submit">Save</gk-button>
    </div>
  </form>`;

const esc = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export class GlassForm extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "sections", "submit-label", "reset-label", "show-actions"];
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
    const button = (event.target as HTMLElement).closest<HTMLElement>("[data-form-action]");
    if (!button) return;
    event.preventDefault();
    if (button.dataset.formAction === "reset") {
      this.#sync();
      emit(this, "gk-reset", { source: this });
      return;
    }
    const values: Record<string, unknown> = {};
    for (const field of Array.from(this.shadowRoot!.querySelectorAll<HTMLElement>("[data-field]"))) {
      const key = field.dataset.field!;
      if ("checked" in field && typeof (field as HTMLElement & { checked?: boolean }).checked === "boolean") {
        values[key] = (field as HTMLElement & { checked: boolean }).checked;
      } else {
        values[key] = (field as HTMLElement & { value?: string }).value ?? field.getAttribute("value") ?? "";
      }
    }
    emit(this, "gk-submit", { value: values, source: this });
  };

  #rows(section: FormSection): string {
    return (section.rows ?? [])
      .map((row, index) => {
        const key = `${esc(row.label || `field-${index}`)}`;
        const label = esc(row.label ?? "Field");
        let control = "";

        switch (row.control) {
          case "toggle":
            control = `<gk-toggle data-field="${key}" label="${label}"${row.checked ? " checked" : ""}></gk-toggle>`;
            break;
          case "text":
            control = `<gk-text-field data-field="${key}" label="${label}" value="${esc(row.value ?? "")}" caption="${esc(row.caption ?? "")}" clearable></gk-text-field>`;
            break;
          case "stepper":
            control = `<gk-stepper-control data-field="${key}" label="${label}" value="${esc(row.value ?? "1")}" min="${esc(row.min ?? "0")}" max="${esc(row.max ?? "10")}" step="${esc(row.step ?? "1")}"></gk-stepper-control>`;
            break;
          case "picker": {
            const options = (row.options ?? []).map((option) => ({
              label: option.label,
              value: option.value,
              detail: option.detail,
            }));
            control = `<gk-value-picker data-field="${key}" label="${label}" value="${esc(row.value ?? "")}" options='${esc(JSON.stringify(options))}'></gk-value-picker>`;
            break;
          }
          case "color":
            control = `<gk-color-picker data-field="${key}" label="${label}" value="${esc(row.value ?? "#0a84ff")}"></gk-color-picker>`;
            break;
          case "button":
            control = `<gk-button data-field="${key}" size="small">${label}</gk-button>`;
            break;
        }
        return `<div class="row">${control}</div>`;
      })
      .join("");
  }

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    const sections = parseItems<FormSection>(this.getAttribute("sections"));

    root.querySelector<HTMLElement>(".legend")!.textContent = this.getAttribute("label") ?? "";
    root.querySelector<HTMLElement>(".sections")!.innerHTML = sections
      .map(
        (section) => `<section class="section" part="section">
          <div class="section-title">${esc(section.title ?? "")}</div>
          <div class="rows">${this.#rows(section)}</div>
          <p class="footer">${esc(section.footer ?? "")}</p>
        </section>`,
      )
      .join("");

    const actions = root.querySelector<HTMLElement>(".actions")!;
    actions.hidden = !this.hasAttribute("show-actions");
    actions.querySelector<HTMLElement>('[data-form-action="reset"]')!.textContent = this.getAttribute("reset-label") ?? "Reset";
    actions.querySelector<HTMLElement>('[data-form-action="submit"]')!.textContent = this.getAttribute("submit-label") ?? "Save";
  }
}

export const FORM_TAG = "gk-form";
