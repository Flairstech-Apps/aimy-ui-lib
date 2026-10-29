import {
  Check,
  ChevronDown,
  Copy,
  Ellipsis,
  Info,
  type LucideIcon,
  Paperclip,
  Phone,
  RefreshCw,
  Search,
  Send,

  Square,
  ThumbsDown,
  ThumbsUp,
  TriangleAlert,
  Undo2,
  X,
} from "lucide-react"
import type { Metadata } from "next"
import { Code, DoDont, PageHeader, Section } from "@/components/docs/page"
import { AimyMark } from "@/registry/aimy/brand/aimy-mark"
import { Icon } from "@/registry/aimy/ui/icon"

export const metadata: Metadata = { title: "Icons" }

const MEANINGS: [LucideIcon, string, string][] = [
  [Send, "send", "Send a message"],
  [Square, "square", "Stop generating"],
  [Undo2, "undo-2", "Undo, in toasts"],
  [Copy, "copy", "Copy"],
  [Check, "check", "Done, copied, selected"],
  [X, "x", "Close, dismiss, remove"],
  [RefreshCw, "refresh-cw", "Regenerate"],
  [ThumbsUp, "thumbs-up", "Good answer"],
  [ThumbsDown, "thumbs-down", "Bad answer"],
  [Search, "search", "Search"],
  [Paperclip, "paperclip", "Attach"],
  [Phone, "phone", "Call"],
  [Info, "info", "Information"],
  [TriangleAlert, "triangle-alert", "Warning"],
  [ChevronDown, "chevron-down", "Opens a menu or section"],
  [Ellipsis, "ellipsis", "More actions"],
]

const SIZES = [
  ["xs", "12", "Inside a tag or a count"],
  ["sm", "14", "Inside a button, beside 14px text"],
  ["md", "16", "The default, beside body text"],
  ["lg", "20", "Standalone controls"],
  ["xl", "24", "Empty states, large controls"],
] as const

export default function IconsPage() {
  return (
    <>
      <PageHeader
        title="Icons"
        lead="Every icon is a Lucide glyph on the 24 grid, stroke 2, round caps. Never draw icon paths by hand: one grid and one weight keep every icon in the same family."
      />
      <Section title="Sizes" lead="Square sizes from this scale only. The Icon component takes the size by name.">
        <div className="flex flex-wrap items-end gap-8 rounded-xl border border-hairline p-6">
          {SIZES.map(([size, px, use]) => (
            <div key={size} className="flex flex-col items-start gap-2">
              <Icon icon={Phone} size={size} className="text-ink" />
              <p className="font-mono text-xs text-ink">
                {size} <span className="text-ink-secondary">{px}px</span>
              </p>
              <p className="max-w-[10rem] text-meta text-ink-secondary">{use}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-meta text-ink-secondary">
          <Code>{`<Icon icon={Send} size="sm" />`}</Code> is hidden from screen readers. Give it a <Code>label</Code> only when
          no words beside it say the same thing.
        </p>
      </Section>
      <Section title="One meaning, one glyph" lead="The same idea always gets the same icon across products.">
        <div className="grid gap-2 canvas:grid-cols-2 rail:grid-cols-3">
          {/* AI is marked with the AiMY mark, as in Sales and Knowledge, never a Lucide glyph. */}
          <div className="flex items-center gap-3 rounded-lg border border-hairline p-3">
            <span className="grid size-9 place-items-center rounded-md bg-w05">
              <AimyMark title="" className="size-4" />
            </span>
            <div>
              <p className="text-meta font-semibold text-ink">AI-written or AI-suggested</p>
              <p className="font-mono text-2xs text-ink-secondary">AimyMark</p>
            </div>
          </div>
          {MEANINGS.map(([glyph, name, meaning]) => (
            <div key={name} className="flex items-center gap-3 rounded-lg border border-hairline p-3">
              <span className="grid size-9 place-items-center rounded-md bg-w05 text-ink">
                <Icon icon={glyph} size="md" />
              </span>
              <div>
                <p className="text-meta font-semibold text-ink">{meaning}</p>
                <p className="font-mono text-2xs text-ink-secondary">{name}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Mark anything AiMY wrote, suggested or did with the AiMY mark, the way Sales and Knowledge do."
            dontText="Use a sparkles or magic-wand glyph for AI. In AiMY, the mark is the AI."
          />
          <DoDont
            doText="Pair an icon with a word when the action matters. An icon alone needs a label and a tooltip."
            dontText="Draw a new icon, or bring in a second icon set because Lucide lacks a glyph. Ask for the gap instead."
          />
        </div>
      </Section>
    </>
  )
}
