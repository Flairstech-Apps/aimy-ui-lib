import { useState } from "react"
import { DataTable, type Column } from "@/components/data-table"
import { DocEditor } from "@/components/doc-editor"
import {
  DocByline,
  DocComments,
  DocHead,
  DocInsights,
  DocNotice,
  DocPage,
  DocRail,
  DocRailFoot,
  DocTitle,
  DocVersions,
  RailAction,
  RailBlock,
  SaveState,
  VersionPreview,
  type DocComment,
} from "@/components/document"
import { Suggestion } from "@/components/suggestion"
import { toast } from "@/components/toast"
import { TrustState } from "@/components/trust-state"
import type { Version } from "@/components/version-list"
import type { TrustStatus } from "@/lib/ai-types"

// The Documents tab: the playbooks and policies the team sells from. A row
// opens the document page, with the writing tools, AiMY's proposals, the
// versions and the comments. Nothing AiMY proposes lands without Accept.
type Doc = {
  id: string
  title: string
  kind: string
  owner?: string
  updated: string
  status: TrustStatus
  body: string
}

const DOCS: Doc[] = [
  {
    id: "d1",
    title: "Pricing for the annual plan",
    kind: "Playbook",
    owner: "Engy Hassan",
    updated: "24 Oct",
    status: "current",
    body: "<p>The annual plan is £132 a seat a year, with the first month free. Quote it per seat and for the year, never per month.</p><h3>When they ask for a discount</h3><p>Offer the first month free before anything else. Above 100 seats, the account owner can agree up to 10%.</p>",
  },
  {
    id: "d2",
    title: "Refunds on annual plans",
    kind: "Policy",
    owner: "Dana Whitfield",
    updated: "12 Oct",
    status: "outdated",
    body: "<p>Customers on an annual plan can ask for a refund within 30 days of renewal. After that, the remaining months are credited to the account.</p><p>Any support lead can approve a refund under £500.</p>",
  },
  {
    id: "d3",
    title: "Calling script for logistics",
    kind: "Script",
    updated: "2 Sep",
    status: "unowned",
    body: "<p>Open with the delivery window they last missed, then ask who plans the routes.</p>",
  },
]

const VERSIONS: Version[] = [
  {
    id: "3",
    n: 3,
    label: "Said the discount rule",
    author: "Engy Hassan",
    how: "edited here",
    time: "24 Oct",
    current: true,
  },
  {
    id: "2",
    n: 2,
    ai: true,
    label: "Tightened from 9 won deals",
    author: "AiMY",
    how: "accepted by Engy Hassan",
    time: "10 Oct",
  },
  { id: "1", n: 1, label: "First version", author: "Omar Said", how: "written here", time: "18 Sep" },
]

const columns = (open: (d: Doc) => void): Column<Doc>[] => [
  {
    key: "title",
    header: "Document",
    cell: (d) => (
      <button type="button" className="doc-by-ent text-left font-semibold text-ink" onClick={() => open(d)}>
        {d.title}
      </button>
    ),
    sort: (a, b) => a.title.localeCompare(b.title),
  },
  { key: "kind", header: "Kind", width: "7rem", cell: (d) => d.kind },
  { key: "owner", header: "Owner", width: "9rem", cell: (d) => d.owner ?? "Nobody" },
  { key: "updated", header: "Updated", width: "6rem", cell: (d) => d.updated },
  { key: "status", header: "State", width: "auto", end: true, cell: (d) => <TrustState status={d.status} /> },
]

export function DocumentsTab() {
  const [open, setOpen] = useState<Doc | null>(null)
  return open ? (
    <DocumentView doc={open} onBack={() => setOpen(null)} />
  ) : (
    <div className="flex flex-col gap-3">
      <p className="text-meta text-ink-secondary">What the team sells from. Open one to read it or keep it right.</p>
      <DataTable label="Documents" rows={DOCS} columns={columns(setOpen)} rowKey={(d) => d.id} />
    </div>
  )
}

function DocumentView({ doc, onBack }: { doc: Doc; onBack: () => void }) {
  const [dirty, setDirty] = useState(false)
  const [reading, setReading] = useState<Version | null>(null)
  const [proposal, setProposal] = useState<{ label: string; before: string; pending: boolean } | null>(null)
  const [comments, setComments] = useState<DocComment[]>([])
  const propose = (label: string, before = "") => {
    setProposal({ label, before, pending: true })
    window.setTimeout(() => setProposal((p) => (p ? { ...p, pending: false } : p)), 2000)
  }
  return (
    <div className="h-[44rem]">
      <DocPage
        back={{ label: "All documents", onClick: onBack }}
        end={
          <SaveState
            state={dirty ? "unsaved" : "saved"}
            savedAt="09:12"
            onSave={() => {
              setDirty(false)
              toast("Saved", { sub: "Filed as version 4" })
            }}
            onDiscard={() => setDirty(false)}
          />
        }
        rail={
          <DocRail
            foot={
              <DocRailFoot
                onReport={(what) => {
                  setComments((c) => [
                    ...c,
                    { id: String(Date.now()), author: "You", time: "Just now", text: what, problem: true },
                  ])
                  toast("Reported", { sub: "It is a comment on the document now" })
                }}
                onArchive={() => toast("Archive asks you to type “archive” first")}
              />
            }
          >
            <DocInsights
              items={[
                {
                  id: "i",
                  text: "Two calls this week quoted the monthly price, which this playbook says never to do.",
                  action: {
                    label: "Say it more plainly",
                    onClick: () =>
                      propose("Make the per-seat rule plainer", "Quote it per seat and for the year, never per month."),
                  },
                },
              ]}
            />
            <RailBlock title="What it is">
              <p className="text-meta text-ink-secondary">
                A {doc.kind.toLowerCase()} for account executives. Read by AiMY when it drafts a reply.
              </p>
            </RailBlock>
            <RailBlock title="Where it came from">
              <p className="text-meta text-ink-secondary">Written here.</p>
              <div className="rail-act">
                <RailAction onClick={() => toast("AiMY looks for a source")}>Find a source for it</RailAction>
              </div>
            </RailBlock>
          </DocRail>
        }
      >
        {reading ? (
          <VersionPreview
            n={reading.n}
            date={reading.time}
            onRestore={() => toast(`Restore v${reading.n}?`)}
            onBack={() => setReading(null)}
          />
        ) : null}
        <DocHead
          notice={
            doc.status === "outdated" ? (
              <DocNotice kind="outdated">
                The billing system changed after this was written. Still used in drafts, and drafts say so.
              </DocNotice>
            ) : undefined
          }
          byline={
            <DocByline
              status={doc.status === "outdated" ? undefined : <TrustState status={doc.status} />}
              type={{ label: doc.kind }}
              owner={{ name: doc.owner, onClick: () => toast(doc.owner ? `Opens ${doc.owner}` : "Pick an owner") }}
              source="here"
              versions={
                <DocVersions
                  updated={doc.updated}
                  versions={VERSIONS}
                  reading={reading?.id}
                  onOpen={(v) => setReading(v.current ? null : v)}
                />
              }
            />
          }
        />
        <DocTitle onChange={(t) => toast(`Renamed to “${t}”`)}>{doc.title}</DocTitle>
        <DocEditor
          key={doc.id}
          html={doc.body}
          readOnly={!!reading}
          onChange={() => setDirty(true)}
          selectionActions={["Rewrite", "Shorten", "Find a source"]}
          onSelectionAction={(label, text) => propose(label, text)}
          docActions={["Rewrite for a first call", "Shorten", "Fill the gaps"]}
          onDocAction={(label) => propose(label)}
        />
        {proposal ? (
          <Suggestion
            key={proposal.label + proposal.before}
            title={proposal.label}
            before={proposal.before || undefined}
            after={
              proposal.before
                ? "Give the price per seat for the year. Don't give a monthly figure."
                : "A shorter version of this, for a first call."
            }
            pending={proposal.pending}
            onAccept={() => setProposal(null)}
            onReject={() => setProposal(null)}
            onUndo={() => {}}
          />
        ) : null}
        <DocComments
          comments={comments}
          onAdd={(text) => {
            setComments((c) => [...c, { id: String(Date.now()), author: "You", time: "Just now", text }])
            toast("Comment added", { onUndo: () => setComments((c) => c.slice(0, -1)) })
          }}
          onResolve={(id) => setComments((c) => c.map((x) => (x.id === id ? { ...x, done: true } : x)))}
        />
      </DocPage>
    </div>
  )
}
