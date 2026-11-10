"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { GroupIcon } from "./group-icon"
import { NAV } from "./nav"

export function Sidebar() {
  const path = usePathname()
  const ref = useRef<HTMLElement>(null)
  const under = (href: string) => (href === "/" ? path === "/" : path.startsWith(href.replace(/\/$/, "")))
  // The deepest match is the page: an overview at /lab/chat-widgets/ is not
  // also current on /lab/chat-widgets/frame/.
  const current = NAV.flatMap((g) => g.items.map((i) => i.href))
    .filter(under)
    .sort((a, b) => b.length - a.length)[0]
  const here = (href: string) => href === current

  // A page deep in the list opens with its own link in view.
  useEffect(() => {
    const link = ref.current?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!link || !link.offsetParent) return
    const box = link.closest<HTMLElement>("[data-scroll]")
    if (!box) return
    const top = link.offsetTop - box.offsetTop
    if (top < box.scrollTop || top > box.scrollTop + box.clientHeight - 48) {
      box.scrollTop = top - box.clientHeight / 3
    }
  }, [path])

  return (
    <nav ref={ref} aria-label="Documentation" className="flex flex-col gap-6 px-3 py-7">
      {NAV.map((group) => (
        <div key={group.label} className="flex flex-col gap-0.5">
          <p className="flex items-start gap-2 px-3 pb-2 text-xs font-semibold text-ink">
            <GroupIcon group={group.label} className="text-ink-secondary" />
            {group.label}
          </p>
          {/* Pages hang under the group's name, indented past its icon. */}
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={here(item.href) ? "page" : undefined}
              className={cn(
                "rounded-md py-1.5 pr-3 pl-8.5 text-xs text-ink-secondary transition-[background-color,color] duration-(--t-fast) ease-out",
                "hover:bg-w05 hover:text-ink",
                "aria-[current=page]:bg-accent-dim aria-[current=page]:font-semibold aria-[current=page]:text-ink-action"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  )
}
