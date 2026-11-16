"use client"

import { Archive, BellOff, FileText, Folder } from "lucide-react"
import { useState } from "react"
import { Combobox } from "@/registry/aimy/ui/combobox"
import { Field } from "@/registry/aimy/ui/field"
import { InlineEdit } from "@/registry/aimy/ui/inline-edit"
import { ResizablePanels } from "@/registry/aimy/ui/resizable-panels"
import { SortableList } from "@/registry/aimy/ui/sortable-list"
import { SwipeRow } from "@/registry/aimy/ui/swipe-row"
import { toast } from "@/registry/aimy/ui/toast"
import { Tree, type TreeItem } from "@/registry/aimy/ui/tree"

const COMPANIES = [
  { value: "kestrel", label: "Kestrel Logistics", description: "Freight, 1,200 people" },
  { value: "northwind", label: "Northwind Foods", description: "Retail, 840 people" },
  { value: "harbor", label: "Harbor Health", description: "Clinics, 3,100 people" },
  { value: "atlas", label: "Atlas Energy", description: "Utilities, 5,600 people" },
  { value: "juniper", label: "Juniper Bank", description: "Finance, 9,800 people" },
  { value: "orbit", label: "Orbit Telecom", description: "Telecoms, 2,400 people" },
  { value: "summit", label: "Summit Schools", description: "Education, 610 people", disabled: true },
]

export function ComboboxDemo() {
  const [company, setCompany] = useState<string | null>("kestrel")
  return (
    <div className="flex max-w-[22rem] flex-col gap-4">
      <Field label="Company" help="Type a name or what they do.">
        <Combobox options={COMPANIES} value={company} onValueChange={setCompany} placeholder="Find a company" />
      </Field>
      <Field label="Company" error="Choose the company this deal is with.">
        <Combobox options={COMPANIES} placeholder="Find a company" />
      </Field>
    </div>
  )
}

export function InlineEditDemo() {
  const [name, setName] = useState("Q4 renewals")
  const [note, setNote] = useState("Call before the 20th; they asked for the new pricing.")
  return (
    <div className="flex max-w-[28rem] flex-col gap-3">
      <InlineEdit label="List name" size="title" value={name} onSave={setName} validate={(v) => (v.trim() ? null : "Give the list a name.")} />
      <InlineEdit label="Note" value={note} onSave={setNote} multiline placeholder="Add a note" />
    </div>
  )
}

const KNOWLEDGE: TreeItem[] = [
  {
    id: "policies",
    label: "Policies",
    icon: <Folder />,
    meta: "3",
    children: [
      { id: "leave", label: "Leave and holidays", icon: <FileText />, meta: "2 Nov" },
      { id: "travel", label: "Travel and expenses", icon: <FileText />, meta: "28 Oct" },
      { id: "security", label: "Security", icon: <Folder />, children: [{ id: "passwords", label: "Passwords", icon: <FileText /> }] },
    ],
  },
  { id: "products", label: "Products", icon: <Folder />, meta: "2", children: [{ id: "cloud", label: "Cloud", icon: <FileText /> }, { id: "data", label: "Data", icon: <FileText /> }] },
  { id: "faq", label: "Questions people ask", icon: <FileText /> },
]

export function TreeDemo() {
  const [selected, setSelected] = useState<string | null>("leave")
  return (
    <div className="flex max-w-[22rem] flex-col gap-6">
      <Tree label="Collections" items={KNOWLEDGE} defaultExpanded={["policies"]} selected={selected} onSelect={setSelected} />
      <Tree label="What AiMY can read" items={KNOWLEDGE} defaultExpanded={["policies", "products"]} checkable defaultChecked={["leave", "cloud", "data"]} />
    </div>
  )
}

type Stage = { id: string; name: string; deals: number }

export function SortableDemo() {
  const [stages, setStages] = useState<Stage[]>([
    { id: "new", name: "New", deals: 14 },
    { id: "qualified", name: "Qualified", deals: 9 },
    { id: "proposal", name: "Proposal sent", deals: 5 },
    { id: "won", name: "Won", deals: 3 },
  ])
  return (
    <div className="max-w-[24rem]">
      <SortableList
        label="Pipeline stages"
        items={stages}
        getKey={(s) => s.id}
        getLabel={(s) => s.name}
        onReorder={setStages}
        renderItem={(s) => (
          <span className="flex items-center justify-between gap-3">
            <span className="font-semibold">{s.name}</span>
            <span className="text-ink-secondary">{s.deals} deals</span>
          </span>
        )}
      />
    </div>
  )
}

export function SwipeDemo() {
  return (
    <div className="flex max-w-[22rem] flex-col gap-2">
      {["Kestrel replied about pricing", "Atlas asked for a call on Monday"].map((t) => (
        <SwipeRow
          key={t}
          leading={{ label: "Snooze", icon: <BellOff />, tone: "warn", onAction: () => toast(`Snoozed until tomorrow: ${t}`) }}
          trailing={{ label: "Archive", icon: <Archive />, tone: "info", onAction: () => toast(`Archived: ${t}`) }}
        >
          <div className="border border-edge px-4 py-3 text-xs text-ink">{t}</div>
        </SwipeRow>
      ))}
    </div>
  )
}

export function ResizableDemo() {
  return (
    <ResizablePanels defaultSizes={[35, 65]} min={[20, 40]} labels={["Contacts", "Contact"]} className="h-56 rounded-lg border border-edge">
      <div className="p-4 text-xs text-ink-secondary">
        <p className="font-semibold text-ink">Contacts</p>
        <p className="mt-1">Drag the line, or Tab to it and use the arrows.</p>
      </div>
      <div className="p-4 text-xs text-ink-secondary">
        <p className="font-semibold text-ink">Kestrel Logistics</p>
        <p className="mt-1">The list never goes below a fifth; the detail keeps at least two fifths.</p>
      </div>
    </ResizablePanels>
  )
}
