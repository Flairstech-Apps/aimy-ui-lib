import { defineConfig } from "tsup"

// The package is built from the same source files as the registry
// (../../registry/aimy), so nothing is written twice.
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  target: "es2022",
  external: ["react", "react-dom", "react/jsx-runtime"],
  banner: { js: '"use client";' },
})
