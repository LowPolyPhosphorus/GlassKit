import { mountShadow } from "../base.js";
import { componentBaseCss, emit, parseList, toNumber } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: block; }

  .path {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0;
    min-height: 28px;
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-sm);
  }

  .crumb {
    display: inline-flex;
    align-items: center;
    gap: var(--gk-space-1);
    padding: 3px 4px;
    border: 0;
    border-radius: var(--gk-radius-xs);
    background: transparent;
    color: inherit;
    cursor: pointer;
  }

  button.crumb:hover { background: var(--gk-color-card-hover); color: var(--gk-color-text); }

  .crumb[aria-current="page"] { color: var(--gk-color-text); font-weight: var(--gk-font-weight-medium); cursor: default; }

  .crumb:not(:last-child)::after {
    content: "";
    width: 4px;
    height: 4px;
    margin-left: var(--gk-space-2);
    border-right: 1px solid var(--gk-color-text-dim);
    border-top: 1px solid var(--gk-color-text-dim);
    transform: rotate(45deg);
  }

  .ellipsis { cursor: default; letter-spacing: 0.12em; }
`;

export class PathControl extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["items", "max-items", "label"];
  }

  #nav: HTMLElement | null = null;

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, '<nav class="path" part="path"></nav>', styles);
      this.#nav = this.shadowRoot!.querySelector<HTMLElement>(".path");
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #sync(): void {
    if (!this.#nav) return;
    const items = parseList(this.getAttribute("items"));
    const max = Math.max(2, toNumber(this.getAttribute("max-items"), 6));
    const indices = items.length > max ? [0, -1, items.length - 1] : items.map((_, index) => index);
    this.#nav.setAttribute("aria-label", this.getAttribute("label") ?? "Breadcrumb");
    this.#nav.replaceChildren();

    indices.forEach((index, position) => {
      if (index === -1) {
        const ellipsis = document.createElement("span");
        ellipsis.className = "crumb ellipsis";
        ellipsis.textContent = "•••";
        ellipsis.setAttribute("aria-hidden", "true");
        this.#nav!.append(ellipsis);
        return;
      }
      const crumb = document.createElement(position === indices.length - 1 ? "span" : "button");
      crumb.className = "crumb";
      crumb.textContent = items[index];
      if (position === indices.length - 1) crumb.setAttribute("aria-current", "page");
      else {
        crumb.setAttribute("type", "button");
        crumb.addEventListener("click", () => emit(this, "gk-navigate", { index, item: items[index], source: this }));
      }
      this.#nav!.append(crumb);
    });
  }
}

export const PATH_CONTROL_TAG = "gk-path-control";
