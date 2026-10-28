"use client"

import { useState } from "react"
import { Chip } from "@/registry/aimy/ui/chip"

export function ChipDemo() {
  const [on, setOn] = useState<Record<string, boolean>>({ "Needs reply": true })
  const [week, setWeek] = useState(true)
  return (
    <div className="flex flex-wrap items-center gap-2">
      {["Needs reply", "Meeting Set", "Only mine"].map((label) => (
        <Chip key={label} selected={!!on[label]} onClick={() => setOn((s) => ({ ...s, [label]: !s[label] }))}>
          {label}
        </Chip>
      ))}
      {week ? (
        <Chip selected onRemove={() => setWeek(false)}>
          This week
        </Chip>
      ) : (
        <Chip onClick={() => setWeek(true)}>Add this week</Chip>
      )}
    </div>
  )
}
