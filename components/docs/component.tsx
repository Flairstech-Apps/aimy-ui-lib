import { CodeBlock, Section } from "./page"

/** Install commands for a registry item, both doors. */
export function Install({ name, exports }: { name: string; exports: string }) {
  return (
    <Section title="Install">
      <div className="flex flex-col gap-3">
        <CodeBlock>{`npx shadcn@latest add ${name
          .split(" ")
          .map((n) => `@aimy/${n}`)
          .join(" ")}`}</CodeBlock>
        <p data-ai="p" className="text-meta text-ink-secondary">
          Or, with the npm package:
        </p>
        <CodeBlock>{`import { ${exports} } from "@flairstech-aimy/ui"`}</CodeBlock>
      </div>
    </Section>
  )
}

/** Where the component comes from in the products, so the reference is on the page. */
export function Source({ children }: { children: React.ReactNode }) {
  return (
    <Section title="Where it comes from">
      <div
        data-ai="p"
        className="max-w-[46rem] text-body text-ink-secondary [&_code]:rounded-xs [&_code]:bg-w07 [&_code]:px-1.5 [&_code]:font-mono [&_code]:text-[0.875em] [&_code]:text-ink"
      >
        {children}
      </div>
    </Section>
  )
}

export function A11y({ items }: { items: string[] }) {
  return (
    <Section title="Accessibility">
      <ul className="flex max-w-[46rem] list-disc flex-col gap-1.5 pl-5 text-body text-ink-secondary">
        {items.map((t) => (
          <li key={t} data-ai="li">
            {t}
          </li>
        ))}
      </ul>
    </Section>
  )
}

/** A labelled row of examples. */
export function Row({ label, children }: { label: string; children: React.ReactNode }) {
  // "brand: the one primary" names a prop value, so the value reads as code and the rest as its meaning.
  const m = /^([a-z]+): (.+)$/.exec(label)
  return (
    <div className="flex flex-col gap-3">
      <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-2xs font-semibold text-ink-secondary">
        {m ? (
          <>
            <code className="rounded-xs bg-w07 px-1.5 py-0.5 font-mono text-[0.6875rem] font-medium text-ink">{m[1]}</code>
            <span>{m[2]}</span>
          </>
        ) : (
          label
        )}
      </p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}
