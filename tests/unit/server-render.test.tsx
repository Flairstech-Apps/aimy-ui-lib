// @vitest-environment node
import { renderToString } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { Checkbox } from "@/registry/aimy/ui/checkbox"
import { DatePicker } from "@/registry/aimy/ui/date-picker"
import { Field } from "@/registry/aimy/ui/field"
import { Input } from "@/registry/aimy/ui/input"
import { Segmented } from "@/registry/aimy/ui/segmented"
import { Tab, Tabs, TabsList } from "@/registry/aimy/ui/tabs"
import { Textarea } from "@/registry/aimy/ui/textarea"

// Parts render on a server (Next.js), where there is no DOM: no HTMLInputElement, no document. jsdom
// tests can't catch a part that reaches for one during render; this one can.

describe("rendering on a server", () => {
  it("fields with an agent id render without a DOM", () => {
    const html = renderToString(
      <>
        <Field label="Company">
          <Input agent="company" defaultValue="Kestrel" />
        </Field>
        <Textarea agent="note" />
        <Checkbox agent="terms" label="Terms" />
        <Segmented agent="show" label="Show" options={[{ value: "a", label: "All" }]} />
        <Tabs agent="views" defaultValue="a">
          <TabsList>
            <Tab value="a">Overview</Tab>
          </TabsList>
        </Tabs>
        <DatePicker agent="created" label="Created" />
      </>
    )
    expect(html).toContain("Kestrel")
  })
})
