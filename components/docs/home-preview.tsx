"use client"

import { Phone } from "lucide-react"
import { AimyMark } from "@/registry/aimy/brand/aimy-mark"
import { AimyNote } from "@/registry/aimy/ui/aimy-note"
import { Button } from "@/registry/aimy/ui/button"
import { KpiWidget, KpiWidgets } from "@/registry/aimy/ui/kpi-widget"
import { toast } from "@/registry/aimy/ui/toast"

const ANSWERED = [51, 52, null, 55, 54, 57, 58, 56, 60, 61, 63, 62, 65, 64]

/** The home page's picture: real library components, live, as a product would use them. */
export function HomePreview() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-hairline bg-card p-5 shadow-lg">
      <KpiWidgets>
        <KpiWidget
          label="Calls answered"
          value="64%"
          sub="51% at signing · 70% promised"
          state={{ word: "behind", tone: "warn" }}
          series={ANSWERED}
          goal={{ value: 70 }}
          format={(v) => `${v}%`}
          start="Signing"
          keyLabel="Now · 4 weeks averaged"
          summary="Calls answered: 51% at signing, 64% now across the last 4 weeks, 70% promised, behind."
          note={
            <AimyNote variant="quiet">
              Six points short, and closing about one a week. At this pace it lands in mid December.
            </AimyNote>
          }
        />
      </KpiWidgets>
      <div className="flex flex-wrap gap-3">
        <Button variant="brand" onClick={() => toast("AiMY prepares the call notes")}>
          <AimyMark title="" />
          Prepare me for it
        </Button>
        <Button onClick={() => toast("Calling Dana Whitfield")}>
          <Phone aria-hidden="true" />
          Call back
        </Button>
      </div>
    </div>
  )
}
