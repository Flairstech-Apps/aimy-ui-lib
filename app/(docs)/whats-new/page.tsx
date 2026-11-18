import type { Metadata } from "next"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { CopyButton } from "@/registry/aimy/ui/copy-button"
import { Tag } from "@/registry/aimy/ui/tag"
import { PageHeader, slug } from "@/components/docs/page"
import site from "@/site.json"

export const metadata: Metadata = { title: "What's new" }

// A timeline, newest first. Releases, patches and site changes are each their
// own entry (Nour, 11 Nov: patches get their own place, not folded into a
// release). An entry is a title of a few words, one short line per change
// with the part's name as a link, what to do before updating when anything,
// and the one command that takes it.

type Kind = "new" | "changed" | "fixed"
type Item = { kind: Kind; name: string; href?: string; text: string }
type Entry = {
  label: string
  type: "Release" | "Patch" | "Site"
  date: string
  title: string
  items: Item[]
  /** What to do first, in one sentence. Only when someone must act. */
  before?: string
  /** The one command that takes it. */
  run?: string
}

const BOTH = "pnpm up @flairstech-aimy/ui@latest @flairstech-aimy/tokens@latest"
const c = (name: string) => `/components/${name}/`

const ENTRIES: Entry[] = [
  {
    label: "2.0.3",
    type: "Patch",
    date: "18 Nov 2026",
    title: "Side navigation that stays put",
    items: [
      { kind: "new", name: "SideNav", href: c("side-nav"), text: "QA's form takes order=\"fixed\": the pages keep their order." },
    ],
    run: BOTH,
  },
  {
    label: "2.0.2",
    type: "Patch",
    date: "18 Nov 2026",
    title: "Fixes from User Management",
    items: [
      { kind: "fixed", name: "Disclosure", href: c("disclosure"), text: "A closed one inside an open one stays closed." },
      { kind: "fixed", name: "Combobox", href: c("combobox"), text: "Options from a server show as soon as they arrive." },
      { kind: "new", name: "Combobox", href: c("combobox"), text: "autoFocus, onQueryChange for server search, filter={false}." },
      { kind: "fixed", name: "Checkbox", href: "/adopt/", text: "Tailwind apps @source the package, so a tick shows." },
      { kind: "changed", name: "Agent rules", href: "/start/", text: "Every session checks for a release and takes it first." },
    ],
    before: "If your app runs Tailwind and imports the package, add @source for its dist (see How to adopt).",
    run: BOTH,
  },
  {
    label: "2.0.1",
    type: "Patch",
    date: "18 Nov 2026",
    title: "The products' background",
    items: [
      { kind: "new", name: "AmbientBackground", href: c("ambient-background"), text: "The wash Sales and Knowledge draw behind the app." },
      { kind: "changed", name: "AppShell", href: c("app-shell"), text: "Draws the wash by default; ambient={false} leaves the plain ground." },
    ],
    before: "If your app already draws its own glow behind the shell, remove it or pass ambient={false}.",
    run: BOTH,
  },
  {
    label: "2.0.0",
    type: "Release",
    date: "16 Nov 2026",
    title: "AiMY works the interface",
    items: [
      { kind: "new", name: "Agent bridge", href: c("agent-bridge"), text: "AiMY reads the screen and acts on it, by your Autonomy setting." },
      { kind: "new", name: "Generative UI", href: c("generative-ui"), text: "Answers drawn from library parts only, as they stream." },
      { kind: "new", name: "Command bar", href: c("command-bar"), text: "Ctrl+K for every action on the page; Ctrl+Z takes back the last." },
      { kind: "new", name: "Confirmation & feedback", href: c("feedback"), text: "Act at once with Undo, optimistic saves, buttons that report." },
      { kind: "new", name: "Behaviours", href: "/foundations/behaviors/", text: "Keyboard, focus, drag, resize, trees, layers and gestures, written once." },
      { kind: "new", name: "Combobox", href: c("combobox"), text: "Type to choose from a long list." },
      { kind: "new", name: "InlineEdit", href: c("inline-edit"), text: "Change one value where it sits." },
      { kind: "new", name: "Tree", href: c("tree"), text: "Folders that open and close, with checks that roll up." },
      { kind: "new", name: "SortableList", href: c("sortable-list"), text: "People's own order, by drag or keys." },
      { kind: "new", name: "SwipeRow", href: c("swipe-row"), text: "Row actions on a phone, never the only way." },
      { kind: "new", name: "ResizablePanels", href: c("resizable-panels"), text: "A list beside its detail, sized by hand." },
      { kind: "changed", name: "Dialog, Sheet, Popover, Tooltip, Menu, Select", href: c("dialog"), text: "On AiMY's own behaviours instead of Radix; same parts and props." },
      { kind: "fixed", name: "Select", href: c("select"), text: "Inside a field, the chevron sits at the end." },
    ],
    before:
      "If your own CSS reads --radix-* variables, use --available-height and --anchor-width; Radix-only props on the popup contents and Select's item-aligned placement are gone.",
    run: BOTH,
  },
  {
    label: "1.5.0",
    type: "Release",
    date: "16 Nov 2026",
    title: "Presentations",
    items: [
      { kind: "new", name: "HorizonDeck", href: c("horizon-deck"), text: "A story on the orb's horizon, for a stage." },
      { kind: "new", name: "LanesDeck", href: c("lanes-deck"), text: "What we learned, and what we did about it." },
      { kind: "new", name: "Deck", href: c("horizon-deck"), text: "The engine both share: keys, Present, the logo's flight." },
      { kind: "new", name: "Deck motion", href: "/foundations/motion/", text: "Timings for slides, apart from the UI's." },
      { kind: "new", name: "AimyMark", href: "/foundations/logo/", text: "variant=\"word\": the wordmark on its own." },
    ],
    run: BOTH,
  },
  {
    label: "1.4.5",
    type: "Patch",
    date: "11 Nov 2026",
    title: "Widget heads on a phone",
    items: [
      { kind: "fixed", name: "WidgetFrame", href: c("widget-frame"), text: "When narrow, the actions take a row of their own." },
      { kind: "fixed", name: "WidgetFrame", href: c("widget-frame"), text: "The icon stays on the name's first line." },
    ],
    run: BOTH,
  },
  {
    label: "1.4.4",
    type: "Patch",
    date: "11 Nov 2026",
    title: "Widgets wear the bubble",
    items: [
      { kind: "changed", name: "WidgetFrame", href: c("widget-frame"), text: "AiMY's bubble in the thread; a card inside a reply." },
      { kind: "changed", name: "CandidateCard", href: c("candidate-card"), text: "Drawn like the cards in Sales' answers." },
    ],
    before: "Put widgets inside AiMY's Message, after its sentence.",
    run: BOTH,
  },
  {
    label: "1.4.3",
    type: "Patch",
    date: "11 Nov 2026",
    title: "One chat bubble",
    items: [
      { kind: "changed", name: "Message", href: c("message"), text: "Sales' bubble, with AiMY on a see-through ground." },
    ],
    run: BOTH,
  },
  {
    label: "1.4.2",
    type: "Patch",
    date: "11 Nov 2026",
    title: "AiMY's messages and phones",
    items: [
      { kind: "changed", name: "Message", href: c("message"), text: "AiMY's turns lose the mark and take 95% of the thread." },
      { kind: "changed", name: "Canvas", href: c("canvas"), text: "A 53rem thread, the composer on the same edges." },
      { kind: "changed", name: "AppShell", href: c("app-shell"), text: "Clears the status bar, the notch and the home indicator." },
      { kind: "changed", name: "Sheet, toast", href: c("sheet"), text: "Keep clear of the phone's bars too." },
      { kind: "new", name: "--safe-*", href: "/foundations/layout/", text: "Tokens for anything you fix to the screen's edge." },
    ],
    before: "Add viewport-fit=cover to your viewport meta.",
    run: BOTH,
  },
  {
    label: "1.4.1",
    type: "Patch",
    date: "5 Nov 2026",
    title: "Call recording",
    items: [
      { kind: "new", name: "CallRecording", href: c("call-recording"), text: "Play a call, or the message left on a missed one." },
      { kind: "changed", name: "Rail door", href: c("rail-door"), text: "The diary door reads Diary, its link Open." },
    ],
    run: "pnpm up @flairstech-aimy/ui@latest",
  },
  {
    label: "1.4.0",
    type: "Release",
    date: "5 Nov 2026",
    title: "Sales' side nav and the face stack",
    items: [
      { kind: "changed", name: "SideNav", href: c("side-nav"), text: "Sales' tabs by default; QA's column is variant=\"qa\"." },
      { kind: "new", name: "SideNavRead", href: c("side-nav"), text: "AiMY's reading of the page you're on." },
      { kind: "new", name: "FaceStack", href: c("face-stack"), text: "A group of people as one object." },
      { kind: "fixed", name: "Avatar", href: c("avatar"), text: "A failed photo shows initials, not a broken image." },
    ],
    before: "QA: add variant=\"qa\" to SideNav first.",
    run: BOTH,
  },
  {
    label: "1.3.0",
    type: "Release",
    date: "4 Nov 2026",
    title: "Chat widgets",
    items: [
      { kind: "new", name: "WidgetFrame", href: c("widget-frame"), text: "The frame every result in a reply sits in." },
      { kind: "new", name: "CandidateCards", href: c("candidate-card"), text: "People two across, with their Fit." },
      { kind: "new", name: "CandidateProfile", href: c("candidate-profile"), text: "One person in full." },
      { kind: "new", name: "ChatTable", href: c("chat-table"), text: "A tool's table that turns to rows when narrow." },
      { kind: "new", name: "RankedList", href: c("ranked-list"), text: "Results best first, each reason in view." },
      { kind: "new", name: "UploadResults", href: c("upload-results"), text: "A batch, counted by status." },
      { kind: "fixed", name: "DataTable", href: c("data-table"), text: "Long values stay inside their row." },
    ],
    run: BOTH,
  },
  {
    label: "1.2.0",
    type: "Release",
    date: "31 Oct 2026",
    title: "Errors and recovery",
    items: [
      { kind: "new", name: "RecoveryState", href: c("recovery"), text: "Every failure, from the whole window to one field." },
      { kind: "new", name: "classifyError", href: c("recovery"), text: "Turns any error into the right kind." },
      { kind: "new", name: "ErrorSummary", href: c("recovery"), text: "A form's errors, each linked to its field." },
      { kind: "new", name: "toast err", href: c("toast"), text: "A red toast for a failed action." },
      { kind: "fixed", name: "Rail toggle", href: c("app-shell"), text: "Its icon is centred again when narrow." },
    ],
    run: BOTH,
  },
  {
    label: "Fix",
    type: "Site",
    date: "30 Oct 2026",
    title: "Install without .npmrc",
    items: [{ kind: "fixed", name: "init", href: "/start/", text: "The shadcn commands no longer fail with E404." }],
    before: "If init failed with E404, run it again.",
  },
  {
    label: "1.1.0",
    type: "Release",
    date: "30 Oct 2026",
    title: "QA's navigation",
    items: [
      { kind: "new", name: "SideNav", href: c("side-nav"), text: "QA's column: open, or icons with counts." },
      { kind: "new", name: "ScrollDot", href: c("scroll-dot"), text: "QA's scroll indicator, turned on per area." },
    ],
    run: BOTH,
  },
  {
    label: "Agents",
    type: "Site",
    date: "30 Oct 2026",
    title: "Tools for AI agents",
    items: [
      { kind: "new", name: "MCP server", href: "/ai-tools/", text: "Search the parts and read the rules from your agent." },
      { kind: "new", name: "Skills", href: "/ai-tools/", text: "Build, review and upgrade screens by name." },
      { kind: "new", name: "Search", text: "Ctrl K from any page of the docs." },
    ],
    // An app that ran init already has the @aimy registry, so the short name works.
    run: "npx shadcn@latest add @aimy/init --overwrite",
  },
  {
    label: "Open",
    type: "Site",
    date: "29 Oct 2026",
    title: "No sign-in, no token",
    items: [
      { kind: "changed", name: "Address", href: "/start/", text: `${site.url.replace("https://", "")}, open to everyone.` },
      { kind: "new", name: "Landing page", href: "/", text: "Install and start moved to /start/." },
    ],
    before: "Point .npmrc and components.json at the new address, and delete the token lines.",
  },
  {
    label: "1.0.0",
    type: "Release",
    date: "29 Oct 2026",
    title: "The first stable release",
    items: [
      { kind: "new", name: "Foundations", href: "/foundations/color/", text: "Colour, type, spacing, motion and the rest." },
      { kind: "new", name: "Components", href: c("button"), text: "Forms, overlays, shell, records, charts, diary, documents." },
      { kind: "new", name: "AI parts", href: c("message"), text: "Conversation, grounding, agency, memory and voice." },
      { kind: "new", name: "Starters", href: "/start/", text: "Vite and Next.js, @aimy/init, and the rules for agents." },
    ],
  },
]

const KIND: Record<Kind, { word: string; tone: "ok" | "info" | "warn" }> = {
  new: { word: "New", tone: "ok" },
  changed: { word: "Changed", tone: "info" },
  fixed: { word: "Fixed", tone: "warn" },
}

/** One command on one line, with Copy. */
function Command({ children, what }: { children: string; what: string }) {
  return (
    <div
      data-theme="dark"
      className="flex min-w-0 items-center gap-3 rounded-lg border border-hairline bg-code py-1.5 pr-1.5 pl-4"
    >
      {/* One line wherever it fits. Only on a phone, where it can't, it breaks
          between words (never inside one) rather than scrolling out of view. */}
      <code className="min-w-0 flex-1 py-1 font-mono text-meta text-ink [overflow-wrap:break-word]">{children}</code>
      <CopyButton value={children} what={what} />
    </div>
  )
}

function Row({ item }: { item: Item }) {
  const k = KIND[item.kind]
  return (
    <li
      data-ai="li"
      className="grid grid-cols-[5.25rem_10.5rem_minmax(0,1fr)] items-baseline gap-x-4 py-2.5 max-canvas:grid-cols-[5.25rem_minmax(0,1fr)] max-canvas:gap-y-0.5"
    >
      <span>
        <Tag tone={k.tone}>{k.word}</Tag>
      </span>
      {item.href ? (
        <Link
          href={item.href}
          className="truncate text-meta font-semibold text-ink underline-offset-4 transition-colors duration-(--t-fast) ease-out hover:text-ink-action hover:underline"
        >
          {item.name}
        </Link>
      ) : (
        <span className="truncate text-meta font-semibold text-ink">{item.name}</span>
      )}
      <span className="text-meta text-ink-secondary max-canvas:col-start-2">{item.text}</span>
    </li>
  )
}

const entryId = (e: Entry) => slug(`${e.label} ${e.type}`)

function EntryBlock({ entry, last }: { entry: Entry; last: boolean }) {
  const id = entryId(entry)
  const release = entry.type === "Release"
  return (
    <section className="grid grid-cols-[7rem_1.25rem_minmax(0,1fr)] gap-x-5 max-canvas:grid-cols-[1.25rem_minmax(0,1fr)] max-canvas:gap-x-3">
      {/* The version and its date, beside the line. */}
      <div className="pb-12 text-right max-canvas:hidden">
        <p className="text-2xl leading-tight font-semibold tracking-tight text-ink tabular-nums">{entry.label}</p>
        <p className="mt-1 text-xs font-semibold text-ink-secondary">{entry.date}</p>
      </div>

      {/* The line: a filled dot for a release, a ring for a patch or a site change. */}
      <div aria-hidden="true" className="relative flex justify-center text-2xl leading-tight">
        <span
          className={cn(
            "relative z-1 mt-[calc((1lh-0.75rem)/2)] block size-3 rounded-full",
            release ? "bg-brand ring-4 ring-brand/20" : "border-2 border-ink-secondary bg-body"
          )}
        />
        {last ? null : <span className="absolute top-[calc(1lh/2)] -bottom-0 w-px bg-hairline" />}
      </div>

      <div className="min-w-0 pb-12">
        <h2
          id={id}
          data-ai="h2"
          // "On this page" names each entry as it always did: the version, or
          // what a site change was, and its date.
          data-title={`${entry.type === "Site" ? entry.title : entry.label}, ${entry.date}`}
          className="flex scroll-mt-[calc(var(--topbar-height)+1.5rem)] flex-wrap items-baseline gap-x-3 gap-y-1 text-2xl leading-tight font-semibold tracking-tight text-ink"
        >
          <span className="hidden tabular-nums max-canvas:inline">{entry.label}</span>
          <span>{entry.title}</span>
        </h2>
        <p className="mt-1.5 text-xs font-semibold text-ink-secondary">
          {entry.type}
          <span className="hidden max-canvas:inline"> · {entry.date}</span>
        </p>

        <ul className="mt-4 divide-y divide-hairline border-y border-hairline">
          {entry.items.map((item) => (
            <Row key={item.name + item.text} item={item} />
          ))}
        </ul>

        {entry.before || entry.run ? (
          <div className="mt-4 flex flex-col gap-2.5">
            {entry.before ? (
              <p data-ai="p" className="flex items-baseline gap-2.5 text-meta text-ink">
                <Tag tone="warn">First</Tag>
                <span>{entry.before}</span>
              </p>
            ) : null}
            {entry.run ? <Command what={`the ${entry.label} update command`}>{entry.run}</Command> : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default function WhatsNew() {
  return (
    <>
      <PageHeader title="What's new" lead="Every release, patch and site change, newest first." />

      {/* Keeping up: two commands, each with its question, and the GitHub watch. */}
      {/* Each question beside its command, and each check beside the command
          that acts on it: packages, then copied parts. */}
      <dl className="mt-10 grid max-w-[56rem] grid-cols-[11rem_minmax(0,1fr)] items-center gap-x-4 gap-y-2.5 max-canvas:grid-cols-1 max-canvas:gap-y-1.5">
        <dt className="text-meta font-semibold text-ink">Is your app behind?</dt>
        <dd className="min-w-0 max-canvas:mb-2">
          <Command what="the outdated command">pnpm outdated @flairstech-aimy/ui @flairstech-aimy/tokens</Command>
        </dd>
        <dt className="text-meta font-semibold text-ink">Update the packages</dt>
        <dd className="min-w-0 max-canvas:mb-2">
          <Command what="the update command">{BOTH}</Command>
        </dd>
        <dt className="text-meta font-semibold text-ink">Which copies changed?</dt>
        <dd className="min-w-0 max-canvas:mb-2">
          <Command what="the diff command">npx shadcn@latest diff</Command>
        </dd>
        <dt className="text-meta font-semibold text-ink">Update a copied part</dt>
        <dd className="min-w-0">
          <Command what="the copy update command">npx shadcn@latest add @aimy/&lt;name&gt; --overwrite</Command>
        </dd>
      </dl>
      <p className="mt-3 text-meta text-ink-secondary">
        Hear about each one: on{" "}
        <a
          href={`https://github.com/${site.repo}/releases`}
          className="font-semibold text-ink-action underline-offset-4 hover:underline"
        >
          GitHub
        </a>
        , Watch, then Custom, then Releases.
      </p>

      <div className="mt-14 border-t border-hairline pt-12">
        {ENTRIES.map((e, i) => (
          <EntryBlock key={e.label + e.date} entry={e} last={i === ENTRIES.length - 1} />
        ))}
      </div>
    </>
  )
}
