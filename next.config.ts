import type { NextConfig } from "next"

// Static export: the docs and the registry JSON are plain files served by the
// Cloudflare Worker in worker/index.ts, which also enforces the internal lock.
const config: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
}

export default config
