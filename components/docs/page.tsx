import { Check, FileCode2, Hash, Moon, SquareTerminal, Sun, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { CopyButton } from "@/registry/aimy/ui/copy-button"
import { CopyForAi } from "./copy-for-ai"
import { detect, Highlight, LANG_LABEL } from "./highlight"
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
      <h1 data-ai="h1" className="text-[2.75rem] leading-[1.1] font-semibold tracking-[-0.025em] text-ink">
        {title}
      </h1>
      <p data-ai="p" className="mt-5 text-lg text-ink-secondary [line-height:var(--lh-base)] [text-wrap:pretty]">
        {lead}
      </p>
      <div className="mt-7">
        <CopyForAi />
      </div>
    </header>
  )
}

export function Section({ title, children, lead }: { title: string; lead?: string; children: React.ReactNode }) {
  const id = slug(title)
  return (
    // Every section opens on a hairline, so the page reads as a run of distinct parts.
    <section className="mt-14 border-t border-hairline pt-12">
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
  const lang = detect(children)
  const LangIcon = lang === "shell" ? SquareTerminal : FileCode2
  return (
    // Code sits on a dark ground in both themes, so its Copy button takes the dark theme too.
    <div data-theme="dark" className="overflow-hidden rounded-lg border border-hairline bg-code">
      <div className="flex h-10 items-center gap-2 border-b border-hairline bg-w03 pr-1.5 pl-4">
        <LangIcon aria-hidden="true" strokeWidth={2} className="size-3.5 text-ink-secondary" />
        <span className="text-2xs font-semibold text-ink-secondary">{LANG_LABEL[lang]}</span>
        <CopyButton value={children} what={what} className="ml-auto" />
      </div>
      <pre
        data-ai="code"
        className={cn(
          "overflow-x-auto px-4 py-3.5 font-mono text-xs leading-relaxed text-[var(--syn-base)]",
          wrap && "break-all whitespace-pre-wrap"
        )}
      >
        <Highlight code={children} lang={lang} />
      </pre>
    </div>
  )
}

/** Renders the same content on a dark ground and a light ground, side by side. */
export function ThemePair({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="grid gap-4 column:grid-cols-2">
      {(["dark", "light"] as const).map((t) => {
        const ThemeIcon = t === "dark" ? Moon : Sun
        return (
          // Each frame is a small stage: the theme named in its bar, the component on a dotted ground.
          <div key={t} data-theme={t} className="flex flex-col overflow-hidden rounded-xl border border-edge bg-body text-ink">
            <p className="flex h-9 items-center gap-2 border-b border-hairline bg-w03 px-4 text-2xs font-semibold text-ink-secondary">
              <ThemeIcon aria-hidden="true" strokeWidth={2} className="size-3.5" />
              {t === "dark" ? "Dark" : "Light"}
            </p>
            <div className={cn("docs-stage flex-1 p-5", className)}>{children}</div>
          </div>
        )
      })}
    </div>
  )
}
