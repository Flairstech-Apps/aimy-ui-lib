import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

// The record card both products draw: Sales' contact, customer and campaign
// cards (article.type-card.s-card.b-qcard) and Knowledge's document card
// (.type-card). An <article> with a head (a state tag and the record's type),
// a title that is a real button or link, a one-line summary, fact rows and a
// foot. The title's hit area stretches over the whole card, so the card opens
// from anywhere while buttons in the foot still work on their own.
// A status tints the edge (Sales .st-*, Knowledge data-status), never a stripe.
type CardProps = React.ComponentProps<"article"> & { status?: "ok" | "warn" | "err" }

export function Card({ status, className, ...props }: CardProps) {
  return (
    <article
      data-slot="card"
      data-status={status}
      className={cn(
        "group/card relative flex flex-col overflow-hidden rounded-xl border border-edge bg-card shadow-[inset_0_1px_0_var(--w04)]",
        "transition-[border-color,box-shadow,scale] duration-(--t-base) ease-out",
        "has-[[data-slot=card-title]:hover]:border-edge-hover has-[[data-slot=card-title]:hover]:shadow-md",
        "has-[[data-slot=card-title]:active]:scale-[0.995] motion-reduce:has-[[data-slot=card-title]:active]:scale-100",
        "data-[status=ok]:border-[color-mix(in_srgb,var(--ok)_16%,var(--card-border))]",
        "data-[status=warn]:border-[color-mix(in_srgb,var(--warn)_20%,var(--card-border))]",
        "data-[status=err]:border-[color-mix(in_srgb,var(--err)_20%,var(--card-border))]",
        className
      )}
      {...props}
    />
  )
}

/** The top row: a state Tag on the left, the record's type on the right. */
export function CardHead({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-head" className={cn("flex items-center gap-2 px-4 pt-3", className)} {...props} />
}

/** The record's type, in words: Contact, Campaign, Policy. */
export function CardType({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="card-type" className={cn("ml-auto text-xs font-semibold text-ink-quiet", className)} {...props} />
}

type CardTitleProps = React.ComponentProps<"button"> & {
  /** Render a link (your router's) instead of a button. */
  asChild?: boolean
  /** Heading level for the title's wrapper. */
  level?: 2 | 3 | 4
}

/** Opens the record. Its hit area covers the whole card. */
export function CardTitle({ asChild = false, level = 3, className, ...props }: CardTitleProps) {
  const Comp = asChild ? Slot.Root : "button"
  const Heading = `h${level}` as const
  return (
    <Heading className="px-4 pt-1.5">
      <Comp
        data-slot="card-title"
        type={asChild ? undefined : "button"}
        className={cn(
          "text-left text-lg leading-tight font-bold text-ink transition-[color] duration-(--t-fast) ease-out hover:text-accent-text",
          "after:absolute after:inset-0 after:rounded-xl after:content-['']",
          className
        )}
        {...props}
      />
    </Heading>
  )
}

/** One line under the title: who or what it is. */
export function CardSummary({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="card-summary" className={cn("px-4 pt-1.5 text-meta text-ink-secondary", className)} {...props} />
}

/** Small fact rows: where, when, how much. */
export function CardFacts({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-facts" className={cn("flex flex-col gap-0.5 px-4 pt-1 text-micro text-ink-quiet", className)} {...props} />
}

/** Sits above the stretched title, so its own buttons stay clickable. */
export function CardBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-body" className={cn("relative px-4 pt-3", className)} {...props} />
}

export function CardFoot({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-foot"
      className={cn("relative mt-auto flex items-center justify-between gap-2 px-4 pt-4 pb-4", className)}
      {...props}
    />
  )
}
