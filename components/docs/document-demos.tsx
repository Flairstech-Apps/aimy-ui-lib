"use client"

import { Link2Off, RefreshCw } from "lucide-react"
import { useState } from "react"
import { AiMenu, BlockMenu, DocEditor, SelectionMenu, WritingToolbar } from "@/registry/aimy/ui/doc-editor"
import {
  DocByline,
  DocComments,
  DocHead,
  DocInsights,
  DocNotice,
  DocPage,
  DocRail,
  DocRailFoot,
  DocStart,
  DocTitle,
  DocVersions,
  RailAction,
  RailBlock,
  SaveState,
  VersionPreview,
  type DocComment,
} from "@/registry/aimy/ui/document"
import { Suggestion } from "@/registry/aimy/ui/suggestion"
import { toast } from "@/registry/aimy/ui/toast"
import { TrustState } from "@/registry/aimy/ui/trust-state"
import type { Version } from "@/registry/aimy/ui/version-list"

const BODY = `<p>Customers on an annual plan can ask for a refund within 30 days of renewal. After 30 days, the remaining months are credited to the account instead.</p><h3>Who can approve it</h3><p>Any support lead can approve a refund under £500. Above that, it needs the account owner and someone from finance.</p><ul><li>Check the renewal date in the billing record.</li><li>Say the amount and the date in the reply.</li></ul>`

const VERSIONS: Version[] = [
  {
    id: "3",
    n: 3,
    label: "Clarified who approves",
    author: "Dana Whitfield",
    how: "edited here",
    time: "12 Oct",
    current: true,
  },
  {
    id: "2",
    n: 2,
    ai: true,
    label: "Rewritten from 12 resolved tickets",
    author: "AiMY",
    how: "accepted by Dana Whitfield",
    time: "3 Oct",
  },
  { id: "1", n: 1, label: "First version", author: "Omar Said", how: "imported from Confluence", time: "14 Sep" },
]

const COMMENTS: DocComment[] = [
  {
    id: "c1",
    author: "Lina Farouk",
    time: "Yesterday",
    text: "Finance asked us to say 'credited', not 'refunded', after 30 days. Done.",
  },
  {
    id: "c2",
    author: "Omar Said",
    time: "2 hours ago",
    text: "The £500 limit changed to £750 last month.",
    problem: true,
  },
]

/* ── The whole page ──────────────────────────────────────────────── */
export function DocPageDemo() {
  const [dirty, setDirty] = useState(false)
  const [reading, setReading] = useState<Version | null>(null)
  const [proposal, setProposal] = useState<{ label: string; before: string; pending: boolean } | null>(null)
  const [comments, setComments] = useState(COMMENTS)

  const propose = (label: string, before = "") => {
    setProposal({ label, before, pending: true })
    window.setTimeout(() => setProposal((p) => (p ? { ...p, pending: false } : p)), 2200)
  }

  return (
    <div className="h-[48rem] overflow-hidden rounded-xl border border-edge p-6">
      <DocPage
        back={{ label: "All documents", onClick: () => toast("Back to all documents") }}
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
                  toast("Reported", {
                    sub: "It is a comment on the document now",
                    onUndo: () => setComments((c) => c.slice(0, -1)),
                  })
                }}
                onArchive={() => toast("Archive asks you to type “archive” first")}
              />
            }
          >
            <DocInsights
              items={[
                {
                  id: "i1",
                  text: "3 answers this week quoted the £500 limit, which a comment says is now £750.",
                  action: {
                    label: "Check the limit",
                    onClick: () =>
                      propose("Update the approval limit", "Any support lead can approve a refund under £500."),
                  },
                },
              ]}
            />
            <RailBlock title="What it is">
              <p className="text-meta text-ink-secondary">
                A policy, read by support agents. Reviewed every quarter; next due 12 Jan.
              </p>
            </RailBlock>
            <RailBlock title="What it connects to" count={2}>
              <ul className="flex flex-col gap-1.5 text-meta">
                <li className="flex items-center justify-between gap-2">
                  Billing FAQ
                  <button
                    type="button"
                    className="cite-action"
                    aria-label="Remove this connection"
                    title="Remove this connection"
                    onClick={() => toast("Connection removed", { onUndo: () => {} })}
                  >
                    <Link2Off aria-hidden="true" />
                  </button>
                </li>
                <li>Renewals playbook</li>
              </ul>
              <div className="rail-act">
                <RailAction onClick={() => toast("Pick documents to connect")}>Connect it to documents</RailAction>
              </div>
            </RailBlock>
            <RailBlock title="Where it came from">
              <p className="text-meta text-ink-secondary">Confluence, Support space. Synced 2 hours ago.</p>
              <div className="rail-act">
                <RailAction href="https://example.com">Open in Confluence</RailAction>
                <RailAction icon={<RefreshCw aria-hidden="true" />} onClick={() => toast("Re-syncing from Confluence")}>
                  Re-sync
                </RailAction>
              </div>
            </RailBlock>
          </DocRail>
        }
      >
        {reading ? (
          <VersionPreview
            n={reading.n}
            date={reading.time}
            onRestore={() => toast(`Restore v${reading.n} asks you to confirm first`)}
            onBack={() => setReading(null)}
          />
        ) : null}
        <DocHead
          byline={
            <DocByline
              status={<TrustState status="outdated" />}
              type={{ label: "Policy" }}
              owner={{ name: "Dana Whitfield", onClick: () => toast("Dana Whitfield") }}
              source={{ label: "Confluence", href: "https://example.com" }}
              collection={{ name: "Support", onClick: () => toast("The Support collection") }}
              versions={
                <DocVersions
                  updated="12 Oct"
                  versions={VERSIONS}
                  reading={reading?.id}
                  onOpen={(v) => setReading(v.current ? null : v)}
                />
              }
            />
          }
        />
        <DocTitle onChange={(t) => toast(`Renamed to “${t}”`, { onUndo: () => {} })}>Refunds on annual plans</DocTitle>
        <DocEditor
          html={BODY}
          readOnly={!!reading}
          onChange={() => setDirty(true)}
          selectionActions={["Rewrite", "Shorten", "Add the missing scope", "Find a source"]}
          onSelectionAction={(label, text) => propose(label, text)}
          docActions={["Rewrite for support agents", "Shorten", "Fill the gaps"]}
          onDocAction={(label) => propose(label)}
        />
        {proposal ? (
          <Suggestion
            key={proposal.label + proposal.before}
            title={proposal.label}
            before={proposal.before || undefined}
            after={
              proposal.before
                ? proposal.before.replace("£500", "£750").replace(/\.$/, "") + ", or the account owner above that."
                : "A tighter version of this policy, written for support agents."
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

/* ── The tools, each on its own ───────────────────────────────────── */
export function DocToolsDemo() {
  const [on, setOn] = useState<Record<string, boolean>>({ bold: true })
  const flip = (f: string) => setOn((o) => ({ ...o, [f]: !o[f] }))
  return (
    <div className="flex flex-col items-start gap-6">
      <SelectionMenu
        className="is-static"
        active={on}
        onFormat={flip}
        actions={["Rewrite", "Shorten", "Add the missing scope", "Find a source"]}
        onAction={(a) => toast(`AiMY: ${a}`, { sub: "Shown as a change to accept, edit or reject" })}
      />
      <WritingToolbar
        className="is-static"
        active={on}
        onFormat={flip}
        onAdd={() => toast("Opens the block menu")}
        onUndo={() => toast("Undo")}
        onRedo={() => toast("Redo")}
        ai={
          <AiMenu
            items={["Rewrite for support agents", "Shorten", "Fill the gaps"]}
            onPick={(a) => toast(`AiMY: ${a}`)}
          />
        }
      />
      <BlockMenu
        autoFocus={false}
        className="is-static"
        onPick={(f) => toast(`Turns the line into: ${f}`)}
        onClose={() => toast("Closed")}
      />
    </div>
  )
}

/* ── States: notices, a blank document ─────────────────────────────── */
export function DocStatesDemo() {
  return (
    <div className="flex flex-col gap-3">
      <DocNotice
        kind="archived"
        link={{ label: "Restore it", onClick: () => toast("Restored", { onUndo: () => {} }) }}
      />
      <DocNotice
        kind="replaced"
        link={{ label: "Go to the current one", onClick: () => toast("Opens the current one") }}
      />
      <DocNotice kind="outdated">
        Confluence changed after our copy. Still used in answers, and answers say so.
      </DocNotice>
      <div className="mt-4">
        <DocStart
          draft={
            <AiMenu
              trigger="start"
              items={["Write a first draft", "Outline it", "Draft from what it connects to"]}
              onPick={(a) => toast(`AiMY: ${a}`)}
            />
          }
          onFile={() => toast("Pick a file")}
          onConnect={() => toast("Pick documents")}
        />
      </div>
    </div>
  )
}
