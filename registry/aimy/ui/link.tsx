import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

// The design system's .link: coloured words with no box, for going somewhere.
// A link has neither a fill nor an edge. An action that does something is a
// Button (variant "text" for the quiet one), never a link.
// - default  brand ink, underline on hover
// - inline   inside a sentence: always underlined, 3px offset
type LinkProps = React.ComponentProps<"a"> & {
  variant?: "default" | "inline"
  /** Render your router's link (Next.js Link, React Router Link) with these styles. */
  asChild?: boolean
}

export function Link({ className, variant = "default", asChild = false, ...props }: LinkProps) {
  const Comp = asChild ? Slot.Root : "a"
  return (
    <Comp
      data-slot="link"
      className={cn(
        "rounded-xs font-semibold text-link decoration-1 underline-offset-[3px]",
        "transition-[text-decoration-color,color] duration-(--t-fast) ease-out",
        "[&_svg]:ml-0.5 [&_svg]:inline [&_svg]:size-3.5 [&_svg]:align-[-2px]",
        variant === "inline" ? "underline" : "no-underline hover:underline",
        className
      )}
      {...props}
    />
  )
}
