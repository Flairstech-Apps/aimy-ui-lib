import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Knowledge and the design system's .icon-btn: a square control on the raised
// surface with an edge; hover lifts the edge and turns the glyph to the accent.
// The toolbar form (.toolbar .icon-btn) drops the box until hovered, and an
// on state takes the accent tint. An icon alone needs a name, so `label` is
// required: it becomes the accessible name and the tooltip.
const iconButtonVariants = cva(
  [
    "inline-grid shrink-0 place-items-center rounded-md border",
    "transition-[background-color,border-color,color,scale] duration-(--t-fast) ease-out",
    "active:not-disabled:scale-(--press-scale) active:not-disabled:duration-(--t-press)",
    "disabled:cursor-not-allowed disabled:opacity-[0.38]",
    "motion-reduce:transition-none motion-reduce:active:scale-100",
    "[&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default:
          "border-edge bg-raised text-ink-secondary hover:not-disabled:border-edge-hover hover:not-disabled:text-accent-text",
        toolbar:
          "border-transparent bg-transparent text-ink-secondary hover:not-disabled:bg-card hover:not-disabled:text-ink aria-pressed:border-[color-mix(in_srgb,var(--accent)_35%,transparent)] aria-pressed:bg-accent-dim aria-pressed:text-ink-action",
      },
      size: {
        sm: "size-7 [&_svg]:size-3.5",
        md: "size-8 [&_svg]:size-4",
        lg: "size-9 [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
)

type IconButtonProps = Omit<React.ComponentProps<"button">, "aria-label"> &
  VariantProps<typeof iconButtonVariants> & {
    /** What the button does, in words. Read by screen readers and shown as the tooltip. */
    label: string
  }

export function IconButton({ className, variant, size, label, title, type, ...props }: IconButtonProps) {
  return (
    <button
      data-slot="icon-button"
      type={type ?? "button"}
      aria-label={label}
      title={title ?? label}
      className={cn(iconButtonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { iconButtonVariants }
