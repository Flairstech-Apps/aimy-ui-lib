import type { Metadata } from "next"
import { Code, DoDont, PageHeader, Section } from "@/components/docs/page"
import { raw } from "@/lib/tokens"

export const metadata: Metadata = { title: "Typography" }

const SCALE = [
  ["--fs-2xs", "text-2xs", "Marks: a tag, a count, a timestamp. Never a paragraph."],
  ["--fs-xs", "text-xs", "The smallest sentence."],
  ["--fs-base", "text-base", "Body. The working minimum, where most of the product lives."],
  ["--fs-lg", "text-lg", "A lead line."],
  ["--fs-xl", "text-xl", "Section titles."],
  ["--fs-2xl", "text-2xl", "Page titles in dense views."],
  ["--fs-3xl", "text-3xl", "Page titles."],
  ["--fs-4xl", "text-4xl", "Display."],
  ["--fs-5xl", "text-5xl", "Masthead."],
] as const

const ROLES = [
  ["text-micro", "12 / snug", "Counts, timestamps, tag labels"],
  ["text-meta", "14 / base", "Labels, helper text, table meta"],
  ["text-body", "16 / base", "Paragraphs, descriptions, controls"],
  ["text-title", "20 / tight", "Card and section titles"],
] as const

const WEIGHTS = [
  ["--fw-regular", "font-regular", "Display sizes only (18px and up)"],
  ["--fw-medium", "font-medium", "Body. Anything 16px or under starts here"],
  ["--fw-semibold", "font-semibold", "Labels, buttons, emphasis in a sentence"],
  ["--fw-bold", "font-bold", "Titles: the emphatic one"],
  ["--fw-extrabold", "font-extrabold", "Display numbers"],
] as const

export default function TypographyPage() {
  return (
    <>
      <PageHeader
        title="Typography"
        lead="One face, Poppins, for every word; JetBrains Mono for code. Sizes are even steps with a 12px floor, and neighbouring ranks always differ on at least two of size, weight and ink."
      />

      <Section title="Scale" lead="Each step names what it is for. 12 marks, 14 is the smallest sentence, 16 is the working minimum.">
        <div className="flex flex-col divide-y divide-hairline rounded-xl border border-hairline">
          {SCALE.map(([token, cls, use]) => (
            <div key={token} className="grid items-baseline gap-2 p-4 column:grid-cols-[13rem_1fr]">
              <div>
                <p className="font-mono text-xs font-semibold text-ink">
                  {cls} <span className="text-ink-secondary">{raw(token)}</span>
                </p>
                <p className="mt-1 text-meta text-ink-secondary">{use}</p>
              </div>
              <p className="truncate font-semibold text-ink" style={{ fontSize: `var(${token})`, lineHeight: 1.25 }}>
                Knowledge to action
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Roles" lead="The four text styles Sales and Knowledge share, each with its line height built in.">
        <div className="grid gap-3 column:grid-cols-2">
          {ROLES.map(([cls, spec, use]) => (
            <div key={cls} className="rounded-xl border border-hairline bg-card p-5">
              <p className={`${cls} font-semibold text-ink`}>Three calls need a reply today</p>
              <p className="mt-3 font-mono text-2xs text-ink-secondary">
                {cls} · {spec}
              </p>
              <p className="mt-1 text-meta text-ink-secondary">{use}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Weights"
        lead="Poppins puts down more ink than most faces, so the ladder sits one step lower: font-medium is 400 and font-semibold is 500. This differs from stock Tailwind on purpose."
      >
        <div className="flex flex-col divide-y divide-hairline rounded-xl border border-hairline">
          {WEIGHTS.map(([token, cls, use]) => (
            <div key={token} className="grid items-center gap-2 p-4 column:grid-cols-[13rem_1fr_1fr]">
              <p className="font-mono text-xs font-semibold text-ink">
                {cls} <span className="text-ink-secondary">{raw(token)}</span>
              </p>
              <p className="text-xl text-ink" style={{ fontWeight: `var(${token})` }}>
                Meeting set with Kestrel
              </p>
              <p className="text-meta text-ink-secondary">{use}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Line height and tracking">
        <div className="grid gap-3 column:grid-cols-2">
          <div className="rounded-xl border border-hairline p-5">
            {["--lh-none", "--lh-tight", "--lh-snug", "--lh-base", "--lh-relaxed"].map((t) => (
              <p key={t} className="font-mono text-xs text-ink-secondary">
                leading-{t.slice(5)} <span className="text-ink">{raw(t)}</span>
              </p>
            ))}
          </div>
          <div className="rounded-xl border border-hairline p-5">
            {["--ls-tighter", "--ls-tight", "--ls-normal", "--ls-wide", "--ls-wider"].map((t) => (
              <p key={t} className="font-mono text-xs text-ink-secondary">
                tracking-{t.slice(5)} <span className="text-ink">{raw(t)}</span>
              </p>
            ))}
            <p className="mt-3 text-meta text-ink-secondary">Wide tracking is for capitals only, which need 5 to 12%.</p>
          </div>
        </div>
      </Section>

      <Section title="Case and hierarchy">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Write a tag in sentence case, as the name of a state: Meeting Set, Needs reply."
            dontText="Set tags in capitals. At 12px every capital word becomes the same rectangle."
          />
          <DoDont
            doText="Make a rank differ from its neighbour on two of size, weight and ink: a 20 semibold title over 16 medium body."
            dontText="Separate ranks by one axis only, like 14 against 16 in the same weight and grey. It reads as noise."
          />
          <DoDont
            doText="Use font-mono for code and keys only."
            dontText={`Expect tabular figures. Poppins has none, so tabular-nums does nothing; don't rely on aligned digits.`}
          />
        </div>
        <p className="mt-4 text-meta text-ink-secondary">
          Fonts are self-hosted from @fontsource (weights 300 to 700, 400 italic, mono 400 and 500), loaded by{" "}
          <Code>@flairstech-aimy/tokens</Code>. <Code>--fw-light</Code> (200) has no font file and renders as 300.
        </p>
      </Section>
    </>
  )
}
