"use client"

import { SearchX, FileText } from "lucide-react"
import { useEffect, useId, useState } from "react"
import { Button } from "@/registry/aimy/ui/button"
import { EmptyState } from "@/registry/aimy/ui/empty-state"
import { Field } from "@/registry/aimy/ui/field"
import { Input } from "@/registry/aimy/ui/input"
import { ErrorSummary, RecoveryDialog, RecoveryState, RecoveryStatus } from "@/registry/aimy/ui/recovery"
import { toast } from "@/registry/aimy/ui/toast"
import { RECOVERY_COPY, type RecoveryKind } from "@/registry/aimy/lib/recovery-kinds"

const box = "rounded-xl border border-edge bg-card"

/** Automatic recovery, three attempts, then the exhausted state. */
export function RetryDemo() {
  const [attempt, setAttempt] = useState(1)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    if (failed) return
    const t = window.setTimeout(() => (attempt < 3 ? setAttempt(attempt + 1) : setFailed(true)), 1600)
    return () => window.clearTimeout(t)
  }, [attempt, failed])
  const again = () => {
    setFailed(false)
    setAttempt(1)
  }
  return (
    <RecoveryState
      kind="service"
      status={failed ? "failed" : "retrying"}
      attempt={attempt}
      onAction={again}
      onSecondary={() => toast("Opening support")}
      reference="7f3c-21ab-9e04"
    />
  )
}

/** The whole window: QA's sign-in gate. Reconnects three times, then asks to sign in. */
export function ScreenDemo() {
  const [attempt, setAttempt] = useState(1)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    if (failed) return
    const t = window.setTimeout(() => (attempt < 3 ? setAttempt(attempt + 1) : setFailed(true)), 1400)
    return () => window.clearTimeout(t)
  }, [attempt, failed])
  return (
    <RecoveryState
      kind="session"
      display="screen"
      status={failed ? "failed" : "retrying"}
      attempt={attempt}
      autoFocus={false}
      className="min-h-[30rem] rounded-xl border border-hairline"
      onAction={() => {
        setFailed(false)
        setAttempt(1)
      }}
      onSecondary={() => toast("Choose an account")}
    />
  )
}

/** A blocking page, framed for the docs. */
export function PageDemo({ kind = "session" }: { kind?: RecoveryKind }) {
  return (
    <div className={box}>
      <RecoveryState
        kind={kind}
        display="page"
        autoFocus={false}
        className="min-h-[22rem]"
        onAction={() => toast(RECOVERY_COPY[kind].action ?? "Done")}
        onSecondary={RECOVERY_COPY[kind].secondary ? () => toast(RECOVERY_COPY[kind].secondary ?? "") : undefined}
      />
    </div>
  )
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className={`${box} flex flex-col gap-1 p-4`}>
      <span className="text-2xs font-semibold text-ink-secondary">{label}</span>
      <span className="text-xl font-bold text-ink">{value}</span>
    </div>
  )
}

/** One widget failed, one is out of reach, the rest of the dashboard works. */
export function PartialDemo() {
  const [status, setStatus] = useState<"failed" | "retrying">("failed")
  return (
    <div className="grid gap-3 phone:grid-cols-2">
      <Tile label="Open deals" value="48" />
      <Tile label="Calls this week" value="126" />
      <div className={box}>
        <RecoveryState
          kind="load"
          display="widget"
          status={status}
          attempt={1}
          title="Couldn't load the pipeline"
          message="The other numbers are up to date."
          onAction={() => {
            setStatus("retrying")
            window.setTimeout(() => setStatus("failed"), 1800)
          }}
        />
      </div>
      <div className={box}>
        <RecoveryState
          kind="permission"
          display="widget"
          title="Revenue is for managers"
          message="Ask your administrator if you need it."
          onAction={() => toast("Checked again: still no access")}
        />
      </div>
    </div>
  )
}

export function BannerDemo() {
  return (
    <div className={`${box} flex flex-col overflow-hidden`}>
      <RecoveryState kind="offline" display="banner" onAction={() => toast("Still offline")} />
      <RecoveryState kind="maintenance" display="banner" backAt="by 14:00" />
      <RecoveryState kind="connection" display="banner" status="retrying" attempt={2} />
      <div className="flex flex-wrap items-center gap-3 p-4">
        <RecoveryStatus kind="session" attempt={2} />
        <RecoveryStatus kind="save" attempt={1} label="Saving again" />
      </div>
    </div>
  )
}

export function InlineDemo() {
  const [pending, setPending] = useState(false)
  const [wait, setWait] = useState(12)
  const [run, setRun] = useState(0)
  return (
    <div className="flex flex-col gap-3">
      <RecoveryState
        kind="save"
        display="inline"
        pending={pending}
        onAction={() => {
          setPending(true)
          window.setTimeout(() => setPending(false), 1500)
        }}
      />
      <RecoveryState
        key={run}
        kind="rate-limit"
        display="inline"
        retryAfter={wait}
        onAction={() => {
          setWait(12)
          setRun(run + 1)
        }}
      />
      <RecoveryState kind="uncertain" display="inline" onAction={() => toast("Opening the sent list")} />
      <RecoveryState
        kind="permission"
        display="inline"
        title="Only a manager can approve this"
        message="Nothing was applied and nothing was lost. Everything else still works."
        actionLabel="Send it to a manager"
        onAction={() => toast("Sent to Lina for approval")}
      />
      <RecoveryState kind="file-too-large" display="inline" message="Choose a file under 50 MB." onAction={() => toast("Choose a file")} />
    </div>
  )
}

export function ToastErrDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        onClick={() =>
          toast("We couldn't export the report", {
            tone: "err",
            sub: "Nothing changed. Trying again is safe.",
            action: { label: "Try again", onClick: () => toast("Exported the report") },
          })
        }
      >
        Export the report
      </Button>
      <Button onClick={() => toast("Exported the report", { sub: "It's in your downloads." })}>Compare: a confirmation</Button>
    </div>
  )
}

export function DialogDemo() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="brand" onClick={() => setOpen(true)}>
        Save changes
      </Button>
      <RecoveryDialog
        open={open}
        onOpenChange={setOpen}
        kind="conflict"
        onAction={() => {
          setOpen(false)
          toast("Showing the latest version beside yours")
        }}
        onSecondary={() => {
          setOpen(false)
          toast("Your changes are copied")
        }}
      >
        Lina changed the due date and the owner at 14:02, after you opened this.
      </RecoveryDialog>
    </>
  )
}

export function SummaryDemo() {
  // Unique per copy: the docs show this form twice, once per theme.
  const p = useId()
  const nameId = `${p}name`
  const emailId = `${p}email`
  const [name, setName] = useState("Engy")
  const [email, setEmail] = useState("engy@")
  const [errors, setErrors] = useState<{ id: string; message: string }[]>([])
  const err = (id: string) => errors.find((e) => e.id === id)?.message
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const next = []
    if (!name.trim()) next.push({ id: nameId, message: "Enter a name" })
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) next.push({ id: emailId, message: "Enter an email address like name@flairstech.com" })
    setErrors(next)
    if (!next.length) toast("Invited Engy")
  }
  return (
    <form onSubmit={submit} noValidate className="flex max-w-[26rem] flex-col gap-4">
      <ErrorSummary errors={errors} />
      <Field id={nameId} label="Name" error={err(nameId)}>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field id={emailId} label="Email" error={err(emailId)}>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <div>
        <Button type="submit" variant="brand">
          Send the invite
        </Button>
      </div>
    </form>
  )
}

/** The four that must never be mistaken for each other. */
export function EmptyVsErrorDemo() {
  return (
    <div className="grid gap-4 column:grid-cols-2">
      <EmptyState
        icon={<SearchX />}
        title="No results match your filters"
        description="134 contacts, none of them matching all of these filters."
        actions={<Button size="sm">Clear filters</Button>}
      />
      <EmptyState
        icon={<FileText />}
        title="There's no data here yet"
        description="The first evaluation will appear here when AiMY scores a call."
      />
      <RecoveryState
        kind="load"
        announce={false}
        title="We couldn't load the results"
        message="Your filters are kept. Nothing changed, so trying again is safe."
        onAction={() => toast("Trying again")}
      />
      <RecoveryState kind="permission" announce={false} onAction={() => toast("Checked again")} onSecondary={() => toast("Going home")} />
    </div>
  )
}

const KINDS = Object.keys(RECOVERY_COPY) as RecoveryKind[]

/** Every kind, as a widget, with its default words. */
export function KindsDemo() {
  return (
    <div className="grid gap-3 phone:grid-cols-2 min-[80rem]:grid-cols-3">
      {KINDS.map((k) => (
        <div key={k} className={`${box} flex flex-col`}>
          <p className="border-b border-hairline px-4 py-2 font-mono text-2xs text-ink-secondary">kind=&quot;{k}&quot;</p>
          <RecoveryState
            kind={k}
            display="widget"
            announce={false}
            onAction={RECOVERY_COPY[k].action ? () => toast(RECOVERY_COPY[k].action ?? "") : undefined}
          />
        </div>
      ))}
    </div>
  )
}
