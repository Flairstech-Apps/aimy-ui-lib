import { App } from "@/screen"

// The screen is interactive throughout, so it is a client component
// (src/screen.tsx); this page stays a server component that renders it.
export default function Page() {
  return <App />
}
