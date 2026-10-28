import { cn } from "@/lib/utils"

// The unread count on a control (.count-badge, Sales' --badge-ground): white
// on #d92d20 reads 4.8:1, where white on the dark theme's --err would not.
// Ringed in the page colour so it sits cleanly on the control's corner.
// Put it inside a `relative` parent; it pins to the top right.
type CountBadgeProps = Omit<React.ComponentProps<"span">, "children"> & {
  count: number
  /** Counts above this show as "max+". */
  max?: number
  /** What is being counted, for screen readers: "unread notifications". */
  label: string
}

export function CountBadge({ count, max = 99, label, className, ...props }: CountBadgeProps) {
  if (count <= 0) return null
  const shown = count > max ? `${max}+` : String(count)
  return (
    <span
      data-slot="count-badge"
      className={cn(
        "absolute -top-1.5 -right-1.5 grid h-4.5 min-w-4.5 place-items-center rounded-pill border-2 border-body bg-badge px-1 text-2xs leading-none font-bold text-on-brand",
        className
      )}
      {...props}
    >
      <span aria-hidden="true">{shown}</span>
      <span className="sr-only">
        {count} {label}
      </span>
    </span>
  )
}
