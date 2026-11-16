"use client"

import { ChevronRight } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { type CheckedState, createTreeCollection, toggleTreeChecked, treeCheckedStates, treeDataNodes } from "@/lib/behaviors"
import { useAgentSurface } from "@/lib/behaviors-agent-react"
import { useFlip, useTreeView } from "@/lib/behaviors-react"
import { cn } from "@/lib/utils"

// Nested items you open and close: folders and files, a team under a
// department, collections in a knowledge base. One Tab stop; the arrows
// move, Right opens or steps in, Left closes or steps out, * opens the
// siblings, letters jump. With checkable, each row has a box and folders
// show all, some or none of what is inside. Rows are 32px, indented 16px a
// level, the chosen row on the brand wash in the AI ink, as Select's chosen
// option.

export type TreeItem = {
  id: string
  label: string
  /** A Lucide icon or a small mark before the label. */
  icon?: React.ReactNode
  /** A short note at the end of the row (a count, a date). */
  meta?: React.ReactNode
  children?: TreeItem[]
}

type TreeProps = {
  items: TreeItem[]
  /** Names the tree for screen readers: "Collections". */
  label: string
  defaultExpanded?: string[]
  /** The chosen row (single choice). */
  selected?: string | null
  onSelect?: (id: string) => void
  /** Shows a box on every row; a folder's box checks or clears everything inside. */
  checkable?: boolean
  /** Checked leaves (folders work theirs out). */
  checked?: string[]
  defaultChecked?: string[]
  onCheckedChange?: (leaves: string[]) => void
  className?: string
  /** Shows this part to AiMY under this id (inside an AgentProvider), so it can read it and act on it. */
  agent?: string
}

export function Tree({ items, label, defaultExpanded, selected, onSelect, checkable, checked: checkedProp, defaultChecked = [], onCheckedChange, className, agent }: TreeProps) {
  const tree = useMemo(() => {
    const { nodes, roots } = treeDataNodes<TreeItem>(items, (i) => i.id, (i) => i.children)
    return createTreeCollection(nodes, roots)
  }, [items])
  const [ownChecked, setOwnChecked] = useState<Set<string>>(() => new Set(defaultChecked))
  const checked = checkedProp ? new Set(checkedProp) : ownChecked
  const states = checkable ? treeCheckedStates(tree, checked) : null

  const toggleCheck = (id: string) => {
    const next = toggleTreeChecked(tree, checked, id)
    if (!checkedProp) setOwnChecked(next)
    onCheckedChange?.([...next])
  }
  const choose = (id: string) => {
    if (checkable) toggleCheck(id)
    else onSelect?.(id)
  }

  const view = useTreeView({ tree, text: (id) => tree.get(id)?.data.label ?? id, defaultExpanded, onSelect: choose })
  const root = useRef<HTMLUListElement>(null)
  // Real focus follows the keyboard model's focused row.
  useEffect(() => {
    if (root.current?.contains(document.activeElement)) root.current.querySelector<HTMLElement>(`[data-tree-id="${CSS.escape(view.focused ?? "")}"]`)?.focus()
  }, [view.focused])

  const labelOf = (id: string) => tree.get(id)?.data.label ?? id
  const all = [...tree.roots.flatMap((r) => [tree.get(r)!, ...tree.descendants(r)])].filter(Boolean)
  const idOf = (name: unknown) => all.find((n) => n.data.label === name)?.id
  const folders = all.filter((n) => n.children.length)
  const [rootEl, setRootEl] = useState<HTMLUListElement | null>(null)
  const openFolder = (name: unknown, open: boolean) => {
    const id = idOf(name)
    if (!id) return
    const was = view.expanded.has(id)
    view.setExpanded((s) => {
      const n = new Set(s)
      if (open) n.add(id)
      else n.delete(id)
      return n
    })
    return () =>
      view.setExpanded((s) => {
        const n = new Set(s)
        if (was) n.add(id)
        else n.delete(id)
        return n
      })
  }
  useAgentSurface(
    agent,
    {
      kind: "tree",
      label,
      state: () => ({
        open: [...view.expanded].map(labelOf),
        ...(checkable ? { checked: all.filter((n) => states?.get(n.id) === "checked").map((n) => n.data.label) } : { chosen: selected ? labelOf(selected) : null }),
      }),
      actions: {
        open: {
          description: "Open a folder",
          keywords: "expand show",
          params: { item: { type: "string", description: "The folder's name", enum: folders.map((n) => n.data.label) } },
          say: (p) => `opened ${p.item}`,
          run: (p) => openFolder(p.item, true),
        },
        close: {
          description: "Close a folder",
          keywords: "collapse hide",
          params: { item: { type: "string", description: "The folder's name", enum: folders.map((n) => n.data.label) } },
          say: (p) => `closed ${p.item}`,
          run: (p) => openFolder(p.item, false),
        },
        ...(checkable
          ? {
              check: {
                description: "Check or clear an item (a folder checks or clears everything inside)",
                params: {
                  item: { type: "string" as const, description: "The item's name", enum: all.map((n) => n.data.label) },
                  checked: { type: "boolean" as const, description: "True to check, false to clear" },
                },
                say: (p: Record<string, unknown>) => `${p.checked ? "checked" : "cleared"} ${p.item}`,
                run: (p: Record<string, unknown>) => {
                  const id = idOf(p.item)
                  if (!id) return
                  const prev = [...checked]
                  const isOn = states?.get(id) === "checked"
                  if (isOn !== p.checked) toggleCheck(id)
                  return () => {
                    if (!checkedProp) setOwnChecked(new Set(prev))
                    onCheckedChange?.(prev)
                  }
                },
              },
            }
          : {
              choose: {
                description: "Choose an item",
                params: { item: { type: "string" as const, description: "The item's name", enum: all.map((n) => n.data.label) } },
                say: (p: Record<string, unknown>) => `chose ${p.item}`,
                run: (p: Record<string, unknown>) => {
                  const id = idOf(p.item)
                  if (!id) return
                  const prev = selected
                  onSelect?.(id)
                  view.setFocused(id)
                  return () => {
                    if (prev) onSelect?.(prev)
                  }
                },
              },
            }),
      },
    },
    rootEl
  )

  const flipRef = useFlip<HTMLUListElement>(view.rows.map((r) => r.id).join("\u0000"), { enter: true })

  return (
    <ul
      ref={(node) => {
        root.current = node
        setRootEl(node)
        flipRef(node)
      }}
      role="tree"
      aria-label={label}
      aria-multiselectable={checkable || undefined}
      data-slot="tree"
      onKeyDown={view.onKeyDown}
      className={cn("flex flex-col", className)}
    >
      {view.rows.map((r) => {
        const item = tree.get(r.id)!.data
        const state: CheckedState | undefined = states?.get(r.id)
        const isSelected = !checkable && selected === r.id
        return (
          <li
            key={r.id}
            role="treeitem"
            data-flip={r.id}
            data-tree-id={r.id}
            aria-level={r.level}
            aria-posinset={r.posInSet}
            aria-setsize={r.setSize}
            aria-expanded={r.expanded}
            aria-selected={checkable ? undefined : isSelected}
            aria-checked={state === undefined ? undefined : state === "mixed" ? "mixed" : state === "checked"}
            tabIndex={r.id === view.focused ? 0 : -1}
            onFocus={(e) => e.target === e.currentTarget && view.setFocused(r.id)}
            onClick={() => {
              view.setFocused(r.id)
              if (r.expanded !== undefined && !checkable) view.toggle(r.id)
              else choose(r.id)
            }}
            style={{ paddingInlineStart: `${(r.level - 1) * 16 + 4}px` }}
            className={cn(
              "flex min-h-8 cursor-pointer items-center gap-2 rounded-md pr-2 text-xs text-ink outline-offset-[-2px] select-none",
              "transition-[background-color] duration-(--t-fast) ease-out hover:bg-w05",
              isSelected && "bg-brand-dim text-ai-ink hover:bg-brand-dim"
            )}
          >
            <span
              aria-hidden="true"
              onClick={(e) => {
                if (r.expanded === undefined) return
                e.stopPropagation()
                view.setFocused(r.id)
                view.toggle(r.id)
              }}
              className={cn("grid size-5 shrink-0 place-items-center rounded-sm text-ink-secondary", r.expanded === undefined && "invisible")}
            >
              <ChevronRight strokeWidth={2} className={cn("size-3.5 transition-transform duration-(--t-fast) ease-out", r.expanded && "rotate-90")} />
            </span>
            {state !== undefined ? (
              <span
                aria-hidden="true"
                className={cn(
                  "grid size-[1.0625rem] shrink-0 place-items-center rounded-xs border text-on-brand",
                  state === "checked" ? "border-brand bg-brand" : state === "mixed" ? "border-brand bg-brand-dim" : "border-ink-rule bg-card"
                )}
              >
                {state === "checked" ? (
                  <svg viewBox="0 0 24 24" className="size-3">
                    <path d="M20 6 9 17l-5-5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : state === "mixed" ? (
                  <span className="block h-0.5 w-2 rounded-pill bg-brand" />
                ) : null}
              </span>
            ) : null}
            {item.icon ? <span className="flex shrink-0 text-ink-secondary [&_svg]:size-4">{item.icon}</span> : null}
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {item.meta ? <span className="shrink-0 text-2xs text-ink-secondary">{item.meta}</span> : null}
          </li>
        )
      })}
    </ul>
  )
}
