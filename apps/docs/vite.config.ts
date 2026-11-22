import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

const pages = [
  "index.html",
  "tokens.html",
  "materials.html",
  "components.html",
  "motion.html",
  "native.html",
  "guidelines.html",
  "playground.html",
];

export default defineConfig({
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        pages.map((page) => [page.replace(/\.html$/, ""), resolve(rootDir, page)]),
      ),
    },
  },
});
