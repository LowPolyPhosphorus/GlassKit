import { mountShadow } from "../base.js";
import { componentBaseCss, emit } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: block; }

  .picker {
    display: grid;
    gap: 6px;
    min-width: 0;
  }

  .label {
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-xs);
    font-weight: var(--gk-font-weight-medium);
  }

  .inputs {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    min-width: 0;
  }

  input {
    min-width: 0;
    padding: 7px 9px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-sm);
    background: var(--gk-color-card);
    color: var(--gk-color-text);
    font: inherit;
    font-size: var(--gk-font-size-sm);
    color-scheme: inherit;
  }

  input:focus-visible {
    border-color: var(--gk-color-accent);
    outline: 2px solid var(--gk-color-accent-fill);
    outline-offset: 1px;
  }

  input[hidden] { display: none !important; }
`;

const html = `
  <label class="picker" part="picker">
    <span class="label" part="label"></span>
    <span class="inputs">
      <input class="date" type="date" aria-label="Date" />
      <input class="time" type="time" aria-label="Time" hidden />
    </span>
  </label>`;

export class DatePicker extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "value", "components", "min", "max", "disabled"];
  }

  #date: HTMLInputElement | null = null;
  #time: HTMLInputElement | null = null;

  get value(): string {
    return this.getAttribute("value") ?? "";
  }

  set value(next: string) {
    this.setAttribute("value", next);
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.#date = this.shadowRoot!.querySelector<HTMLInputElement>(".date");
      this.#time = this.shadowRoot!.querySelector<HTMLInputElement>(".time");
      this.#date?.addEventListener("change", this.#onChange);
      this.#time?.addEventListener("change", this.#onChange);
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #onChange = (): void => {
    const date = this.#date?.value ?? "";
    const time = this.#time?.value ?? "09:00";
    const showTime = this.hasTime;
    const next = date ? (showTime ? `${date}T${time}` : date) : "";
    this.value = next;
    emit(this, "gk-change", { value: next, date, time: showTime ? time : undefined });
  };

  get hasTime(): boolean {
    const components = this.getAttribute("components") ?? "date";
    return components.includes("hour") || components.includes("time");
  }

  #sync(): void {
    if (!this.#date || !this.#time || !this.shadowRoot) return;
    const [date = "", time = "09:00"] = this.value.split("T");
    this.shadowRoot.querySelector<HTMLElement>(".label")!.textContent = this.getAttribute("label") ?? "Date";
    this.#date.value = date;
    this.#time.value = time;
    this.#time.hidden = !this.hasTime;
    for (const input of [this.#date, this.#time]) {
      input.disabled = this.hasAttribute("disabled");
      if (this.hasAttribute("min")) input.min = this.getAttribute("min")!;
      else input.removeAttribute("min");
      if (this.hasAttribute("max")) input.max = this.getAttribute("max")!;
      else input.removeAttribute("max");
    }
  }
}

export const DATE_PICKER_TAG = "gk-date-picker";
