import { mountShadow } from "../base.js";
import { componentBaseCss, emit, parseItems } from "../shared.js";

interface OutlineItem {
  value?: string;
  label?: string;
  detail?: string;
  expanded?: boolean;
  children?: OutlineItem[];
}

const styles = `
  ${componentBaseCss}
  :host { display: block; min-width: 0; }

  .outline {
    display: grid;
    gap: 8px;
    min-width: 0;
    padding: 10px;
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

  .nodes { display: grid; gap: 2px; min-width: 0; }

  .line {
    display: grid;
    grid-template-columns: 24px minmax(0, 1fr);
    align-items: center;
    gap: 2px;
    min-width: 0;
  }

  .twisty {
    display: grid;
    width: 24px;
    height: 24px;
    place-items: center;
    padding: 0;
    border: 0;
    border-radius: var(--gk-radius-xs);
    background: transparent;
    color: var(--gk-color-text-dim);
    cursor: pointer;
    font-size: var(--gk-font-size-sm);
    line-height: 1;
    transition: transform 160ms var(--gk-motion-ease-standard, ease);
  }
  .twisty:hover { background: var(--gk-color-card-hover); color: var(--gk-color-text); }
  .twisty[aria-expanded="true"] { transform: rotate(90deg); }
  .spacer { width: 24px; }

  .select {
    display: flex;
    min-width: 0;
    align-items: baseline;
    gap: 8px;
    padding: 5px 8px;
    border: 0;
    border-radius: var(--gk-radius-xs);
    background: transparent;
    color: inherit;
    cursor: pointer;
    font-size: var(--gk-font-size-xs);
    text-align: left;
  }
  .select:hover { background: var(--gk-color-card-hover); }
  .select[aria-current="true"] {
    background: var(--gk-color-accent-fill);
    color: var(--gk-color-accent);
    font-weight: var(--gk-font-weight-semibold);
  }
  .label { min-width: 0; overflow-wrap: anywhere; }
  .detail { color: var(--gk-color-text-dim); font-size: 10px; white-space: nowrap; }

  .children {
    display: grid;
    gap: 2px;
    min-width: 0;
    margin-left: 18px;
    padding-left: 8px;
    border-left: 1px solid var(--gk-color-hairline);
  }
  .children[hidden] { display: none; }
`;

const html = `
  <div class="outline" part="outline">
    <div class="heading" part="heading"></div>
    <div class="nodes" part="nodes"></div>
  </div>`;

const esc = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export class OutlineGroup extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "items"];
  }

  get value(): string {
    return this.getAttribute("selection") ?? "";
  }

  set value(next: string) {
    this.setAttribute("selection", next);
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.shadowRoot!.querySelector<HTMLElement>(".nodes")!.addEventListener("click", this.#onClick);
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #render(items: OutlineItem[], parentPath = ""): string {
    if (!items.length) return "";
    return items
      .map((item, index) => {
        const path = parentPath ? `${parentPath}.${index}` : String(index);
        const value = String(item.value ?? item.label ?? path);
        const label = String(item.label ?? value);
        const children = Array.isArray(item.children) ? item.children : [];
        const expanded = Boolean(item.expanded);
        return `<div class="node" data-path="${path}">
          <div class="line">
            ${
              children.length
                ? `<button type="button" class="twisty" data-path="${path}" aria-expanded="${expanded}" aria-label="Toggle ${esc(label)}">›</button>`
                : `<span class="spacer" aria-hidden="true"></span>`
            }
            <button type="button" class="select" data-path="${path}" data-value="${esc(value)}" aria-current="${value === this.value}">
              <span class="label">${esc(label)}</span>
              ${item.detail ? `<span class="detail">${esc(String(item.detail))}</span>` : ""}
            </button>
          </div>
          ${
            children.length
              ? `<div class="children"${expanded ? "" : " hidden"}>${this.#render(children, path)}</div>`
              : ""
          }
        </div>`;
      })
      .join("");
  }

  #onClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;
    const twisty = target.closest<HTMLButtonElement>(".twisty");
    if (twisty) {
      const expanded = twisty.getAttribute("aria-expanded") !== "true";
      twisty.setAttribute("aria-expanded", String(expanded));
      const children = twisty.closest<HTMLElement>(".node")!.querySelector<HTMLElement>(":scope > .children");
      if (children) children.hidden = !expanded;
      emit(this, "gk-outline-toggle", {
        value: twisty.closest<HTMLElement>(".node")!.querySelector<HTMLElement>(".select")?.dataset.value ?? "",
        path: twisty.dataset.path,
        expanded,
        source: this,
      });
      return;
    }

    const select = target.closest<HTMLButtonElement>(".select");
    if (!select) return;
    for (const button of Array.from(this.shadowRoot!.querySelectorAll<HTMLButtonElement>(".select"))) {
      const selected = button === select;
      button.setAttribute("aria-current", String(selected));
      button.classList.toggle("is-selected", selected);
    }
    this.value = select.dataset.value ?? "";
    emit(this, "gk-outline-select", {
      value: this.value,
      label: select.querySelector<HTMLElement>(".label")?.textContent ?? this.value,
      path: select.dataset.path,
      source: this,
    });
  };

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    root.querySelector<HTMLElement>(".heading")!.textContent = this.getAttribute("label") ?? "Outline";
    root.querySelector<HTMLElement>(".nodes")!.innerHTML = this.#render(parseItems<OutlineItem>(this.getAttribute("items")));
  }
}

export const OUTLINE_GROUP_TAG = "gk-outline-group";
