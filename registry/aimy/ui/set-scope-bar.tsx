import { cn } from "@/lib/utils"

// Bulk work states its scope before it acts: how many are selected, of what,
// filtered how, and the actions that apply to all of them. The design
// system's .set-scope-bar (aimy-ds.css:3538); neither product draws one yet,
// so it is built from the spec. The action button names the operation and its
// count ("Send 15 requests"), never "Apply", and a change with consequences
// goes through ChangeReview, which says what it will skip.
//
//   <SetScopeBar count={18} scope={<>of <strong>240 cards</strong> · filtered to <strong>Policies</strong></>}
//     actions={<EntryAction mode="review" onClick={review}>Request verification</EntryAction>}
//     onClear={clear} />

type SetScopeBarProps = {
  count: number
  /** Of what, and filtered how. Strong the parts that narrow it. */
  scope: React.ReactNode
  actions?: React.ReactNode
  onClear: () => void
  /** What Clear says: "Clear", or "Select only this page (18)". */
  clearLabel?: string
  className?: string
}

export function SetScopeBar({ count, scope, actions, onClear, clearLabel = "Clear", className }: SetScopeBarProps) {
  return (
    <div data-slot="set-scope-bar" role="region" aria-label="Selection" className={cn("set-scope-bar", className)}>
      <span className="ss-count" aria-live="polite">
        <span className="ss-num">{count.toLocaleString("en-GB")}</span> selected
      </span>
      <span className="ss-scope">{scope}</span>
      <span className="ss-actions">
        {actions}
        <button type="button" className="ss-clear" onClick={onClear}>
          {clearLabel}
        </button>
      </span>
    </div>
  )
}
