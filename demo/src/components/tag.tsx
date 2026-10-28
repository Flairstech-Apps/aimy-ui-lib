import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Knowledge's .tag (Nour's choice, 28 Oct): a label has a fill and no edge.
// A soft ground of the hue with the word in the readable -text ink, so light
// theme clears 4.5:1. A tag is the NAME of a state, in sentence case; two
// words both get capitals ("Meeting Set"). 12px, 600, 22px tall.
const tagVariants = cva(
  "inline-flex items-center gap-1 rounded-pill border border-transparent px-2 py-0.5 align-middle text-2xs leading-4 font-bold whitespace-nowrap [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      tone: {
        neutral: "bg-w07 text-ink-quiet",
        ok: "bg-ok-bg text-ok-text",
        warn: "bg-warn-bg text-warn-text",
        err: "bg-err-bg text-err-text",
        info: "bg-info-bg text-info-text",
        ai: "bg-cyan-bg text-cyan-text",
        accent: "bg-[color-mix(in_srgb,var(--accent-label)_15%,transparent)] text-accent-label",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
)

type TagProps = React.ComponentProps<"span"> & VariantProps<typeof tagVariants>

export function Tag({ className, tone, ...props }: TagProps) {
  return <span data-slot="tag" data-tone={tone ?? "neutral"} className={cn(tagVariants({ tone }), className)} {...props} />
}

export { tagVariants }
