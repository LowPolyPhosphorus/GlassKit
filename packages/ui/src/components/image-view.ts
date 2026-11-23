import { mountShadow } from "../base.js";
import { componentBaseCss, emit, slotHasContent } from "../shared.js";

const styles = `
  ${componentBaseCss}
  :host { display: block; }

  .frame {
    display: grid;
    place-items: center;
    width: 100%;
    aspect-ratio: var(--gk-image-ratio, 16 / 9);
    overflow: hidden;
    border: 1px solid var(--gk-color-hairline);
    border-radius: var(--gk-radius-md);
    background: var(--gk-color-card);
    color: var(--gk-color-text-dim);
    font-size: var(--gk-font-size-xs);
  }

  .placeholder { display: grid; place-items: center; gap: 6px; padding: var(--gk-space-4); text-align: center; }
  .placeholder[hidden] { display: none; }

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: var(--gk-image-fit, contain);
  }

  img[hidden] { display: none; }
`;

const html = `
  <div class="frame" part="frame">
    <span class="placeholder" part="placeholder"><slot>Image</slot></span>
    <img part="image" hidden />
  </div>`;

export class ImageView extends HTMLElement {
  static get observedAttributes(): string[] {
    return ["src", "alt", "fit", "ratio", "label"];
  }

  #image: HTMLImageElement | null = null;
  #placeholder: HTMLElement | null = null;

  connectedCallback(): void {
    if (!this.shadowRoot) {
      mountShadow(this, html, styles);
      this.#image = this.shadowRoot!.querySelector<HTMLImageElement>("img");
      this.#placeholder = this.shadowRoot!.querySelector<HTMLElement>(".placeholder");
      this.#image!.addEventListener("load", () => emit(this, "gk-load", { src: this.getAttribute("src") ?? "" }));
      this.#image!.addEventListener("error", () => emit(this, "gk-error", { src: this.getAttribute("src") ?? "" }));
      this.shadowRoot!.querySelector("slot")!.addEventListener("slotchange", () => this.#sync());
    }
    this.#sync();
  }

  attributeChangedCallback(): void {
    this.#sync();
  }

  #sync(): void {
    if (!this.#image || !this.#placeholder || !this.shadowRoot) return;
    const frame = this.shadowRoot.querySelector<HTMLElement>(".frame")!;
    frame.style.setProperty("--gk-image-fit", this.getAttribute("fit") ?? "contain");
    const ratio = this.getAttribute("ratio");
    if (ratio) frame.style.setProperty("--gk-image-ratio", ratio);
    else frame.style.removeProperty("--gk-image-ratio");
    frame.setAttribute("aria-label", this.getAttribute("label") ?? this.getAttribute("alt") ?? "Image");

    const src = this.getAttribute("src") ?? "";
    this.#placeholder.hidden = Boolean(src) || slotHasContent(this.shadowRoot, "");
    this.#image.hidden = !src;
    this.#image.alt = this.getAttribute("alt") ?? "";
    if (src) {
      if (this.#image.getAttribute("src") !== src) this.#image.setAttribute("src", src);
    } else {
      this.#image.removeAttribute("src");
    }
  }
}

export const IMAGE_VIEW_TAG = "gk-image-view";
