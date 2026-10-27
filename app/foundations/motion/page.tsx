import type { Metadata } from "next"
import { DurationDemo, EasingDemo, IconSwapDemo } from "@/components/docs/motion-demos"
import { Code, DoDont, PageHeader, Section } from "@/components/docs/page"
import { motion } from "@/lib/tokens"

export const metadata: Metadata = { title: "Motion" }

const DURATIONS = [
  ["--duration-stagger", "--t-stagger", "The offset between items in a list that enters together"],
  ["--duration-micro", "--t-intent", "Tooltip delay, one segment of a shake"],
  ["--duration-quick", "--t-fast", "Closing a menu or dialog, swapping text, showing a tooltip"],
  ["--duration-fast", "--t-base", "Opening a menu or dialog, swapping an icon, sliding tabs"],
  ["--duration-medium", "--t-medium", "Closing a panel or a toast"],
  ["--duration-slow", "--t-slow", "Opening a panel, revealing loaded content"],
  ["--duration-very-slow", "--t-emphasis", "Emphasis: a badge arriving, a success check"],
] as const

const EASINGS = [
  ["--ease-smooth-out", "Opening, closing, sliding, resizing. Also --ease-out."],
  ["--ease-in-out", "Swapping one icon or word for another"],
  ["--ease-linear", "Shimmer, skeleton pulse, spinners: anything that loops"],
  ["--ease-bounce", "A badge popping in"],
  ["--ease-spring", "A control settling after a press"],
] as const

export default function MotionPage() {
  return (
    <>
      <PageHeader
        title="Motion"
        lead="Every transition and animation comes from transitions.dev: its motion tokens, and its snippets pasted as written. Pick a token by the job it names, not by the number."
      />

      <Section title="Durations" lead="Opening is slower than closing; a panel is slower than a menu. Knowledge already uses these values under the --t-* names, so both names work.">
        <DurationDemo rows={DURATIONS.map(([token, alias, use]) => ({ token, alias, use, value: motion(token) }))} />
      </Section>

      <Section title="Easings">
        <EasingDemo rows={EASINGS.map(([token, use]) => ({ token, use, value: motion(token) }))} />
      </Section>

      <Section
        title="Distance, scale and blur"
        lead="How far, how small and how soft things start. A pressed control scales to --scale-medium (0.97), which both products already use."
      >
        <div className="grid gap-3 column:grid-cols-3">
          {[
            ["Distance", ["--distance-micro", "--distance-small", "--distance-base", "--distance-medium", "--distance-large"]],
            ["Scale", ["--scale-large", "--scale-medium", "--scale-small", "--scale-tiny"]],
            ["Blur", ["--blur-small", "--blur-medium", "--blur-large"]],
          ].map(([label, tokens]) => (
            <div key={label as string} className="rounded-xl border border-hairline p-5">
              <p className="text-meta font-semibold text-ink">{label as string}</p>
              {(tokens as string[]).map((t) => (
                <p key={t} className="mt-1 font-mono text-2xs text-ink-secondary">
                  {t} <span className="text-ink">{motion(t)}</span>
                </p>
              ))}
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Transitions"
        lead="Each component uses one named transitions.dev snippet, shipped in @flairstech-aimy/tokens/transitions.css. The list grows as components land."
      >
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-hairline p-5">
          <IconSwapDemo />
          <p className="text-meta text-ink-secondary">
            Icon swap (09). Used by the theme toggle; later by send and stop in the composer, and copy and copied.
          </p>
        </div>
      </Section>

      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Animate transform and opacity (and filter for blur). Name the properties: transition-[transform,opacity]."
            dontText="Write transition-all, or a raw duration like duration-200. The build rejects both."
          />
          <DoDont
            doText="Give every animation a reason: it shows where something came from, that something changed, or that a press landed."
            dontText="Add motion that only decorates, or loops that never stop for no reason."
          />
          <DoDont
            doText="Keep the snippet's prefers-reduced-motion block. Reduced motion turns off shimmer, pulses, spinners and lifts."
            dontText="Strip the reduced-motion guard to make a demo look smoother."
          />
        </div>
        <p className="mt-4 text-meta text-ink-secondary">
          One name differs from transitions.dev: there, <Code>--ease-out</Code> is the plain ease-out keyword. In AiMY it
          has always meant the smooth-out curve, so that meaning is kept.
        </p>
      </Section>
    </>
  )
}
