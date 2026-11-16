// Feedback, confirmation and optimistic UI: what a person sees between
// pressing and done. AiMY's ladder (doctrine §3.1) is: act at once and say
// so with Undo; a typed confirmation only for what can't be taken back;
// never a plain "Are you sure?". These behaviours make the first rung the
// easy one:
// - createActionState: idle → pending → success or error for one action,
//   with no flicker (pending shows only if the action is slow, and then for
//   long enough to read) and a success that holds a moment, then clears.
// - createOptimistic: a value that changes the moment the person acts, saves
//   in the background, and goes back (saying why, with Try again) if the
//   save fails. Later saves win; a slow earlier answer can't undo a newer one.

import { createStore, tokenMs } from "./behaviors-core"
import { RECOVERY_COPY, classifyError } from "./recovery-kinds"

export type ActionStatus = "idle" | "pending" | "success" | "error"

/** A sentence for a failure: the error's own message when it was written for people, else AiMY's copy for its kind. */
export function failureMessage(error: unknown, options: { save?: boolean } = {}): string {
  if (error instanceof Error && error.name === "UserFacingError") return error.message
  const kind = classifyError(error, { save: options.save, sideEffect: true }).kind
  const copy = RECOVERY_COPY[kind]
  return copy.message || copy.title
}

/** An error whose message is already written for the person: shown as it is. */
export class UserFacingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "UserFacingError"
  }
}

export type ActionStateOptions = {
  /** Show pending only if the action takes longer than this. Default --duration-quick (150ms). */
  pendingDelay?: number
  /** Once shown, pending stays at least this long, so it can be read. Default --duration-slow (400ms). */
  minPending?: number
  /** How long success shows before going quiet. Default 1600ms. */
  successHold?: number
}

/** The feedback states of one action, timed so nothing flickers. */
export function createActionState(options: ActionStateOptions = {}) {
  const store = createStore<{ status: ActionStatus; error: string | null }>({ status: "idle", error: null })
  let token = 0
  const timers: ReturnType<typeof setTimeout>[] = []
  const later = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms))
  const clear = () => {
    while (timers.length) clearTimeout(timers.pop())
  }

  return {
    ...store,
    /** Runs the action with feedback. Resolves true when it worked. */
    async run(action: () => unknown | Promise<unknown>, opts: { save?: boolean } = {}): Promise<boolean> {
      const mine = ++token
      clear()
      store.set({ error: null })
      const delay = options.pendingDelay ?? tokenMs("--duration-quick", 150)
      const min = options.minPending ?? tokenMs("--duration-slow", 400)
      let shownAt = 0
      later(() => {
        if (mine !== token) return
        shownAt = performance.now()
        store.set({ status: "pending" })
      }, delay)
      const settle = async () => {
        if (!shownAt) return
        const left = min - (performance.now() - shownAt)
        if (left > 0) await new Promise((r) => setTimeout(r, left))
      }
      try {
        await action()
        await settle()
        if (mine !== token) return true
        clear()
        store.set({ status: "success", error: null })
        later(() => mine === token && store.set({ status: "idle" }), options.successHold ?? 1600)
        return true
      } catch (e) {
        await settle()
        if (mine !== token) return false
        clear()
        store.set({ status: "error", error: failureMessage(e, opts) })
        return false
      }
    },
    reset() {
      token++
      clear()
      store.set({ status: "idle", error: null })
    },
    destroy: clear,
  }
}

export type OptimisticStatus = "idle" | "saving" | "saved" | "failed"

export type OptimisticOptions<T> = {
  value: T
  /** Saves a value. Reject (throw) when it didn't save. */
  save: (value: T) => Promise<unknown>
  /** Told when a save failed and the value went back; retry tries the same value again. */
  onError?: (message: string, retry: () => void, attempted: T) => void
  /** Told when a save landed. */
  onSaved?: (value: T) => void
  equal?: (a: T, b: T) => boolean
}

/**
 * A value that changes at once and saves behind. shown is what the person
 * sees; confirmed is what the server has. Each set saves; only the newest
 * save's answer counts.
 */
export function createOptimistic<T>(options: OptimisticOptions<T>) {
  let o = options
  const equal = o.equal ?? Object.is
  const store = createStore<{ shown: T; confirmed: T; status: OptimisticStatus; error: string | null }>({
    shown: o.value,
    confirmed: o.value,
    status: "idle",
    error: null,
  })
  let token = 0
  let quiet: ReturnType<typeof setTimeout> | undefined

  const api = {
    ...store,
    setOptions(next: Partial<OptimisticOptions<T>>) {
      o = { ...o, ...next }
    },
    /** The server's value changed (a refetch, another person): take it unless a save is in flight. */
    sync(value: T) {
      const s = store.get()
      if (s.status === "saving" || equal(value, s.confirmed)) return
      store.set({ shown: value, confirmed: value })
    },
    set(next: T) {
      const mine = ++token
      clearTimeout(quiet)
      store.set({ shown: next, status: "saving", error: null })
      o.save(next).then(
        () => {
          if (mine !== token) return
          store.set({ confirmed: next, status: "saved" })
          o.onSaved?.(next)
          quiet = setTimeout(() => mine === token && store.set({ status: "idle" }), 1600)
        },
        (e: unknown) => {
          if (mine !== token) return
          const message = failureMessage(e, { save: true })
          store.set({ shown: store.get().confirmed, status: "failed", error: message })
          o.onError?.(message, () => api.set(next), next)
        }
      )
    },
    destroy: () => clearTimeout(quiet),
  }
  return api
}
