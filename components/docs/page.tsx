import { Check, Hash, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { CopyButton } from "@/registry/aimy/ui/copy-button"
import { CopyForAi } from "./copy-for-ai"
import { Crumb } from "./page-chrome"

/** A section title as an anchor: "Sizes and states" becomes "sizes-and-states". */
export const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

export function PageHeader({ title, lead }: { title: string; lead: string }) {
  return (
    <header className="max-w-[48rem]">
      <Crumb />
      <h1 data-ai="h1" className="text-4xl font-semibold tracking-tight text-ink">
        {title}
      </h1>
      <p data-ai="p" className="mt-4 text-lg text-ink-secondary [line-height:var(--lh-base)]">
        {lead}
      </p>
      <div className="mt-6">
        <CopyForAi />
      </div>
    </header>
  )
}

export function Section({ title, children, lead }: { title: string; lead?: string; children: React.ReactNode }) {
  const id = slug(title)
  return (
    <section className="mt-16">
      <h2
        id={id}
        data-ai="h2"
        data-title={title}
        className="group scroll-mt-[calc(var(--topbar-height)+1.5rem)] text-2xl font-semibold tracking-tight text-ink"
      >
        <a href={`#${id}`} className="inline-flex items-center gap-2 rounded-sm">
          {title}
          <Hash
            aria-hidden="true"
            strokeWidth={2}
            className="size-4 text-ink-secondary opacity-0 transition-opacity duration-(--t-fast) ease-out group-hover:opacity-100 group-focus-within:opacity-100"
          />
        </a>
      </h2>
      {lead ? (
        <p data-ai="p" className="mt-3 max-w-[46rem] text-body text-ink-secondary">
          {lead}
        </p>
      ) : null}
      <div className="mt-6">{children}</div>
    </section>
  )
}

/** A rule with the right way and the wrong way side by side. */
export function DoDont({ doText, dontText }: { doText: string; dontText: string }) {
  return (
    <div className="grid gap-3 column:grid-cols-2">
      <p data-ai="li" className="flex gap-3 rounded-lg bg-ok-bg p-4 text-meta text-ink">
        <Check className="mt-0.5 size-4 shrink-0 text-ok-text" strokeWidth={2} aria-hidden="true" />
        <span>
          <strong className="font-semibold text-ok-text">Do: </strong>
          {doText}
        </span>
      </p>
      <p data-ai="li" className="flex gap-3 rounded-lg bg-err-bg p-4 text-meta text-ink">
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
    <code className={cn("rounded-xs bg-w07 px-1.5 py-0.5 font-mono text-[0.875em] text-ink", className)}>
      {children}
    </code>
  )
}

/** Code with its own Copy button, so nobody selects by hand. */
/** wrap lets a long one-line command break instead of scrolling, so it reads in full. */
export function CodeBlock({
  children,
  what = "the code",
  wrap = false,
}: {
  children: string
  what?: string
  wrap?: boolean
}) {
  return (
    // Code sits on a dark ground in both themes, so its Copy button takes the dark theme too.
    <div data-theme="dark" className="flex items-start rounded-lg border border-hairline bg-code">
      <pre
        data-ai="code"
        className={cn(
          "min-w-0 flex-1 overflow-x-auto py-4 pr-3 pl-4 font-mono text-xs leading-relaxed text-[var(--syn-base)]",
          wrap && "break-all whitespace-pre-wrap"
        )}
      >
        {children}
      </pre>
      <CopyButton value={children} what={what} className="m-2.5 shrink-0" />
    </div>
  )
}

/** Renders the same content on a dark ground and a light ground, side by side. */
export function ThemePair({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="grid gap-4 column:grid-cols-2">
      {(["dark", "light"] as const).map((t) => (
        <div key={t} data-theme={t} className={cn("rounded-xl border border-hairline bg-body p-5 text-ink", className)}>
          <p className="mb-4 text-2xs font-semibold text-ink-secondary">{t === "dark" ? "Dark" : "Light"}</p>
          {children}
        </div>
      ))}
    </div>
  )
}
