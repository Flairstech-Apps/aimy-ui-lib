"use client"

import { useState } from "react"
import { type AutonomyLevel } from "@/lib/behaviors-agent"
import { useAgent as useBridge } from "@/lib/behaviors-agent-react"
import { AimyMark } from "@/registry/aimy/brand/aimy-mark"
import { AgentAsks, AgentLog, AgentProvider } from "@/registry/aimy/ui/agent-bridge"
import { Autonomy } from "@/registry/aimy/ui/autonomy"
import { Button } from "@/registry/aimy/ui/button"
import { Combobox } from "@/registry/aimy/ui/combobox"
import { Field } from "@/registry/aimy/ui/field"
import { InlineEdit } from "@/registry/aimy/ui/inline-edit"
import { Select, SelectItem } from "@/registry/aimy/ui/select"
import { SortableList } from "@/registry/aimy/ui/sortable-list"

const COMPANIES = [
  { value: "kestrel", label: "Kestrel Logistics", description: "Freight" },
  { value: "atlas", label: "Atlas Energy", description: "Utilities" },
  { value: "harbor", label: "Harbor Health", description: "Clinics" },
]

// What a model would send, one tool call at a time. In a product these come
// from the model's tool use; here they are scripted so the demo needs no model.
const PLAN: { say: string; tool: string; input: Record<string, unknown> }[] = [
  { say: "Reading the screen", tool: "read_screen", input: {} },
  { say: "Choosing the company", tool: "deal-company__choose", input: { option: "Atlas Energy" } },
  { say: "Naming the deal", tool: "deal-name__set", input: { value: "Atlas Energy renewal" } },
  { say: "Moving it to Proposal", tool: "deal-stage__choose", input: { option: "Proposal sent" } },
  { say: "Putting the contract review first", tool: "deal-steps__move", input: { item: "Contract review", position: 1 } },
]

export function AgentBridgeDemo() {
  const [level, setLevel] = useState<AutonomyLevel>("tell")
  return (
    <AgentProvider levelFor={() => level}>
      <DealDemo level={level} setLevel={setLevel} />
    </AgentProvider>
  )
}

function DealDemo({ level, setLevel }: { level: AutonomyLevel; setLevel: (l: AutonomyLevel) => void }) {
  const [company, setCompany] = useState<string | null>("kestrel")
  const [name, setName] = useState("Kestrel Q4")
  const [stage, setStage] = useState("new")
  const [steps, setSteps] = useState(["Discovery call", "Pricing", "Contract review"])
  return (
    <div className="flex flex-col gap-5">
      <Autonomy title="Changing this deal" value={level} onValueChange={setLevel} />
      <div className="grid gap-5 column:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-xl border border-edge bg-card p-5">
          <InlineEdit agent="deal-name" label="Deal name" size="title" value={name} onSave={setName} />
          <Field label="Company">
            <Combobox agent="deal-company" options={COMPANIES} value={company} onValueChange={setCompany} />
          </Field>
          <Field label="Stage">
            <Select agent="deal-stage" value={stage} onValueChange={setStage}>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="proposal">Proposal sent</SelectItem>
              <SelectItem value="won">Won</SelectItem>
            </Select>
          </Field>
          <div className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold text-ink-secondary">Next steps</p>
            <SortableList agent="deal-steps" label="Next steps" items={steps} getKey={(s) => s} getLabel={(s) => s} onReorder={setSteps} renderItem={(s) => s} />
          </div>
        </div>
        <AimyPanel />
      </div>
    </div>
  )
}

function AimyPanel() {
  const bridge = useBridge()
  const [now, setNow] = useState<string | null>(null)
  const [tools, setTools] = useState<string | null>(null)
  const run = async () => {
    if (!bridge) return
    for (const step of PLAN) {
      setNow(step.say)
      const r = await bridge.act(step.tool, step.input)
      if (!r.ok) {
        setNow(r.message)
        return
      }
      await new Promise((ok) => setTimeout(ok, 900))
    }
    setNow(null)
  }
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-edge bg-raised p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-[1lh] shrink-0 items-center text-meta">
          <AimyMark title="" className="h-4 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-meta text-ink">&ldquo;Set this up as the Atlas Energy renewal, at proposal, contract review first.&rdquo;</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button variant="brand" size="sm" onClick={() => void run()} disabled={!!now}>
              Let AiMY do it
            </Button>
            {now ? (
              <span role="status" className="text-xs text-ai-ink">
                {now}…
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <AgentAsks />
      <div>
        <p className="mb-1 text-xs font-semibold text-ink-secondary">What AiMY did</p>
        <AgentLog />
      </div>
      <div>
        <Button size="sm" onClick={() => setTools(tools ? null : JSON.stringify(bridge?.tools() ?? [], null, 2))}>
          {tools ? "Hide the tools" : "Show the tools a model gets"}
        </Button>
        {tools ? <pre className="mt-2 max-h-64 overflow-auto rounded-md bg-card p-3 font-mono text-2xs text-ink-secondary">{tools}</pre> : null}
      </div>
    </div>
  )
}
