import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        about: "about.html",
        works: "works/index.html",
        landing: "works/redesignlanding.html",
        contact: "contact.html",
        // add more pages here if needed
      },
    },
  },
});
