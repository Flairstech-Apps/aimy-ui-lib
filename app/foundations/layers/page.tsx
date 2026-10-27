import type { Metadata } from "next"
import { Code, PageHeader, Section } from "@/components/docs/page"
import { layers } from "@/lib/tokens"

export const metadata: Metadata = { title: "Layers" }

const USE: Record<string, string> = {
  "--z-loading": "A loading overlay over its own region",
  "--z-float": "The composer bar and the canvas overlay",
  "--z-popover": "Popovers and coach marks",
  "--z-menu": "Menus",
  "--z-tooltip": "Tooltips",
  "--z-dropdown": "Dropdown panels",
  "--z-preview": "Citation previews",
  "--z-modal": "Dialogs and their scrim",
  "--z-toast": "Toasts, always on top",
}

export default function LayersPage() {
  const z = layers().filter(([k]) => k.startsWith("--z-"))
  return (
    <>
      <PageHeader
        title="Layers"
        lead="What sits on top of what. Sales and Knowledge use these exact numbers today as literals; the library names them by job. Use the token, never a new number."
      />
      <Section title="The stack, bottom to top">
        <div className="flex flex-col divide-y divide-hairline rounded-xl border border-hairline">
          {z.map(([token, value]) => (
            <div key={token} className="grid items-center gap-2 p-4 column:grid-cols-[14rem_5rem_1fr]">
              <p className="font-mono text-xs font-semibold text-ink">{token}</p>
              <p className="font-mono text-xs text-ink-secondary">{value}</p>
              <p className="text-meta text-ink-secondary">{USE[token]}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-meta text-ink-secondary">
          In Tailwind: <Code>z-(--z-modal)</Code>. These names are new in the library and are flagged to the design-system
          repo, which doesn&apos;t define layers yet.
        </p>
      </Section>
    </>
  )
}
