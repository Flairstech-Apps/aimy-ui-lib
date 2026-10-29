import type { Metadata } from "next"
import { PageHeader, Section, ThemePair } from "@/components/docs/page"
import { raw } from "@/lib/tokens"

export const metadata: Metadata = { title: "Elevation" }

const LEVELS = [
  ["sm", "Cards at rest"],
  ["md", "Hovered cards, popovers"],
  ["lg", "Menus, toasts"],
  ["xl", "Dialogs, the composer bar"],
] as const

export default function ElevationPage() {
  return (
    <>
      <PageHeader
        title="Elevation"
        lead="Dark gains elevation by getting lighter: a raised card is a lighter surface. Light keeps surfaces white and gains elevation through shadow. Same tokens, two strategies."
      />
      <Section title="Shadows in both themes">
        <ThemePair>
          <div className="grid grid-cols-2 gap-5">
            {LEVELS.map(([name, use]) => (
              <div key={name} className="rounded-xl border border-edge bg-card p-4" style={{ boxShadow: `var(--shadow-${name})` }}>
                <p className="font-mono text-xs font-semibold text-ink">shadow-{name}</p>
                <p className="mt-1 text-meta text-ink-secondary">{use}</p>
              </div>
            ))}
          </div>
        </ThemePair>
        <div className="mt-4 flex flex-col gap-1">
          {LEVELS.map(([name]) => (
            <p key={name} className="font-mono text-2xs text-ink-secondary">
              --shadow-{name}: dark {raw(`--shadow-${name}`, "dark")} · light {raw(`--shadow-${name}`, "light")}
            </p>
          ))}
        </div>
      </Section>
      <Section title="Surfaces by height" lead="body, then card, then raised. In dark each step is lighter; in light card and raised are both white.">
        <ThemePair>
          <div className="rounded-xl bg-body p-4">
            <p className="text-meta text-ink-secondary">bg-body</p>
            <div className="mt-3 rounded-lg border border-edge bg-card p-4">
              <p className="text-meta text-ink-secondary">bg-card</p>
              <div className="mt-3 rounded-lg border border-edge bg-raised p-4 shadow-lg">
                <p className="text-meta text-ink-secondary">bg-raised</p>
              </div>
            </div>
          </div>
        </ThemePair>
      </Section>
    </>
  )
}
