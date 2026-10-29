import type { Metadata } from "next"
import { Code, DoDont, PageHeader, Section } from "@/components/docs/page"
import { contrast, raw, resolve, type ThemeName } from "@/lib/tokens"

export const metadata: Metadata = { title: "Colour" }

type Swatch = { token: string; cls: string; note: string; kind: "fill" | "ink" | "mark" }

const SURFACES: Swatch[] = [
  { token: "--body-bg", cls: "bg-body", note: "The page", kind: "fill" },
  { token: "--card-bg", cls: "bg-card", note: "Cards and panels", kind: "fill" },
  { token: "--card-bg-raised", cls: "bg-raised", note: "Raised: menus, hover on cards", kind: "fill" },
  { token: "--surface-sunken", cls: "bg-sunken", note: "Wells and recessed strips", kind: "fill" },
  { token: "--glass-bg", cls: "bg-glass", note: "The canvas overlay and floating bars", kind: "fill" },
  { token: "--scrim", cls: "bg-scrim", note: "Behind dialogs", kind: "fill" },
  { token: "--code-bg", cls: "bg-code", note: "Code blocks; stays dark in both themes", kind: "fill" },
]

const INKS: Swatch[] = [
  { token: "--ink-primary", cls: "text-ink", note: "Headings, values, the main words", kind: "ink" },
  { token: "--ink-secondary", cls: "text-ink-secondary", note: "Body copy and descriptions", kind: "ink" },
  { token: "--ink-quiet", cls: "text-ink-quiet", note: "The quietest text allowed: labels, meta", kind: "ink" },
  { token: "--ink-placeholder", cls: "text-ink-placeholder", note: "Placeholders only, never a label", kind: "ink" },
  { token: "--ink-action", cls: "text-ink-action", note: "An action written as words", kind: "ink" },
  { token: "--text-link", cls: "text-link", note: "Links", kind: "ink" },
  { token: "--ink-faint", cls: "text-ink-faint", note: "Glyphs and ambience. Never words.", kind: "mark" },
  { token: "--ink-rule", cls: "text-ink-rule", note: "Hairline glyphs and dividers. Never words.", kind: "mark" },
]

const BRAND: Swatch[] = [
  { token: "--brand", cls: "bg-brand", note: "The one filled primary per surface; focus rings", kind: "fill" },
  { token: "--brand-hover", cls: "bg-brand-hover", note: "Primary on hover", kind: "fill" },
  { token: "--accent", cls: "bg-accent", note: "The product accent (Sales' violet)", kind: "fill" },
  { token: "--accent-text", cls: "text-accent-text", note: "Accent as words", kind: "ink" },
  { token: "--cyan", cls: "bg-cyan", note: "Secondary accent", kind: "fill" },
  { token: "--cyan-text", cls: "text-cyan-text", note: "Cyan as words", kind: "ink" },
  { token: "--ai-ink", cls: "text-ai-ink", note: "The readable member of the AI gradient", kind: "ink" },
]

const STATUS: Swatch[] = [
  { token: "--ok", cls: "bg-ok", note: "Done, decided, good: marks and dots", kind: "mark" },
  { token: "--ok-text", cls: "text-ok-text", note: "Success as words", kind: "ink" },
  { token: "--ok-bg", cls: "bg-ok-bg", note: "Success ground", kind: "fill" },
  { token: "--warn", cls: "bg-warn", note: "Needs attention: marks and dots", kind: "mark" },
  { token: "--warn-text", cls: "text-warn-text", note: "Warning as words", kind: "ink" },
  { token: "--warn-bg", cls: "bg-warn-bg", note: "Warning ground", kind: "fill" },
  { token: "--err", cls: "bg-err", note: "Wrong or failed: marks and dots", kind: "mark" },
  { token: "--err-text", cls: "text-err-text", note: "Error as words", kind: "ink" },
  { token: "--err-bg", cls: "bg-err-bg", note: "Error ground", kind: "fill" },
  { token: "--err-strong", cls: "bg-err-strong", note: "The alarm: destructive confirms only", kind: "fill" },
  { token: "--info", cls: "bg-info", note: "Information: marks and dots", kind: "mark" },
  { token: "--info-text", cls: "text-info-text", note: "Information as words", kind: "ink" },
  { token: "--info-bg", cls: "bg-info-bg", note: "Information ground", kind: "fill" },
]

const EDGES: Swatch[] = [
  { token: "--w07", cls: "border-hairline", note: "The hairline: dividers and control edges", kind: "fill" },
  { token: "--card-border", cls: "border-edge", note: "Card and control edges", kind: "fill" },
  { token: "--card-border-hover", cls: "border-edge-hover", note: "Edge on hover", kind: "fill" },
  { token: "--card-border-focus", cls: "border-edge-focus", note: "Edge of a focused field", kind: "fill" },
]

const WASH = ["--w02", "--w03", "--w04", "--w05", "--w06", "--w07", "--w08", "--w10", "--w12", "--w14", "--w16", "--w20", "--w25", "--w40", "--w50"]
const RAMP = ["--d950", "--d900", "--d850", "--d800", "--d750", "--d700", "--d600", "--d500", "--d400", "--d300", "--d200", "--d100", "--d50"]

function Ratio({ value, kind }: { value: number | null; kind: Swatch["kind"] }) {
  if (value === null || kind === "fill") return null
  const need = kind === "ink" ? 4.5 : 3
  const pass = value >= need
  return (
    <span className={pass ? "text-ok-text" : "text-err-text"}>
      {value.toFixed(2)}:1 {pass ? `passes ${need}:1` : `below ${need}:1`}
    </span>
  )
}

function Tile({ s, theme }: { s: Swatch; theme: ThemeName }) {
  const value = resolve(s.token, theme)
  const body = resolve("--body-bg", theme)
  const ink = resolve("--ink-primary", theme)
  return (
    <div data-theme={theme} className="flex flex-col gap-2 rounded-lg border border-hairline bg-body p-3">
      <div
        className="flex h-14 items-center justify-center rounded-md border border-hairline text-lg font-semibold"
        style={
          s.kind === "ink"
            ? { background: body, color: value }
            : s.kind === "mark"
              ? { background: body, color: value }
              : { background: value, color: ink }
        }
      >
        {s.kind === "ink" ? "Aa" : s.kind === "mark" ? <span className="size-4 rounded-pill" style={{ background: value }} /> : null}
      </div>
      <p className="font-mono text-2xs text-ink-secondary">{raw(s.token, theme)}</p>
      <p className="text-2xs">
        <Ratio value={contrast(value, "--body-bg", theme)} kind={s.kind} />
      </p>
    </div>
  )
}

function Group({ items }: { items: Swatch[] }) {
  return (
    <div className="flex flex-col divide-y divide-hairline rounded-xl border border-hairline">
      {items.map((s) => (
        <div key={s.token} className="grid items-center gap-4 p-4 column:grid-cols-[1fr_11rem_11rem]">
          <div>
            <p className="font-mono text-xs font-semibold text-ink">{s.token}</p>
            <p className="mt-1 text-meta text-ink-secondary">{s.note}</p>
            <p className="mt-1 text-2xs text-ink-quiet">
              Tailwind <Code>{s.cls}</Code>
            </p>
          </div>
          <Tile s={s} theme="dark" />
          <Tile s={s} theme="light" />
        </div>
      ))}
    </div>
  )
}

function Strip({ tokens }: { tokens: string[] }) {
  return (
    <div className="flex flex-col gap-3">
      {(["dark", "light"] as const).map((theme) => (
        <div key={theme} data-theme={theme} className="rounded-xl border border-hairline bg-body p-4">
          <p className="mb-3 text-2xs font-semibold text-ink-quiet">{theme === "dark" ? "Dark" : "Light"}</p>
          <div className="grid grid-cols-5 gap-2 canvas:grid-cols-8 rail:grid-cols-[repeat(15,minmax(0,1fr))]">
            {tokens.map((t) => (
              <div key={t} className="flex flex-col gap-1">
                <div className="h-10 rounded-sm border border-hairline" style={{ background: resolve(t, theme) }} />
                <p className="font-mono text-2xs text-ink-secondary">{t.slice(2)}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ColorPage() {
  return (
    <>
      <PageHeader
        title="Colour"
        lead="Colour marks an outcome. A hue means something was decided or something is wrong; it never names a category or a stage. Every value below is read from the shipped tokens, in both themes, with its contrast on the page ground."
      />

      <Section title="The rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Say a state in words and colour together: a tag that reads Failed, in the error ink."
            dontText="Show a state by fading the text. A state you can only see as low contrast is a state you can't read."
          />
          <DoDont
            doText="Use the -text ink when a status hue carries words; the plain hue is for marks, dots and edges."
            dontText="Set a sentence in --ok or --warn in light theme. They are grounds and marks, not sentences."
          />
          <DoDont
            doText="Show emphasis on a block with a tinted ground: about 15% of the hue."
            dontText="Draw a coloured stripe down the left edge of a block."
          />
        </div>
      </Section>

      <Section title="Surfaces" lead="Dark gains elevation by getting lighter; light keeps surfaces white and gains it through shadow.">
        <Group items={SURFACES} />
      </Section>

      <Section
        title="Ink"
        lead="Words bottom out at ink-quiet. ink-faint and ink-rule are for hairlines and glyphs; the build rejects them on text."
      >
        <Group items={INKS} />
      </Section>

      <Section title="Brand, accent and AI">
        <Group items={BRAND} />
        <div className="mt-4 grid gap-3 column:grid-cols-2">
          {(["dark", "light"] as const).map((theme) => (
            <div key={theme} data-theme={theme} className="rounded-xl border border-hairline bg-body p-4">
              <div className="h-12 rounded-md" style={{ background: resolve("--ai", theme) }} />
              <p className="mt-2 font-mono text-2xs text-ink-secondary">--ai: the AI gradient. Decoration only, never behind words.</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Status"
        lead="Full-strength hues so a verdict reads at a glance. Status is always colour plus a word or an icon, never colour alone."
      >
        <Group items={STATUS} />
      </Section>

      <Section title="Edges" lead="A control has an edge, a label has a fill, a link has neither.">
        <Group items={EDGES} />
      </Section>

      <Section
        title="Wash ramp"
        lead="Every subtle fill, hairline and hover goes through this ramp. Dark washes light onto a dark ground; light washes navy onto a light one. Tailwind: bg-w05, border-w08 and so on."
      >
        <Strip tokens={WASH} />
      </Section>

      <Section title="Neutral ramp" lead="The navy-tinted ramp the roles are built from. Reach for a role first; use the ramp only when no role fits.">
        <Strip tokens={RAMP} />
      </Section>
    </>
  )
}
