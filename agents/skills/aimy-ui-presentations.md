---
name: aimy-ui-presentations
description: Make a presentation (a deck) for an AiMY team from a brief, notes, a document or data, with AiMY UI's HorizonDeck or LanesDeck, ready to present with speaker notes. Use when asked for a presentation, deck, slides, a keynote, an all-hands, a launch, a review, a retrospective or an update.
---

# Make a presentation with AiMY UI

A deck is a story told aloud, one moment at a time. It is not a document on a screen. Each slide holds one idea in a few large words; the presenter says everything else, and everything else goes in the notes. Most of the work is deciding what the room should remember and cutting the rest.

The library has two templates. Both take a story (a cover, the moments in order, a close) and draw every slide, the timeline and the motion themselves. Never lay slides out by hand, never add your own slide markup around them, and never put a list on a slide.

## 1. Take the latest AiMY UI

Once per session: compare the project's `@flairstech-aimy/ui` with `npm view @flairstech-aimy/ui version`. If it is behind, read {{SITE}}/whats-new/ and update ui and tokens together (`pnpm up @flairstech-aimy/ui@latest @flairstech-aimy/tokens@latest`). Speaker notes, figure units and the deck checks need 2.1.3 or later.

## 2. Pick the template

- **`HorizonDeck`** for a room listening to one person: keynotes, launches, all-hands, kick-offs. One headline per slide, a line or two under it at most. The orb travels a horizon of moments.
- **`LanesDeck`** for what we learned and what we did: reviews, retrospectives, monthly and quarterly updates, post-mortems. Each moment is a column, learned above and did below, and past columns stay on screen so the room can read back.
- **Neither** when the thing is meant to be read alone, is mostly a table, or is a long list (a report, a manual, a backlog). Say so and stop: that is a page (`DocPage`, `DataTable`), not a deck.

## 3. Write the story before any code

1. Write the one sentence the room should leave with. It becomes the close.
2. Choose two to seven moments; five reads best. The horizon holds seven at most; the lanes hold twelve, but every extra moment is another minute of talking.
3. Order them in time. Common shapes:
   - **Launch:** why we built it, then one moment for each thing that matters most (three at most), then the proof as figures, then when it arrives, then the close with the ask.
   - **Review:** one moment per period (July, August, September) or per finding, each with what we learned and what we did.
   - **Plan:** where we are today, then each step with its date, then the close with what we need.
4. Cut. Whatever doesn't earn a moment goes in a nearby moment's notes, not on a slide. When the brief has more than seven points for the horizon, merge the closest ones (two features in one moment, the dates of a rollout in one) and keep the rest for the notes.

## 4. Write each part

Short is the rule; the deck checks the numbers below for you (step 7).

- **Cover:** `kicker` names the occasion in a few words ("All-hands · Sales v3", under 48 characters). `title` is the deck's claim in two lines at most (under 60). `sub` is one line (under 110). `when` shows top right: the day it is presented when the brief gives it, or for a review the period it covers ("Q3 2026"). Leave it out rather than work it out.
- **`chapter`:** the moment's name on the timeline, one to three words, under 22 characters: "Why", "Call summaries", "Pilot", "EMEA".
- **`when`:** a real date or period from the brief, in one format across the deck ("1 Dec", "July", "Q3", "Today", "Next"). Leave it out when there isn't one. Never invent a date to fill the field; moments without one still sit in order on the timeline.
- **Horizon `title`:** one claim in plain words, two lines at most (under 64 characters). **`body`:** at most two lines (under 130), or nothing.
- **Lanes `learned` and `did`:** one or two sentences each, three lines at most (under 150 characters). `did` is what was actually done. When nothing was done yet, write "Next: …"; when nothing changed that period, say so and why ("Nothing new: the lift came from July's citations."). Never invent an action.
- **Figures:** a number that earns its place (`figure: { value, prefix, suffix, means }`).
  - `value` is the number as it is: `92.5`, `1240`, `1.4`. It keeps its decimals and groups thousands when drawn.
  - The unit goes in `prefix` ("$", "£") or `suffix` ("%", "M", "K", "h", "x", "/5"), never in the words.
  - `means` says what it counts and what it is against: "win rate in the pilot teams, up from 18%". Compare it with before, a usual day or a target someone actually set, using only numbers from the brief.
  - When the brief gives nothing to compare with, say what the number means for us instead: the rest of the whole ("of questions search answered; the other 39% got none"), or what it changes ("hours a week back for each rep"). Never invent a baseline or a target. If nothing honest can be said beside it, it is not a figure: put it in a title's words or the notes.
  - On the horizon a figure replaces the title and body; in the lanes it replaces `learned`. Don't pass both: the other is dropped.
- **Close:** `title` plus `turn` fit on one line (under 34 characters together); `turn` is the last word or two, set in AiMY blue ("Knowledge to" + "Action."). `sub` is one line (under 60 on the horizon; two lines, under 110, in the lanes). `action` is the one thing to do next, with a real `href` (ask for it, or leave the href out; never invent a link), and `where` says where to find it when the brief does. When the room is asked for nothing (a review), leave the action out.

## 5. Lists, asks and everything else

- **Several things that each matter** (three features, three regions): a moment each when the count allows; they can share a `when`. When it doesn't, one moment names them all, the first in the title and the rest in the body, as the example below does with the rollout.
- **Several things to mention:** one sentence in a body, or the notes.
- **Several asks:** the most important is the close's `action`; the next goes in the close's `sub` ("Book a training session, and tell us what breaks in #sales-v3.").
- **Priorities ahead:** in a review, one sentence in the close's `sub` ("Next quarter: offline mode, admin analytics and Arabic."), or their own moments with `when: "Next"`.
- **Detail, sources, caveats, the long version of a number:** the notes.

## 6. Write the notes

Give every slide `notes`: what to say, in full sentences, as the presenter would say it. Put there the detail you cut, where each number comes from, and the line that leads to the next slide. Notes never appear on the slides. Any notes add a **Speaker view** button beside Present: it opens the presenter's own window with this slide's notes, what comes next and a clock, and its arrow keys move the deck.

## 7. Put it on a page

The deck is the page's content. It fills the width of whatever holds it and keeps 16:9, so put it straight into the app's content column (the shell sets the width; about 1200px reads best) with nothing between its slides and its controls. Don't put it in a card, beside other content, or in a dialog, and add no CSS of your own.

Keep the story in its own module (`story.ts`, exporting it) and import it into the page, so a test can check it.

```tsx
// story.ts
import type { HorizonStory } from "@/components/horizon-deck"


// The brief: "Launch Sales v3 at the all-hands. Reps spent 40% of their day on data entry. New: AI call
// summaries. Pilot: win rate up from 18% to 23%, $1.4M pipeline added in six weeks by three teams.
// Rollout: EMEA 1 Dec, US 12 Jan, APAC 2 Feb. Ask: book training; feedback in #sales-v3."
// Every word below comes from it; nothing is invented.
const story: HorizonStory = {
  cover: { kicker: "All-hands · Sales v3", title: "Sales v3 gives reps their day back.", notes: "Open with where reps' time goes today." },
  moments: [
    { chapter: "Why", figure: { value: 40, suffix: "%", means: "of a rep's day goes on data entry instead of selling" }, notes: "…" },
    { chapter: "Call summaries", title: "Every call is summarised before you hang up.", notes: "…" },
    { chapter: "Pilot", figure: { value: 23, suffix: "%", means: "win rate in the pilot teams, up from 18%" }, notes: "…" },
    { chapter: "Pilot", figure: { value: 1.4, prefix: "$", suffix: "M", means: "pipeline added in six weeks by three teams" }, notes: "…" },
    { when: "1 Dec", chapter: "EMEA", title: "EMEA moves first, on 1 December.", body: "The US follows on 12 January and APAC on 2 February.", notes: "…" },
  ],
  close: { title: "Your day,", turn: "back.", sub: "Book a training session, and tell us what breaks in #sales-v3.", action: { label: "Book training" }, notes: "…" },
}

export default story

// page.tsx
import { HorizonDeck } from "@/components/horizon-deck"
import story from "./story"

export default function SalesV3AllHands() {
  return <HorizonDeck story={story} />
}

// story.test.ts
import { deckProblems } from "@/components/deck"
import story from "./story"

test("the all-hands deck has no problems", () => expect(deckProblems(story, "horizon")).toEqual([]))
```

## 8. Check it

- **The story:** `deckProblems(story, "horizon")` (or `"lanes"`, from `@/components/deck`) returns every problem as a sentence. It must return `[]`; put it in a unit test, as above.
- **The drawn slides:** in development the deck measures every slide once its fonts load. Words that run into the horizon, the orb, the header or off the slide are set smaller until they fit (to 70% at most), and it warns in the console (`AiMY deck "…"`) for each one. Pass `onProblems` to collect them yourself. A warning means the slide is smaller than it should be: fix every one by cutting words, never with CSS.
- **Look at it:** open the page, click the deck, and step through every slide with the arrow keys, waiting for each to settle. Check both themes and Present. If the `aimy-ui-visual-review` skill is present, run it on the cover, a figure slide and the close.
- **Read it aloud:** if a slide needs its notes to make sense, its title is wrong.

## 9. Presenting

- **Present** takes the deck full screen. Arrows, Space, Page Up and Down, Home and End move it; clicking the left third goes back.
- **Speaker view** opens on the presenter's screen. In a Teams meeting, share the window or screen with the deck, not the speaker view.
- Allow pop-ups for the site if the browser blocks the speaker view; the deck says so when it happens.

## Which component

{{INDEX}}
