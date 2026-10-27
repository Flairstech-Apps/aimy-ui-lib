import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function PageHeader({ title, lead }: { title: string; lead: string }) {
  return (
    <header className="max-w-[46rem]">
      <h1 className="text-3xl font-semibold tracking-tight text-ink">{title}</h1>
      <p className="mt-3 text-body text-ink-secondary">{lead}</p>
    </header>
  )
}

export function Section({ title, children, lead }: { title: string; lead?: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      {lead ? <p className="mt-2 max-w-[46rem] text-body text-ink-secondary">{lead}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  )
}

/** A rule with the right way and the wrong way side by side. */
export function DoDont({ doText, dontText }: { doText: string; dontText: string }) {
  return (
    <div className="grid gap-3 column:grid-cols-2">
      <p className="flex gap-3 rounded-lg bg-ok-bg p-4 text-meta text-ink">
        <Check className="mt-0.5 size-4 shrink-0 text-ok-text" strokeWidth={2} aria-hidden="true" />
        <span>
          <strong className="font-semibold text-ok-text">Do: </strong>
          {doText}
        </span>
      </p>
      <p className="flex gap-3 rounded-lg bg-err-bg p-4 text-meta text-ink">
        <X className="mt-0.5 size-4 shrink-0 text-err-text" strokeWidth={2} aria-hidden="true" />
        <span>
          <strong className="font-semibold text-err-text">Don&apos;t: </strong>
          {dontText}
        </span>
      </p>
    </div>
  )
}

export function Code({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <code className={cn("rounded-xs bg-w07 px-1.5 py-0.5 font-mono text-[0.875em] text-ink", className)}>{children}</code>
  )
}

export function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-hairline bg-code p-4 font-mono text-xs leading-relaxed text-[var(--syn-base)]">
      {children}
    </pre>
  )
}

/** Renders the same content on a dark ground and a light ground, side by side. */
export function ThemePair({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="grid gap-4 column:grid-cols-2">
      {(["dark", "light"] as const).map((t) => (
        <div key={t} data-theme={t} className={cn("rounded-xl border border-hairline bg-body p-5 text-ink", className)}>
          <p className="mb-4 text-2xs font-semibold text-ink-quiet">{t === "dark" ? "Dark" : "Light"}</p>
          {children}
        </div>
      ))}
    </div>
  )
}
