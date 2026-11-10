import {
  AppWindow,
  ChartLine,
  FileText,
  FlaskConical,
  MessageSquareDot,
  MessagesSquare,
  Palette,
  PanelsTopLeft,
  Rocket,
  Shapes,
  Table2,
  TextCursorInput,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { AimyMark } from "@/registry/aimy/brand/aimy-mark"

const ICONS: Record<string, LucideIcon> = {
  "Start here": Rocket,
  Foundations: Palette,
  Components: Shapes,
  Forms: TextCursorInput,
  "Containers & navigation": PanelsTopLeft,
  "Feedback & overlays": MessageSquareDot,
  Shell: AppWindow,
  Documents: FileText,
  "Data display": Table2,
  Charts: ChartLine,
  "Chat widgets": MessagesSquare,
}

/** The icon for a docs group. AI groups carry the AiMY mark, as AI does everywhere in the products.
    It sits in a box one line tall, so beside a label that wraps it stays on the first line. */
export function GroupIcon({ group, className }: { group: string; className?: string }) {
  const Icon = group.startsWith("Lab") ? FlaskConical : (ICONS[group] ?? Shapes)
  return (
    <span className="flex shrink-0 items-center" style={{ height: "1lh" }}>
      {group.startsWith("AI:") ? (
        <AimyMark title="" className={cn("size-3.5 shrink-0", className)} />
      ) : (
        <Icon aria-hidden="true" strokeWidth={2} className={cn("size-3.5 shrink-0", className)} />
      )}
    </span>
  )
}
