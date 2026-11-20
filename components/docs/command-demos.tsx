"use client"

import { useState } from "react"
import { useCommand } from "@/lib/behaviors-agent-react"
import { AgentLog, AgentProvider } from "@/registry/aimy/ui/agent-bridge"
import { Button } from "@/registry/aimy/ui/button"
import { Combobox } from "@/registry/aimy/ui/combobox"
import { CommandBar } from "@/registry/aimy/ui/command-bar"
import { Field } from "@/registry/aimy/ui/field"
import { InlineEdit } from "@/registry/aimy/ui/inline-edit"
import { Kbd } from "@/registry/aimy/ui/kbd"
import { Select, SelectItem } from "@/registry/aimy/ui/select"
import { SortableList } from "@/registry/aimy/ui/sortable-list"
import { toast } from "@/registry/aimy/ui/toast"

const COMPANIES = [
  { value: "kestrel", label: "Kestrel Logistics" },
  { value: "atlas", label: "Atlas Energy" },
  { value: "harbor", label: "Harbor Health" },
]

function PageCommands() {
  useCommand("go-contacts", { group: "Go to", label: "Contacts", said: "opened Contacts", level: "tell", run: () => void toast("The app would open Contacts here") })
  useCommand("go-pipeline", { group: "Go to", label: "Pipeline", said: "opened the pipeline", level: "tell", run: () => void toast("The app would open the pipeline here") })
  useCommand("new-deal", { group: "Create", label: "New deal", said: "started a new deal", run: () => void toast("The app would start a new deal here") })
  return null
}

export function CommandBarDemo() {
  const [open, setOpen] = useState(false)
  const [company, setCompany] = useState<string | null>("kestrel")
  const [name, setName] = useState("Kestrel Q4")
  const [stage, setStage] = useState("new")
  const [steps, setSteps] = useState(["Discovery call", "Pricing", "Contract review"])
  return (
    <AgentProvider>
      <PageCommands />
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="brand" onClick={() => setOpen(true)}>
            Open the command bar
          </Button>
          <span className="flex items-center gap-1.5 text-xs text-ink-secondary">
            then try &ldquo;atlas&rdquo;, &ldquo;proposal&rdquo;, &ldquo;rename&rdquo; or a question. In an app <Kbd keys={["Ctrl", "K"]} /> opens it; here that key searches the docs.
          </span>
        </div>
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
          <div className="flex flex-col gap-2 rounded-xl border border-edge bg-raised p-5">
            <p className="text-xs font-semibold text-ink-secondary">What changed</p>
            <AgentLog everyone />
            <p className="mt-auto flex items-center gap-1.5 pt-2 text-2xs text-ink-secondary">
              <Kbd keys={["Ctrl", "Z"]} /> anywhere outside a field takes back the last one.
            </p>
          </div>
        </div>
      </div>
      <CommandBar shortcut={false} open={open} onOpenChange={setOpen} onAsk={(q) => toast(`AiMY would answer: “${q}”`)} />
    </AgentProvider>
  )
}
