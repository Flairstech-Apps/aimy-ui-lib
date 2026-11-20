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
      <Section
        title="Your settings"
        lead="Nothing changes by default. When a person turns a setting on in Windows or the browser, every part follows it (settings.css)."
      >
        <ul data-ai="li" className="flex max-w-[46rem] list-disc flex-col gap-1.5 ps-5 text-body text-ink-secondary">
          <li>
            <b className="text-ink">High contrast</b> (forced colours): focus is always an outline; the chosen, current or
            checked item takes the system&apos;s selection colours; switches, checkboxes, bars and meters keep an edge;
            charts keep their own colours.
          </li>
          <li>
            <b className="text-ink">Reduced motion</b>: nothing moves on its own; a loading spinner still turns.
          </li>
          <li>
            <b className="text-ink">More contrast</b>: secondary and quiet ink step up, edges and rules get stronger.
          </li>
          <li>
            <b className="text-ink">Less transparency</b>: glass and blur become solid grounds.
          </li>
          <li>
            <b className="text-ink">Keys</b>: F6 and Shift+F6 move between the bar, the side navigation, the rail and the
            page.
          </li>
        </ul>
      </Section>
    </>
  )
}
