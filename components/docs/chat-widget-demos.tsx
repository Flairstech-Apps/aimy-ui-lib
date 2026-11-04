"use client"

import { Briefcase, Table2, Upload, Users } from "lucide-react"
import { useState } from "react"
import { AimyAvatar } from "@/registry/aimy/ui/avatar"
import { Button } from "@/registry/aimy/ui/button"
import { CandidateCards, type Candidate } from "@/registry/aimy/ui/candidate-card"
import { CandidateProfile } from "@/registry/aimy/ui/candidate-profile"
import { ChatTable, wrapCell } from "@/registry/aimy/ui/chat-table"
import { RankedList, type RankedItem } from "@/registry/aimy/ui/ranked-list"
import { Score } from "@/registry/aimy/ui/score"
import { toast } from "@/registry/aimy/ui/toast"
import { UploadResults, type UploadItem } from "@/registry/aimy/ui/upload-results"
import { WidgetFrame } from "@/registry/aimy/ui/widget-frame"

// Demos for the chat widgets. The people are made up: these pages are
// public. The production examples live in the local lab.

const canvas = () => toast("Opens in the canvas")
const download = () => toast("Downloaded")

/** An AiMY turn at chat width: the mark, a sentence, then the widget. */
function Turn({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <AimyAvatar size="md" />
      <div className="flex min-w-0 flex-1 flex-col gap-3 pt-1">
        <p className="text-body text-ink">{text}</p>
        {children}
      </div>
    </div>
  )
}

const PEOPLE: Candidate[] = [
  {
    id: "c1",
    name: "Youssef Hamdy",
    role: "Technical Support Specialist",
    company: "Teleperformance",
    location: "Giza, Egypt",
    match: 82,
    skills: ["Technical support", "Ticketing", "Windows", "Networking", "SLA handling"],
  },
  {
    id: "c2",
    name: "Mariam Adel Fouad",
    role: "Customer Technical Support",
    company: "Concentrix",
    location: "Sheikh Zayed, Giza",
    match: 76,
    skills: ["Microsoft 365", "Exchange", "Incident handling"],
  },
  {
    id: "c3",
    name: "Karim Ashraf",
    role: "IT Support",
    company: "Teleperformance",
    location: "New Cairo",
    match: 64,
    skills: ["Hardware", "MS Office", "Customer relations"],
  },
  {
    id: "c4",
    name: "Salma Ragab",
    role: "Customer Support Specialist",
    company: "Concentrix",
    location: "Cairo, Egypt",
    match: 51,
    skills: ["Customer relations", "CRM", "Chat support", "Arabic and English"],
  },
]

export function FrameDemo() {
  return (
    <Turn text="Here are the closest matches for the IT support role.">
      <WidgetFrame
        icon={<Users />}
        title="Recommended candidates"
        meta="Best match first"
        onOpen={canvas}
        onDownload={download}
        more={{ label: "Show all candidates", onClick: canvas }}
      >
        <p className="px-1 py-8 text-center text-meta text-ink-secondary">The result goes here.</p>
      </WidgetFrame>
    </Turn>
  )
}

export function CandidateCardsDemo() {
  return (
    <Turn text="Here are the closest matches for the IT support role.">
      <WidgetFrame
        icon={<Users />}
        title="Recommended candidates"
        meta="Best match first"
        onOpen={canvas}
        onDownload={download}
        more={{ label: "Show all candidates", onClick: canvas }}
      >
        <CandidateCards
          candidates={PEOPLE}
          onView={(c) => toast(`Opening ${c.name}`)}
          onEmail={(c) => toast(`Drafting an email to ${c.name}`)}
          onOutreach={() => toast("Opens the outreach campaign")}
        />
      </WidgetFrame>
    </Turn>
  )
}

export function ProfileDemo() {
  return (
    <Turn text="Here is Karim's profile.">
      <WidgetFrame icon={<Briefcase />} title="Candidate profile" meta="Teleperformance" onOpen={canvas} onDownload={download}>
        <CandidateProfile
          name="Karim Ashraf"
          role="IT Support"
          company="Teleperformance"
          location="New Cairo"
          level="Junior"
          email="karim.ashraf@example.com"
          phone="+20 100 000 0000"
          match={64}
          about="IT support specialist with four years across help desks and call centres. Works in Windows, Microsoft 365 and common ticketing tools, and explains fixes in plain language in Arabic, English and German. Moved from hospitality into IT in 2016 and has stayed in customer-facing support since."
          experience={[
            { title: "IT Support", company: "Teleperformance", period: "Jan 2022 to now", place: "New Cairo" },
            { title: "IT Support", company: "Domatech", period: "Jan 2016 to Dec 2019", place: "Chur, Switzerland", description: "First-line support for 300 staff across two sites." },
            { title: "Front desk", company: "Hotel Bellevue", period: "Mar 2015 to Dec 2015", place: "Lugano, Switzerland" },
          ]}
          skills={["Hardware", "MS Office", "Customer relations", "Windows", "Ticketing", "German"]}
          onOutreach={() => toast("Opens the outreach campaign")}
          onDownloadCv={() => toast("Downloading the CV")}
          onAddNote={() => toast("Add a note")}
        />
      </WidgetFrame>
    </Turn>
  )
}

const ROLES: RankedItem[] = [
  { id: "r1", title: "PHP Developer", details: "Cairo / Alexandria, 2 years needed", reason: "Same title, and three years of PHP and Laravel against the two asked for.", match: 95 },
  { id: "r2", title: "Senior WordPress / PHP Developer", details: "Cairo / Alexandria, 5 years needed", reason: "Fourteen WordPress sites with custom plugins; two years short of the five asked for.", match: 92 },
  { id: "r3", title: "Senior Full Stack Developer", details: "Cairo / Alexandria, 4 years needed", reason: "Strong on the back end; the front end is jQuery, where the role asks for React.", match: 75 },
  { id: "r4", title: "Full Stack Developer", details: "Cairo / Alexandria, 1 year needed", reason: "Meets the experience easily, but the stack is Node and the CV has one small Node project.", match: 72 },
]

export function RankedListDemo() {
  return (
    <Turn text="Omar Nabil matches four open positions. PHP Developer is the strongest.">
      <WidgetFrame icon={<Briefcase />} title="Matched positions for Omar Nabil" meta="Best match first" onOpen={canvas} onDownload={download} flush>
        <RankedList label="Matched positions" items={ROLES} onOpen={(r) => toast(`Opening ${r.title}`)} />
      </WidgetFrame>
    </Turn>
  )
}

type Row = { id: string; title: string; match: number; location: string; years: number; why: string }
const ROWS: Row[] = ROLES.map((r) => ({
  id: r.id,
  title: r.title,
  match: r.match ?? 0,
  location: "Cairo / Alexandria",
  years: Number(r.details?.match(/(\d+) year/)?.[1] ?? 0),
  why: r.reason ?? "",
}))

export function ChatTableDemo() {
  const [loading, setLoading] = useState(false)
  return (
    <div className="flex flex-col gap-3">
      <Turn text="Omar Nabil matches four open positions.">
        <WidgetFrame
          icon={<Table2 />}
          title="Matched positions for Omar Nabil"
          meta={loading ? "Loading the data" : `${ROWS.length} rows, from the matching tool`}
          onOpen={canvas}
          onDownload={download}
          flush
        >
          <ChatTable<Row>
            loading={loading}
            label="Matched positions"
            rows={ROWS}
            rowKey={(r) => r.id}
            columns={[
              { key: "title", header: "Position", cell: (r) => wrapCell(<b className="font-semibold">{r.title}</b>, "7rem"), sort: (a, b) => a.title.localeCompare(b.title) },
              { key: "match", header: "Match", cell: (r) => <Score value={r.match} label="Fit" />, sort: (a, b) => a.match - b.match },
              { key: "location", header: "Location", cell: (r) => wrapCell(r.location, "5rem") },
              { key: "years", header: "Exp. needed", end: true, cell: (r) => `${r.years} ${r.years === 1 ? "year" : "years"}`, sort: (a, b) => a.years - b.years },
              { key: "why", header: "Reasoning", cell: (r) => wrapCell(r.why) },
            ]}
          />
        </WidgetFrame>
      </Turn>
      <div className="pl-11">
        <Button
          size="sm"
          onClick={() => {
            setLoading(true)
            window.setTimeout(() => setLoading(false), 1600)
          }}
        >
          Show it loading
        </Button>
      </div>
    </div>
  )
}

const FILES: UploadItem[] = [
  { id: "u1", name: "CV_final_v2.pdf", file: "CV_final_v2.pdf", status: "failed", message: "The PDF is a scan with no text. Upload a text PDF or a Word file." },
  { id: "u2", name: "Dina Emad", file: "20260329_DinaEmadCV.pdf", status: "warnings", message: "No email or phone in the CV." },
  { id: "u3", name: "Hana Mansour", file: "Hana_Mansour_2026.pdf", status: "added" },
  { id: "u4", name: "Tarek Samir", file: "TarekSamir-CV.pdf", status: "warnings", message: "May be the same person as Tarek Samir, added 2 Oct." },
  { id: "u5", name: "Omar Khaled", file: "OmarKhaled-CV.docx", status: "added" },
  { id: "u6", name: "Laila Hassan", file: "Laila Hassan Resume.pdf", status: "added" },
]

export function UploadResultsDemo() {
  return (
    <Turn text="I read 6 CVs. 3 are in, 2 with warnings, and 1 could not be added.">
      <WidgetFrame icon={<Upload />} title="Bulk CV upload results" meta={`${FILES.length} files`} onOpen={canvas} onDownload={download} flush>
        <UploadResults label="CV upload" items={FILES} onAction={(i) => toast(`${i.name}`)} />
      </WidgetFrame>
    </Turn>
  )
}
