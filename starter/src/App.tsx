import { InstallCheck } from "@/components/install-check"

// Phase 0 starter: proves a new product comes up with AiMY UI installed.
// Phase 1 onward replaces this with the AiMY shell (topnav, rail, canvas).
export function App() {
  return (
    <main style={{ padding: 48 }}>
      <InstallCheck />
    </main>
  )
}
