"use client"

import { useState } from "react"
import type { Source, TrustStatus } from "@/registry/aimy/lib/ai-types"
import { Button } from "@/registry/aimy/ui/button"
import { Citation } from "@/registry/aimy/ui/citation"
import { Composer } from "@/registry/aimy/ui/composer"
import { Confidence, type ConfidenceLevel } from "@/registry/aimy/ui/confidence"
import { ResponseActions } from "@/registry/aimy/ui/response-actions"
import { Score } from "@/registry/aimy/ui/score"
import { SourceLine } from "@/registry/aimy/ui/source-line"
import { SourceList } from "@/registry/aimy/ui/source-list"
import { toast } from "@/registry/aimy/ui/toast"
import { DisclosureAction, TrustDisclosure } from "@/registry/aimy/ui/trust-disclosure"
import { TrustState } from "@/registry/aimy/ui/trust-state"

const SOURCES: Source[] = [
  {
    id: "1",
    title: "Refund policy: EU customers",
    status: "outdated",
    passage: "Customers in the EU may cancel within 14 days of purchase, unless the licence has been activated.",
    type: "Policy",
    connector: "Confluence",
    collection: "Billing",
  },
  {
    id: "2",
    title: "Activation and refunds FAQ",
    status: "current",
    passage:
      "Once a licence is activated, the refund window closes. Support can make an exception for a failed install.",
    type: "Article",
    connector: "Zendesk",
    collection: "Help centre",
  },
  {
    id: "3",
    title: "Refunds before 2024",
    status: "superseded",
    setByHand: true,
    passage: "All customers may request a full refund within 30 days.",
    type: "Policy",
    connector: "Confluence",
    collection: "Archive",
  },
]

const open = (s: Source) => toast(`Opened ${s.title}`)
const flag = () => {}

export function CitationDemo() {
  const [drawer, setDrawer] = useState(false)
  const [s1, s2, s3] = SOURCES as [Source, Source, Source]
  return (
    <div className="flex flex-col gap-4 text-body text-ink">
      <p>
        No. EU customers can cancel within 14 days, but not once the licence is activated
        <Citation n={1} source={s1} onFlag={flag} />. Support can make an exception when the install failed
        <Citation n={2} source={s2} onFlag={flag} />. The older 30-day rule no longer applies
        <Citation n={3} source={s3} onFlag={flag} />.
      </p>
      <SourceList sources={SOURCES} onOpen={open} />
      <ResponseActions
        text="No. EU customers can cancel within 14 days…"
        sources={3}
        sourcesOpen={drawer}
        onSourcesChange={setDrawer}
      />
      {drawer ? <SourceList variant="drawer" sources={SOURCES} onOpen={open} /> : null}
      <SourceLine>From your last 3 calls</SourceLine>
    </div>
  )
}

const STATUSES: TrustStatus[] = ["current", "outdated", "conflicting", "draft", "unowned", "unused", "superseded"]

export function TrustStateDemo() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <TrustState key={s} status={s} />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-ink-secondary">
        Set by hand: <TrustState status="current" setByHand />
      </div>
    </div>
  )
}

export function TrustDisclosureDemo() {
  const [staged, setStaged] = useState(false)
  return (
    <div className="flex flex-col gap-4">
      <TrustDisclosure
        rows={[
          {
            tone: "err",
            children: (
              <>
                <strong>One cited source is behind Confluence</strong> — the source changed after our copy. It is still
                answering, and this is what that looks like.
              </>
            ),
          },
          {
            tone: "warn",
            children: (
              <>
                The second source is unscoped: it does not say which storefront it applies to. That is the actual
                defect.
              </>
            ),
          },
        ]}
      />
      <TrustDisclosure
        exclusion
        rows={[
          {
            tone: "none",
            children: (
              <>
                <strong>0 sources matched.</strong> This is a genuine coverage gap, not a retrieval or a permission
                problem.
              </>
            ),
          },
        ]}
        actions={
          <>
            <DisclosureAction onClick={() => toast("Draft started", { sub: "From the question nothing could answer" })}>
              Raise it as a coverage gap →
            </DisclosureAction>
            <DisclosureAction
              disabled={staged}
              onClick={() => {
                setStaged(true)
                toast("Request staged for a person", {
                  sub: "Nothing was sent — there is no routing yet. The question and its scope are recorded.",
                })
              }}
            >
              {staged ? "Staged" : "Ask a person instead"}
            </DisclosureAction>
          </>
        }
      />
    </div>
  )
}

export function ConfidenceDemo() {
  const [level, setLevel] = useState<ConfidenceLevel>("old")
  const check = () => {
    setLevel("busy")
    window.setTimeout(() => {
      setLevel("ok")
      toast("Company: checked again on LinkedIn", { sub: "Nothing had changed.", onUndo: () => setLevel("old") })
    }, 2400)
  }
  const row = (label: string, el: React.ReactNode) => (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-edge bg-card px-4 py-2.5">
      <span className="text-xs font-semibold text-ink">{label}</span>
      {el}
    </div>
  )
  return (
    <div className="flex flex-col gap-2">
      {row(
        "Company",
        <Confidence
          level={level}
          group="Company"
          when="just now"
          source="on LinkedIn"
          checkedIn="March 2025"
          onCheckAgain={check}
        />
      )}
      {row("Role", <Confidence level="ok" group="Role" when="3 weeks ago" source="on LinkedIn" />)}
      {row(
        "Contact details",
        <Confidence
          level="gap"
          group="Contact details"
          missing={["a direct line", "a second email"]}
          onFindOut={() =>
            toast("AiMY found more about Dana", { sub: "The summary and the details are filled in.", onUndo: () => {} })
          }
        />
      )}
      {row(
        "Buying history",
        <Confidence
          level="none"
          group="Buying history"
          missing={["past orders", "contract dates"]}
          onFindOut={() => {}}
        />
      )}
    </div>
  )
}

export function ScoreDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Score value={86} label="Fit" />
      <Score value={62} label="Fit" />
      <Score value={31} label="Fit" />
    </div>
  )
}

export function UnavailableDemo() {
  const [down, setDown] = useState(true)
  return (
    <div className="flex flex-col gap-4">
      <Composer
        unavailable={down ? "AiMY is unavailable — the filters still work" : undefined}
        onSubmit={(q) => toast(`Asked: ${q}`, { sub: "Sent now that AiMY is back" })}
        onVoice={() => {}}
      />
      <Button size="sm" className="self-start" onClick={() => setDown((d) => !d)}>
        {down ? "Bring AiMY back" : "Take AiMY down"}
      </Button>
    </div>
  )
}
