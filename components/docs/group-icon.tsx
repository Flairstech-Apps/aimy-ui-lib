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
  "Containers and navigation": PanelsTopLeft,
  "Feedback and overlays": MessageSquareDot,
  Shell: AppWindow,
  Documents: FileText,
  "Data display": Table2,
  Charts: ChartLine,
  "Chat widgets": MessagesSquare,
}

/** The icon for a docs group. AI groups carry the AiMY mark, as AI does everywhere in the products. */
export function GroupIcon({ group, className }: { group: string; className?: string }) {
  if (group.startsWith("AI:")) return <AimyMark title="" className={cn("size-3.5 shrink-0", className)} />
  const Icon = group.startsWith("Lab") ? FlaskConical : (ICONS[group] ?? Shapes)
  return <Icon aria-hidden="true" strokeWidth={2} className={cn("size-3.5 shrink-0", className)} />
}
