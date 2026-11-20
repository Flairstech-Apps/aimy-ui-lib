"use client"

import { Calendar } from "@/registry/aimy/ui/calendar"
import { Chip } from "@/registry/aimy/ui/chip"
import { Field } from "@/registry/aimy/ui/field"
import { Input } from "@/registry/aimy/ui/input"
import { Progress } from "@/registry/aimy/ui/progress"
import { Segmented } from "@/registry/aimy/ui/segmented"
import { Switch } from "@/registry/aimy/ui/switch"
import { Tab, TabPanel, Tabs, TabsList } from "@/registry/aimy/ui/tabs"
import { Tree } from "@/registry/aimy/ui/tree"

// The same parts, once left to right and once right to left (Arabic), side by side. Only the page's
// dir changes; nothing in the parts is told.

const FILES = [
  { id: "a", label: "الحسابات", children: [{ id: "a1", label: "كيسترل للخدمات اللوجستية" }, { id: "a2", label: "هاربور فودز" }] },
  { id: "b", label: "الفواتير" },
]
const FILES_EN = [
  { id: "a", label: "Accounts", children: [{ id: "a1", label: "Kestrel Logistics" }, { id: "a2", label: "Harbour Foods" }] },
  { id: "b", label: "Billing" },
]

function Side({ rtl }: { rtl: boolean }) {
  const t = rtl
    ? { tabs: ["نظرة عامة", "المكالمات", "الملاحظات"], show: "عرض", all: "الكل", mine: "لي", email: "البريد الإلكتروني", hint: "سنرسل الدعوة إليه.", notify: "أخبرني عند الرد", chip: "مُرسل", tree: "الملفات", done: "مكتمل" }
    : { tabs: ["Overview", "Calls", "Notes"], show: "Show", all: "All", mine: "Mine", email: "Email", hint: "We'll send the invite here.", notify: "Tell me when they reply", chip: "Sent", tree: "Files", done: "Done" }
  return (
    <div dir={rtl ? "rtl" : "ltr"} lang={rtl ? "ar" : "en"} className="flex flex-col gap-5 rounded-xl border border-edge bg-body p-5 text-ink">
      <p className="text-2xs font-semibold text-ink-secondary">{rtl ? 'Right to left: dir="rtl"' : "Left to right"}</p>
      <Tabs defaultValue="0" size="section">
        <TabsList>
          {t.tabs.map((label, i) => (
            <Tab key={label} value={String(i)} count={i === 1 ? 12 : undefined}>
              {label}
            </Tab>
          ))}
        </TabsList>
        <TabPanel value="0" className="sr-only">
          {t.tabs[0]}
        </TabPanel>
      </Tabs>
      <Segmented label={t.show} options={[{ value: "all", label: t.all }, { value: "mine", label: t.mine }]} />
      <Field label={t.email} help={t.hint}>
        <Input placeholder="name@company.com" />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <Switch label={t.notify} defaultChecked />
        <Chip onRemove={() => {}} removeLabel={t.chip}>
          {t.chip}
        </Chip>
      </div>
      <Progress value={62} label={t.done} size="meter" />
      <Tree label={t.tree} items={rtl ? FILES : FILES_EN} defaultExpanded={["a"]} />
      <Calendar disableFuture={false} />
    </div>
  )
}

export function DirectionDemo() {
  return (
    <div className="grid gap-4 column:grid-cols-2">
      <Side rtl={false} />
      <Side rtl />
    </div>
  )
}
