import { mountShadow } from "../base.js";
import { componentBaseCss, emit } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: block; min-width: 0; }

  a {
    display: flex;
    align-items: baseline;
    gap: 6px;
    width: fit-content;
    max-width: 100%;
    color: var(--gk-color-accent);
    font-size: var(--gk-font-size-sm);
    font-weight: var(--gk-font-weight-medium);
    text-decoration: none;
  }

  a:hover { text-decoration: underline; }
  a .label { overflow-wrap: anywhere; }
  .arrow { flex: none; font-size: 12px; }
  .detail { color: var(--gk-color-text-muted); font-weight: var(--gk-font-weight-regular); }
  :host([disabled]) a { opacity: 0.42; pointer-events: none; }
`;

const html = `
  <a part="link">
    <span class="label" part="label"></span>
    <span class="detail" part="detail"></span>
    <span class="arrow" aria-hidden="true">↗</span>
  </a>`;

function safeHref(value: string | null): { href: string; external: boolean } {
  const raw = (value ?? "").trim();
  if (/^https?:\/\//i.test(raw) || /^mailto:/i.test(raw)) return { href: raw, external: true };
  if (raw.startsWith("#") || raw.startsWith("/")) return { href: raw, external: false };
  return { href: "#", external: false };
}

export class WebLink extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["label", "href", "detail", "disabled"];
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.shadowRoot!.querySelector<HTMLAnchorElement>("a")!.addEventListener("click", this.#onClick);
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #onClick = (event: MouseEvent): void => {
    if (this.hasAttribute("disabled")) {
      event.preventDefault();
      return;
    }
    const href = this.getAttribute("href") ?? "";
    emit(this, "gk-navigate", { href, value: href, label: this.getAttribute("label") ?? href, source: this });
  };

  #sync(): void {
    if (!this.shadowRoot) return;
    const root = this.shadowRoot;
    const anchor = root.querySelector<HTMLAnchorElement>("a")!;
    const { href, external } = safeHref(this.getAttribute("href"));
    anchor.href = href;
    if (external) {
      anchor.target = "_blank";
      anchor.rel = "noreferrer noopener";
    } else {
      anchor.removeAttribute("target");
      anchor.removeAttribute("rel");
    }
    anchor.setAttribute("aria-disabled", String(this.hasAttribute("disabled")));
    root.querySelector<HTMLElement>(".label")!.textContent = this.getAttribute("label") ?? "Open link";
    root.querySelector<HTMLElement>(".detail")!.textContent = this.getAttribute("detail") ?? "";
    root.querySelector<HTMLElement>(".arrow")!.hidden = !external;
  }
}

export const WEB_LINK_TAG = "gk-web-link";
