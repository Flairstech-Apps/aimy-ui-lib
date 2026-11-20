"use client"

import { useState } from "react"
import { Field } from "@/registry/aimy/ui/field"
import { MultiSelect } from "@/registry/aimy/ui/multi-select"
import { TagInput } from "@/registry/aimy/ui/tag-input"

const TEAMS = ["Sales", "Support", "Billing", "Legal", "Operations", "Finance"].map((t) => ({ value: t.toLowerCase(), label: t }))

export function MultiSelectDemo() {
  const [teams, setTeams] = useState<string[]>(["sales"])
  return (
    <Field label="Teams" optional>
      <MultiSelect options={TEAMS} value={teams} onValueChange={setTeams} placeholder="Any team" />
    </Field>
  )
}

export function TagInputDemo() {
  const [regions, setRegions] = useState<string[]>(["EMEA", "APAC"])
  return (
    <Field label="Regions" help="Press Enter or type a comma after each.">
      <TagInput value={regions} onValueChange={setRegions} placeholder="Add a region" validate={(t) => (/^[A-Za-z]{2,5}$/.test(t) ? null : "Use a region code, like EMEA.")} />
    </Field>
  )
}
