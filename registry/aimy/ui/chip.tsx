import { X } from "lucide-react"
import { cn } from "@/lib/utils"

// Sales' .chip (the filter cuts in bdr.js): a control, so it has an edge.
// 12px, 500, 28px tall, a pill. Selected takes the accent; the words stay
// readable in both states (no faded text for the unselected ones).
// A chip is a toggle: it reports its state with aria-pressed.
type ChipProps = Omit<React.ComponentProps<"button">, "onClick"> & {
  selected?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  /** Shows a remove control after the label. */
  onRemove?: () => void
  /** Name used for the remove control, e.g. the filter's label. */
  removeLabel?: string
}

export function Chip({ className, selected = false, onRemove, removeLabel, children, type, ...props }: ChipProps) {
  const chip = (
    <button
      data-slot="chip"
      type={type ?? "button"}
      aria-pressed={selected}
      className={cn(
        "inline-flex min-h-7 shrink-0 items-center gap-1.5 rounded-pill border px-3.5 text-2xs leading-4 font-semibold whitespace-nowrap",
        "transition-[background-color,border-color,color,scale] duration-(--t-fast) ease-out",
        "active:scale-(--press-scale) active:duration-(--t-press) motion-reduce:transition-none motion-reduce:active:scale-100",
        "[&_svg]:size-3 [&_svg]:shrink-0",
        selected
          ? "border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-accent-dim text-accent-text"
          : "border-w08 bg-w04 text-ink-secondary hover:bg-w07 hover:text-ink",
        onRemove && "pr-1.5",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
  if (!onRemove) return chip
  return (
    <span data-slot="chip-group" className="inline-flex items-center gap-0.5">
      {chip}
      <button
        type="button"
        data-slot="chip-remove"
        onClick={onRemove}
        aria-label={`Remove ${removeLabel ?? (typeof children === "string" ? children : "filter")}`}
        className="grid size-6 place-items-center rounded-pill text-ink-secondary transition-[background-color,color] duration-(--t-fast) ease-out hover:bg-w07 hover:text-ink"
      >
        <X aria-hidden="true" strokeWidth={2} className="size-3" />
      </button>
    </span>
  )
}
