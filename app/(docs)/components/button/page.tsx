import { Phone } from "lucide-react"
import type { Metadata } from "next"
import { A11y, Install, Row, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"
import { AimyMark } from "@/registry/aimy/brand/aimy-mark"
import { Button } from "@/registry/aimy/ui/button"

export const metadata: Metadata = { title: "Button" }

export default function ButtonPage() {
  return (
    <>
      <PageHeader
        title="Button"
        lead="A pill, as both products draw their buttons. One filled primary per surface; everything else is a quiet control with an edge. Every button is a verb."
      />
      <Section title="Variants">
        <ThemePair>
          <div className="flex flex-col gap-5">
            <Row label="brand: the one primary">
              <Button variant="brand">
                <AimyMark title="" />
                Prepare me for it
              </Button>
              <Button variant="brand">Send the follow-up</Button>
            </Row>
            <Row label="ghost: the quiet control (default)">
              <Button>
                <Phone aria-hidden="true" />
                Call back
              </Button>
              <Button>Snooze a week</Button>
            </Row>
            <Row label="accent: an action AiMY will take">
              <Button variant="accent">
                <AimyMark title="" />
                Fill them in
              </Button>
            </Row>
            <Row label="ok, warn, err">
              <Button variant="ok">Mark as won</Button>
              <Button variant="warn">Flag for review</Button>
              <Button variant="err">Remove contact</Button>
            </Row>
            <Row label="text: the tertiary action">
              <Button variant="text">See all calls</Button>
            </Row>
          </div>
        </ThemePair>
      </Section>
      <Section title="Sizes and states">
        <ThemePair>
          <div className="flex flex-col gap-5">
            <Row label="sm 28, md 32, lg 40">
              <Button size="sm">Small</Button>
              <Button>Medium</Button>
              <Button size="lg">Large</Button>
            </Row>
            <Row label="loading, disabled">
              <Button variant="brand" loading>
                Saving
              </Button>
              <Button disabled>Call back</Button>
            </Row>
          </div>
        </ThemePair>
      </Section>
      <Install name="button" exports="Button" />
      <Section title="Use it">
        <CodeBlock>{`<Button variant="brand" onClick={send}>Send the follow-up</Button>
<Button onClick={snooze}>Snooze a week</Button>
<Button variant="brand" loading={saving}>Save</Button>
<Button asChild><Link href="/calls">View the call</Link></Button>`}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont
            doText="Use one brand button per surface, for the main next step."
            dontText="Fill several buttons on one surface. When everything shouts, nothing is the next step."
          />
          <DoDont
            doText="Name the action: Send the follow-up, Call back, Mark as won."
            dontText="Write Open, Learn more, Click here or OK when the action has a real name."
          />
          <DoDont
            doText="Act at once and offer Undo in a toast for a reversible action."
            dontText="Put a confirm dialog in front of something Undo can take back."
          />
        </div>
      </Section>
      <Source>
        <p>
          brand is Sales&apos; <code>.s-insight-lnk.primary</code> and Knowledge&apos;s <code>.btn-brand</code>; ghost is
          Sales&apos; <code>.b-ghost</code>; accent is Sales&apos; <code>.b-ai</code>; ok, warn and err are Knowledge&apos;s
          tinted <code>.btn-*</code>; text is Sales&apos; <code>.s-inline-btn</code>. Both products draw pills at 14px.
        </p>
        <p className="mt-3">
          Settled here, where they differed: height 32 (Sales 32, Knowledge 34), weight 500 for every variant (Knowledge
          and Sales&apos; ghost; Sales&apos; primary was 600), press scales to 0.97 (Sales&apos; ghost and the design system;
          Knowledge 0.98, Sales&apos; <code>.btn</code> moved 1px down).
        </p>
      </Source>
      <A11y
        items={[
          "A real <button type=\"button\">, so it works with Enter and Space and never submits a form by accident.",
          "loading disables the button and sets aria-busy; the label stays, so screen readers still hear what is happening.",
          "Focus shows the brand ring from the theme. Disabled is the one place reduced opacity is allowed.",
          "Pressing scales down unless the user asked for reduced motion.",
        ]}
      />
    </>
  )
}
