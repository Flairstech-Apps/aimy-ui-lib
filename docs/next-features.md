# AiMY UI: what to build next (20 Nov 2026)

One list from six researchers: the Vercel UI SDK, React Aria / Base UI / Ariakit / shadcn / Mantine, AI chat kits (AI Elements, assistant-ui, CopilotKit, Chainlit, Shape of AI), the AiMY products (Sales, Knowledge, QA, operations hub, User Management) and an accessibility features review. Right to left and the visual audit are built in this round; everything below is proposed, not built. Each item says who asked for it (where it came from), why it matters to AiMY, and a size (S a day or less, M a few days, L a week or more).

## 1. Accessibility (do these first: they are promises the library already makes)

The rule for this pass (Nour, 20 Nov): it never touches the visible UI. No new buttons, links, panels or parts, nothing removed, default rendering unchanged. It works behind the scenes (roles, labels, announcements, focus, keys) or only under a setting the person chose in Windows or the browser.

Under a person's own settings:

- **Forced colours (Windows High Contrast).** Nothing handles it today, and some states vanish when the browser drops backgrounds and shadows: the calendar's focused and chosen day, the segmented pill, the switch track, the checkbox's dash, the composer's focus glow, chart series. Inside `@media (forced-colors: active)` only: outlines and borders that appear, Highlight for chosen and current, `forced-color-adjust: none` for chart marks. M.
- **Reduced motion, everywhere.** The note-taker's spinner and shimmer ignored it (fixed in this round). Decks, the generating beam and the thinking shimmer loop for ever: under `prefers-reduced-motion` they hold still. S.
- **More contrast.** Under `prefers-contrast: more`: stronger inks, card edges and rules, from tokens. M.
- **Less transparency.** Under `prefers-reduced-transparency: reduce`: solid grounds for the 15 glass surfaces and scrims. S.
- **Zoom and text spacing.** At 400% zoom and with spacing overridden (WCAG 1.4.10, 1.4.12): fix the boxes that clip (six fixed px line heights inside hidden overflow). Nothing changes at 100%. S.

Behind the scenes:

- **Keys between regions.** F6 and Shift+F6 move between the bar, the rail, the page and the composer; scroll padding keeps a focused field clear of sticky bars and toasts (WCAG 2.4.11). No element is added. S.
- **Screen reader structure.** Page-title updates as the page changes; heading levels that follow where a part is placed; `aria-keyshortcuts` on what has a shortcut. S.
- **Checks that keep it true.** A token contrast script (every ink on every surface, both themes), and browser runs with forced colours, reduced motion and 400% zoom, using the visual audit. Tooling only. M.

Need a design decision first (they add visible UI, so they are not part of this pass):

- A transcript for CallRecording (WCAG 1.2.1, level A) and captions for VoiceStage.
- A skip link, a "?" shortcuts panel, a toast-duration setting, "show as a table" for charts.

## 2. AiMY works the interface, better (from the UI SDK and the AI kits)

- **A tool call you can read before saying yes.** AgentAsks is a yes or no on one sentence. Show what will be called with which values (editable), what came back, and its state. Sales writes to the CRM: people need to see exactly what. M. (AI Elements Tool and Confirmation, assistant-ui approval card, CopilotKit.)
- **Batched actions and lookups for the agent.** One `act({ steps })` call for several changes, and `query()` to find options or rows without opening anything. The UI SDK's benchmark: about half the calls and a third of the cost of driving a UI by browser tools. M.
- **Every field joins the bridge.** Only six parts register with the agent today. Input, Textarea, Checkbox, Switch, Segmented, DatePicker, Tabs and DataTable should too, so AiMY can fill a form. M.
- **Staged changes.** Show AiMY's suggested values in the real fields as a preview, with Keep and Take back, instead of a sentence describing them. M.
- **What the person changed.** A stream of the person's own edits (with their source) so AiMY knows what was changed by hand, and the app can refuse agent changes where it must. S–M.
- **Undo everything AiMY did.** Page-wide history with one "take back AiMY's changes". S on top of what exists.
- **Conversation control.** Edit a question and regenerate, with versions (‹ 2/3 ›); type while AiMY works (queue or steer); a plan AiMY writes up front and ticks off, which the person can edit; a chat list with search, rename and pin; @mentions and /commands in the Composer; attachments by drop and paste with progress; a refused or out-of-scope answer state; feedback with a reason. Each S–M; together L.
- **Safety hints on the browser agent's tools** (read only, untrusted content, consequential), and the browser agent asking by default. S.

## 3. Parts the products draw that the library lacks

- **File drop zone and import with column mapping.** Knowledge (`.set2-up`, `.set2-map`), QA (`.di-dropzone`, channel mapping), Sales (CSV dropped on the page). Three products. M.
- **Multi-select and tag input.** Knowledge facets (`.k-facet`, `.k-multi`, `.tag-input`); User Management builds tag picking by hand. M.
- **Connector card with sync state and history.** Knowledge (`.set2-dc`, about 380 rules), QA (`.integration-*`, `.di-src-card`). M.
- **A bar per category with a goal mark.** Operations hub (`.bk-row`, 35 to 78 rows a page), QA (`.eval-bar-row` with `.eval-bar-goal-mark`). S, as a Funnel option or its own part.
- **Typed fields.** Time of day (operations hub, QA quiet hours), number with steppers, typed dates, slider (Knowledge voice speed), radio group (QA). M.
- **Data table at scale.** Column resize, pin and hide, virtual rows, server paging; User Management still uses its own table. The behaviours exist (virtualizer, grid focus, cell range, resize) but aren't wired in. L.
- **A locale layer.** One place for number, currency, date, relative time, plurals and sorting by language; today "en-GB" is hard-coded in places and plurals are built by hand. M.
- **Toast tones and a queue.** User Management asks for warning and info; bulk agent actions finishing together replace each other's Undo. S.
- **Email thread** (QA tickets, Sales emails), **stepper** (QA's import wizard), **breadcrumbs**, **context menu and hover card**, **insight card** (QA's measure, problem, AiMY's fix). S–M each.
- **Catching up with the products.** SetScopeBar should match Knowledge's selection tray (`.sel-tray`); EntryAction needs a small size (QA uses `.ea-sm` 29 times).

## A suggested first batch

1. Forced colours, reduced motion everywhere, F6 between regions, and the contrast checks (accessibility, with no visible change).
2. The readable tool call, batched actions, and every field joining the bridge (AiMY's edge).
3. File drop and import mapping, multi-select and tag input, the goal-mark bars (three products waiting).
