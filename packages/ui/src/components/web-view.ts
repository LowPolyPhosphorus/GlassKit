import { mountShadow } from "../base.js";
import { componentBaseCss, emit } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: block; }

  .webview {
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-md);
    overflow: hidden;
    background: var(--gk-color-card);
  }

  .bar {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 8px;
    border-bottom: 1px solid var(--gk-color-hairline);
  }

  .bar[hidden] { display: none; }

  .nav {
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    padding: 0;
    border: 0;
    border-radius: var(--gk-radius-xs);
    background: transparent;
    color: var(--gk-color-text-muted);
    cursor: pointer;
  }

  .nav:hover { background: var(--gk-color-card-hover); color: var(--gk-color-text); }

  .address {
    flex: 1;
    min-width: 0;
    margin-left: 6px;
    overflow: hidden;
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-xs);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  iframe {
    display: block;
    width: 100%;
    height: var(--gk-webview-height, 240px);
    border: 0;
    background: var(--gk-color-card);
  }
`;

const html = `
  <section class="webview" part="webview">
    <div class="bar" part="toolbar">
      <button type="button" class="nav back" aria-label="Back">‹</button>
      <button type="button" class="nav forward" aria-label="Forward">›</button>
      <button type="button" class="nav reload" aria-label="Reload">↻</button>
      <span class="address"></span>
      <slot name="toolbar"></slot>
    </div>
    <iframe part="frame" title="Web view"></iframe>
  </section>`;

export class WebView extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["src", "srcdoc", "title", "height", "sandbox", "no-toolbar"];
  }

  #frame: HTMLIFrameElement | null = null;
  #bar: HTMLElement | null = null;

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.#frame = this.shadowRoot!.querySelector<HTMLIFrameElement>("iframe");
      this.#bar = this.shadowRoot!.querySelector<HTMLElement>(".bar");
      this.#frame!.addEventListener("load", () =>
        emit(this, "gk-load", { src: this.#frame?.srcdoc ? "inline" : this.getAttribute("src") ?? "" }),
      );
      this.shadowRoot!.querySelector<HTMLButtonElement>(".back")!.addEventListener("click", () => this.#history("back"));
      this.shadowRoot!.querySelector<HTMLButtonElement>(".forward")!.addEventListener("click", () => this.#history("forward"));
      this.shadowRoot!.querySelector<HTMLButtonElement>(".reload")!.addEventListener("click", () => this.#reload());
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #history(direction: "back" | "forward"): void {
    try {
      const window = this.#frame?.contentWindow;
      if (direction === "back") window?.history.back();
      else window?.history.forward();
    } catch {
      // Cross-origin frames cannot be scripted; the native frame controls remain available.
    }
  }

  #reload(): void {
    if (!this.#frame) return;
    try {
      if (this.#frame.srcdoc) this.#frame.srcdoc = this.#frame.srcdoc;
      else this.#frame.contentWindow?.location.reload();
    } catch {
      const src = this.#frame.getAttribute("src");
      if (src) this.#frame.setAttribute("src", src);
    }
  }

  #sync(): void {
    if (!this.#frame || !this.#bar) return;
    const root = this.shadowRoot!;
    const srcdoc = this.getAttribute("srcdoc");
    const src = this.getAttribute("src") ?? "about:blank";
    this.#frame.title = this.getAttribute("title") ?? "Web view";
    this.#frame.setAttribute("sandbox", this.getAttribute("sandbox") ?? "allow-same-origin");
    root.querySelector<HTMLElement>(".address")!.textContent = srcdoc !== null ? "Inline content" : src;
    root.querySelector<HTMLElement>(".webview")!.style.setProperty(
      "--gk-webview-height",
      this.getAttribute("height") ?? "240px",
    );
    this.#bar.hidden = this.hasAttribute("no-toolbar");

    if (srcdoc !== null) {
      this.#frame.removeAttribute("src");
      if (this.#frame.srcdoc !== srcdoc) this.#frame.srcdoc = srcdoc;
    } else {
      this.#frame.removeAttribute("srcdoc");
      if (this.#frame.getAttribute("src") !== src) this.#frame.setAttribute("src", src);
    }
  }
}

export const WEB_VIEW_TAG = "gk-web-view";
