"use client"

import { Check, ChevronDown } from "lucide-react"
import { useEffect, useId, useState } from "react"
import { controlStyles, useField, useShake } from "@/components/field"
import { focus } from "@/lib/behaviors"
import { useAgentSurface } from "@/lib/behaviors-agent-react"
import { Portal, composeRefs, useControllable, useElement, useLayer, useListbox, usePresence } from "@/lib/behaviors-react"
import { PopperContent } from "@/lib/popper-primitive"
import { cn } from "@/lib/utils"

// Choose one option by typing to narrow a long list: an owner from 200
// people, a company, a product. The field is the box field; the list is
// Select's raised panel and rows, so the two read as one family. Focus stays
// in the field the whole time (aria-activedescendant follows the
// highlight). Built on AiMY's listbox behaviour; opens and closes with
// transitions.dev's menu dropdown (05).

export type ComboboxOption = {
  value: string
  label: string
  /** A second line under the label (a role, a domain). */
  description?: string
  disabled?: boolean
}

type ComboboxProps = {
  options: ComboboxOption[]
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  placeholder?: string
  /** Accessible name when the combobox is not inside a Field. */
  label?: string
  /** What the list says when nothing matches. */
  emptyText?: string
  disabled?: boolean
  /** Adds a hidden input with the value, for a form. */
  name?: string
  className?: string
  /** Shows this part to AiMY under this id (inside an AgentProvider), so it can read it and act on it. */
  agent?: string
  /** Puts focus in the field when it first shows. */
  autoFocus?: boolean
  /** The words as they are typed, for a server search: fetch with them and pass what comes back as options. */
  onQueryChange?: (query: string) => void
  /** false when the options are already narrowed (by a server search), so the typed words don't narrow them again. */
  filter?: boolean
}

export function Combobox({
  options,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  placeholder = "Type to search",
  label,
  emptyText = "Nothing matches. Try fewer words.",
  disabled,
  name,
  className,
  agent,
  autoFocus,
  onQueryChange,
  filter = true,
}: ComboboxProps) {
  const field = useField()
  const shake = useShake<HTMLDivElement>(field?.error)
  const [value, setValue] = useControllable<string | null>({ value: valueProp, defaultValue, onChange: (v) => onValueChange?.(v) })
  // The chosen option's name survives a later search that no longer returns it.
  const [lastChosen, setLastChosen] = useState<ComboboxOption | null>(null)
  const found = options.find((o) => o.value === value) ?? null
  if (found && found !== lastChosen) setLastChosen(found)
  const chosen = found ?? (lastChosen && lastChosen.value === value ? lastChosen : null)
  const [open, setOpen] = useState(false)
  const [typing, setTyping] = useState(false)
  const [anchor, anchorRef] = useElement<HTMLDivElement>()
  const [panel, panelRef] = useElement<HTMLElement>()
  const { present, ref: presenceRef } = usePresence(open)
  const id = useId()
  const listId = `${id}-list`
  // Encoded, not stripped: "Zoë" and "Zoé" stay two ids.
  const optId = (v: string) => `${id}-opt-${encodeURIComponent(v)}`

  const lb = useListbox({
    items: () => options,
    key: (o) => o.value,
    text: (o) => `${o.label} ${o.description ?? ""}`,
    filter: filter ? undefined : null,
    disabled: (o) => !!o.disabled,
    onSelect: (o) => {
      setValue(o.value)
      setTyping(false)
      setOpen(false)
    },
    onHighlight: (k) => {
      if (k) document.getElementById(optId(k))?.scrollIntoView?.({ block: "nearest" })
    },
  })

  const usable = options.filter((o) => !o.disabled)
  useAgentSurface(
    agent,
    {
      kind: "combobox",
      label: label ?? "",
      state: () => ({ chosen: chosen?.label ?? null, options: usable.map((o) => o.label) }),
      actions: {
        choose: {
          description: "Choose an option",
          keywords: "pick select set change",
          params: { option: { type: "string", description: "The option's name as shown", enum: usable.map((o) => o.label) } },
          say: (p) => `chose ${p.option}`,
          run: (p) => {
            const prev = value
            setValue(usable.find((o) => o.label === p.option)?.value ?? null)
            return () => setValue(prev)
          },
        },
        clear: {
          description: "Clear the choice",
          say: () => "cleared the choice",
          run: () => {
            const prev = value
            setValue(null)
            return () => setValue(prev)
          },
        },
      },
    },
    anchor
  )

  const close = () => {
    setOpen(false)
    setTyping(false)
  }
  useLayer(panel, open && !!panel, { onDismiss: close, branches: () => [anchor] })

  // New options while the list is open (a server search answering): keep the
  // highlight if it still shows, otherwise light the first match, as typing does.
  const { setQuery, query } = lb
  useEffect(() => {
    if (open) setQuery(query)
    // Only when the options change, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options])

  const visible = lb.visible()
  const shown = typing ? lb.query : (chosen?.label ?? "")

  const openList = () => {
    if (disabled) return
    if (!open) {
      lb.setQuery(typing ? lb.query : "")
      lb.highlight(value)
      // The chosen name is selected, so typing replaces it instead of adding to it.
      if (!typing) anchor?.querySelector("input")?.select()
    }
    setOpen(true)
  }

  return (
    <div ref={composeRefs(anchorRef, shake)} data-slot="combobox" className={cn("relative w-full", className)}>
      <input
        id={field?.id}
        role="combobox"
        aria-label={field ? undefined : label}
        aria-expanded={open}
        aria-controls={open && lb.visible().length ? listId : undefined}
        aria-activedescendant={open && lb.highlighted ? optId(lb.highlighted) : undefined}
        aria-autocomplete="list"
        aria-invalid={field?.invalid || undefined}
        aria-describedby={field?.describedBy}
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
        placeholder={placeholder}
        value={shown}
        autoFocus={autoFocus}
        onChange={(e) => {
          setTyping(true)
          lb.setQuery(e.target.value)
          onQueryChange?.(e.target.value)
          setOpen(true)
        }}
        onClick={openList}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            if (open) {
              e.preventDefault()
              e.stopPropagation()
              close()
            } else if (typing) close()
            return
          }
          if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            e.preventDefault()
            openList()
            return
          }
          if (open) lb.onKeyDown(e, true)
        }}
        onBlur={(e) => {
          if (!panel?.contains(e.relatedTarget as Node)) close()
        }}
        className={cn(controlStyles.base, controlStyles.box, "min-h-9 pr-8")}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        disabled={disabled}
        onPointerDown={(e) => e.preventDefault()}
        onClick={() => {
          if (open) close()
          else {
            openList()
            anchor?.querySelector("input")?.focus()
          }
        }}
        className="absolute inset-y-0 right-0 grid w-8 place-items-center text-ink-secondary"
      >
        <ChevronDown strokeWidth={2} className={cn("size-3.5 transition-transform duration-(--t-fast) ease-out", open && "rotate-180")} />
      </button>
      {name ? <input type="hidden" name={name} value={value ?? ""} /> : null}
      {present ? (
        <Portal>
          <PopperContent
            anchor={anchor}
            open={present}
            side="bottom"
            align="start"
            sideOffset={4}
            collisionPadding={10}
            ref={composeRefs(panelRef, presenceRef)}
            data-state={open ? "open" : "closed"}
            // Pressing a row must not take focus from the field.
            onPointerDown={(e: React.PointerEvent) => e.preventDefault()}
            className={cn(
              "t-dropdown z-(--z-dropdown) max-h-[min(16.25rem,var(--available-height))] w-[var(--anchor-width)] min-w-[10rem]",
              "overflow-y-auto rounded-lg border border-w10 bg-raised p-1 shadow-lg"
            )}
          >
            {visible.length ? (
            <ul id={listId} role="listbox" aria-label={label ?? "Options"}>
              {visible.map((o) => {
                const lit = lb.highlighted === o.value
                const isChosen = o.value === value
                return (
                  <li
                    key={o.value}
                    id={optId(o.value)}
                    role="option"
                    aria-selected={isChosen}
                    aria-disabled={o.disabled || undefined}
                    data-highlighted={lit ? "" : undefined}
                    onPointerMove={() => !o.disabled && lb.highlight(o.value)}
                    onClick={() => {
                      lb.select(o)
                      focus(anchor?.querySelector("input"))
                    }}
                    className={cn(
                      "flex cursor-pointer items-start gap-2 rounded-sm px-2.5 py-1.5 text-xs text-ink-secondary select-none",
                      "transition-[background-color,color] duration-(--t-intent) ease-out data-highlighted:bg-w06 data-highlighted:text-ink",
                      isChosen && "bg-brand-dim text-ai-ink",
                      o.disabled && "cursor-not-allowed opacity-[0.38]"
                    )}
                  >
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-semibold">{o.label}</span>
                      {o.description ? <span className="truncate text-ink-secondary">{o.description}</span> : null}
                    </span>
                    {isChosen ? <Check aria-hidden="true" strokeWidth={2} className="mt-px size-3.5 shrink-0 transition-[opacity,scale] duration-(--t-base) ease-(--ease-spring) starting:scale-50 starting:opacity-0" /> : null}
                  </li>
                )
              })}
            </ul>
            ) : null}
            {!visible.length ? (
              <p role="status" className="px-2.5 py-1.5 text-xs text-ink-secondary">
                {emptyText}
              </p>
            ) : null}
          </PopperContent>
        </Portal>
      ) : null}
    </div>
  )
}
