"use client"

import { useState } from "react"
import { FileDrop } from "@/registry/aimy/ui/file-drop"

export function FileDropDemo() {
  const [got, setGot] = useState<string[]>([])
  return (
    <div className="flex flex-col gap-3">
      <FileDrop accept={[".csv", ".xlsx"]} maxSize={10_000_000} label="Upload contacts" onFiles={(files) => setGot(files.map((f) => f.name))} />
      <p className="text-meta text-ink-secondary" aria-live="polite">
        {got.length ? `Ready to import: ${got.join(", ")}.` : "Nothing chosen yet."}
      </p>
    </div>
  )
}
