"use client"

import { FileText, SearchX } from "lucide-react"
import { useState } from "react"
import { Button } from "@/registry/aimy/ui/button"
import { Dialog, DialogClose, DialogContent, DialogTrigger, TypeToConfirm } from "@/registry/aimy/ui/dialog"
import { EmptyState, ErrorState } from "@/registry/aimy/ui/empty-state"
import { Field } from "@/registry/aimy/ui/field"
import { Input } from "@/registry/aimy/ui/input"
import { Notice } from "@/registry/aimy/ui/notice"
import { Progress } from "@/registry/aimy/ui/progress"
import { Sheet, SheetContent, SheetTrigger } from "@/registry/aimy/ui/sheet"
import { Reveal, SkeletonCard } from "@/registry/aimy/ui/skeleton"
import { Switch } from "@/registry/aimy/ui/switch"
import { toast } from "@/registry/aimy/ui/toast"

export function ToastDemo() {
  const [owner, setOwner] = useState("Engy")
  return (
    <div className="flex flex-col gap-3">
      <p className="text-meta text-ink-secondary">
        Kestrel Logistics belongs to <span className="font-semibold text-ink">{owner}</span>.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="brand"
          onClick={() => {
            const was = owner
            setOwner("Lina")
            toast("Assigned to Lina", { onUndo: () => setOwner(was) })
          }}
        >
          Assign to Lina
        </Button>
        <Button onClick={() => toast("Link copied")}>Copy the link</Button>
        <Button onClick={() => toast("Looking for Dana's address", { sub: "It takes a few seconds." })}>Find the address</Button>
      </div>
    </div>
  )
}

export function DialogDemo() {
  const [confirm, setConfirm] = useState(false)
  return (
    <div className="flex flex-wrap gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button>Add a person</Button>
        </DialogTrigger>
        <DialogContent
          title="Add a person"
          description="They can see every contact in this workspace."
          footer={
            <>
              <DialogClose asChild>
                <Button>Cancel</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button variant="brand" onClick={() => toast("Lina Farouk added")}>
                  Add Lina
                </Button>
              </DialogClose>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <Field label="Name">
              <Input defaultValue="Lina Farouk" />
            </Field>
            <Field label="Email" help="We send the invitation here.">
              <Input type="email" defaultValue="lina@flairstech.com" />
            </Field>
          </div>
        </DialogContent>
      </Dialog>
      <Button variant="err" onClick={() => setConfirm(true)}>
        Delete 1,284 records
      </Button>
      <TypeToConfirm
        open={confirm}
        onOpenChange={setConfirm}
        title="Delete 1,284 records"
        description="They leave every list and report. This can't be undone."
        word="1,284"
        actionLabel="Delete 1,284 records"
        onConfirm={() => toast("1,284 records deleted", { sub: "Logged to the audit trail." })}
      >
        <Notice tone="err" title="What else this affects">
          3 campaigns lose their audience. 12 scheduled calls are cancelled.
        </Notice>
      </TypeToConfirm>
    </div>
  )
}

export function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Open notification settings</Button>
      </SheetTrigger>
      <SheetContent title="Notifications" description="Choose what AiMY tells you about.">
        <div className="flex flex-col gap-4">
          <Switch label="Email me the daily summary" defaultChecked />
          <Switch label="Tell me when a draft is ready" defaultChecked />
          <Switch label="Weekly report on Mondays" />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function NoticeDemo() {
  return (
    <div className="flex flex-col gap-3">
      <Notice tone="info" title="A newer version replaces this one" action={<Button size="sm">Open it</Button>}>
        Pricing policy, updated 12 October.
      </Notice>
      <Notice tone="warn">This document expires in 5 days. Its owner has been told.</Notice>
      <Notice tone="err" title="The last sync failed." action={<Button size="sm">Try again</Button>}>
        Nothing was changed. Salesforce didn&apos;t answer.
      </Notice>
      <Notice tone="ok">Saved. It applies on the next sync.</Notice>
      <Notice>Only admins can change who sees this.</Notice>
    </div>
  )
}

export function StatesDemo() {
  return (
    <div className="grid gap-4 column:grid-cols-2">
      <EmptyState
        icon={<SearchX />}
        title="No matches"
        description="134 contacts, none of them matching all of these filters."
        actions={<Button size="sm">Clear filters</Button>}
      />
      <EmptyState
        icon={<FileText />}
        title="Nothing here yet"
        description="Add the first document and AiMY starts reading it."
        actions={
          <>
            <Button variant="brand" size="sm">
              New document
            </Button>
            <Button size="sm">Choose a file</Button>
          </>
        }
        fine="PDF, Word or text, up to 50 MB"
      />
      <ErrorState onRetry={() => toast("Trying again")} className="column:col-span-2" />
    </div>
  )
}

export function SkeletonDemo() {
  const [loading, setLoading] = useState(true)
  return (
    <div className="flex flex-col gap-4">
      <Button onClick={() => setLoading((v) => !v)} className="self-start">
        {loading ? "Finish loading" : "Load again"}
      </Button>
      <Reveal loading={loading} label="Loading contacts" skeleton={<SkeletonCard />}>
        <div className="flex min-h-[8.25rem] flex-col gap-1 rounded-xl border border-edge bg-card px-4 py-3">
          <p className="text-title font-bold text-ink">Kestrel Logistics</p>
          <p className="text-meta text-ink-secondary">Dana Whitfield, head of operations</p>
        </div>
      </Reveal>
    </div>
  )
}

export function ProgressDemo() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <p className="text-meta text-ink-secondary">Importing contacts: 640 of 1,284</p>
        <Progress value={640} max={1284} label="Contacts imported" />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-meta text-ink-secondary">1,200 of 2,000 credits used</p>
        <Progress value={1200} max={2000} size="meter" limit label="Credits used" />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-meta text-ink-secondary">1,700 of 2,000 credits used</p>
        <Progress value={1700} max={2000} size="meter" limit label="Credits used" />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-meta text-ink-secondary">1,960 of 2,000 credits used</p>
        <Progress value={1960} max={2000} size="large" limit label="Credits used" />
      </div>
    </div>
  )
}
