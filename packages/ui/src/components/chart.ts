import { mountShadow } from "../base.js";
import { componentBaseCss, emit, parseList, toNumber } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: block; }

  .chart {
    padding: 12px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-md);
    background: var(--gk-color-card);
  }

  header { display: flex; align-items: center; justify-content: space-between; gap: var(--gk-space-3); margin-bottom: 12px; }
  .title { font-size: var(--gk-font-size-sm); font-weight: var(--gk-font-weight-semibold); }
  .legend { color: var(--gk-color-text-muted); font-size: var(--gk-font-size-xs); }

  .plot {
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(18px, 1fr);
    align-items: end;
    gap: 8px;
    height: 120px;
    padding-bottom: 22px;
    position: relative;
  }

  .bar {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    height: 100%;
    border: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }

  .value { margin-bottom: 4px; font-size: var(--gk-font-size-xs); color: var(--gk-color-text-muted); }

  .fill {
    width: 100%;
    min-height: 2px;
    height: var(--bar-height, 0%);
    border-radius: var(--gk-radius-xs) var(--gk-radius-xs) 0 0;
    background: var(--gk-color-accent);
    transition: height var(--gk-motion-duration-base) var(--gk-motion-ease-emphasized);
  }

  .bar:hover .fill { background: var(--gk-color-text); }

  .axis {
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(18px, 1fr);
    gap: 8px;
  }

  .axis span {
    overflow: hidden;
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-xs);
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .empty { color: var(--gk-color-text-dim); font-size: var(--gk-font-size-xs); }
`;

export class Chart extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["title", "values", "labels", "max", "tone"];
  }

  #plot: HTMLElement | null = null;

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(
        this,
        `<section class="chart" part="chart">
          <header><span class="title"></span><span class="legend"><slot name="legend"></slot></span></header>
          <div class="plot" part="plot" role="list" aria-label="Chart data"></div>
        </section>`,
        styles,
      );
      this.#plot = this.shadowRoot!.querySelector<HTMLElement>(".plot");
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #sync(): void {
    if (!this.#plot || !this.shadowRoot) return;
    const root = this.shadowRoot;
    root.querySelector<HTMLElement>(".title")!.textContent = this.getAttribute("title") ?? "";
    const rawValues = parseList(this.getAttribute("values")).map((value) => toNumber(value, 0));
    const labels = parseList(this.getAttribute("labels"));
    if (!rawValues.length) {
      const empty = document.createElement("span");
      empty.className = "empty";
      empty.textContent = "No chart data";
      this.#plot.replaceChildren(empty);
      return;
    }

    const max = Math.max(1, toNumber(this.getAttribute("max"), Math.max(...rawValues)));
    this.#plot.replaceChildren();
    rawValues.forEach((value, index) => {
      const label = labels[index] ?? String(index + 1);
      const bar = document.createElement("button");
      bar.type = "button";
      bar.className = "bar";
      bar.setAttribute("role", "listitem");
      bar.setAttribute("aria-label", `${label}: ${value}`);

      const valueLabel = document.createElement("span");
      valueLabel.className = "value";
      valueLabel.textContent = String(value);

      const fill = document.createElement("span");
      fill.className = "fill";
      fill.style.setProperty("--bar-height", `${Math.max(0, Math.min(100, (value / max) * 100))}%`);

      const axisLabel = document.createElement("span");
      axisLabel.textContent = label;

      bar.append(valueLabel, fill, axisLabel);
      bar.addEventListener("click", () => emit(this, "gk-point-select", { index, label, value }));
      this.#plot!.append(bar);
    });
  }
}

export const CHART_TAG = "gk-chart";
