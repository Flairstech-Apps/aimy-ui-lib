import { AimyMark } from "@/components/aimy-mark"
import { cn } from "@/lib/utils"

// Sales' attainment bar (.s-att): how far a figure has got toward its target.
// The figure and "of" the target, the share in words, then one bar in two
// layers: the fills (what is in, solid accent; what AiMY expects could still
// come, hatched so it reads as not yet real) and the marks over them. The
// target crosses the bar; where you should be today is a tick inside it. The
// scale is the target plus a fifth, so the target sits at 83% with room to
// pass it, and a figure that outruns even that widens the scale rather than
// clipping. The key under it names each band and mark in plain words.
//
//   <TargetBar value={182400} target={300000} forecast={268000} elapsed={0.61}
//     format={(n) => `€${Math.round(n / 1000)}k`} />

type TargetBarProps = {
  value: number
  target: number
  /** Where AiMY expects it to end; leave out once the period has closed. */
  forecast?: number
  /** How much of the period has gone, 0 to 1: draws where you should be today. */
  elapsed?: number
  format: (n: number) => string
  labels?: { value?: string; forecast?: string; target?: string; pace?: string }
  /** The fills wipe in once, the projection after the figure. */
  arriving?: boolean
  className?: string
}

const OVERSHOOT = 1.2

export function TargetBar({ value, target, forecast, elapsed, format, labels, arriving, className }: TargetBarProps) {
  const scale = Math.max(target * OVERSHOOT, forecast ?? 0, value) || 1
  const pc = (v: number) => Math.max(0, Math.min(100, (v / scale) * 100))
  const valuePc = pc(value)
  const fcastPc = forecast == null ? 0 : Math.max(0, pc(forecast) - valuePc)
  const pacePc = elapsed == null ? null : pc(target * elapsed)
  const share = target ? value / target : 0
  const more = forecast == null ? 0 : Math.max(0, forecast - value)
  const said =
    `${format(value)} of a ${format(target)} target.` +
    (forecast != null ? ` AiMY expects another ${format(more)} by the end, reaching ${format(forecast)}.` : "")
  const L = {
    value: "Gained",
    forecast: "Could still come",
    target: "Target",
    pace: "Where you should be today",
    ...labels,
  }
  return (
    <div className={cn("s-att", arriving && "is-arriving", className)} data-slot="target-bar">
      <div className="s-att-head">
        <span className="s-att-lead">
          {format(value)} <span className="s-att-of">of {format(target)}</span>
        </span>
        <span className={cn("s-att-pc", share >= 1 && "tone-ok")}>{Math.round(share * 100)}% of target</span>
      </div>
      <div className="s-att-bar" role="img" aria-label={said}>
        <div className="s-att-track">
          <span className="s-att-booked" style={{ width: `${valuePc.toFixed(1)}%` }} />
          {fcastPc ? <span className="s-att-fcast" style={{ width: `${fcastPc.toFixed(1)}%` }} /> : null}
        </div>
        <span className="s-att-target" style={{ left: `${pc(target).toFixed(1)}%` }} />
        {pacePc != null ? <span className="s-att-pace" style={{ left: `${pacePc.toFixed(1)}%` }} /> : null}
      </div>
      <div className="s-att-keys" aria-hidden="true">
        <span className="s-att-key is-booked">{L.value}</span>
        {forecast != null ? (
          <span className="s-att-key is-fcast">
            <AimyMark title="" />
            {L.forecast} · {format(more)}
          </span>
        ) : null}
        <span className="s-att-key is-target">{L.target}</span>
        {pacePc != null ? <span className="s-att-key is-pace">{L.pace}</span> : null}
      </div>
    </div>
  )
}
