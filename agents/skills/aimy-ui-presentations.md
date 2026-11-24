---
name: aimy-ui-presentations
description: Make a presentation (a deck) for an AiMY team from a brief, notes, a document or data, with AiMY UI's HorizonDeck, LanesDeck or ChaptersDeck, ready to present with speaker notes. Use when asked for a presentation, deck, slides, a keynote, an all-hands, a launch, a review, a retrospective, an update, a proposal, a plan, a pitch or a training.
---

# Make a presentation with AiMY UI

A deck is a talk given aloud, one slide at a time. It is not a document on a screen. Each slide holds one idea in a few large words; the presenter says everything else, and everything else goes in the notes. Most of the work is deciding what the room should remember and cutting the rest.

The library has three templates. Two tell a story on a timeline (`HorizonDeck`, `LanesDeck`: a cover, moments in time order, a close); one is organised by topic (`ChaptersDeck`: a cover, parts with their slides, a close). Each draws every slide, the agenda or timeline and the motion itself. Never lay slides out by hand, never add your own slide markup around them, and never put a list on a slide.

## 1. Take the latest AiMY UI

Once per session: compare the project's `@flairstech-aimy/ui` with `npm view @flairstech-aimy/ui version`. If it is behind, read {{SITE}}/whats-new/ and update ui and tokens together (`pnpm up @flairstech-aimy/ui@latest @flairstech-aimy/tokens@latest`). Speaker notes, figure units and the deck checks need 2.1.3 or later; `ChaptersDeck` needs 2.1.4 or later.

## 2. Pick the template

Ask one question of the content: **is it organised by time, or by topic?**

- **By time** (what happened, in order, on real dates or periods):
  - **`HorizonDeck`** when it is told to a room as a story: launches, all-hands, kick-offs, a year in review. One headline per slide; the orb travels a horizon of moments.
  - **`LanesDeck`** when every moment is something learned and something done about it: retrospectives, monthly and quarterly updates, post-mortems. Past columns stay on screen so the room can read back.
- **By topic** (an argument, a subject, a decision, a how-to):
  - **`ChaptersDeck`**: proposals, plans, pitches, business cases, trainings and onboarding, a review of one subject ("search quality"), anything that ends in a decision. The talk is split into parts, each opening with a divider; the agenda stays on screen in a rail, and its slides are statements, points, figures, before and after, quotes and choices.
- **Neither** when the thing is meant to be read alone, is mostly a table, or is a long list (a report, a manual, a backlog). Say so and stop: that is a page (`DocPage`, `DataTable`), not a deck.

When it could be either, choose by what the room has to do afterwards. If they only need to know what happened, use a timeline deck. If they have to understand something, decide or act, use Chapters. A launch told as "how we got here" is Horizon; a launch pitched as "why this, what it does, the proof, the ask" is Chapters. A review of July to September is Lanes; a review of search quality is Chapters.

## 3. Write the story before any code

1. Write the one sentence the room should leave with. It becomes the close.
2. **Timeline decks:** choose two to seven moments; five reads best. The horizon holds seven at most; the lanes hold twelve, but every extra moment is another minute of talking.
3. Order them in time. Common shapes:
   - **Launch:** why we built it, then one moment for each thing that matters most (three at most), then the proof as figures, then when it arrives, then the close with the ask.
   - **Review:** one moment per period (July, August, September) or per finding, each with what we learned and what we did.
   - **Plan:** where we are today, then each step with its date, then the close with what we need.
4. **Chapters:** choose two to five parts (three or four read best), each the answer to one question, with one to five slides each. Common shapes:
   - **Proposal or business case:** Why now, What changes, The proof, The decision.
   - **Plan:** Where we are, Where we're going, How we get there, What we need.
   - **Pitch:** The problem, Our answer, Why it works, The ask.
   - **Training:** What it is, How to use it, What to watch for, Where to get help.
   - **Review of a subject:** What we found, What it means, What we'll do.
5. Cut. Whatever doesn't earn a moment or a slide goes in a nearby slide's notes. When the brief has more points than fit, merge the closest ones (two features in one moment, the dates of a rollout in one) and keep the rest for the notes.

## 4. Tell it as a story

A timeline deck is a sequence of events, so write it as one. A Chapters deck follows an argument instead of a calendar (the problem, the answer, the proof, the ask), and everything below applies to it too: each slide leads to the next, titles say what happened or what is true, and it stays plain. Each moment is something that happened (or will happen) to someone, and each one leads to the next. The room should be able to retell it afterwards: this was the problem, this is what we did, this is what changed, this is what comes next. Keep it plain and factual; the story is in the order and the links, not in decoration.

- **Moments are events, not topics.** A title says who did what, or what happened: "Reps lost 40% of their day to data entry", not "Data entry overhead"; "EMEA moves first, on 1 December", not "Rollout plan". In Chapters, a slide's title is its point: "Agents spend a third of every call looking for the answer", not "The problem". Only the parts have topic names ("Why now", "The proof"), because they are the agenda.
- **Give it people.** Name who it happened to or who acted: reps, the pilot teams, the Knowledge team, people asking questions. Never a real person's name unless the brief gives it for the slide.
- **Follow one thread.** Start with the situation or the problem, show what was tried and what it changed, and end where the room comes in (the close). Every moment should answer "and then what?" from the one before.
- **Link the moments.** Let cause and effect show: "so", "then", "after that", "which is why". The links mostly live in the notes ("That's why, in August, we…"); a title can carry one when it is short.
- **Keep the tense of the timeline.** Past for what happened, present for where we are now, future for what comes next. Don't mix them inside one moment.
- **Let the turn land.** The story has one turning point (the pilot results, the month the number moved). Give it its own moment, usually a figure, and let the next moment show what changed because of it.
- **Stay grounded.** No fairy-tale openings ("Once upon a time", "It all began"), no "journey", "chapter one" or "the hero", no cliffhangers or rhetorical questions on slides, no hype ("game-changing", "revolutionary"), and no invented drama or quotes. If a sentence would sound odd said aloud in a work meeting, rewrite it.

A launch, told as events:

- Why: "Reps lost 40% of their day to data entry."
- Calls & emails: "Now calls and emails log themselves."
- Pilot (the turn): 23% win rate, "up from 18% after six weeks with three teams".
- EMEA: "EMEA moves first, on 1 December."
- Close: "Your day, back." with the ask.

The same launch as topics, which is what to avoid: "The problem", "New features", "Results", "Timeline", "Next steps".

## 5. Write each part

Short is the rule; the deck checks the numbers below for you (step 9).

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

### Chapters parts and slides

- **Cover:** as above; `when` shows on the cover and at the foot of the rail with the kicker.
- **Part:** `title` is its name in the agenda and the rail, one to three words (under 24 characters). `holds` is one line on its divider saying what the part answers (under 70). `slides` holds one to five slides.
- **`statement`:** one idea, large. `title` under 80 characters (three lines), `sub` one line under it (under 110). Use it to open a part with its point.
- **`points`:** two or three things that each matter, side by side, never four. Each has a `head` (under 24 characters), a `line` (under 70) and a Lucide `icon` (the component itself: `icon: Search`). More than three is a list: split it or say it aloud.
- **`figures`:** one to three, each a figure as below. The `title` says what they show together.
- **`compare`:** before and after, two to four rows, each side under 32 characters. `before` and `after` name the columns ("Today", "With Knowledge").
- **`quote`:** someone's own words, under 120 characters, exactly as said, and `who` as a role ("An account manager in the pilot"), never a name the brief doesn't give. Never write a quote nobody said.
- **`choice`:** two options for the room to decide, each with a `name` (under 28 characters) and up to three `lines` (under 48 each). Mark the one you recommend with `recommended: true`, and say why in the notes. Use it when the talk ends in a decision; the close then asks for it.
- **`agenda`:** on by default, built from the parts. Leave it on unless the talk has only two parts.

## 6. Lists, asks and everything else

- **Several things that each matter** (three features, three regions): a moment each when the count allows; they can share a `when`. When it doesn't, one moment names them all, the first in the title and the rest in the body, as the example below does with the rollout. In Chapters, two or three of them are a `points` slide.
- **Options to decide between:** a `choice` slide in Chapters, two options, one recommended. On a timeline deck, the decision goes in the close.
- **Several things to mention:** one sentence in a body, or the notes.
- **Several asks:** the most important is the close's `action`; the next goes in the close's `sub` ("Book a training session, and tell us what breaks in #sales-v3.").
- **Priorities ahead:** in a review, one sentence in the close's `sub` ("Next quarter: offline mode, admin analytics and Arabic."), or their own moments with `when: "Next"`.
- **Detail, sources, caveats, the long version of a number:** the notes.

## 7. Write the notes

Give every slide `notes`: what to say, in full sentences, as the presenter would say it. Put there the detail you cut, where each number comes from, and the line that leads to the next slide. Notes never appear on the slides. Any notes add a **Speaker view** button beside Present: it opens the presenter's own window with this slide's notes, what comes next and a clock, and its arrow keys move the deck.

## 8. Put it on a page

The deck is the page's content. It fills the width of whatever holds it and keeps 16:9, so put it straight into the app's content column (the shell sets the width; about 1200px reads best) with nothing between its slides and its controls. Don't put it in a card, beside other content, or in a dialog, and add no CSS of your own.

Keep the story in its own module (`story.ts`, exporting it) and import it into the page, so a test can check it. A timeline deck:

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

A Chapters deck, from a brief for a proposal (every word from the brief):

```tsx
// story.ts
import { FileCheck, Phone, Search } from "lucide-react"
import type { ChaptersStory } from "@/components/chapters-deck"

const story: ChaptersStory = {
  cover: { kicker: "Proposal · Customer Support", title: "Give Support answers in seconds, not minutes.", when: "3 December 2026", notes: "…" },
  parts: [
    { title: "Why now", holds: "What searching costs us today", slides: [
      { kind: "statement", title: "Agents spend a third of every call looking for the answer.", notes: "…" },
      { kind: "figures", title: "What searching costs today", figures: [
        { value: 11, suffix: "min", means: "to answer a question, against the 7-minute target Support set" },
        { value: 34, suffix: "%", means: "of call time goes on searching, not talking" },
      ] },
    ] },
    { title: "What changes", slides: [
      { kind: "points", title: "What AiMY Knowledge gives every agent", points: [
        { icon: Search, head: "One search", line: "Every wiki, drive and past ticket, asked once." },
        { icon: FileCheck, head: "Answers with sources", line: "Each answer cites the policy it came from." },
        { icon: Phone, head: "Inside the call", line: "It sits in the call screen, not another tab." },
      ] },
    ] },
    { title: "The decision", slides: [
      { kind: "choice", title: "Two ways to roll it out", options: [
        { name: "Everyone in January", lines: ["All 60 agents start on 12 January"] },
        { name: "Tier 1 first", recommended: true, lines: ["Tier 1 in January, tier 2 in February"] },
      ], notes: "Recommend tier 1 first, and say why." },
    ] },
  ],
  close: { title: "Answers in", turn: "seconds.", sub: "Approve tier 1 first, and we start on 12 January.", action: { label: "Approve the rollout" } },
}

export default story

// story.test.ts
import { chaptersProblems } from "@/components/chapters-deck"
test("the proposal deck has no problems", () => expect(chaptersProblems(story)).toEqual([]))
```

## 9. Check it

- **The story:** `deckProblems(story, "horizon")` (or `"lanes"`, from `@/components/deck`) or `chaptersProblems(story)` (from `@/components/chapters-deck`) returns every problem as a sentence. It must return `[]`; put it in a unit test, as above.
- **The drawn slides:** in development the deck measures every slide once its fonts load. Words that run into the horizon, the orb, the header, the rail or off the slide (down or sideways) are set smaller until they fit (to 70% at most), and it warns in the console (`AiMY deck "…"`) for each one. Pass `onProblems` to collect them yourself. A warning means the slide is smaller than it should be: fix every one by cutting words, never with CSS. Never cut text short to make it fit either: no ellipsis, no line clamp, no `overflow: hidden` on words. A presentation shows every word it has, or loses the word.
- **Look at it:** open the page, click the deck, and step through every slide with the arrow keys, waiting for each to settle. Check both themes and Present. If the `aimy-ui-visual-review` skill is present, run it on the cover, a figure slide and the close.
- **Read it aloud:** if a slide needs its notes to make sense, its title is wrong.

## 10. Presenting

- **Present** takes the deck full screen. Arrows, Space, Page Up and Down, Home and End move it; clicking the left third goes back.
- **Speaker view** opens on the presenter's screen. In a Teams meeting, share the window or screen with the deck, not the speaker view.
- Allow pop-ups for the site if the browser blocks the speaker view; the deck says so when it happens.

## Which component

{{INDEX}}
