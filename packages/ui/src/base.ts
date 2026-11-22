export function defineElement(tagName: string, constructor: CustomElementConstructor): void {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, constructor);
  }
}

export function mountShadow(host: HTMLElement, html: string, css: string): ShadowRoot {
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = `<style>${css}</style>${html}`;
  return root;
}
