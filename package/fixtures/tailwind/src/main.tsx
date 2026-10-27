import { createRoot } from "react-dom/client"
import { InstallCheck } from "@flairstech-aimy/ui"
import "./app.css"

createRoot(document.getElementById("root")!).render(
  <main className="grid justify-items-start gap-4 p-6">
    <InstallCheck />
    <InstallCheck className="bg-red-900" />
  </main>
)
