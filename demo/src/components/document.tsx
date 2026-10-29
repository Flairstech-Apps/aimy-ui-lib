import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  Flag,
  Link2,
  PanelRightClose,
  PanelRightOpen,
  RefreshCw,
  Send,
  Upload,
  X,
} from "lucide-react"
import { Popover as Primitive } from "radix-ui"
import { useState } from "react"
import { AimyMark } from "@/components/aimy-mark"
import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Textarea } from "@/components/textarea"
import { VersionList, type Version } from "@/components/version-list"
import { cn } from "@/lib/utils"

// Knowledge's document page (console.html ?doc=, renderDoc in knowledge.js
// 7253-7570): the paper on the left and the details beside it. The bar on
// top goes back to where you came from, says whether your changes are saved,
// and shows or hides the details. The head says what state the document is
// in (a notice for archived, replaced and out of date), who owns it, where
// it came from and its versions, then the title, then the body (DocEditor),
// AiMY's proposal (Suggestion) and the comments. The details are blocks you
// fold, AiMY's notes on it, and Report a problem, Archive and Delete at the
// foot. Below 1100px of its own width the details go under the paper.
//
//   <DocPage back={{ label: "All documents", onClick: close }} end={<SaveState state="saved" savedAt="09:12" />}
//     rail={<DocRail>…</DocRail>}>
//     <DocHead byline={<DocByline status={…} owner={…} source={…} versions={<DocVersions … />} />} />
//     <DocTitle>Refund policy</DocTitle>
//     <DocEditor … />
//   </DocPage>

type DocPageProps = {
  back: { label: string; onClick: () => void }
  /** On the right of the bar: SaveState, Publish. */
  end?: React.ReactNode
  /** The details beside the paper (DocRail). */
  rail?: React.ReactNode
  className?: string
  children: React.ReactNode
}

export function DocPage({ back, end, rail, className, children }: DocPageProps) {
  const [open, setOpen] = useState(true)
  return (
    <div className="doc-wrap" data-slot="doc-page">
      <div className={cn("doc-page", !open && "rail-closed", className)}>
        <div className="doc-topbar">
          <button type="button" className="doc-back" onClick={back.onClick}>
            <ArrowLeft aria-hidden="true" />
            {back.label}
          </button>
          <span className="doc-top-end">
            {end}
            {rail ? (
              <button
                type="button"
                className="doc-rail-toggle"
                aria-label={open ? "Hide details" : "Show details"}
                title={open ? "Hide details" : "Show details"}
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
              >
                {open ? <PanelRightClose aria-hidden="true" /> : <PanelRightOpen aria-hidden="true" />}
              </button>
            ) : null}
          </span>
        </div>
        <div className="doc-canvas">
          <article className="doc-paper">{children}</article>
        </div>
        {rail}
      </div>
    </div>
  )
}

type SaveStateProps = {
  state: "saved" | "unsaved"
  /** When it was saved: "09:12". Leave out for "Saved just now". */
  savedAt?: string
  onSave?: () => void
  onDiscard?: () => void
  /** A draft: Publish, or why it can't be yet ("Add some content first"). */
  publish?: { onPublish: () => void; blockedBy?: string }
}

/** Saved, or what to do about changes that aren't. */
export function SaveState({ state, savedAt, onSave, onDiscard, publish }: SaveStateProps) {
  return (
    <>
      {state === "saved" ? (
        <span className="doc-saved">
          <Check aria-hidden="true" />
          {savedAt ? `Saved · ${savedAt}` : "Saved just now"}
        </span>
      ) : (
        <>
          <span className="doc-unsaved" role="status">
            <AlertTriangle aria-hidden="true" />
            Unsaved changes
          </span>
          {onDiscard ? (
            <Button size="sm" variant="ghost" onClick={onDiscard}>
              Discard changes
            </Button>
          ) : null}
          {onSave ? (
            <Button size="sm" variant="brand" onClick={onSave}>
              Save changes
            </Button>
          ) : null}
        </>
      )}
      {publish ? (
        <Button
          size="sm"
          variant="brand"
          disabled={!!publish.blockedBy}
          title={publish.blockedBy}
          onClick={publish.onPublish}
        >
          {publish.blockedBy ?? "Publish"}
        </Button>
      ) : null}
    </>
  )
}

/** The notice, the byline and a note, over the title. */
export function DocHead({
  notice,
  byline,
  note,
}: {
  notice?: React.ReactNode
  byline?: React.ReactNode
  note?: React.ReactNode
}) {
  return (
    <header className="doc-head">
      {notice}
      {byline}
      {note ? <p className="doc-note">{note}</p> : null}
    </header>
  )
}

const NOTICE = {
  archived: {
    cls: "is-expired",
    Icon: Archive,
    word: "Archived.",
    say: "Kept whole and restorable. Not used in answers.",
  },
  replaced: {
    cls: "is-superseded",
    Icon: ArrowRight,
    word: "Replaced.",
    say: "A newer document replaced it. Not used in answers.",
  },
  outdated: { cls: "is-outdated", Icon: RefreshCw, word: "Out of date.", say: "" },
} as const

/** What state the document is in, and the way out of it. Never a silent redirect. */
export function DocNotice({
  kind,
  children,
  link,
}: {
  kind: keyof typeof NOTICE
  /** The sentence after the word; each kind has its own by default ("out of date" needs one). */
  children?: React.ReactNode
  link?: { label: string; onClick: () => void }
}) {
  const n = NOTICE[kind]
  return (
    <div className={cn("dv-notice", n.cls)} role="status">
      <n.Icon aria-hidden="true" />
      <span className="dv-notice-text">
        <strong>{n.word}</strong> {children ?? n.say}
      </span>
      {link ? (
        <button type="button" className="dv-notice-link" onClick={link.onClick}>
          {link.label}
          <ArrowRight className="size-3" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  )
}

type DocBylineProps = {
  /** The trust state (TrustState), unless the notice already says it. */
  status?: React.ReactNode
  type?: { icon?: React.ReactNode; label: string }
  /** Who owns it; without a name it says "Nobody owns it". */
  owner?: { name?: string; onClick?: () => void }
  /** Where it came from: a link to the original, or written here. */
  source?: { label: string; href?: string } | "here"
  collection?: { name: string; onClick?: () => void }
  /** DocVersions. */
  versions?: React.ReactNode
}

const Ent = ({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) =>
  onClick ? (
    <button type="button" className="doc-by-ent" onClick={onClick}>
      {children}
    </button>
  ) : (
    <span>{children}</span>
  )

/** Knowledge's byline: state, kind, owner, source, collection, versions. */
export function DocByline({ status, type, owner, source, collection, versions }: DocBylineProps) {
  return (
    <p className="doc-byline">
      {status}
      {type ? (
        <span className="doc-by-kind">
          {type.icon ?? <FileText aria-hidden="true" />}
          {type.label}
        </span>
      ) : null}
      {owner ? (
        owner.name ? (
          <span>
            Owned by <Ent onClick={owner.onClick}>{owner.name}</Ent>
          </span>
        ) : (
          <Ent onClick={owner.onClick}>Nobody owns it</Ent>
        )
      ) : null}
      {source === "here" ? (
        <span>Written here</span>
      ) : source ? (
        source.href ? (
          <a
            className="doc-by-ent doc-by-out"
            href={source.href}
            target="_blank"
            rel="noreferrer"
            title={`Opens ${source.label} in a new tab`}
          >
            Came from {source.label}
            <ExternalLink aria-hidden="true" />
          </a>
        ) : (
          <span>Came from {source.label}</span>
        )
      ) : null}
      {collection ? (
        <span>
          Filed in <Ent onClick={collection.onClick}>{collection.name}</Ent>
        </span>
      ) : null}
      {versions}
    </p>
  )
}

/** The byline's versions: when it was updated and how many versions, opening the list. */
export function DocVersions({
  updated,
  versions,
  reading,
  onOpen,
}: {
  updated: string
  versions: Version[]
  /** The version being read, if not the current one. */
  reading?: string
  onOpen: (v: Version) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <Primitive.Root open={open} onOpenChange={setOpen}>
      <Primitive.Trigger className="doc-versions-btn">
        <span className="doc-by-vd">Updated {updated}</span>
        <span className="doc-by-vn">
          {versions.length} {versions.length === 1 ? "version" : "versions"}
        </span>
        <ChevronDown aria-hidden="true" />
      </Primitive.Trigger>
      <Primitive.Portal>
        <Primitive.Content
          align="start"
          sideOffset={4}
          collisionPadding={12}
          className="t-dropdown doc-versions-panel z-(--z-popover)"
          aria-label="Versions"
        >
          <VersionList
            versions={versions}
            selected={reading}
            onPick={(v) => {
              setOpen(false)
              onOpen(v)
            }}
          />
          <p className="ver-hint">Open a version to read it. Only the current one can be edited.</p>
        </Primitive.Content>
      </Primitive.Portal>
    </Primitive.Root>
  )
}

/** Reading an old version: say so, and the ways back. */
export function VersionPreview({
  n,
  date,
  onRestore,
  onBack,
}: {
  n: number
  date: string
  onRestore?: () => void
  onBack: () => void
}) {
  return (
    <div className="ver-preview" role="status">
      <Clock aria-hidden="true" />
      <span>
        Reading <b>v{n}</b> from {date}. You cannot edit history.
      </span>
      <span className="ver-preview-end">
        {onRestore ? (
          <Button size="sm" variant="ghost" onClick={onRestore}>
            Restore this version
          </Button>
        ) : null}
        <Button size="sm" variant="brand" onClick={onBack}>
          Back to the current one
        </Button>
      </span>
    </div>
  )
}

/** The title. Editable when `onChange` is given; Enter commits. */
export function DocTitle({ children, onChange }: { children: string; onChange?: (title: string) => void }) {
  if (!onChange) return <h1 className="doc-title">{children}</h1>
  return (
    <h1
      className="doc-title"
      contentEditable
      suppressContentEditableWarning
      spellCheck
      aria-label="Title"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          e.currentTarget.blur()
        }
      }}
      onBlur={(e) => {
        const t = e.currentTarget.textContent?.trim() ?? ""
        if (t && t !== children) onChange(t)
        else e.currentTarget.textContent = children
      }}
    >
      {children}
    </h1>
  )
}

/** A blank document: the ways to start. */
export function DocStart({
  draft,
  onDraft,
  onFile,
  onConnect,
  fine = "Or drop a file on the page: Word, PDF, text.",
}: {
  /** "Draft with AiMY" as a menu of what AiMY can write (an AiMenu with trigger="start"). */
  draft?: React.ReactNode
  /** Or "Draft with AiMY" as one action. */
  onDraft?: () => void
  onFile?: () => void
  onConnect?: () => void
  fine?: string
}) {
  return (
    <>
      <div className="doc-start">
        {draft}
        {!draft && onDraft ? (
          <button type="button" className="doc-ai" onClick={onDraft}>
            <AimyMark title="" />
            Draft with AiMY
          </button>
        ) : null}
        {onFile ? (
          <button type="button" className="doc-start-act" onClick={onFile}>
            <Upload aria-hidden="true" />
            Start from a file
          </button>
        ) : null}
        {onConnect ? (
          <button type="button" className="doc-start-act" onClick={onConnect}>
            <Link2 aria-hidden="true" />
            Connect it to documents
          </button>
        ) : null}
      </div>
      {fine ? <p className="doc-start-fine">{fine}</p> : null}
    </>
  )
}

/* ── Comments ─────────────────────────────────────────────────────────── */
export type DocComment = { id: string; author: string; time: string; text: string; problem?: boolean; done?: boolean }

/** The comments under the document; a reported problem is marked and can be resolved. */
export function DocComments({
  comments,
  onAdd,
  onResolve,
}: {
  comments: DocComment[]
  onAdd: (text: string) => void
  onResolve?: (id: string) => void
}) {
  const [draft, setDraft] = useState("")
  const send = () => {
    const t = draft.trim()
    if (!t) return
    onAdd(t)
    setDraft("")
  }
  return (
    <section className="doc-comments" aria-label="Comments">
      <h2 className="doc-comments-head">
        {comments.length ? `${comments.length} ${comments.length === 1 ? "comment" : "comments"}` : "No comments yet"}
      </h2>
      {comments.length ? (
        <ul className="doc-comment-list">
          {comments.map((c) => (
            <li key={c.id} className={cn("comment", c.problem && "is-problem", c.done && "is-done")}>
              {c.problem ? (
                <span className="comment-flag">
                  {c.done ? <Check aria-hidden="true" /> : <Flag aria-hidden="true" />}
                  {c.done ? "Resolved" : "Reported a problem"}
                </span>
              ) : null}
              <span className="comment-head">
                <span className="comment-author">{c.author}</span>
                <span className="comment-time">{c.time}</span>
              </span>
              <p className="comment-text">{c.text}</p>
              {c.problem && !c.done && onResolve ? (
                <button type="button" className="comment-resolve" onClick={() => onResolve(c.id)}>
                  Mark it resolved
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="comment-empty">Comments are for the people who keep this document right.</p>
      )}
      <form
        className="comment-compose"
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
      >
        <Input
          aria-label="Add a comment"
          placeholder="Add a comment…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit" className="comment-send" aria-label="Send the comment">
          <Send aria-hidden="true" />
        </button>
      </form>
    </section>
  )
}

/* ── The rail ─────────────────────────────────────────────────────────── */
/** The details beside the paper. */
export function DocRail({
  label = "Details",
  children,
  foot,
}: {
  label?: string
  children: React.ReactNode
  foot?: React.ReactNode
}) {
  return (
    <aside className="doc-rail" aria-label={label}>
      {children}
      {foot}
    </aside>
  )
}

/** A block of the rail you fold: "What it is", "What it connects to", "Where it came from". */
export function RailBlock({
  title,
  count,
  defaultOpen = true,
  children,
}: {
  title: string
  count?: number
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  return (
    <details className="rail-block" open={defaultOpen}>
      <summary>
        <ChevronRight className="rail-block-chev" aria-hidden="true" />
        <span className="rail-block-title">{title}</span>
        {count != null ? <span className="rail-block-n">{count}</span> : null}
      </summary>
      <div className="rail-block-body">{children}</div>
    </details>
  )
}

/** A rail action: an outlined button, or a link out. */
export function RailAction({
  icon,
  href,
  onClick,
  children,
}: {
  icon?: React.ReactNode
  href?: string
  onClick?: () => void
  children: React.ReactNode
}) {
  return href ? (
    <a className="rail-act-btn" href={href} target="_blank" rel="noreferrer" onClick={onClick}>
      {icon}
      {children}
    </a>
  ) : (
    <button type="button" className="rail-act-btn" onClick={onClick}>
      {icon}
      {children}
    </button>
  )
}

/** "AiMY noticed": up to two things about this document, each with its next step. */
export function DocInsights({
  items,
}: {
  items: { id: string; text: React.ReactNode; action: { label: string; onClick: () => void } }[]
}) {
  if (!items.length) return null
  return (
    <div className="ins-band">
      <p className="ins-rail-lead">
        <AimyMark title="" />
        <span>AiMY noticed</span>
      </p>
      {items.slice(0, 2).map((i) => (
        <div key={i.id} className="ins-row">
          <p className="ins-row-text">{i.text}</p>
          <button type="button" className="ins-row-act" onClick={i.action.onClick}>
            {i.action.label}
          </button>
        </div>
      ))}
    </div>
  )
}

/** The rail's foot: Report a problem (inline, not a modal), Archive or Restore, Delete. */
export function DocRailFoot({
  onReport,
  archived,
  onArchive,
  onRestore,
  onDelete,
}: {
  /** Called with what is wrong. Leave out on a draft. */
  onReport?: (what: string) => void
  archived?: boolean
  /** Hand these to a typed confirmation (ChangeReview with `word`). */
  onArchive?: () => void
  onRestore?: () => void
  onDelete?: () => void
}) {
  const [reporting, setReporting] = useState(false)
  const [what, setWhat] = useState("")
  return (
    <div className="doc-rail-foot">
      {reporting ? (
        <form
          className="doc-report"
          onSubmit={(e) => {
            e.preventDefault()
            if (!what.trim()) return
            onReport?.(what.trim())
            setWhat("")
            setReporting(false)
          }}
        >
          <Textarea
            aria-label="What is wrong with it?"
            placeholder="What is wrong with it?"
            value={what}
            autoFocus
            onChange={(e) => setWhat(e.target.value)}
          />
          <span className="doc-report-acts">
            <Button size="sm" variant="brand" type="submit" disabled={!what.trim()}>
              Send the report
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setReporting(false)}>
              Cancel
            </Button>
          </span>
        </form>
      ) : (
        <>
          {onReport ? (
            <button type="button" className="cite-action" onClick={() => setReporting(true)}>
              <Flag aria-hidden="true" />
              Report a problem
            </button>
          ) : null}
          {archived ? (
            onRestore ? (
              <button type="button" className="cite-action" onClick={onRestore}>
                <Archive aria-hidden="true" />
                Restore
              </button>
            ) : null
          ) : onArchive ? (
            <button type="button" className="cite-action" onClick={onArchive}>
              <Archive aria-hidden="true" />
              Archive
            </button>
          ) : null}
          {archived && onDelete ? (
            <button type="button" className="cite-action is-danger" onClick={onDelete}>
              <X aria-hidden="true" />
              Delete
            </button>
          ) : null}
        </>
      )}
    </div>
  )
}
