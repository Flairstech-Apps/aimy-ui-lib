## What AiMY UI is

AiMY UI is the component library for AiMY products at FlairsTech. Every component documents what AiMY Sales and AiMY Knowledge already draw; nothing in it is a new design. Build screens from it. If a screen needs something the library does not have, say so and stop; do not invent a component.

Docs, with every component's preview, rules and source notes: https://aimy-ui-lib.aimy.flairstech.com. A plain index for agents is at `/llms.txt` on the same site.

## First, take the latest

At the start of every session that works with AiMY UI, before building or changing anything, check for an update and take it:

1. Read the latest version from the registry: `npm view @flairstech-aimy/ui version` (or `dist-tags.latest` at https://aimy-ui-lib.aimy.flairstech.com/npm/@flairstech-aimy/ui/), and compare it with the version in the project's `package.json` or lockfile.
2. If the project is behind, read the entries since its version on https://aimy-ui-lib.aimy.flairstech.com/whats-new/ and do what any "before you update" line says.
3. Update both packages together with the project's own package manager: `pnpm up @flairstech-aimy/ui@latest @flairstech-aimy/tokens@latest` (or the npm or yarn equivalent).
4. If the project copied components in with shadcn, take the new release with the `aimy-ui-upgrade` skill, so the app's own edits survive. Refresh these rules and the skills with `npx shadcn@latest add https://aimy-ui-lib.aimy.flairstech.com/r/init.json`.
5. Say which version the project was on and which it is on now. If the check can't reach the registry, say so and carry on with the installed version.

## Installing

Installing needs no token. The shadcn commands take everything from the site, including the tokens package. Installing `@flairstech-aimy` packages by name needs one line in the project's `.npmrc`: `@flairstech-aimy:registry=https://aimy-ui-lib.aimy.flairstech.com/npm/`.

- Copy a component into the project (the shadcn way): `npx shadcn@latest add @aimy/<name>`. The project's `components.json` must list the `@aimy` registry.
- Or import from the package: `import { Button } from "@flairstech-aimy/ui"` and `import "@flairstech-aimy/ui/styles.css"`. If the app runs Tailwind itself, also add `@source "<path to>/node_modules/@flairstech-aimy/ui/dist";` to its CSS, or a class the app also uses (`bg-card`, `hidden`) outranks the components' state styles.
- Tokens only (any HTML): `@flairstech-aimy/tokens`.

## Tools for agents

- The AiMY UI MCP server: `claude mcp add --transport http aimy-ui https://aimy-ui-lib.aimy.flairstech.com/mcp`. It searches the components, returns a component's code and install commands, and gives these rules.
- The skills, installed with the rules by `npx shadcn@latest add https://aimy-ui-lib.aimy.flairstech.com/r/init.json`: `aimy-ui` (these rules and the component index), `aimy-ui-build` (build a screen from a brief), `aimy-ui-review` (check a screen's code against these rules), `aimy-ui-visual-review` (check how a screen looks, rendered: alignment, spacing, overflow, contrast, both themes, desk and phone widths, measured with `https://aimy-ui-lib.aimy.flairstech.com/agents/visual-audit.js`) and `aimy-ui-upgrade` (take a new release without losing the app's edits).

## The rules every screen follows

Doctrine, from the AiMY Knowledge-to-Action doctrine and the products:

- Dark by default, with the light theme one toggle away. Use the theme's tokens for every colour, size, radius, shadow and duration; never a raw hex value or an off-scale size.
- Classify every action into one of the four entry modes (prompt, investigate, reviewed action, direct action) with `EntryAction`, and declare the work state of every surfaced item with `WorkState`.
- AI never applies a change silently. A change AiMY proposes is shown for Accept, Edit or Reject (`ChangeReview`, `Suggestion`); a direct action happens at once and ends in a toast with Undo.
- Pair every insight with its next step. A number in a sentence opens the set it counts.
- Generated content, confirmation of a workflow and drill-through go to the AiMY Canvas, not to a new page.
- One-click inline controls with toast undo. No modal, picker, choice list or drag as the only way to do something. Ask before anything destructive with a typed confirmation, never a plain "Are you sure?".
- When space runs out, change a component's form (a drawer, a menu, its own line). Never hide it, and never shrink it past use.
- Mark AI with the AiMY mark (`AimyMark`), never with sparkles.

Accessibility (WCAG 2.2 AA in both themes):

- No muted text. A state is said in words and colour, never by lowering contrast or fading.
- Status is colour plus words or an icon, never colour alone.
- Full keyboard use, the theme's focus ring, correct roles and names. A control made of several parts reads as one sentence.
- Every animation honours `prefers-reduced-motion`. Motion comes from the theme's motion tokens (transitions.dev); never `transition: all`.

Writing:

- Plain English. Say "call", never "ring"; "contacts", never "board" or "book". No sales slang.
- A verb on every button that names the action; never "Open" or "Learn more" when the real action has a name. A card captioned with the page it opens says "Open": the diary door is captioned Diary, so its link is Open.
- Errors say what happened and what to do next.

Moving between pages:

- A product with a few pages (four or five) uses `SideNav`, Sales' tabs, as the first card of the `Rail`: a row per page with its count, and the current page holding AiMY's reading of it (`SideNavRead`). Most AiMY products are this.
- A product with many pages and nested flows uses `SideNav variant="qa"` in AppShell's `nav` slot: each page with its headline figures, collapsing to icons. QA and User Management use it. With no findings to lead with, pass `order="fixed"` so the pages keep their order and the list never reshuffles. Never use it for a handful of pages, and never put both forms in one product.
- Right to left: set `dir="rtl"` (and `lang`) on the page; every part mirrors its layout, arrow keys, drags and arrows. In the app's own classes write the logical forms (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`, `text-start`, `border-s`, `border-e`), never left and right.
- Every product sits on the products' ambient wash. AppShell draws it (`AmbientBackground`, on by default); an app without the shell puts `<AmbientBackground />` first in the body. Never add a second glow, hang one on a card, or animate it.

Phones:

- Set `viewport-fit=cover` in the viewport meta (Next.js: `viewport: { viewportFit: "cover" }`). The shell, the canvas, sheets and toasts then keep clear of the status bar, the home indicator or gesture bar and a landscape notch on their own.
- Anything the app fixes to the screen's edge itself, such as the float bar, adds the matching `--safe-top`, `--safe-bottom`, `--safe-left` or `--safe-right` to its offset. They are 0 on a laptop.

Conversations:

- AiMY's turns in a `Message` carry no mark and take 95% of the thread; only the person's turns show a face. Never add the AiMY mark beside a message.

Results inside a chat reply:

- Every result AiMY draws in a reply sits in a `WidgetFrame`: its name in sentence case, a count or order, Open in the canvas, and a foot that opens the rest. No paginator and no sideways scrolling in a reply.
- Put the widget inside AiMY's `Message`, after its sentence: the frame then draws as a card on AiMY's bubble. Never give a widget its own AiMY mark or a ground of its own.
- People are `CandidateCards`; one person in full is `CandidateProfile`; a ranking whose reason matters is `RankedList`; a tool's table is `ChatTable`; a batch is `UploadResults`. Every score is the Fit badge (`Score`).

Errors and recovery (AIMY-2979):

- Classify every failed request once with `classifyError` and show the matching `RecoveryState`. HTTP codes and raw messages are for logs; they never reach the screen.
- Keep what still works: one failed widget or section never blocks or redirects the page, and a failed save keeps what was typed. Use `display="screen"` only when the app can't draw its shell, and `display="page"` only when nothing on the screen works without what failed.
- Retry at most three times with `status="retrying"`, then show the failed state with its recovery. Never retry forever.
- Tell permission, session and connection apart. Say offline only when the browser confirms it.
- A request that creates, updates, deletes, sends or pays and then times out is `uncertain`: ask people to check, never offer a blind retry.
- An empty result is an `EmptyState`, never a failure; a failed load is never an empty state.

Presentations:

- For a whole presentation, follow the `aimy-ui-presentations` skill (https://aimy-ui-lib.aimy.flairstech.com/skills/aimy-ui-presentations/SKILL.md).
- A deck is a story told aloud: `HorizonDeck` (keynotes, launches, all-hands: a headline and a line or two per slide) or `LanesDeck` (reviews, retrospectives, updates: what we learned above, what we did below). Pass a story: a cover, three to seven moments in time order (five reads best), a close. Never lay slides out by hand, and never make a deck of something meant to be read alone.
- Each moment has a chapter of one to three words. `when` is a real date or period; leave it out rather than invent one. In the lanes, `did` is what was actually done, or "Next: …".
- A figure is the number as it is (`92.5`, `1240`), its unit in `prefix` or `suffix` ("$", "%", "M", "/5"), and `means`: what it counts and what it is against. A figure replaces the title (horizon) or learned (lanes); don't pass both.
- No lists on slides: three things that each matter are three moments; the rest is one sentence or the notes. The close has one action; a second ask goes in its sub.
- Give every slide `notes`: what the presenter says and the detail you cut. They show only in the speaker view.
- `deckProblems(story, kind)` must return nothing, and the deck must log no `AiMY deck` warnings. Fix them by cutting words, never by CSS.

Behaviours (building a part the library doesn't have):

- First check the parts already built on them: `Combobox` (type to choose from a long list), `InlineEdit` (change one value where it sits), `Tree`, `SortableList` (people's own order), `SwipeRow` (phone row actions, never the only way), `ResizablePanels`.

- Take its behaviour from `@aimy/behaviors` (`@/lib/behaviors` and the hooks in `@/lib/behaviors-react`; in the package, `@flairstech-aimy/ui/behaviors`) and its look from the tokens. Keyboard, focus, selection, dragging, resizing, trees, layers and gestures are all there; never hand-write them.
- Every pointer gesture needs a keyboard path (Space to pick up, the arrows, Space to drop, Escape to cancel), and the behaviour's announcement for screen readers.
- A floating panel uses the primitives (`@aimy/popover-primitive`, `menu-primitive`, `select-primitive`, `tooltip-primitive`, `dialog-primitive`), never its own outside-click or Escape code.
- Anything to press on a chart mark goes in a HoverCard, never a Tooltip (a Tooltip closes before the pointer reaches it). A hover card only adds what the mark doesn't show (a share, a comparison, a long label, one action); it never repeats the mark's own figure.
- Let AiMY work the screen through the agent bridge (`@aimy/agent-bridge`): wrap the page in `AgentProvider`, give each part AiMY may change an `agent` id, pass the person's Autonomy setting to `levelFor`, and hand `bridge.tools()` to the model. Every action returns its undo; what can't be undone is `undoable: false` and always asks. Never let AiMY change the page any other way.
- Show changes the moment the person acts and save behind (`@aimy/feedback`): `useUndoable` for act-then-toast-with-Undo, `useOptimisticValue` for any controlled part with `SaveStatus` beside it, `ActionButton` for a button that reports its own progress. A failed save goes back and says why with Try again; throw `UserFacingError` when your message is already written for people.
- Give every page one `CommandBar` (`@aimy/command-bar`) inside the `AgentProvider`; add the app's own commands with `useCommand` (they are AiMY's tools too; AiMY asks before running one unless it says `undoable: true` or a `level`, and `undoable: false` asks the person too). Ctrl+Z outside a field takes back the last change; never hand-write another undo.
- When AiMY answers with interface, give the model `uiPrompt(AIMY_UI)` and `showUiTool(AIMY_UI)` and draw its answer with `GenerativeUI` (`@aimy/generative-ui`); never render model HTML or code. Send `onProblems` back to the model.
- Test it with `@aimy/behaviors-testing`: `ariaProblems` and `singleTabStopProblems` must come back empty.

Never:

- Never use a native `<select>`, an inline `onclick` string, a coloured left-edge stripe, gradient text, or a pulsing decorative dot.
- Never build a dropdown, dialog or menu by hand; use the library's, which carry the keyboard model and ARIA.
- Never fix a bug you find in passing without saying so.
- Never expand scope. When matching a design from another page, copy its style, not its content.

Icons are Lucide only, on the 24 grid at stroke 2.
