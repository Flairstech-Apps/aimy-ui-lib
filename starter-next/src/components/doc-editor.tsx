import { Code, Heading2, Heading3, List, ListOrdered, Pilcrow, Plus, Quote, Redo2, Undo2 } from "lucide-react"
import { Popover as Primitive } from "radix-ui"
import { useCallback, useEffect, useRef, useState } from "react"
import { AimyMark } from "@/components/aimy-mark"
import { cn } from "@/lib/utils"

// Knowledge's writing tools on the document page (knowledge.js 7681-8313):
//
//   SelectionMenu  select some words: Bold, Italic, Underline, then what AiMY
//                  can do with them ("Rewrite", "Shorten", "Find a source"),
//                  the first in the accent. It sits under the selection.
//   WritingToolbar while you write, above the block you are in: add a block,
//                  Bold, Italic, Underline, Heading, Subheading, the lists,
//                  Quote, Undo, Redo, and AiMY for the whole document.
//   BlockMenu      "+" or "/" on an empty line: Text, Heading, Subheading,
//                  the lists, Quote, Code.
//   AiMenu         what AiMY can do with the whole document, from the
//                  toolbar's AiMY button or "Draft with AiMY".
//   DocEditor      the body with all of them wired, as Knowledge wires them.
//
// What AiMY proposes is shown as a change to Accept, Edit or Reject
// (Suggestion); nothing is applied silently. Fixed in the port: Knowledge's
// menus can run off the page and its selection menu ignores Escape; here they
// stay inside it, flip above a selection with no room below, and close on
// Escape. The toolbar and the block menu move with the arrow keys.
//
//   <DocEditor html={body} onChange={save} selectionActions={["Rewrite", "Shorten", "Find a source"]}
//     onSelectionAction={(label, text) => propose(label, text)}
//     docActions={["Rewrite for support agents", "Shorten", "Fill the gaps"]} onDocAction={propose} />

export type Format = "bold" | "italic" | "underline" | "h3" | "h4" | "ul" | "ol" | "quote" | "code" | "p"
type Active = Partial<Record<Format, boolean>>

/** A row that moves with the arrow keys, Home and End. */
const rove = (e: React.KeyboardEvent<HTMLElement>, keys: [string, string] = ["ArrowLeft", "ArrowRight"]) => {
  const items = [...e.currentTarget.querySelectorAll<HTMLElement>("button:not([disabled])")]
  const i = items.indexOf(document.activeElement as HTMLElement)
  const to =
    e.key === keys[1]
      ? i + 1
      : e.key === keys[0]
        ? i - 1
        : e.key === "Home"
          ? 0
          : e.key === "End"
            ? items.length - 1
            : null
  if (to == null || i < 0) return
  e.preventDefault()
  items[(to + items.length) % items.length]?.focus()
}
/** Pressing a tool must not take the selection away from the words. */
const keep = (e: React.MouseEvent) => e.preventDefault()

type SelectionMenuProps = {
  active?: Active
  onFormat: (f: Format) => void
  /** What AiMY can do with the selected words; the first is the primary. */
  actions?: string[]
  onAction?: (label: string) => void
  className?: string
  style?: React.CSSProperties
}

export function SelectionMenu({ active = {}, onFormat, actions = [], onAction, className, style }: SelectionMenuProps) {
  const fmt = (f: Format, label: string, glyph: React.ReactNode) => (
    <button
      type="button"
      className={cn("ai-menu-fmt", active[f] && "is-on")}
      aria-label={label}
      title={label}
      aria-pressed={!!active[f]}
      onMouseDown={keep}
      onClick={() => onFormat(f)}
    >
      {glyph}
    </button>
  )
  return (
    <div
      className={cn("ai-menu", className)}
      style={style}
      role="toolbar"
      aria-label="The selected words"
      onKeyDown={rove}
      data-slot="selection-menu"
    >
      {fmt("bold", "Bold", <b>B</b>)}
      {fmt("italic", "Italic", <i>I</i>)}
      {fmt("underline", "Underline", <u>U</u>)}
      {actions.map((a, i) => (
        <span key={a} className="contents">
          <span className="sep" aria-hidden="true" />
          <button
            type="button"
            className={cn(i === 0 && "ai-menu-primary")}
            onMouseDown={keep}
            onClick={() => onAction?.(a)}
          >
            {i === 0 ? <AimyMark title="" className="h-3.5 w-3" /> : null}
            {a}
          </button>
        </span>
      ))}
    </div>
  )
}

type WritingToolbarProps = {
  active?: Active
  onFormat: (f: Format) => void
  onUndo?: () => void
  onRedo?: () => void
  /** "+": opens the block menu. */
  onAdd?: () => void
  /** The AiMY button: an AiMenu goes here. */
  ai?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

const TOOLS: { f: Format; label: string; glyph: React.ReactNode }[] = [
  { f: "bold", label: "Bold", glyph: <b>B</b> },
  { f: "italic", label: "Italic", glyph: <i>I</i> },
  { f: "underline", label: "Underline", glyph: <u>U</u> },
]
const BLOCK_TOOLS: { f: Format; label: string; glyph: React.ReactNode }[] = [
  { f: "h3", label: "Heading", glyph: <Heading2 aria-hidden="true" /> },
  { f: "h4", label: "Subheading", glyph: <Heading3 aria-hidden="true" /> },
]
const LIST_TOOLS: { f: Format; label: string; glyph: React.ReactNode }[] = [
  { f: "ul", label: "Bulleted list", glyph: <List aria-hidden="true" /> },
  { f: "ol", label: "Numbered list", glyph: <ListOrdered aria-hidden="true" /> },
  { f: "quote", label: "Quote", glyph: <Quote aria-hidden="true" /> },
]

export function WritingToolbar({
  active = {},
  onFormat,
  onUndo,
  onRedo,
  onAdd,
  ai,
  className,
  style,
}: WritingToolbarProps) {
  const tool = (t: { f: Format; label: string; glyph: React.ReactNode }) => (
    <button
      key={t.f}
      type="button"
      className="blk-tool"
      aria-label={t.label}
      title={t.label}
      aria-pressed={!!active[t.f]}
      onMouseDown={keep}
      onClick={() => onFormat(t.f)}
    >
      {t.glyph}
    </button>
  )
  const sep = (k: string) => <span key={k} className="blk-sep" aria-hidden="true" />
  return (
    <div
      className={cn("blk-tools", className)}
      style={style}
      role="toolbar"
      aria-label="Writing tools"
      onKeyDown={rove}
      data-slot="writing-toolbar"
    >
      {onAdd ? (
        <>
          <button
            type="button"
            className="blk-tool"
            aria-label="Add a block"
            title="Add a block"
            aria-haspopup="menu"
            onMouseDown={keep}
            onClick={onAdd}
          >
            <Plus aria-hidden="true" />
          </button>
          {sep("s0")}
        </>
      ) : null}
      {TOOLS.map(tool)}
      {sep("s1")}
      {BLOCK_TOOLS.map(tool)}
      {sep("s2")}
      {LIST_TOOLS.map(tool)}
      {onUndo || onRedo ? (
        <>
          {sep("s3")}
          <button type="button" className="blk-tool" aria-label="Undo" title="Undo" onMouseDown={keep} onClick={onUndo}>
            <Undo2 aria-hidden="true" />
          </button>
          <button type="button" className="blk-tool" aria-label="Redo" title="Redo" onMouseDown={keep} onClick={onRedo}>
            <Redo2 aria-hidden="true" />
          </button>
        </>
      ) : null}
      {ai ? (
        <>
          {sep("s4")}
          {ai}
        </>
      ) : null}
    </div>
  )
}

const BLOCKS: { f: Format; label: string; icon: React.ReactNode }[] = [
  { f: "p", label: "Text", icon: <Pilcrow aria-hidden="true" /> },
  { f: "h3", label: "Heading", icon: <Heading2 aria-hidden="true" /> },
  { f: "h4", label: "Subheading", icon: <Heading3 aria-hidden="true" /> },
  { f: "ul", label: "Bulleted list", icon: <List aria-hidden="true" /> },
  { f: "ol", label: "Numbered list", icon: <ListOrdered aria-hidden="true" /> },
  { f: "quote", label: "Quote", icon: <Quote aria-hidden="true" /> },
  { f: "code", label: "Code", icon: <Code aria-hidden="true" /> },
]

export function BlockMenu({
  onPick,
  onClose,
  autoFocus = true,
  className,
  style,
}: {
  onPick: (f: Format) => void
  onClose: () => void
  /** Opened by a key or a press: focus goes to the first block. */
  autoFocus?: boolean
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      ref={(el) => {
        if (autoFocus) el?.querySelector<HTMLElement>("button")?.focus({ preventScroll: true })
      }}
      className={cn("blk-menu", className)}
      style={style}
      role="menu"
      aria-label="Add a block"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault()
          e.stopPropagation()
          onClose()
        } else rove(e, ["ArrowUp", "ArrowDown"])
      }}
      data-slot="block-menu"
    >
      {BLOCKS.map((b) => (
        <button
          key={b.f}
          type="button"
          role="menuitem"
          className="blk-menu-item"
          onMouseDown={keep}
          onClick={() => onPick(b.f)}
        >
          <span className="blk-menu-ico">{b.icon}</span>
          {b.label}
        </button>
      ))}
    </div>
  )
}

/** What AiMY can do with the whole document, opening from its trigger (the toolbar's AiMY, or "Draft with AiMY"). */
export function AiMenu({
  items,
  onPick,
  trigger = "toolbar",
}: {
  items: string[]
  onPick: (label: string) => void
  /** toolbar: the toolbar's AiMY button. start: "Draft with AiMY" on a blank document. */
  trigger?: "toolbar" | "start"
}) {
  const [open, setOpen] = useState(false)
  return (
    <Primitive.Root open={open} onOpenChange={setOpen}>
      <Primitive.Trigger
        className={trigger === "start" ? "doc-ai" : "blk-ai"}
        aria-label={trigger === "start" ? undefined : "Rewrite this with AiMY"}
        title={trigger === "start" ? undefined : "Rewrite with AiMY"}
        onMouseDown={keep}
      >
        <AimyMark title="" className="h-3.5 w-3" />
        {trigger === "start" ? "Draft with AiMY" : "AiMY"}
      </Primitive.Trigger>
      <Primitive.Portal>
        <Primitive.Content
          align="start"
          sideOffset={6}
          collisionPadding={12}
          className="z-(--z-popover)"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="ai-menu is-static is-entering" role="menu" aria-label="AiMY" onKeyDown={rove}>
            {items.map((a, i) => (
              <span key={a} className="contents">
                {i ? <span className="sep" aria-hidden="true" /> : null}
                <button
                  type="button"
                  role="menuitem"
                  className={cn(i === 0 && "ai-menu-primary")}
                  onClick={() => {
                    setOpen(false)
                    onPick(a)
                  }}
                >
                  {a}
                </button>
              </span>
            ))}
          </div>
        </Primitive.Content>
      </Primitive.Portal>
    </Primitive.Root>
  )
}

/* ── The editor ──────────────────────────────────────────────────────── */
const BLOCK_TAG: Partial<Record<Format, string>> = { p: "P", h3: "H3", h4: "H4", quote: "BLOCKQUOTE", code: "PRE" }

/** Runs a format on the current selection, the way Knowledge does (the browser's editing commands). */
export function applyFormat(f: Format) {
  if (f === "bold" || f === "italic" || f === "underline") document.execCommand(f)
  else if (f === "ul") document.execCommand("insertUnorderedList")
  else if (f === "ol") document.execCommand("insertOrderedList")
  else {
    const now = String(document.queryCommandValue("formatBlock")).toUpperCase()
    const tag = BLOCK_TAG[f] ?? "P"
    document.execCommand("formatBlock", false, `<${now === tag ? "P" : tag}>`)
  }
}

const readActive = (): Active => {
  const block = String(document.queryCommandValue("formatBlock")).toUpperCase()
  return {
    bold: document.queryCommandState("bold"),
    italic: document.queryCommandState("italic"),
    underline: document.queryCommandState("underline"),
    ul: document.queryCommandState("insertUnorderedList"),
    ol: document.queryCommandState("insertOrderedList"),
    h3: block === "H3",
    h4: block === "H4",
    quote: block === "BLOCKQUOTE",
    code: block === "PRE",
  }
}

type DocEditorProps = {
  /** The body to start from, as HTML. The editor owns it after that; read changes from onChange. */
  html: string
  onChange?: (html: string) => void
  /** What AiMY can do with selected words; the first is the primary. */
  selectionActions?: string[]
  onSelectionAction?: (label: string, text: string) => void
  /** What AiMY can do with the whole document, under the toolbar's AiMY. */
  docActions?: string[]
  onDocAction?: (label: string) => void
  /** Reading an old version: no tools, no editing. */
  readOnly?: boolean
  placeholder?: string
  label?: string
}

type Box = { left: number; top: number }

export function DocEditor({
  html,
  onChange,
  selectionActions = ["Rewrite", "Shorten", "Find a source"],
  onSelectionAction,
  docActions,
  onDocAction,
  readOnly,
  placeholder = "Write here, or press / for a block",
  label = "Document",
}: DocEditorProps) {
  const wrap = useRef<HTMLDivElement>(null)
  const body = useRef<HTMLDivElement>(null)
  const [writing, setWriting] = useState(false)
  const [sel, setSel] = useState<{ box: DOMRect; text: string } | null>(null)
  const [block, setBlock] = useState<Box | null>(null)
  const [menu, setMenu] = useState<Box | null>(null)
  const [active, setActive] = useState<Active>({})
  const [blank, setBlank] = useState(!html.trim())

  // The body is the browser's to edit; React sets it once.
  useEffect(() => {
    if (body.current) body.current.innerHTML = html
    // Only the first html counts; later edits live in the DOM.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const read = useCallback(() => {
    const w = wrap.current
    const b = body.current
    const s = window.getSelection()
    if (!w || !b || !s || !s.rangeCount || !b.contains(s.anchorNode)) {
      setSel(null)
      setBlock(null)
      return
    }
    setActive(readActive())
    const wr = w.getBoundingClientRect()
    if (!s.isCollapsed && s.toString().trim()) {
      setSel({ box: s.getRangeAt(0).getBoundingClientRect(), text: s.toString() })
      setBlock(null)
      return
    }
    setSel(null)
    // The block the caret is in: the body's direct child that holds it.
    let n: Node | null = s.anchorNode
    while (n && n.parentNode !== b) n = n.parentNode
    const el = (n instanceof HTMLElement ? n : null) ?? b
    const r = el.getBoundingClientRect()
    setBlock({ left: Math.max(0, r.left - wr.left), top: r.top - wr.top })
  }, [])

  useEffect(() => {
    const onChangeSel = () => {
      if (wrap.current?.contains(document.activeElement)) read()
    }
    document.addEventListener("selectionchange", onChangeSel)
    return () => document.removeEventListener("selectionchange", onChangeSel)
  }, [read])

  const changed = () => {
    const h = body.current?.innerHTML ?? ""
    setBlank(!body.current?.textContent?.trim())
    onChange?.(h)
  }
  const format = (f: Format) => {
    body.current?.focus()
    applyFormat(f)
    changed()
    read()
  }

  // The selection menu: under the words, inside the page, above them when there is no room below.
  const place = (el: HTMLDivElement | null) => {
    const w = wrap.current
    if (!el || !w || !sel) return
    const wr = w.getBoundingClientRect()
    const left = Math.max(8, Math.min(wr.width - el.offsetWidth - 8, sel.box.left - wr.left))
    const below = sel.box.bottom - wr.top + 8
    const room = window.innerHeight - sel.box.bottom
    el.style.left = `${left}px`
    el.style.top = `${room < el.offsetHeight + 24 ? sel.box.top - wr.top - el.offsetHeight - 8 : below}px`
  }

  return (
    <div
      ref={wrap}
      className="relative"
      onFocus={() => !readOnly && setWriting(true)}
      onBlur={(e) => {
        if (!wrap.current?.contains(e.relatedTarget as Node)) {
          setWriting(false)
          setSel(null)
          setBlock(null)
          setMenu(null)
        }
      }}
      data-slot="doc-editor"
    >
      <div
        ref={body}
        className={cn("doc-body", writing && "is-writing", readOnly && "is-reading", blank && "is-blank")}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={label}
        aria-readonly={readOnly || undefined}
        data-placeholder={placeholder}
        tabIndex={0}
        onInput={changed}
        onMouseUp={() => window.setTimeout(read, 10)}
        onKeyUp={read}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            if (menu) setMenu(null)
            else if (sel) setSel(null)
            else e.currentTarget.blur()
            return
          }
          // "/" on an empty line opens the block menu.
          if (e.key === "/" && block) {
            const s = window.getSelection()
            let n: Node | null = s?.anchorNode ?? null
            while (n && n.parentNode !== body.current) n = n.parentNode
            if (!(n?.textContent ?? "").trim()) {
              e.preventDefault()
              setMenu({ left: block.left, top: block.top + 28 })
            }
          }
        }}
      />
      {!readOnly && sel ? (
        <div
          key={`${sel.box.left}-${sel.box.top}`}
          ref={place}
          className="absolute z-[5] max-w-[calc(100%-1rem)]"
          style={{ left: -9999, top: 0 }}
        >
          <SelectionMenu
            className="is-static is-entering"
            active={active}
            onFormat={format}
            actions={onSelectionAction ? selectionActions : []}
            onAction={(a) => {
              onSelectionAction?.(a, sel.text)
              setSel(null)
            }}
          />
        </div>
      ) : null}
      {!readOnly && writing && block && !sel ? (
        <WritingToolbar
          active={active}
          onFormat={format}
          onUndo={() => {
            document.execCommand("undo")
            changed()
          }}
          onRedo={() => {
            document.execCommand("redo")
            changed()
          }}
          onAdd={() => setMenu({ left: block.left, top: block.top + 28 })}
          ai={docActions?.length && onDocAction ? <AiMenu items={docActions} onPick={onDocAction} /> : undefined}
          style={{ left: block.left, top: Math.max(0, block.top - 48) }}
        />
      ) : null}
      {!readOnly && menu ? (
        <BlockMenu
          style={{ left: menu.left, top: menu.top }}
          onClose={() => {
            setMenu(null)
            body.current?.focus()
          }}
          onPick={(f) => {
            setMenu(null)
            format(f)
          }}
        />
      ) : null}
    </div>
  )
}
