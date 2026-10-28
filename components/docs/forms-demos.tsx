"use client"

import { useState } from "react"
import { Button } from "@/registry/aimy/ui/button"
import { Checkbox } from "@/registry/aimy/ui/checkbox"
import { CopyButton } from "@/registry/aimy/ui/copy-button"
import { Field } from "@/registry/aimy/ui/field"
import { Input } from "@/registry/aimy/ui/input"
import { PasswordField } from "@/registry/aimy/ui/password-field"
import { SearchField } from "@/registry/aimy/ui/search-field"
import { Segmented } from "@/registry/aimy/ui/segmented"
import { Select, SelectItem } from "@/registry/aimy/ui/select"
import { Switch } from "@/registry/aimy/ui/switch"
import { Textarea } from "@/registry/aimy/ui/textarea"

export function FieldsDemo({ variant }: { variant: "box" | "line" }) {
  const [name, setName] = useState("")
  const [error, setError] = useState<string>()
  return (
    <form
      noValidate
      className="flex max-w-[24rem] flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        setError(name.trim() ? undefined : "It still needs a name.")
      }}
    >
      <Field label="Contact name" error={error}>
        <Input variant={variant} value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="What they asked for" help="AiMY drafts the reply from this." optional>
        <Textarea variant={variant} rows={2} />
      </Field>
      <Field label="Auth token">
        <PasswordField variant={variant} secretName="the token" defaultValue="sk_live_51Kestrel" />
      </Field>
      <div>
        <Button variant="brand" type="submit">
          Save the contact
        </Button>
      </div>
    </form>
  )
}

export function SearchDemo() {
  return (
    <div className="flex flex-col gap-4">
      <SearchField label="Search contacts" className="w-64" />
      <SearchField label="Search documents" variant="line" className="w-64" />
    </div>
  )
}

export function SelectDemo() {
  return (
    <div className="flex flex-wrap items-start gap-3">
      <Select label="Owner" defaultValue="engy">
        <SelectItem value="engy">Engy Hassan</SelectItem>
        <SelectItem value="lina">Lina Farouk</SelectItem>
        <SelectItem value="sherif">Sherif Adel</SelectItem>
      </Select>
      <Select label="Stage" placeholder="Choose a stage">
        <SelectItem value="new">New</SelectItem>
        <SelectItem value="talking">Talking</SelectItem>
        <SelectItem value="won">Won</SelectItem>
        <SelectItem value="lost" disabled>
          Lost
        </SelectItem>
      </Select>
      <Field label="Region" error="Choose where this contact sits." className="w-48">
        <Select placeholder="Choose a region">
          <SelectItem value="emea">EMEA</SelectItem>
          <SelectItem value="na">North America</SelectItem>
        </Select>
      </Field>
    </div>
  )
}

export function ChoiceDemo() {
  return (
    <div className="flex flex-col gap-3">
      <Checkbox label="Only my calls" defaultChecked />
      <Checkbox label="Include archived" />
      <Checkbox label="All teams" checked="indeterminate" />
      <Checkbox label="Export to Salesforce" disabled />
    </div>
  )
}

export function SwitchDemo() {
  return (
    <div className="flex flex-col gap-3">
      <Switch label="Email me the daily summary" defaultChecked />
      <Switch label="Let AiMY draft replies" />
      <Switch label="Voice mode" disabled lockedReason="Your plan doesn't include voice." />
      <Switch label="Call recording" disabled defaultChecked lockedReason="Your admin keeps this on." />
    </div>
  )
}

export function SegmentedDemo() {
  return (
    <div className="flex flex-col gap-4">
      <Segmented
        label="Show"
        options={[
          { value: "day", label: "Day" },
          { value: "week", label: "Week" },
          { value: "month", label: "Month" },
        ]}
      />
      <Segmented
        label="Source"
        defaultValue="calls"
        options={[
          { value: "calls", label: "Calls" },
          { value: "emails", label: "Emails" },
          { value: "meetings", label: "Meetings and notes" },
        ]}
      />
    </div>
  )
}

export function CopyDemo() {
  return (
    <div className="flex items-center gap-3">
      <code className="rounded-md bg-w05 px-3 py-1.5 font-mono text-xs text-ink">https://hooks.aimy.app/k3s7</code>
      <CopyButton value="https://hooks.aimy.app/k3s7" what="the webhook URL" />
    </div>
  )
}
