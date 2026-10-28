"use client"

import { ChevronDown } from "lucide-react"
import { Menu, MenuContent, MenuLabel, MenuRadioGroup, MenuRadioItem, MenuTrigger } from "@/components/menu"

// Which AiMY model answers: the design system's .model-picker (neither
// product has a model choice yet). The AI gradient dot, the model's name and
// its tag, and a menu where each model says what it is for. The spec leaves
// the menu open; this uses the library's Menu.
//
//   <ModelPicker value={model} onValueChange={setModel} models={[
//     { id: "reasoning", name: "AiMY Reasoning", tag: "Pro", description: "Slower, checks its sources against each other" },
//     { id: "fast", name: "AiMY Fast", description: "Quick answers from what it already knows" }]} />

export type Model = { id: string; name: string; tag?: string; description?: string }

type ModelPickerProps = {
  models: Model[]
  value: string
  onValueChange: (id: string) => void
}

export function ModelPicker({ models, value, onValueChange }: ModelPickerProps) {
  const current = models.find((m) => m.id === value) ?? models[0]
  return (
    <Menu>
      <MenuTrigger asChild>
        <button type="button" data-slot="model-picker" className="model-picker" aria-label={`Model: ${current?.name}`}>
          <span className="model-dot" aria-hidden="true" />
          <span className="model-name">{current?.name}</span>
          {current?.tag ? <span className="model-tag">{current.tag}</span> : null}
          <ChevronDown aria-hidden="true" strokeWidth={2.5} />
        </button>
      </MenuTrigger>
      <MenuContent align="start">
        <MenuLabel>Answer with</MenuLabel>
        <MenuRadioGroup value={value} onValueChange={onValueChange}>
          {models.map((m) => (
            <MenuRadioItem key={m.id} value={m.id} description={m.description}>
              {m.name}
              {m.tag ? <span className="model-tag ml-2">{m.tag}</span> : null}
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  )
}
