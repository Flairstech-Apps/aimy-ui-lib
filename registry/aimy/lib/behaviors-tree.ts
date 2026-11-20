// Trees: a collection that knows parents, children and levels; nested data
// or file paths turned into one; the visible rows with their ARIA positions;
// tri-state checks that roll up to parents; and the tree keyboard model
// (Up and Down, Right opens or enters, Left closes or goes to the parent,
// Home, End, * opens the siblings, letters type ahead).

import { readingKey } from "./behaviors-core"
import { createTypeahead } from "./behaviors-focus"

export type TreeNode<T = unknown> = {
  id: string
  parentId: string | null
  children: string[]
  level: number
  data: T
}

export type TreeCollection<T = unknown> = {
  roots: string[]
  get(id: string): TreeNode<T> | undefined
  parent(id: string): TreeNode<T> | undefined
  children(id: string | null): TreeNode<T>[]
  ancestors(id: string): TreeNode<T>[]
  descendants(id: string): TreeNode<T>[]
  hasChildren(id: string): boolean
  size: number
}

/** Nested items to nodes: each item's id and children are read by the functions you pass. */
export function treeDataNodes<T>(items: readonly T[], id: (item: T) => string, children: (item: T) => readonly T[] | undefined) {
  const nodes = new Map<string, TreeNode<T>>()
  const roots: string[] = []
  const walk = (list: readonly T[], parentId: string | null, level: number) => {
    for (const item of list) {
      const key = id(item)
      const kids = children(item) ?? []
      nodes.set(key, { id: key, parentId, children: kids.map(id), level, data: item })
      if (parentId === null) roots.push(key)
      walk(kids, key, level + 1)
    }
  }
  walk(items, null, 1)
  return { nodes, roots }
}

export function createTreeCollection<T>(nodes: Map<string, TreeNode<T>>, roots: string[]): TreeCollection<T> {
  const get = (id: string) => nodes.get(id)
  const descendants = (id: string): TreeNode<T>[] => {
    const out: TreeNode<T>[] = []
    for (const c of get(id)?.children ?? []) {
      const n = get(c)
      if (n) out.push(n, ...descendants(c))
    }
    return out
  }
  return {
    roots,
    get,
    parent: (id) => {
      const p = get(id)?.parentId
      return p ? get(p) : undefined
    },
    children: (id) => (id === null ? roots : get(id)?.children ?? []).map(get).filter(Boolean) as TreeNode<T>[],
    ancestors(id) {
      const out: TreeNode<T>[] = []
      for (let p = get(id)?.parentId ?? null; p; p = get(p)?.parentId ?? null) {
        const n = get(p)
        if (n) out.unshift(n)
      }
      return out
    },
    descendants,
    hasChildren: (id) => (get(id)?.children.length ?? 0) > 0,
    size: nodes.size,
  }
}

export type PathItem = { name: string; path: string; children: PathItem[] }

/** "src/app/page.tsx" style paths to nested items, folders first then files, each by name. */
export function treeFromPaths(paths: readonly string[], separator = "/"): PathItem[] {
  const root: PathItem = { name: "", path: "", children: [] }
  for (const p of paths) {
    let at = root
    const parts = p.split(separator).filter(Boolean)
    parts.forEach((name, i) => {
      const path = parts.slice(0, i + 1).join(separator)
      let next = at.children.find((c) => c.name === name)
      if (!next) {
        next = { name, path, children: [] }
        at.children.push(next)
      }
      at = next
    })
  }
  const sort = (list: PathItem[]) => {
    list.sort((a, b) => Number(!a.children.length) - Number(!b.children.length) || a.name.localeCompare(b.name))
    list.forEach((c) => sort(c.children))
    return list
  }
  return sort(root.children)
}

export type TreeRowInfo = {
  id: string
  level: number
  index: number
  /** aria-posinset and aria-setsize. */
  posInSet: number
  setSize: number
  expanded: boolean | undefined
  parentId: string | null
}

/** The rows on screen: open branches flattened, with what aria-level, aria-posinset and aria-setsize need. */
export function visibleTreeRows<T>(tree: TreeCollection<T>, expanded: ReadonlySet<string>): TreeRowInfo[] {
  const rows: TreeRowInfo[] = []
  const walk = (ids: string[]) => {
    ids.forEach((id, i) => {
      const n = tree.get(id)
      if (!n) return
      const has = n.children.length > 0
      rows.push({ id, level: n.level, index: rows.length, posInSet: i + 1, setSize: ids.length, expanded: has ? expanded.has(id) : undefined, parentId: n.parentId })
      if (has && expanded.has(id)) walk(n.children)
    })
  }
  walk(tree.roots)
  return rows
}

export type CheckedState = "checked" | "unchecked" | "mixed"

/** Each node's check: leaves from the set, branches checked when all their leaves are, mixed when some are. */
export function treeCheckedStates<T>(tree: TreeCollection<T>, checked: ReadonlySet<string>): Map<string, CheckedState> {
  const out = new Map<string, CheckedState>()
  const visit = (id: string): CheckedState => {
    const n = tree.get(id)
    if (!n || !n.children.length) {
      const s: CheckedState = checked.has(id) ? "checked" : "unchecked"
      out.set(id, s)
      return s
    }
    const kids = n.children.map(visit)
    const s: CheckedState = kids.every((k) => k === "checked") ? "checked" : kids.every((k) => k === "unchecked") ? "unchecked" : "mixed"
    out.set(id, s)
    return s
  }
  tree.roots.forEach(visit)
  return out
}

/** The next set of checked leaves after toggling a node: a branch checks or clears all its leaves. */
export function toggleTreeChecked<T>(tree: TreeCollection<T>, checked: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(checked)
  const state = treeCheckedStates(tree, checked).get(id)
  const leaves = tree.hasChildren(id) ? tree.descendants(id).filter((n) => !n.children.length).map((n) => n.id) : [id]
  const on = state !== "checked"
  for (const l of leaves) {
    if (on) next.add(l)
    else next.delete(l)
  }
  return next
}

/**
 * The tree keyboard model over the visible rows. You own expanded and the
 * focused id; this tells you what a key does.
 */
export function createTreeNavigation<T>(options: {
  tree: () => TreeCollection<T>
  rows: () => TreeRowInfo[]
  focused: () => string | null
  text: (id: string) => string
  onFocus: (id: string) => void
  onExpand: (id: string, open: boolean) => void
  /** Enter or Space on a row. */
  onSelect?: (id: string) => void
}) {
  const typeahead = createTypeahead<TreeRowInfo>({
    items: options.rows,
    text: (r) => options.text(r.id),
    current: () => options.rows().find((r) => r.id === options.focused()),
    onMatch: (r) => options.onFocus(r.id),
  })
  return {
    onKeyDown(e: { key: string; preventDefault(): void; ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean; target?: EventTarget | null; currentTarget?: EventTarget | null }): boolean {
      const rows = options.rows()
      const id = options.focused()
      const i = rows.findIndex((r) => r.id === id)
      const row = rows[i]
      const go = (r: TreeRowInfo | undefined) => r && options.onFocus(r.id)
      const act: Record<string, () => void> = {
        ArrowDown: () => go(rows[i + 1]),
        ArrowUp: () => go(rows[i - 1]),
        Home: () => go(rows[0]),
        End: () => go(rows[rows.length - 1]),
        ArrowRight: () => {
          if (!row || row.expanded === undefined) return
          if (!row.expanded) options.onExpand(row.id, true)
          else go(rows[i + 1])
        },
        ArrowLeft: () => {
          if (!row) return
          if (row.expanded) options.onExpand(row.id, false)
          else go(rows.find((r) => r.id === row.parentId))
        },
        "*": () => {
          if (!row) return
          for (const s of options.tree().children(row.parentId)) if (s.children.length) options.onExpand(s.id, true)
        },
        Enter: () => row && options.onSelect?.(row.id),
        " ": () => row && options.onSelect?.(row.id),
      }
      // Right to left: ArrowLeft opens and goes in, ArrowRight closes and goes up.
      const fn = act[readingKey(e)]
      if (fn && !(e.key === " " && typeahead.active())) {
        e.preventDefault()
        fn()
        return true
      }
      return typeahead.onKeyDown({ key: e.key, ctrlKey: !!e.ctrlKey, metaKey: !!e.metaKey, altKey: !!e.altKey, preventDefault: () => e.preventDefault() })
    },
    destroy: () => typeahead.destroy(),
  }
}
