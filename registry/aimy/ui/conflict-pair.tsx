import { EntryAction } from "@/components/entry-action"
import { TrustState } from "@/components/trust-state"
import type { Source } from "@/lib/ai-types"

// Two sources that disagree, side by side, and a way to settle it: Knowledge's
// conflict answer (knowledge.js:9674). Each side shows its trust state, title,
// what it says and how it is used, and "Make this the one", a review action:
// it opens a ChangeReview, where the other one becomes superseded. It stays
// readable and stops being used in answers.
//
//   <ConflictPair sides={[{ source: a, says: "…", meta: "Confluence · Dana · used 14 times in 90 days" }, …]}
//     onPick={(side) => review(side)} />

type Side = { source: Source; says: React.ReactNode; meta?: React.ReactNode }

export function ConflictPair({ sides, onPick }: { sides: [Side, Side]; onPick: (side: Side) => void }) {
  return (
    <div data-slot="conflict-pair" className="conflict-pair" role="group" aria-label="Two sources that disagree">
      {sides.map((s) => (
        <section key={s.source.id} className="conflict-side" aria-label={s.source.title}>
          <div className="conflict-head">
            {s.source.status ? <TrustState status={s.source.status} setByHand={s.source.setByHand} /> : null}
          </div>
          <h4 className="conflict-title">{s.source.title}</h4>
          <p className="conflict-body">{s.says}</p>
          {s.meta ? <p className="conflict-meta">{s.meta}</p> : null}
          <EntryAction mode="review" onClick={() => onPick(s)}>
            Make this the one
          </EntryAction>
        </section>
      ))}
    </div>
  )
}
