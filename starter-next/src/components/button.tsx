import { cva, type VariantProps } from "class-variance-authority"
import { LoaderCircle } from "lucide-react"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

// AiMY buttons are pills, as both products draw them:
// - brand   Sales .s-insight-lnk.primary and Knowledge .btn-brand: the one
//           filled primary per surface. White words, and the AiMY mark turns
//           white with them (--aimy-mark: currentColor).
// - ghost   Sales .b-ghost, the quiet control: an edge, no fill.
// - accent  Sales .b-ai: an action AiMY will take, in the accent.
// - ok, warn, err  Knowledge .btn-ok/-warn/-err: a tinted ground, the
//           readable -text ink, and a 25% edge of the hue.
// - text    Sales .s-inline-btn, the tertiary action: a verb in the accent
//           ink with no box, and a 24px hit area.
// A control has an edge and a label has a fill: brand is the one exception,
// once per surface.
const buttonVariants = cva(
  [
    "relative inline-flex shrink-0 items-center justify-center gap-2 rounded-pill border border-transparent",
    "font-sans font-semibold whitespace-nowrap select-none",
    "transition-[background-color,border-color,color,scale] duration-(--t-fast) ease-out",
    "active:not-disabled:scale-(--press-scale) active:not-disabled:duration-(--t-press)",
    "disabled:cursor-not-allowed disabled:opacity-[0.38] aria-busy:cursor-progress aria-busy:opacity-100",
    "[&_svg]:size-3.5 [&_svg]:shrink-0",
    "motion-reduce:transition-none motion-reduce:active:scale-100",
  ],
  {
    variants: {
      variant: {
        brand: "bg-brand text-on-brand [--aimy-mark:currentColor] hover:not-disabled:bg-brand-hover",
        ghost: "border-edge text-ink-secondary hover:not-disabled:border-edge-hover hover:not-disabled:text-ink",
        accent:
          "border-[color-mix(in_srgb,var(--accent)_35%,transparent)] text-accent-text hover:not-disabled:border-[color-mix(in_srgb,var(--accent)_50%,transparent)] hover:not-disabled:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]",
        ok: "border-[color-mix(in_srgb,var(--ok)_25%,transparent)] bg-ok-bg text-ok-text hover:not-disabled:bg-[color-mix(in_srgb,var(--ok)_20%,transparent)]",
        warn: "border-[color-mix(in_srgb,var(--warn)_25%,transparent)] bg-warn-bg text-warn-text hover:not-disabled:bg-[color-mix(in_srgb,var(--warn)_22%,transparent)]",
        err: "border-[color-mix(in_srgb,var(--err)_25%,transparent)] bg-err-bg text-err-text hover:not-disabled:bg-[color-mix(in_srgb,var(--err)_20%,transparent)]",
        text: [
          "rounded-sm border-0 text-accent-text",
          "underline-offset-[3px] hover:not-disabled:text-accent hover:not-disabled:underline",
          "after:absolute after:-inset-x-1 after:-inset-y-1.5",
        ],
      },
      size: {
        sm: "min-h-7 px-3 text-xs",
        md: "min-h-8 px-4 text-xs",
        lg: "min-h-10 px-5 text-base",
      },
    },
    compoundVariants: [{ variant: "text", class: "min-h-0 px-0" }],
    defaultVariants: { variant: "ghost", size: "md" },
  }
)

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /** Render the child element (a link, say) with button styling. */
    asChild?: boolean
    /** Shows a spinner, keeps the label, and blocks clicks until done. */
    loading?: boolean
  }

export function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  type,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      data-slot="button"
      data-variant={variant ?? "ghost"}
      type={asChild ? undefined : (type ?? "button")}
      disabled={asChild ? undefined : disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {loading && !asChild ? (
        <>
          <LoaderCircle aria-hidden="true" strokeWidth={2} className="animate-spin motion-reduce:animate-none" />
          {children}
        </>
      ) : (
        children
      )}
    </Comp>
  )
}

export { buttonVariants }
