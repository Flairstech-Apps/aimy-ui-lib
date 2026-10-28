import { Button } from "@/components/button"
import { cn } from "@/lib/utils"

// Sales' pager (pager() in bdr.js): says where you are in words and offers
// Back and Next by how many, as quiet text actions. No page-number strip.
// "134 contacts, all shown." when everything fits on one page.
type PagerProps = {
  total: number
  /** 1-based. */
  page: number
  pageSize?: number
  onPageChange: (page: number) => void
  /** What is being paged, plural: "contacts". */
  noun: string
  className?: string
}

export function Pager({ total, page, pageSize = 15, onPageChange, noun, className }: PagerProps) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (pages === 1) {
    return (
      <p data-slot="pager" className={cn("mt-3 text-meta text-ink-secondary", className)}>
        {total} {noun}, all shown.
      </p>
    )
  }
  const first = (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)
  const nextCount = Math.min(pageSize, total - last)
  return (
    <nav data-slot="pager" aria-label={`Pages of ${noun}`} className={cn("mt-3 flex items-center justify-between gap-3", className)}>
      <p className="text-meta text-ink-secondary" aria-live="polite">
        {first}–{last} of {total} {noun}, page {page} of {pages}
      </p>
      <div className="flex items-center gap-4">
        {page > 1 ? (
          <Button variant="text" onClick={() => onPageChange(page - 1)}>
            Back {pageSize}
          </Button>
        ) : null}
        {page < pages ? (
          <Button variant="text" onClick={() => onPageChange(page + 1)}>
            Next {nextCount}
          </Button>
        ) : null}
      </div>
    </nav>
  )
}
