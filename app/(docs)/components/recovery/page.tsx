import type { Metadata } from "next"
import {
  BannerDemo,
  DialogDemo,
  EmptyVsErrorDemo,
  InlineDemo,
  KindsDemo,
  PageDemo,
  PartialDemo,
  RetryDemo,
  ScreenDemo,
  SummaryDemo,
  ToastErrDemo,
} from "@/components/docs/recovery-demos"
import { A11y, Install, Source } from "@/components/docs/component"
import { Code, CodeBlock, DoDont, PageHeader, Section, ThemePair } from "@/components/docs/page"

export const metadata: Metadata = { title: "Errors and recovery" }

const CHOOSE: [string, string][] = [
  ["Screen", "The app can't draw its shell: the session ended at start-up, the account has no workspace, all of AiMY is in maintenance. The whole window, a card in the middle, the recovery full width."],
  ["Page", "Inside the shell, essential content can't load and nothing else on the screen works without it: session ended, no workspace, no access to the page, a missing record, the service down. Focus moves to its title."],
  ["Section", "One part of the page failed or is out of reach; the rest works. The default."],
  ["Widget", "One tile on a dashboard. It stays the size of the tile, so the other numbers keep their place."],
  ["Inline", "An action failed where it happened: a save, an upload, an approval that needs someone else. The form and what was typed stay."],
  ["Banner", "A state of the whole app that lasts: offline, maintenance, reconnecting. One at a time, across the top of the page or region."],
  ["Background status", "Recovery is running and the page still works. A small pill in the bar or above the list, polite, one announcement per attempt."],
  ["Toast", "A one-off action failed and the screen has nowhere better to say it: an export, a copy, a send. tone err, with the recovery as its button."],
  ["Dialog", "A decision is needed before going on and no inline state can hold it: a conflict on save, an action that may already have happened."],
]

const MAP: [string, string][] = [
  ["401, invalid_token, token_expired, invalid_grant, login_required, interaction_required", "session"],
  ["403, access_denied, insufficient_permissions, role_required", "permission"],
  ["no_workspace, workspace_removed", "workspace, workspace-removed"],
  ["navigator.onLine is false", "offline"],
  ["No response: ERR_NETWORK, Failed to fetch, DNS, proxy, CORS, VPN", "connection (or save, upload, uncertain with the options)"],
  ["408, 504, ECONNABORTED, ETIMEDOUT", "timeout (uncertain when sideEffect is set)"],
  ["500, 502, 503, service_unavailable, dependency_unavailable", "service (save when save is set)"],
  ["503 whose body says maintenance", "maintenance"],
  ["429, rate_limit_exceeded, Retry-After", "rate-limit, with retryAfter in seconds"],
  ["404, resource_not_found", "missing"],
  ["410, link_expired", "expired"],
  ["400, 422, validation_failed", "validation"],
  ["413 and 415", "file-too-large and file-type"],
  ["409, 412, concurrency_conflict, an ETag mismatch", "conflict"],
]

export default function Page() {
  return (
    <>
      <PageHeader
        title="Errors and recovery"
        lead="What every AiMY screen shows when something fails: what happened, what is safe, and the one action that recovers. Calm while it retries, clear when it has stopped."
      />

      <Section
        title="Retrying, then stopped"
        lead="Automatic recovery tries three times in the info tone with the attempt count. Only when it is exhausted does the failure appear, with the recovery and a support reference."
      >
        <ThemePair>
          <RetryDemo />
        </ThemePair>
      </Section>

      <Section title="A part failed, the page still works" lead="One widget failed and one is out of reach. The other numbers stay, and nothing redirects the page.">
        <ThemePair>
          <PartialDemo />
        </ThemePair>
      </Section>

      <Section
        title="The whole window"
        lead="When the app can't draw its shell at all: signed out, no workspace, all of AiMY in maintenance. A card on the page ground under the brand glow, the recovery as one full-width button. It reconnects first, then asks."
      >
        <ThemePair>
          <ScreenDemo />
        </ThemePair>
      </Section>

      <Section title="Blocking page" lead="Inside the shell, when nothing on the screen works without what failed. The title is the page heading and takes focus.">
        <ThemePair>
          <PageDemo kind="session" />
        </ThemePair>
      </Section>

      <Section title="Banner and background status" lead="States of the whole app that last. Offline is said only when the browser confirms it.">
        <ThemePair>
          <BannerDemo />
        </ThemePair>
      </Section>

      <Section
        title="Inline: a failed action"
        lead="Beside where it happened, with the work still there. A rate limit counts down and keeps its button until the wait is over. An action that may have finished asks you to check, not to repeat it."
      >
        <ThemePair>
          <InlineDemo />
        </ThemePair>
      </Section>

      <Section title="Form summary" lead="Press Send the invite. The summary takes focus, each line links to its field, and what was typed stays.">
        <ThemePair>
          <SummaryDemo />
        </ThemePair>
      </Section>

      <Section title="Toast and dialog" lead="A failed one-off action gets the red toast with its recovery. A conflict on save asks before anything is overwritten.">
        <div className="flex flex-wrap items-center gap-3">
          <ToastErrDemo />
          <DialogDemo />
        </div>
      </Section>

      <Section
        title="Empty is not an error"
        lead="No results is a success with nothing in it: neutral, dashed, and the way to widen the search. A failed load is red and offers to try again. Access is solid and never red."
      >
        <EmptyVsErrorDemo />
      </Section>

      <Section title="Every kind" lead="The default words for each kind. Override the title, message and action for the screen; keep the action a verb.">
        <KindsDemo />
      </Section>

      <Install name="recovery" exports="RecoveryState, RecoveryStatus, ErrorSummary, RecoveryDialog, classifyError" />

      <Section title="Use it" lead="Classify the error once, where the request is made, and show the state that matches.">
        <CodeBlock>{`try {
  await saveDeal(draft)
} catch (err) {
  const r = classifyError(err, { save: true })
  setFailure(r)  // keep the draft: the form stays filled
}

{failure ? (
  <RecoveryState
    kind={failure.kind}
    display="inline"
    reference={failure.reference}
    retryAfter={failure.retryAfter}
    onAction={() => saveDeal(draft)}
  />
) : null}`}</CodeBlock>
        <CodeBlock>{`// Automatic recovery, then the exhausted state
<RecoveryState kind="session" display="page" status={tries < 3 ? "retrying" : "failed"} attempt={tries}
  onAction={signIn} onSecondary={signInWithAnother} />

// A failed export
toast("We couldn't export the report", { tone: "err", sub: "Nothing changed.", action: { label: "Try again", onClick: exportIt } })

// A form that failed its checks or a 422
<ErrorSummary errors={[{ id: "email", message: "Enter an email address like name@flairstech.com" }]} />
<Field id="email" label="Email" error="Enter an email address like name@flairstech.com">…</Field>`}</CodeBlock>
      </Section>

      <Section title="Choosing the presentation">
        <ul data-ai="li" className="flex max-w-[46rem] flex-col gap-3 text-body text-ink-secondary">
          {CHOOSE.map(([name, when]) => (
            <li key={name}>
              <b className="text-ink">{name}.</b> {when}
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="From error to kind"
        lead="classifyError reads these and returns the kind, the status, Retry-After in seconds and the correlation ID. The codes are for logs; they never appear on the screen."
      >
        <ul data-ai="li" className="flex max-w-[46rem] list-disc flex-col gap-2 pl-5 text-body text-ink-secondary">
          {MAP.map(([from, to]) => (
            <li key={from}>
              {from}: <Code>{to}</Code>
            </li>
          ))}
        </ul>
        <p data-ai="p" className="mt-4 max-w-[46rem] text-body text-ink-secondary">
          Pass <Code>sideEffect: true</Code> for anything that creates, updates, deletes, sends or pays. A timeout or a
          lost connection then becomes <Code>uncertain</Code>, which asks people to check what happened instead of
          repeating it. <Code>save</Code> and <Code>upload</Code> give a dropped connection the words of the action.
        </p>
      </Section>

      <Section title="Writing the words">
        <ul data-ai="li" className="flex max-w-[46rem] list-disc flex-col gap-2 pl-5 text-body text-ink-secondary">
          <li>The title says what happened, in the person&apos;s terms: &quot;We couldn&apos;t save your changes&quot;, not &quot;Save failed (500)&quot;.</li>
          <li>The message says what is safe and what to do: &quot;Your changes are still here.&quot;, &quot;Nothing changed, so trying again is safe.&quot;</li>
          <li>The action names the recovery: Try again, Sign in again, Check access again, Try saving again. Never OK.</li>
          <li>Permission and workspace states never mention the internet or the VPN. Connection states never say offline unless the browser says so.</li>
          <li>Show the reference only when there is one, so people can quote it to support.</li>
        </ul>
      </Section>

      <Section title="Rules">
        <div className="flex flex-col gap-3">
          <DoDont doText="Keep what was typed, the filters and the rest of the page." dontText="Clear the form, or redirect the whole page because one widget failed." />
          <DoDont doText="Say no results when the search worked and found nothing." dontText="Show an empty state when the load failed." />
          <DoDont doText="Ask people to check before repeating a send, a payment or a delete that may have gone through." dontText="Offer a blind Try again after a timeout on a side effect." />
          <DoDont doText="Retry three times, then stop and say so." dontText="Retry forever, or show two errors for one failure." />
          <DoDont doText="Tell permission, session and connection apart." dontText="Treat every failure as a network problem, or show Forbidden, Unauthorized or a raw HTTP error." />
          <DoDont doText="Carry the meaning in the words and the icon." dontText="Rely on red alone." />
        </div>
      </Section>

      <Source>
        <p>
          AIMY-2979. The section is Knowledge&apos;s <code>.error-state</code> (a dashed edge in the error tint, an icon
          tile, a title, what is safe, Try again), generalised to every tone. The solid edge for access comes from
          QA&apos;s <code>.ai-unavailable.is-degraded</code>, which also gave the permission wording: &quot;Nothing was
          applied and nothing was lost.&quot; The whole-window screen is QA's sign-in gate on staging (a card under a soft brand glow, a round icon tile, one full-width Sign in again). The page, the banner and the form summary port the design system&apos;s{" "}
          <code>.error-page</code>, <code>.offline-bar</code>, <code>.banner</code> and <code>.form-summary</code>,
          specimens no product used yet; the summary&apos;s left stripe became a tinted ground. &quot;That didn&apos;t go
          through&quot; and &quot;Nothing was changed&quot; are Knowledge&apos;s failure toast. Session, workspace,
          offline, timeout, maintenance, rate limit, conflict and the attempt counter exist in no product; their words
          are the ticket&apos;s, in AiMY&apos;s voice. The red toast is your choice on 31 Oct.
        </p>
      </Source>

      <A11y
        items={[
          "While recovery runs, the attempt is announced politely, once per attempt. A failure that needs attention is announced at once.",
          "A blocking page moves focus to its title, so the announcement and the focus are one event.",
          "The Retry-After countdown is not announced each second; \"You can try again now\" is, once, when the wait ends.",
          "The error summary takes focus when it appears and each line links to its field. Fields keep aria-invalid and their message.",
          "Meaning is in the words and the icon as well as the colour. Buttons name the recovery.",
          "announce={false} keeps a second state quiet when another already speaks for the same failure.",
          "The spinner stops under reduced motion; the words still say it is retrying.",
        ]}
      />
    </>
  )
}
