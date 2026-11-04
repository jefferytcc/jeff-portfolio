import { defineConfig } from "vite";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const partialsDir = resolve(root, "src/partials");

// ----------------------------
// Shared partials: <!-- @include nav.html -->
// ----------------------------
const INCLUDE = /<!--\s*@include\s+([\w.-]+)\s*-->/g;

function includePartials(html) {
  return html.replace(INCLUDE, (_, file) =>
    includePartials(readFileSync(resolve(partialsDir, file), "utf8")),
  );
}

function htmlPartials() {
  return {
    name: "html-partials",
    transformIndexHtml: { order: "pre", handler: includePartials },
    handleHotUpdate({ file, server }) {
      if (file.startsWith(partialsDir)) {
        server.ws.send({ type: "full-reload" });
        return [];
      }
    },
  };
}

// ----------------------------
// Build every page in the root and /works automatically
// ----------------------------
function findPages(dir) {
  return readdirSync(resolve(root, dir))
    .filter((file) => file.endsWith(".html"))
    .map((file) => resolve(root, dir, file));
}

export default defineConfig({
  plugins: [htmlPartials()],
  build: {
    rollupOptions: {
      input: [...findPages("."), ...findPages("works")],
    },
  },
});
