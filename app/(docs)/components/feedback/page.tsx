import type { Metadata } from "next"
import { ActionButtonDemo, OptimisticDemo, UndoableDemo } from "@/components/docs/feedback-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Confirmation & feedback" }

export default function Page() {
  return (
    <>
      <PageHeader
        title="Confirmation & feedback"
        lead="What a person sees between pressing and done. Act at once and show the result; say what happened, with Undo; show progress only when it's slow enough to notice; and when something fails, put it back and say why, with Try again. A typed confirmation only for what can't be taken back, never a plain Are you sure?"
      />
      <Section title="The ladder" lead="Every action climbs only as far as it needs to.">
        <ol data-ai="ol" className="flex max-w-[46rem] list-decimal flex-col gap-1.5 pl-5 text-body text-ink-secondary">
          <li data-ai="li">
            <strong className="text-ink">Act, then tell, with Undo.</strong> The change shows at once (optimistic), a toast
            says what happened, the save runs behind. This is almost everything.
          </li>
          <li data-ai="li">
            <strong className="text-ink">Explain, then accept.</strong> A Dialog when the change has consequences people
            need to read first (a diff, what else it affects).
          </li>
          <li data-ai="li">
            <strong className="text-ink">Type to confirm.</strong> TypeToConfirm for what can&apos;t be undone or is
            governed: deleting records, changing permissions.
          </li>
        </ol>
      </Section>
      <Section title="Act at once, with Undo" lead="useUndoable: the row folds away, the toast offers Undo, and the save runs behind. Set the server to fail: the row comes back and an error toast says why, with Try again.">
        <UndoableDemo />
      </Section>
      <Section title="Optimistic, and honest when it fails" lead="useOptimisticValue drives any part: the new order or name shows the moment you act. SaveStatus says Saving…, then Saved; a failure puts it back and says why.">
        <OptimisticDemo />
      </Section>
      <Section title="A button that shows its own progress" lead="ActionButton: a spinner only if the work is slow (the copy finishes too fast to flash one), a tick and the word when done, and on failure a shake and the reason under it. Its width never moves.">
        <ThemePair>
          <ActionButtonDemo />
        </ThemePair>
      </Section>
      <Install name="feedback" exports="ActionButton, SaveStatus, useUndoable" />
      <Section title="Use it">
        <CodeBlock>{`// 1. Act at once, with Undo; the save behind can fail safely
const run = useUndoable()
run({ title: "Archived Kestrel", apply: () => archive(id), revert: () => restore(id), save: () => api.archive(id) })

// 2. Any controlled part, optimistic
const order = useOptimisticValue(serverOrder, (next) => api.saveOrder(next), {
  onError: (message, retry) => toast("Couldn't save the new order", { tone: "err", sub: message, action: { label: "Try again", onClick: retry } }),
})
<SortableList items={order.shown} onReorder={order.set} … />
<SaveStatus status={order.status} error={order.error} onRetry={() => order.set(order.shown)} />

// 3. A button that reports on itself
<ActionButton pendingLabel="Saving" successLabel="Saved" onAction={save}>Save changes</ActionButton>

// Throw a UserFacingError when your message is already written for people;
// anything else is put in AiMY's words for its kind (offline, timeout, conflict…).`}</CodeBlock>
      </Section>
      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Show the change the moment the person acts, and save behind it." dontText="Wait for the server before anything moves, with a spinner in place of the result." />
          <DoDont doText="When a save fails, put the change back, say what failed and what is safe, and offer Try again." dontText="Leave the failed change on screen as if it saved, or say only that something went wrong." />
          <DoDont doText="Confirm with Undo after the fact; type to confirm only what can't be taken back." dontText="Ask Are you sure? before an action Undo could reverse." />
        </div>
      </Section>
      <Source>
        <p>
          The ladder is AiMY&apos;s doctrine (§3.1), the same one the Autonomy part sets for AiMY. The toast is the
          library&apos;s; failure words come from <code>RECOVERY_COPY</code> through <code>classifyError</code>. The shake
          is transitions.dev 12 with its own timings, the tick springs in on <code>--ease-spring</code>, and pending waits{" "}
          <code>--duration-quick</code> before it shows and then stays <code>--duration-slow</code>, so nothing flickers.
        </p>
      </Source>
      <A11y
        items={[
          "Progress and success are said in a polite live region; a failure is an alert tied to what failed.",
          "ActionButton is aria-busy while it works and keeps its name, so the person always knows what it does.",
          "A row that folds away is hidden from screen readers and can't be tabbed to while it leaves.",
        ]}
      />
    </>
  )
}
