import { mountShadow } from "../base.js";
import { componentBaseCss, emit } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: block; min-width: 0; }

  .frame {
    position: relative;
    display: grid;
    place-items: center;
    overflow: hidden;
    width: 100%;
    aspect-ratio: var(--gk-image-ratio, 16 / 9);
    min-height: 80px;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-md);
    background: var(--gk-color-glass-thin);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  img[hidden] { display: none !important; }

  .state {
    position: absolute;
    display: grid;
    justify-items: center;
    gap: 8px;
    color: var(--gk-color-text-muted);
    font-size: var(--gk-font-size-xs);
  }

  .state[hidden] { display: none !important; }
  .spinner {
    width: 20px;
    height: 20px;
    border: 2px solid var(--gk-color-glass-regular);
    border-top-color: var(--gk-color-accent);
    border-radius: 50%;
    animation: gk-image-spin 720ms linear infinite;
  }
  .placeholder { font-size: var(--gk-font-size-xl); color: var(--gk-color-text-dim); }

  @keyframes gk-image-spin {
    to { transform: rotate(360deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    .spinner { animation-duration: 1600ms; }
  }
`;

const html = `
  <div class="frame" part="frame" role="img">
    <img alt="" hidden />
    <span class="state loading"><span class="spinner" aria-hidden="true"></span><span>Loading…</span></span>
    <span class="state error" hidden><span class="placeholder" aria-hidden="true">◇</span><span>Image unavailable</span></span>
  </div>`;

export class AsyncImage extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["src", "alt", "ratio", "placeholder"];
  }

  #image: HTMLImageElement | null = null;

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.#image = this.shadowRoot!.querySelector<HTMLImageElement>("img");
      this.#image!.addEventListener("load", this.#onLoad);
      this.#image!.addEventListener("error", this.#onError);
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #setState(name: "loading" | "error" | "none"): void {
    if (!this.shadowRoot) return;
    for (const state of ["loading", "error"]) {
      this.shadowRoot.querySelector<HTMLElement>(`.${state}`)!.hidden = state !== name;
    }
  }

  #onLoad = (): void => {
    this.#setState("none");
    if (this.#image) this.#image.hidden = false;
    emit(this, "gk-load", { src: this.getAttribute("src") ?? "", source: this });
  };

  #onError = (): void => {
    this.#setState("error");
    if (this.#image) this.#image.hidden = true;
    emit(this, "gk-error", { src: this.getAttribute("src") ?? "", source: this });
  };

  #sync(): void {
    if (!this.shadowRoot || !this.#image) return;
    const src = this.getAttribute("src") ?? "";
    const frame = this.shadowRoot.querySelector<HTMLElement>(".frame")!;
    frame.style.setProperty("--gk-image-ratio", this.getAttribute("ratio") ?? "16 / 9");
    frame.setAttribute("aria-label", this.getAttribute("alt") ?? "Decorative image");
    this.#image.alt = this.getAttribute("alt") ?? "";
    this.shadowRoot.querySelector<HTMLElement>(".loading span:last-child")!.textContent =
      this.getAttribute("placeholder") ?? "Loading…";
    if (src) {
      this.#image.hidden = true;
      this.#setState("loading");
      if (this.#image.getAttribute("src") !== src) this.#image.src = src;
      if (this.#image.complete) {
        if (this.#image.naturalWidth > 0) this.#onLoad();
        else this.#onError();
      }
    } else {
      this.#image.removeAttribute("src");
      this.#image.hidden = true;
      this.#setState("error");
    }
  }
}

export const ASYNC_IMAGE_TAG = "gk-async-image";
