"use client"

import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// AiMY's work, step by step, while it runs: Sales' curation trace (.b-cur,
// bdr.js:34360). A fold whose summary says what AiMY is doing and how long
// it has been at it, a line saying the person can leave, and the steps on a
// rail: waiting steps are not drawn yet, the live one beats and its words
// shine, a finished one ticks itself and says what it found. When it is done
// the summary says so with the time ("Curated in 6.0s") and the trace can
// fold away. A failed step says so in error ink; Sales has no failed step.
//
//   <AgentSteps live={running} title="Curating “Leeds logistics”" doneTitle="Curated"
//     seconds={elapsed} steps={[{ label: "Asking Apollo", result: "42 people came back", state: "done" }, …]} />

export type AgentStepState = "wait" | "live" | "done" | "fail"
export type AgentStep = { label: string; result?: string; state: AgentStepState }

type AgentStepsProps = {
  steps: AgentStep[]
  /** True while AiMY is working. */
  live: boolean
  /** What AiMY is doing, while live. */
  title: string
  /** The word for finished, followed by the time: "Curated" reads "Curated in 6.0s". */
  doneTitle?: string
  /** Seconds since it started. */
  seconds: number
  /** Said while live: what leaving does. */
  note?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

export function AgentSteps({
  steps,
  live,
  title,
  doneTitle = "Done",
  seconds,
  note = "You can close this. It keeps going, and I will tell you when it is ready.",
  open,
  onOpenChange,
  className,
}: AgentStepsProps) {
  const time = seconds.toFixed(1) + "s"
  const failed = steps.some((s) => s.state === "fail")
  return (
    <details
      data-slot="agent-steps"
      className={cn("b-cur", live && "is-live", className)}
      open={open ?? true}
      onToggle={(e) => onOpenChange?.(e.currentTarget.open)}
    >
      <summary className="b-cur-sum">
        <span className="b-cur-say">
          {live ? title : failed ? "Stopped before it finished" : `${doneTitle} in ${time}`}
        </span>
        {live ? (
          <span className="b-cur-time" role="timer" aria-label="Running for">
            {time}
          </span>
        ) : null}
        <ChevronDown aria-hidden="true" />
      </summary>
      <div className="b-cur-note" aria-hidden={!live}>
        <p>{note}</p>
      </div>
      <ol className="b-cur-steps" aria-live="polite">
        {steps.map((s) => (
          <li key={s.label} className={cn("b-cur-step", `is-${s.state}`)} aria-hidden={s.state === "wait" || undefined}>
            <div className="b-cur-in">
              <div className="b-cur-row">
                <span className="b-cur-pin" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" pathLength={1} />
                  </svg>
                </span>
                <div className="b-cur-body">
                  <span className="b-cur-label">
                    {s.label}
                    <span className="sr-only">
                      {s.state === "done"
                        ? ", done"
                        : s.state === "live"
                          ? ", working"
                          : s.state === "fail"
                            ? ", failed"
                            : ""}
                    </span>
                  </span>
                  {s.result ? (
                    <div className="b-cur-saidw">
                      <span className="b-cur-said">{s.result}</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </details>
  )
}
