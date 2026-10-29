"use client"

import { ArrowLeft, ArrowRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { NAV } from "./nav"

const FLAT = NAV.flatMap((group) => group.items.map((item) => ({ ...item, group: group.label })))

function useCurrent() {
  const path = usePathname()
  const at = FLAT.findIndex((item) =>
    item.href === "/" ? path === "/" : path.startsWith(item.href.replace(/\/$/, ""))
  )
  return { path, at, item: at >= 0 ? FLAT[at] : undefined }
}

/** The group a page sits in, above its title. */
export function Crumb() {
  const { item } = useCurrent()
  if (!item) return null
  return <p className="mb-3 text-xs font-semibold text-ink-secondary">{item.group}</p>
}

/** The previous and next page, in the sidebar's order. */
export function PageNav() {
  const { at } = useCurrent()
  if (at < 0) return null
  const prev = FLAT[at - 1]
  const next = FLAT[at + 1]
  const card =
    "group flex min-w-0 flex-col gap-1 rounded-lg border border-hairline p-4 transition-[border-color,background-color] duration-(--t-fast) ease-out hover:border-edge-hover hover:bg-w05"
  return (
    <nav
      aria-label="Previous and next page"
      className="mt-20 grid gap-3 border-t border-hairline pt-8 phone:grid-cols-2"
    >
      {prev ? (
        <Link href={prev.href} className={card}>
          <span className="flex items-center gap-1.5 text-xs text-ink-secondary">
            <ArrowLeft
              aria-hidden="true"
              strokeWidth={2}
              className="size-3.5 transition-transform duration-(--t-fast) ease-out group-hover:-translate-x-0.5"
            />
            Previous
          </span>
          <span className="truncate text-body font-semibold text-ink">{prev.label}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={next.href} className={cn(card, "phone:items-end phone:text-right")}>
          <span className="flex items-center gap-1.5 text-xs text-ink-secondary">
            Next
            <ArrowRight
              aria-hidden="true"
              strokeWidth={2}
              className="size-3.5 transition-transform duration-(--t-fast) ease-out group-hover:translate-x-0.5"
            />
          </span>
          <span className="max-w-full truncate text-body font-semibold text-ink">{next.label}</span>
        </Link>
      ) : null}
    </nav>
  )
}

type Heading = { id: string; text: string }

/** "On this page": the page's sections, with the one in view marked. */
export function Toc() {
  const { path } = useCurrent()
  const [headings, setHeadings] = useState<Heading[]>([])
  const [active, setActive] = useState("")

  useEffect(() => {
    // The page's own headings are the only source; read them once the new page has painted.
    const els = [...document.querySelectorAll<HTMLElement>("main h2[id]")]
    const frame = requestAnimationFrame(() => {
      setHeadings(els.map((el) => ({ id: el.id, text: el.dataset.title ?? el.textContent ?? "" })))
      setActive(els[0]?.id ?? "")
    })
    const seen = new Map<string, boolean>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) seen.set(entry.target.id, entry.isIntersecting)
        const first = els.find((el) => seen.get(el.id))
        if (first) setActive(first.id)
      },
      { rootMargin: "-64px 0px -60% 0px" }
    )
    els.forEach((el) => observer.observe(el))
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [path])

  if (headings.length < 2) return null
  return (
    <nav aria-label="On this page" className="flex flex-col gap-1">
      <p className="mb-2 text-xs font-semibold text-ink">On this page</p>
      {headings.map((h) => (
        <a
          key={h.id}
          href={`#${h.id}`}
          aria-current={active === h.id ? "location" : undefined}
          className={cn(
            "border-l-2 border-hairline py-1 pl-3 text-xs text-ink-secondary transition-[border-color,color] duration-(--t-fast) ease-out",
            "hover:text-ink aria-[current=location]:border-ink-action aria-[current=location]:text-ink"
          )}
        >
          {h.text}
        </a>
      ))}
    </nav>
  )
}
