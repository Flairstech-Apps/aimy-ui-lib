import type { Metadata } from "next"
import { DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Focus" }

export default function FocusPage() {
  return (
    <>
      <PageHeader
        title="Focus"
        lead="Focus is always the brand blue: a 2px outline, 2px away from the edge, shown for keyboard use only. The theme sets it for every element, so components don't draw their own."
      />
      <Section title="Try it with the Tab key" lead="Press Tab to move through these. The ring appears for keyboard focus, not for mouse clicks.">
        <ThemePair>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="rounded-md bg-brand px-4 py-2 text-xs font-semibold text-on-status">
              Save
            </button>
            <button type="button" className="rounded-md border border-edge px-4 py-2 text-xs font-semibold text-ink">
              Cancel
            </button>
            <a href="#focus-demo" className="text-xs font-semibold text-link">
              View the call
            </a>
            <input
              aria-label="Search contacts"
              placeholder="Search contacts"
              className="rounded-md border border-edge bg-card px-3 py-2 text-xs text-ink placeholder:text-ink-placeholder"
            />
          </div>
        </ThemePair>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Leave focus to the theme: :focus-visible, 2px --brand, offset 2px."
            dontText="Remove the outline, or colour focus with the accent. Focus is never the accent."
          />
          <DoDont
            doText="Keep focus visible on every interactive thing, including custom controls and menu items."
            dontText="Show focus on mouse click. :focus-visible already handles that."
          />
        </div>
      </Section>
    </>
  )
}
