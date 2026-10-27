import { createRoot } from "react-dom/client"
import { InstallCheck } from "@flairstech-aimy/ui"
import "@flairstech-aimy/ui/styles.css"
import "./app.css"

createRoot(document.getElementById("root")!).render(
  <main>
    <InstallCheck />
    <InstallCheck className="app-override" />
  </main>
)
