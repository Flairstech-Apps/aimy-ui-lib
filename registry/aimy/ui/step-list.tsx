import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

// The compact form of AiMY's steps: the design system's .agent-steps
// (aimy-ds.css:2945), built from the spec because neither product draws it.
// One row a step: done with a tick and what it found ("3 matches · 1.2s"),
// running with a small turning ring, pending with its number. Use it inside a
// card or an answer; for a long run the person watches, use AgentSteps.
//
//   <StepList steps={[{ label: "Searched connected sources", meta: "3 matches · 1.2s", state: "done" },
//     { label: "Drafting summary…", state: "running" }, { label: "Propose actions", state: "pending" }]} />

export type ListStep = { label: string; meta?: string; state: "done" | "running" | "pending" | "failed" }

export function StepList({ steps, className }: { steps: ListStep[]; className?: string }) {
  return (
    <ol data-slot="step-list" className={cn("agent-steps", className)} aria-label="Steps">
      {steps.map((s, i) => (
        <li key={s.label} className={cn("agent-step", s.state)}>
          <span className="agent-step-ico" aria-hidden="true">
            {s.state === "done" ? (
              <Check strokeWidth={3} />
            ) : s.state === "failed" ? (
              <X strokeWidth={3} />
            ) : s.state === "running" ? (
              <span className="mini-spin" />
            ) : (
              i + 1
            )}
          </span>
          <div>
            <div className="agent-step-label">
              {s.label}
              <span className="sr-only">, {s.state === "running" ? "working" : s.state}</span>
            </div>
            {s.meta ? <div className="agent-step-meta">{s.meta}</div> : null}
          </div>
        </li>
      ))}
    </ol>
  )
}
