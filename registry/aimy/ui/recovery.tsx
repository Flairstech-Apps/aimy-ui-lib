"use client"

import {
  Building2,
  CircleAlert,
  CircleQuestionMark,
  CloudOff,
  CloudUpload,
  FileExclamationPoint,
  FileQuestionMark,
  GitCompareArrows,
  Hourglass,
  Link2Off,
  LoaderCircle,
  Lock,
  LogIn,
  ServerCrash,
  Timer,
  Trash2,
  WifiOff,
  Wrench,
  X,
} from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"
import { Button } from "@/components/button"
import { CopyButton } from "@/components/copy-button"
import { Dialog, DialogContent } from "@/components/dialog"
import { RECOVERY_COPY, retryingCopy, type RecoveryKind, type RecoveryTone } from "@/lib/recovery-kinds"
import { cn } from "@/lib/utils"

// Error and recovery states, AIMY-2979. One component for every failure the
// ticket names, in the presentation that fits: a blocking page, a section or
// a dashboard widget that keeps the rest of the page usable, an inline note,
// or a persistent banner. Knowledge's .error-state (a tinted icon tile, a
// title, what is safe, the recovery) is the section; QA's .ai-unavailable
// and .is-degraded give the access tone its solid edge; the design system's
// .error-page, .offline-bar and .banner give the page and the banner.
//
// While recovery runs (status="retrying") it is calm: the info tone, a
// spinner, "Attempt 2 of 3", announced politely. When recovery is exhausted
// (status="failed") it says what happened, what is safe and the way out,
// announced at once. A blocking page moves focus to its title instead.
//
//   <RecoveryState kind="session" display="page" onAction={signIn} onSecondary={switchAccount} />
//   <RecoveryState kind="service" display="widget" status="retrying" attempt={2} />
//   <RecoveryState kind="rate-limit" display="inline" retryAfter={30} onAction={retry} />

const ICONS: Record<RecoveryKind, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  session: LogIn,
  permission: Lock,
  workspace: Building2,
  "workspace-removed": Building2,
  offline: WifiOff,
  connection: CloudOff,
  timeout: Hourglass,
  uncertain: CircleQuestionMark,
  service: ServerCrash,
  maintenance: Wrench,
  "rate-limit": Timer,
  missing: FileQuestionMark,
  deleted: Trash2,
  expired: Link2Off,
  validation: CircleAlert,
  save: CircleAlert,
  upload: CloudUpload,
  "file-too-large": FileExclamationPoint,
  "file-type": FileExclamationPoint,
  conflict: GitCompareArrows,
  load: CircleAlert,
  action: CircleAlert,
}

// edge: the section's outline. line: the banner's bottom edge.
const TONE: Record<RecoveryTone, { tile: string; ink: string; ground: string; edge: string; line: string }> = {
  err: {
    tile: "bg-err-bg text-err-text",
    ink: "text-err-text",
    ground: "bg-err-bg",
    edge: "border-dashed border-[color-mix(in_srgb,var(--err)_35%,transparent)]",
    line: "border-err-border",
  },
  warn: {
    tile: "bg-warn-bg text-warn-text",
    ink: "text-warn-text",
    ground: "bg-warn-bg",
    edge: "border-dashed border-[color-mix(in_srgb,var(--warn)_35%,transparent)]",
    line: "border-warn-border",
  },
  info: {
    tile: "bg-info-bg text-info-text",
    ink: "text-info-text",
    ground: "bg-info-bg",
    edge: "border-dashed border-[color-mix(in_srgb,var(--info)_35%,transparent)]",
    line: "border-info-border",
  },
  // A question of access, not a failure: solid edge, quiet tile, never red.
  access: { tile: "bg-w07 text-ink", ink: "text-ink", ground: "bg-w05", edge: "border-solid border-edge", line: "border-edge" },
}

/** Counts down Retry-After once a second; null when there is nothing to wait for. */
function useCountdown(from: number | undefined) {
  const [left, setLeft] = useState(from ?? 0)
  const [prev, setPrev] = useState(from)
  if (from !== prev) {
    setPrev(from)
    setLeft(from ?? 0)
  }
  useEffect(() => {
    if (left <= 0) return
    const t = window.setTimeout(() => setLeft((s) => s - 1), 1000)
    return () => window.clearTimeout(t)
  }, [left])
  return from ? left : null
}

function Attempts({ attempt, of, compact }: { attempt: number; of: number; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold text-info-text", compact ? "text-2xs" : "text-xs")}>
      <span aria-hidden="true" className="flex gap-1">
        {Array.from({ length: of }, (_, i) => (
          <span
            key={i}
            className={cn("size-1.5 rounded-full", i < attempt ? "bg-info" : "bg-[color-mix(in_srgb,var(--info)_25%,transparent)]")}
          />
        ))}
      </span>
      Attempt {attempt} of {of}
    </span>
  )
}

function Reference({ value }: { value: string }) {
  return (
    <span className="inline-flex flex-wrap items-center justify-center gap-2 text-2xs text-ink-secondary">
      <span>
        Reference: <span className="font-mono text-ink">{value}</span>
      </span>
      <CopyButton value={value} what="the reference" />
    </span>
  )
}

export type RecoveryDisplay = "screen" | "page" | "section" | "widget" | "inline" | "banner"

type RecoveryStateProps = {
  kind: RecoveryKind
  /**
   * screen: the whole window, when the app can't even draw its shell (signed
   * out, no workspace, all of AiMY down). page: inside the shell, blocks the
   * content because essential content can't load. section and
   * widget: one part failed, the rest of the page stays usable. inline: a
   * failed action beside where it happened. banner: a persistent bar across
   * the top of a page or region (offline, maintenance, reconnecting).
   */
  display?: RecoveryDisplay
  /** retrying while automatic recovery runs; failed once it is exhausted. */
  status?: "retrying" | "failed"
  attempt?: number
  maxAttempts?: number
  title?: React.ReactNode
  message?: React.ReactNode
  /** The recovery. Without it there is no main button. */
  onAction?: () => void
  actionLabel?: string
  /** True while the recovery runs: the button spins and can't be pressed twice. */
  pending?: boolean
  onSecondary?: () => void
  secondaryLabel?: string
  /** Replaces both buttons, for links or anything the props don't cover. */
  actions?: React.ReactNode
  /** Seconds before trying again is allowed (Retry-After). The button counts down. */
  retryAfter?: number
  /** Maintenance: when it is expected back, in words ("by 14:00", "at about 3 pm"). */
  backAt?: string
  /** A correlation or request ID people can quote to support. */
  reference?: string
  /** Banner only: lets people put it away. Persistent problems usually keep it. */
  onDismiss?: () => void
  /** Page only: move focus to the title when it appears. On by default. */
  autoFocus?: boolean
  /**
   * Announce it to screen readers. On by default; turn it off when another
   * state already speaks for the same failure, so one failure is heard once.
   */
  announce?: boolean
  /** More guidance under the message: what still works, what was kept. */
  children?: React.ReactNode
  className?: string
}

export function RecoveryState({
  kind,
  display = "section",
  status = "failed",
  attempt = 1,
  maxAttempts = 3,
  title,
  message,
  onAction,
  actionLabel,
  pending,
  onSecondary,
  secondaryLabel,
  actions,
  retryAfter,
  backAt,
  reference,
  onDismiss,
  autoFocus = true,
  announce: speak = true,
  children,
  className,
}: RecoveryStateProps) {
  const copy = RECOVERY_COPY[kind]
  const retrying = status === "retrying"
  const tone = TONE[retrying ? "info" : copy.tone]
  const left = useCountdown(retrying ? undefined : retryAfter)
  const waiting = left !== null && left > 0
  const headingRef = useRef<HTMLHeadingElement>(null)
  const titleId = useId()

  const screen = display === "screen"
  // page and screen block everything: their title is the heading and takes focus.
  const page = display === "page" || screen
  const row = display === "inline" || display === "banner"

  useEffect(() => {
    if (page && autoFocus) headingRef.current?.focus()
  }, [page, autoFocus, status, kind, display])

  const words = retrying ? retryingCopy(kind) : copy
  const heading = title ?? words.title
  let body: React.ReactNode = message ?? words.message
  if (!message && !retrying && kind === "rate-limit" && retryAfter) {
    body = waiting ? `Wait ${left} ${left === 1 ? "second" : "seconds"} before trying again.` : "You can try again now."
  }
  if (!message && !retrying && kind === "maintenance" && backAt) body = `${copy.message} We expect it back ${backAt}.`

  // What screen readers hear: once when it appears, once per attempt, and
  // once when a wait ends. The ticking countdown itself is never announced.
  const [firstWait] = useState(retryAfter)
  const plain = (n: React.ReactNode) => (typeof n === "string" ? n : "")
  let live = ""
  if (retrying) live = `${plain(heading)}. Attempt ${attempt} of ${maxAttempts}.`
  else if (left === 0 && firstWait) live = "You can try again now."
  else if (!page)
    live = `${plain(heading)}. ${kind === "rate-limit" && firstWait && !message ? `Wait ${firstWait} seconds before trying again.` : plain(body)}`

  const Icon = retrying ? LoaderCircle : ICONS[kind]
  const iconClass = cn(retrying && "animate-spin motion-reduce:animate-none")
  const label = actionLabel ?? copy.action ?? "Try again"
  const size = screen ? "lg" : page || display === "section" ? "md" : "sm"

  const buttons =
    retrying ? null : actions !== undefined ? (
      actions
    ) : onAction || onSecondary ? (
      <>
        {onSecondary ? (
          <Button size={size} onClick={onSecondary} className={screen ? "w-full" : undefined}>
            {secondaryLabel ?? copy.secondary ?? "Go back"}
          </Button>
        ) : null}
        {onAction ? (
          <Button
            size={size}
            variant={page || display === "section" ? "brand" : undefined}
            onClick={onAction}
            loading={pending}
            disabled={waiting}
            // The words say it is waiting ("in 12s"), so they stay at full strength.
            className={cn(waiting && "disabled:opacity-100", screen && "w-full")}
          >
            {waiting ? `${label} in ${left}s` : label}
          </Button>
        ) : null}
      </>
    ) : null

  const announce = !speak ? null : live ? (
    <span className="sr-only" role={retrying ? "status" : "alert"}>
      {live}
    </span>
  ) : (
    <span className="sr-only" role="status" />
  )

  if (row) {
    return (
      <div
        data-slot="recovery-state"
        data-kind={kind}
        data-display={display}
        data-status={status}
        className={cn(
          "@container text-meta text-ink",
          tone.ground,
          display === "banner" ? cn("border-b px-4 py-2.5", tone.line) : "rounded-lg px-4 py-3",
          className
        )}
      >
        {announce}
        {/* Under 30rem the buttons take their own line under the words, instead of squeezing them. */}
        <div className="flex items-start gap-3 @max-[30rem]:flex-wrap">
          {/* A 20px box, so the words start on the scale (32px) and the buttons can line up under them. */}
          <span className="grid size-5 shrink-0 place-items-center">
            <Icon aria-hidden="true" strokeWidth={2} className={cn("size-4", tone.ink, iconClass)} />
          </span>
          <div className="min-w-0 flex-1">
            <p className={cn("font-semibold", tone.ink)}>{heading}</p>
            <div className="mt-0.5 text-ink-secondary">
              {body}
              {retrying ? (
                <span className="ml-2">
                  <Attempts attempt={attempt} of={maxAttempts} compact />
                </span>
              ) : null}
            </div>
            {children ? <div className="mt-1.5 text-ink-secondary">{children}</div> : null}
            {reference ? (
              <div className="mt-1.5">
                <Reference value={reference} />
              </div>
            ) : null}
          </div>
          {onDismiss ? (
            <button
              type="button"
              aria-label="Dismiss"
              onClick={onDismiss}
              className="order-last grid size-7 shrink-0 place-items-center self-center rounded-md text-ink-secondary transition-[background-color,color] duration-(--t-fast) ease-out hover:bg-w07 hover:text-ink @max-[30rem]:order-none @max-[30rem]:self-start"
            >
              <X aria-hidden="true" strokeWidth={2} className="size-4" />
            </button>
          ) : null}
          {buttons ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2 self-center @max-[30rem]:basis-full @max-[30rem]:pl-8">
              {buttons}
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  const widget = display === "widget"
  const state = (
    <div
      data-slot={screen ? undefined : "recovery-state"}
      data-kind={screen ? undefined : kind}
      data-display={screen ? undefined : display}
      data-status={screen ? undefined : status}
      aria-labelledby={page ? titleId : undefined}
      role={page ? "region" : undefined}
      className={cn(
        "flex flex-col",
        display === "page" && "min-h-[min(32rem,70dvh)] items-center justify-center gap-3 px-6 py-12 text-center",
        screen && "w-full max-w-[28rem] items-center gap-3 rounded-2xl border border-edge bg-card px-8 py-8 text-center shadow-xl max-phone:px-5",
        display === "section" && cn("items-center gap-3 rounded-2xl border bg-card px-8 py-10 text-center", tone.edge),
        widget && "items-start gap-2 p-4 text-left",
        !screen && className
      )}
    >
      {announce}
      <span
        className={cn(
          "grid shrink-0 place-items-center",
          // On the screen, access states take QA's gate tile: the brand, not grey.
          screen && !retrying && copy.tone === "access"
            ? "bg-[color-mix(in_srgb,var(--brand)_18%,transparent)] text-accent-text"
            : tone.tile,
          screen
            ? "size-12 rounded-full [&_svg]:size-5"
            : page
              ? "size-14 rounded-2xl [&_svg]:size-6"
              : widget
                ? "size-8 rounded-lg [&_svg]:size-4"
                : "size-11 rounded-xl [&_svg]:size-5"
        )}
      >
        <Icon aria-hidden="true" strokeWidth={2} className={iconClass} />
      </span>
      {page ? (
        <h1 ref={headingRef} id={titleId} tabIndex={-1} className="mt-1 text-xl leading-tight font-bold text-ink outline-none">
          {heading}
        </h1>
      ) : (
        <p className={cn("font-semibold text-ink", widget ? "text-xs" : "text-body")}>{heading}</p>
      )}
      <div
        className={cn(
          "text-ink-secondary",
          page ? "max-w-[28rem] text-body" : widget ? "text-xs" : "max-w-[24rem] text-meta"
        )}
      >
        {body}
      </div>
      {retrying ? <Attempts attempt={attempt} of={maxAttempts} compact={widget} /> : null}
      {children ? (
        <div className={cn("text-ink-secondary", widget ? "text-xs" : "max-w-[28rem] text-meta")}>{children}</div>
      ) : null}
      {buttons ? (
        <div
          className={cn(
            "mt-1 flex gap-2",
            // The screen stacks full-width buttons, the recovery on top.
            screen ? "mt-3 w-full flex-col-reverse" : "flex-wrap",
            !widget && !screen && "justify-center"
          )}
        >
          {buttons}
        </div>
      ) : null}
      {reference && !retrying ? <Reference value={reference} /> : null}
    </div>
  )

  if (!screen) return state
  // The whole window, when the app can't draw its shell: signed out, no
  // workspace, the whole of AiMY in maintenance. QA's sign-in gate: a card
  // in the middle of the page ground under a soft glow of the brand.
  return (
    <div
      data-slot="recovery-state"
      data-kind={kind}
      data-display={display}
      data-status={status}
      className={cn(
        "grid min-h-dvh w-full place-items-center bg-body p-4",
        "bg-[radial-gradient(ellipse_60%_55%_at_50%_45%,color-mix(in_srgb,var(--brand)_22%,transparent),transparent_70%)]",
        className
      )}
    >
      {state}
    </div>
  )
}

/**
 * Background recovery: a small status that says AiMY is retrying while the
 * page stays usable, in the top bar or above a list. Polite, once per attempt.
 */
export function RecoveryStatus({
  kind = "connection",
  attempt = 1,
  maxAttempts = 3,
  label,
  className,
}: {
  kind?: RecoveryKind
  attempt?: number
  maxAttempts?: number
  /** Replaces the words: "Saving again". */
  label?: string
  className?: string
}) {
  const words = label ?? retryingCopy(kind).title
  return (
    <span
      data-slot="recovery-status"
      role="status"
      className={cn(
        "inline-flex min-h-7 items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--info)_30%,transparent)] bg-info-bg px-3 text-2xs font-semibold text-info-text",
        className
      )}
    >
      <LoaderCircle aria-hidden="true" strokeWidth={2} className="size-3.5 animate-spin motion-reduce:animate-none" />
      <span>
        {words}
        <span className="font-medium text-ink-secondary">
          {" "}
          · Attempt {attempt} of {maxAttempts}
        </span>
      </span>
    </span>
  )
}

export type ErrorSummaryItem = {
  /** The id of the field's control: <Field id="email">. */
  id: string
  message: string
}

/**
 * The form-level summary for a failed submit (400, 422 or the form's own
 * checks): what to fix, each item a link to its field. It takes focus when
 * it appears, so keyboard and screen reader users start at the list. The
 * design system's .form-summary, with the tinted ground instead of a stripe.
 */
export function ErrorSummary({
  errors,
  title = RECOVERY_COPY.validation.title,
  message = RECOVERY_COPY.validation.message,
  focusOnShow = true,
  className,
}: {
  errors: ErrorSummaryItem[]
  title?: string
  message?: string
  focusOnShow?: boolean
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const key = errors.map((e) => `${e.id}:${e.message}`).join("|")

  useEffect(() => {
    if (focusOnShow && key) ref.current?.focus()
  }, [focusOnShow, key])

  if (!errors.length) return null
  return (
    <div
      ref={ref}
      data-slot="error-summary"
      tabIndex={-1}
      aria-labelledby={titleId}
      role="group"
      className={cn(
        "rounded-lg border border-[color-mix(in_srgb,var(--err)_35%,transparent)] bg-err-bg px-4 py-3",
        className
      )}
    >
      <p id={titleId} className="flex items-center gap-2 text-meta font-semibold text-err-text">
        <CircleAlert aria-hidden="true" strokeWidth={2} className="size-4 shrink-0" />
        {title}
      </p>
      <p className="mt-0.5 text-meta text-ink-secondary">{message}</p>
      <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-meta text-ink">
        {errors.map((e) => (
          <li key={e.id}>
            <a
              href={`#${e.id}`}
              onClick={(ev) => {
                const el = document.getElementById(e.id)
                if (!el) return
                ev.preventDefault()
                el.focus()
                el.scrollIntoView?.({ block: "center" })
              }}
              className="font-semibold text-err-text underline underline-offset-2"
            >
              {e.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * A decision the person has to make before going on: a conflict on save, an
 * action that may already have happened. Only when no inline state can hold
 * the choice; their work stays in the page behind it.
 */
export function RecoveryDialog({
  open,
  onOpenChange,
  kind,
  title,
  message,
  onAction,
  actionLabel,
  onSecondary,
  secondaryLabel,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  kind: RecoveryKind
  title?: string
  message?: string
  onAction: () => void
  actionLabel?: string
  onSecondary?: () => void
  secondaryLabel?: string
  children?: React.ReactNode
}) {
  const copy = RECOVERY_COPY[kind]
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={title ?? copy.title}
        description={message ?? copy.message}
        footer={
          <>
            {onSecondary ? <Button onClick={onSecondary}>{secondaryLabel ?? copy.secondary ?? "Cancel"}</Button> : null}
            <Button variant="brand" onClick={onAction}>
              {actionLabel ?? copy.action ?? "Try again"}
            </Button>
          </>
        }
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}
