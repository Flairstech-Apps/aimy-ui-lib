"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { NAV } from "./nav"

export function Sidebar() {
  const path = usePathname()
  const ref = useRef<HTMLElement>(null)
  const here = (href: string) => (href === "/" ? path === "/" : path.startsWith(href.replace(/\/$/, "")))

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
    <nav ref={ref} aria-label="Documentation" className="flex flex-col gap-7 px-3 py-7">
      {NAV.map((group) => (
        <div key={group.label} className="flex flex-col gap-0.5">
          <p className="px-3 pb-2 text-xs font-semibold text-ink">{group.label}</p>
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={here(item.href) ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs text-ink-secondary transition-[background-color,color] duration-(--t-fast) ease-out",
                "hover:bg-w05 hover:text-ink",
                "aria-[current=page]:bg-w07 aria-[current=page]:font-semibold aria-[current=page]:text-ink"
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
