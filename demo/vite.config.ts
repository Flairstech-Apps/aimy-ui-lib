import path from "node:path"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  // The demo lives inside the library repo, so some packages (the fonts)
  // resolve from the repo's node_modules one level up. Let the dev server
  // serve them. A product outside this repo doesn't need this.
  server: { fs: { allow: [".."] } },
})
