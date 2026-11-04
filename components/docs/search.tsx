"use client"

import { CornerDownLeft, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/registry/aimy/ui/dialog"
import { NAV } from "./nav"

type Entry = { href: string; label: string; group: string; words: string }
type Component = { name: string; description?: string; docs?: string }

const noSubscribe = () => () => {}

const firstSentence =(s = "") => (s.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? s).trim()

// Every page in the sidebar; component pages gain their description once it loads.
const PAGES: Entry[] = NAV.flatMap((g) =>
  g.items.map((i) => ({ href: i.href, label: i.label, group: g.label, words: "" }))
)

function rank(entries: Entry[], query: string) {
  const words = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
  if (!words.length) return entries.filter((e) => e.group === "Start here" || e.group === "Shell")
  return entries
    .map((e) => {
      const label = e.label.toLowerCase()
      const group = e.group.toLowerCase()
      const desc = e.words.toLowerCase()
      let score = 0
      for (const w of words) {
        if (label.startsWith(w)) score += 8
        else if (label.includes(w)) score += 5
        if (group.includes(w)) score += 2
        if (desc.includes(w)) score += 1
      }
      // Every word must match somewhere.
      const all = words.every((w) => label.includes(w) || group.includes(w) || desc.includes(w))
      return { e, score: all ? score : 0 }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((r) => r.e)
}

/** Search the docs: a button in the bar, Ctrl+K or ⌘K from anywhere. */
export function DocsSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [at, setAt] = useState(0)
  const [entries, setEntries] = useState<Entry[]>(PAGES)
  const loaded = useRef(false)
  const router = useRouter()
  const listId = useId()
  const results = useMemo(() => rank(entries, query), [entries, query])
  // The static page renders Ctrl; a Mac swaps in ⌘ once it loads.
  const mac = useSyncExternalStore(
    noSubscribe,
    () => /Mac|iPhone|iPad/.test(navigator.userAgent),
    () => false
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // The component descriptions load the first time search opens.
  useEffect(() => {
    if (!open || loaded.current) return
    loaded.current = true
    fetch("/agents/components.json")
      .then((r) => (r.ok ? r.json() : []))
      .then((list: Component[]) => {
        const byDocs = new Map(list.filter((c) => c.docs).map((c) => [new URL(c.docs!).pathname, c]))
        setEntries((all) =>
          all.map((e) => {
            const c = byDocs.get(e.href)
            return c ? { ...e, words: `${c.name} ${firstSentence(c.description)}` } : e
          })
        )
      })
      .catch(() => {})
  }, [open])

  const go = (href: string) => {
    setOpen(false)
    setQuery("")
    router.push(href)
  }

  const optionId = (i: number) => `${listId}-${i}`

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) setQuery("")
      }}
    >
      {/* A field you can type into at a glance: a quiet well, the words, and the shortcut as one key chip
          inset at the end (two separate caps read as two buttons). */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search the docs"
        aria-keyshortcuts="Control+K Meta+K"
        className="flex h-9 items-center gap-2.5 rounded-lg border border-edge bg-w03 px-2.5 text-xs text-ink-secondary transition-[border-color,background-color,color] duration-(--t-fast) ease-out hover:border-edge-hover hover:bg-w05 hover:text-ink canvas:w-72 canvas:pr-1.5 canvas:pl-3"
      >
        <Search aria-hidden="true" strokeWidth={2} className="size-4 shrink-0" />
        <span className="hidden flex-1 text-left canvas:inline">Search the docs</span>
        <kbd className="hidden h-6 items-center gap-1 rounded-md border border-hairline bg-w05 px-2 font-sans text-2xs font-semibold text-ink canvas:inline-flex">
          <span>{mac ? "⌘" : "Ctrl"}</span>
          <span>K</span>
        </kbd>
      </button>
      <DialogContent title="Search the docs" size="wide">
        <div className="flex flex-col gap-3">
          <div className="flex h-10 items-center gap-2 rounded-lg border border-edge bg-raised px-3 focus-within:border-brand">
            <Search aria-hidden="true" strokeWidth={2} className="size-4 shrink-0 text-ink-secondary" />
            <input
              autoFocus
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={results.length ? optionId(Math.min(at, results.length - 1)) : undefined}
              aria-label="Search the docs"
              placeholder="A component, a foundation, or what you need"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setAt(0)
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault()
                  setAt((i) => Math.min(i + 1, results.length - 1))
                } else if (e.key === "ArrowUp") {
                  e.preventDefault()
                  setAt((i) => Math.max(i - 1, 0))
                } else if (e.key === "Enter" && results[at]) {
                  e.preventDefault()
                  go(results[at].href)
                }
              }}
              className="min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-ink-placeholder"
            />
          </div>
          <p className="text-meta text-ink-secondary" aria-live="polite">
            {query
              ? results.length
                ? `${results.length} ${results.length === 1 ? "page" : "pages"}`
                : `Nothing matches "${query}". Try a shorter word, or what the part does.`
              : "Start here, and the shell"}
          </p>
          <ul id={listId} role="listbox" aria-label="Pages" className="flex flex-col gap-0.5">
            {results.map((r, i) => (
              <li
                key={r.href}
                id={optionId(i)}
                role="option"
                aria-selected={i === at}
                onMouseEnter={() => setAt(i)}
                onClick={() => go(r.href)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-md px-3 py-2.5",
                  i === at ? "bg-w07 text-ink" : "text-ink-secondary"
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-body font-semibold text-ink">{r.label}</span>
                  <span className="block truncate text-meta text-ink-secondary">
                    {r.group}
                    {r.words ? `: ${r.words.replace(/^\S+\s/, "")}` : ""}
                  </span>
                </span>
                {i === at ? (
                  <CornerDownLeft aria-hidden="true" strokeWidth={2} className="size-4 shrink-0 text-ink-secondary" />
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}
