import { cn } from "@/lib/utils"

// Where an answer's facts came from, in one plain line under it: Sales'
// .s-ans-cite (bdr.js:31804). "From your last 3 calls", "12 calls on the
// record", "nothing on the record yet". For an answer with numbered
// citations, use SourceList instead. A number with no way to see behind it is
// the unsourced confidence AiMY exists to remove.
//
//   <SourceLine>From your last 3 calls</SourceLine>

export function SourceLine({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <p data-slot="source-line" className={cn("s-ans-cite", className)}>
      <span>{children}</span>
    </p>
  )
}
