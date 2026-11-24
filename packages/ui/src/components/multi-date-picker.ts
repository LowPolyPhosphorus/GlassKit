import { mountShadow } from "../base.js";
import { componentBaseCss, emit, parseItems, toNumber } from "../shared.js";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const styles = `
  ${componentBaseCss}
  :host { display: inline-block; min-width: 0; }

  .calendar {
    display: grid;
    gap: 7px;
    min-width: 244px;
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
  .count { color: var(--gk-color-text-dim); font-size: 10px; font-variant-numeric: tabular-nums; }

  .weekdays, .days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }
  .weekday { padding-bottom: 3px; color: var(--gk-color-text-dim); font-size: 9px; text-align: center; }
  .day {
    aspect-ratio: 1;
    min-height: 26px;
    padding: 0;
    border: 1px solid transparent;
    border-radius: var(--gk-radius-xs);
    background: transparent;
    color: var(--gk-color-text-muted);
    cursor: pointer;
    font-size: 10px;
    font-variant-numeric: tabular-nums;
  }
  .day:hover { border-color: var(--gk-color-hairline); background: var(--gk-color-card-hover); }
  .day[aria-pressed="true"] { border-color: var(--gk-color-accent); background: var(--gk-color-accent-fill); color: var(--gk-color-text); }
  .day.blank { visibility: hidden; }
  .summary { color: var(--gk-color-text-dim); font-size: 10px; }
`;

const html = `
  <section class="calendar" part="calendar">
    <header class="head"><span class="label" part="label"></span><span class="count" part="count">0 selected</span></header>
    <div class="weekdays" part="weekdays" aria-hidden="true"></div>
    <div class="days" part="days" role="group" aria-label="Dates"></div>
    <div class="summary" part="summary"></div>
  </section>`;

export class MultiDatePicker extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "month", "value"];
  }

  get value(): number[] {
    return this.#selected();
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.shadowRoot!.querySelector<HTMLElement>(".days")!.addEventListener("click", this.#onDayClick);
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #selected(): number[] {
    return parseItems<number>(this.getAttribute("value"))
      .map((day) => toNumber(String(day), Number.NaN))
      .filter((day) => Number.isFinite(day))
      .map((day) => Math.trunc(day));
  }

  #month(): { year: number; month: number } {
    const match = /^(\d{4})-(\d{2})$/.exec(this.getAttribute("month") ?? "");
    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      if (year >= 1 && month >= 1 && month <= 12) return { year, month };
    }
    const now = new Date();
    return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
  }

  #iso(day: number): string {
    const { year, month } = this.#month();
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  #onDayClick = (event: MouseEvent): void => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(".day[data-day]");
    if (!button?.dataset.day) return;
    const day = Number(button.dataset.day);
    const selected = this.#selected();
    const index = selected.indexOf(day);
    if (index >= 0) selected.splice(index, 1);
    else selected.push(day);
    selected.sort((a, b) => a - b);
    this.setAttribute("value", JSON.stringify(selected));
    const isSelected = index < 0;
    emit(this, "gk-date-toggle", { day, iso: this.#iso(day), selected: isSelected, value: [...selected], host: this });
  };

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    const { year, month } = this.#month();
    const selected = this.#selected();
    const label = this.getAttribute("label") ?? "Available dates";
    root.querySelector<HTMLElement>(".label")!.textContent = label;
    root.querySelector<HTMLElement>(".weekdays")!.innerHTML = WEEKDAYS.map((day) => `<span class="weekday">${day}</span>`).join("");
    const firstDay = new Date(Date.UTC(year, month - 1, 1));
    const offset = (firstDay.getUTCDay() + 6) % 7;
    const count = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const cells: string[] = [];
    for (let index = 0; index < offset; index += 1) cells.push('<span class="day blank" aria-hidden="true"></span>');
    for (let day = 1; day <= count; day += 1) {
      const isSelected = selected.includes(day);
      cells.push(
        `<button type="button" class="day" data-day="${day}" aria-pressed="${isSelected}" aria-label="${label}, ${this.#iso(day)}">${day}</button>`,
      );
    }
    root.querySelector<HTMLElement>(".days")!.innerHTML = cells.join("");
    root.querySelector<HTMLElement>(".count")!.textContent = `${selected.length} selected`;
    root.querySelector<HTMLElement>(".summary")!.textContent = selected.length
      ? selected.map((day) => this.#iso(day)).join(" · ")
      : "Choose one or more dates";
    emit(this, "gk-change", { value: [...selected], month: `${year}-${String(month).padStart(2, "0")}`, host: this });
  }
}

export const MULTI_DATE_PICKER_TAG = "gk-multi-date-picker";
