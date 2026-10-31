"use client"

import { createContext, useContext, useEffect, useId, useRef } from "react"
import { cn } from "@/lib/utils"

// Label above, the control, then help or the error below (no placeholder as a
// label, ever). Knowledge's settings form: .set2-field > .set2-lbl, the
// control, .set2-hint / .set2-hint.is-err. The products never set
// aria-invalid or tie the message to the control; this does both.
type FieldContextValue = { id: string; describedBy: string | undefined; invalid: boolean; error: string | undefined }

const FieldContext = createContext<FieldContextValue | null>(null)

/** Inside a Field, gives a control its id, aria-describedby and aria-invalid. */
export function useField() {
  return useContext(FieldContext)
}

/**
 * Shakes the control once each time a new error message appears
 * (transitions.dev 12). Returns a ref for the element that should move.
 */
export function useShake<T extends HTMLElement>(error: string | undefined) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !error) return
    el.classList.remove("is-shaking")
    void el.offsetWidth // reflow, so the animation replays
    el.classList.add("is-shaking")
    const done = () => el.classList.remove("is-shaking")
    el.addEventListener("animationend", done, { once: true })
    return () => el.removeEventListener("animationend", done)
  }, [error])
  return ref
}

type FieldProps = {
  label: string
  /** Shown under the control while there is no error. */
  help?: string
  /** Shown under the control in the error ink; also marks the control invalid. */
  error?: string
  /** Adds "Optional" after the label. Required is the default and needs no mark. */
  optional?: boolean
  /** The control's id, so an ErrorSummary can link to it. Generated when left out. */
  id?: string
  className?: string
  children: React.ReactNode
}

export function Field({ label, help, error, optional, id: given, className, children }: FieldProps) {
  const auto = useId()
  const id = given ?? auto
  const helpId = `${id}-help`
  const errorId = `${id}-error`
  const describedBy = error ? errorId : help ? helpId : undefined
  return (
    <FieldContext.Provider value={{ id, describedBy, invalid: Boolean(error), error }}>
      <div data-slot="field" className={cn("flex flex-col gap-1.5", className)}>
        <label htmlFor={id} className="text-xs font-semibold text-ink-secondary">
          {label}
          {optional ? <span className="ml-1.5 font-medium text-ink-quiet">Optional</span> : null}
        </label>
        {children}
        {error ? (
          <p id={errorId} className="text-xs text-err-text">
            {error}
          </p>
        ) : help ? (
          <p id={helpId} className="text-xs text-ink-quiet">
            {help}
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  )
}

/** Shared look for text controls. box: Knowledge's .set2-fld. line: the underline both products use in forms. */
export const controlStyles = {
  base: [
    "t-input w-full min-w-0 font-sans text-base text-ink placeholder:text-ink-placeholder",
    "disabled:cursor-not-allowed disabled:opacity-[0.38]",
  ],
  box: [
    "rounded-md border border-edge bg-card px-3 py-1.5",
    "hover:not-disabled:border-edge-hover",
    "focus-visible:border-transparent focus-visible:outline-offset-[-1px]",
    "aria-invalid:border-err",
  ],
  line: [
    "rounded-none border-0 border-b border-edge-hover bg-transparent px-0 py-1.5",
    "focus-visible:border-brand focus-visible:outline-none",
    "aria-invalid:border-err",
  ],
} as const
