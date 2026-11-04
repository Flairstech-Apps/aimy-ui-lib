import type { NextConfig } from "next"

// Lab pages (page.lab.tsx) are explorations for choosing what goes into the
// library. They are routes on the dev server only; the production build
// doesn't see them, so they never reach the site.
const lab = process.env.NODE_ENV === "development"

// Static export: the docs and the registry JSON are plain files served by the
// Cloudflare Worker in worker/index.ts, which also enforces the internal lock.
const config: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  pageExtensions: lab ? ["lab.tsx", "tsx", "ts", "jsx", "js"] : ["tsx", "ts", "jsx", "js"],
}

export default config
