// What went wrong, in the words a person reads, and how to tell from the
// error itself. AIMY-2979: engineering classifies the runtime error once,
// with classifyError, and the screen shows the matching RecoveryState. The
// codes below are inputs only; they never appear as the message.
//
//   const r = classifyError(err, { sideEffect: true })
//   <RecoveryState kind={r.kind} reference={r.reference} retryAfter={r.retryAfter} onAction={retry} />

export type RecoveryKind =
  | "session"
  | "permission"
  | "workspace"
  | "workspace-removed"
  | "offline"
  | "connection"
  | "timeout"
  | "uncertain"
  | "service"
  | "maintenance"
  | "rate-limit"
  | "missing"
  | "deleted"
  | "expired"
  | "validation"
  | "save"
  | "upload"
  | "file-too-large"
  | "file-type"
  | "conflict"
  | "load"
  | "action"

/** How the state reads: a failure, a warning, a question of access, or news. */
export type RecoveryTone = "err" | "warn" | "access" | "info"

export type RecoveryCopy = {
  title: string
  message: string
  /** The recovery the main button performs. Never "OK". */
  action?: string
  /** A second way out, when there is one. */
  secondary?: string
  tone: RecoveryTone
}

// The ticket's words, in AiMY's voice: no "Please", no "Oops", say what is
// safe. Override any of them per screen; keep the action a verb.
export const RECOVERY_COPY: Record<RecoveryKind, RecoveryCopy> = {
  session: {
    title: "Let's get you signed in again",
    message: "We couldn't reconnect to your session automatically. Sign in again to continue.",
    action: "Sign in again",
    secondary: "Sign in with another account",
    tone: "access",
  },
  permission: {
    title: "You don't have access to this yet",
    message: "Ask your administrator to check your permissions. If your access was updated recently, check again.",
    action: "Check access again",
    secondary: "Go to home",
    tone: "access",
  },
  workspace: {
    title: "Your account isn't connected to a workspace",
    message: "Ask your administrator to give you workspace access, or sign in with another account.",
    action: "Sign in with another account",
    tone: "access",
  },
  "workspace-removed": {
    title: "This workspace isn't available any more",
    message: "It was removed, or your access to it changed. Ask your administrator, or sign in with another account.",
    action: "Sign in with another account",
    tone: "access",
  },
  offline: {
    title: "You appear to be offline",
    message: "Reconnect to the internet and, if your organization requires it, connect to your VPN. Then try again.",
    action: "Try again",
    tone: "warn",
  },
  connection: {
    title: "We're having trouble connecting",
    message:
      "Check your internet connection and, if your organization requires it, your VPN. If your connection is working, the service may be down for a moment.",
    action: "Try again",
    tone: "err",
  },
  timeout: {
    title: "This is taking longer than expected",
    message: "The request timed out. Check your connection and try again.",
    action: "Try again",
    tone: "err",
  },
  uncertain: {
    title: "We're not sure that went through",
    message: "We stopped hearing back before it finished, so it may have worked. Check before you try again, so it doesn't happen twice.",
    action: "Check what happened",
    tone: "warn",
  },
  service: {
    title: "Something went wrong on our side",
    message: "We couldn't complete your request. Try again in a moment.",
    action: "Try again",
    secondary: "Contact support",
    tone: "err",
  },
  maintenance: {
    title: "We're doing planned maintenance",
    message: "This part of AiMY is down while we work on it. Everything you saved is safe.",
    action: "Check again",
    tone: "info",
  },
  "rate-limit": {
    title: "Too many requests",
    message: "Wait a moment before trying again.",
    action: "Try again",
    tone: "warn",
  },
  missing: {
    title: "We couldn't find this item",
    message: "It may have been deleted or moved, or the link may be wrong.",
    action: "Go back",
    secondary: "Go to home",
    tone: "access",
  },
  deleted: {
    title: "This item was deleted",
    message: "Someone deleted it, so it can't be opened any more.",
    action: "Go back",
    secondary: "Go to home",
    tone: "access",
  },
  expired: {
    title: "This link has expired",
    message: "Links like this stop working after a while. Ask whoever sent it for a new one.",
    action: "Go to home",
    tone: "access",
  },
  validation: {
    title: "Check the highlighted fields",
    message: "Correct the information below and try again.",
    tone: "err",
  },
  save: {
    title: "We couldn't save your changes",
    message: "Your changes are still here. Check your connection and try again.",
    action: "Try saving again",
    tone: "err",
  },
  upload: {
    title: "The upload was interrupted",
    message: "The file didn't finish uploading. Nothing else changed, so trying again is safe.",
    action: "Try again",
    tone: "err",
  },
  "file-too-large": {
    title: "This file is too large",
    message: "Choose a smaller file and try again.",
    action: "Choose another file",
    tone: "warn",
  },
  "file-type": {
    title: "This file type isn't supported",
    message: "Choose a different kind of file and try again.",
    action: "Choose another file",
    tone: "warn",
  },
  conflict: {
    title: "This item was updated by someone else",
    message: "Your changes aren't saved yet. Review the latest version before you save them.",
    action: "Review latest version",
    secondary: "Copy my changes",
    tone: "warn",
  },
  load: {
    title: "Couldn't load this",
    message: "Nothing changed. Trying again is safe.",
    action: "Try again",
    tone: "err",
  },
  action: {
    title: "That didn't go through",
    message: "Nothing was changed. Trying again is safe.",
    action: "Try again",
    tone: "err",
  },
}

/** What a retry looks like while it runs, before recovery is exhausted. */
export function retryingCopy(kind: RecoveryKind): { title: string; message: string } {
  if (kind === "session") return { title: "Reconnecting your session", message: "We're refreshing your sign-in." }
  if (kind === "offline" || kind === "connection") return { title: "Reconnecting", message: "We're trying to reach AiMY again." }
  if (kind === "save") return { title: "Saving again", message: "Your changes are still here." }
  return { title: "Trying again", message: "This can take a moment." }
}

export type ClassifiedError = {
  kind: RecoveryKind
  /** HTTP status, when there was a response. For logs, never for the screen. */
  status?: number
  /** Seconds before a retry is allowed, from Retry-After. */
  retryAfter?: number
  /** A correlation or request ID to show as a support reference. */
  reference?: string
}

type ClassifyOptions = {
  /**
   * The request creates, updates, deletes, sends or pays. A timeout or a lost
   * connection then means "uncertain", not "try again", so nothing happens twice.
   */
  sideEffect?: boolean
  /** The request was a file upload: 413, 415 and a dropped connection get file words. */
  upload?: boolean
  /** The request was a save: a dropped connection or a server error says "save". */
  save?: boolean
}

const CODES: [RegExp, RecoveryKind][] = [
  [/^(invalid_token|token_expired|invalid_grant|login_required|interaction_required|unauthori[sz]ed)$/i, "session"],
  [/^(access_denied|insufficient_permissions|role_required|forbidden)$/i, "permission"],
  [/^(no_workspace|workspace_required)$/i, "workspace"],
  [/^(workspace_not_found|workspace_removed)$/i, "workspace-removed"],
  [/^rate_limit(_exceeded)?$/i, "rate-limit"],
  [/^(resource_not_found|not_found)$/i, "missing"],
  [/^(resource_deleted|deleted)$/i, "deleted"],
  [/^(link_expired|expired)$/i, "expired"],
  [/^(validation_failed|invalid_request)$/i, "validation"],
  [/^(concurrency_conflict|version_mismatch|etag_mismatch|conflict)$/i, "conflict"],
  [/^maintenance$/i, "maintenance"],
  [/^(service_unavailable|dependency_unavailable|internal_error)$/i, "service"],
]

const BY_STATUS: Record<number, RecoveryKind> = {
  400: "validation",
  401: "session",
  403: "permission",
  404: "missing",
  408: "timeout",
  409: "conflict",
  410: "expired",
  412: "conflict",
  413: "file-too-large",
  415: "file-type",
  422: "validation",
  429: "rate-limit",
  500: "service",
  502: "service",
  503: "service",
  504: "timeout",
}

type Loose = Record<string, unknown>
const obj = (v: unknown): Loose | undefined => (v && typeof v === "object" ? (v as Loose) : undefined)
const str = (v: unknown) => (typeof v === "string" && v ? v : undefined)

function header(headers: unknown, name: string): string | undefined {
  if (!headers) return undefined
  const h = headers as { get?: (n: string) => string | null } & Loose
  if (typeof h.get === "function") return h.get(name) ?? undefined
  const key = Object.keys(h).find((k) => k.toLowerCase() === name)
  return key ? str(h[key]) : undefined
}

function seconds(value: string | undefined): number | undefined {
  if (!value) return undefined
  const n = Number(value)
  if (Number.isFinite(n)) return Math.max(0, Math.ceil(n))
  const at = Date.parse(value)
  return Number.isNaN(at) ? undefined : Math.max(0, Math.ceil((at - Date.now()) / 1000))
}

/**
 * Turns whatever was thrown or returned into a RecoveryKind: an Axios error,
 * a fetch Response, a failed fetch's TypeError, an OIDC error, or a status
 * number. Offline is said only when the browser confirms it.
 */
export function classifyError(error: unknown, options: ClassifyOptions = {}): ClassifiedError {
  const e = obj(error)
  const response = obj(e?.response) ?? (typeof e?.status === "number" && "headers" in (e ?? {}) ? e : undefined)
  const status = typeof error === "number" ? error : typeof response?.status === "number" ? response.status : undefined
  const headers = response?.headers
  const body = obj(response?.data)
  const reference =
    header(headers, "x-correlation-id") ?? header(headers, "x-request-id") ?? str(body?.correlationId) ?? str(body?.traceId)
  const retryAfter = seconds(header(headers, "retry-after"))
  const done = (kind: RecoveryKind): ClassifiedError => ({ kind, status, retryAfter, reference })

  // A word from the server or the identity provider is more exact than a status.
  const code = str(body?.error) ?? str(body?.code) ?? (status === undefined ? str(e?.error) : undefined)
  const named = code ? CODES.find(([re]) => re.test(code))?.[1] : undefined

  const offline = typeof navigator !== "undefined" && navigator.onLine === false
  const netCode = str(e?.code)
  const timedOut = netCode === "ECONNABORTED" || netCode === "ETIMEDOUT" || status === 408 || status === 504
  const noResponse =
    status === undefined &&
    (netCode === "ERR_NETWORK" || (error instanceof TypeError && /fetch|network/i.test(error.message)) || offline)

  // Offline first: the request never left, so nothing can have happened twice.
  if (offline) return done("offline")
  if (options.sideEffect && (timedOut || noResponse)) return done("uncertain")
  if (noResponse) return done(options.upload ? "upload" : options.save ? "save" : "connection")
  if (timedOut) return done("timeout")
  if (named) return done(named)
  if (status === 503 && /maint/i.test(str(body?.reason) ?? str(body?.message) ?? "")) return done("maintenance")
  if (status !== undefined && BY_STATUS[status]) {
    const kind = BY_STATUS[status]
    if (options.save && kind === "service") return done("save")
    return done(kind)
  }
  if (status !== undefined && status >= 500) return done(options.save ? "save" : "service")
  return done(options.save ? "save" : "action")
}
