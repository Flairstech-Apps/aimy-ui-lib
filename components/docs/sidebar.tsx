"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { NAV } from "./nav"

export function Sidebar() {
  const path = usePathname()
  const here = (href: string) => (href === "/" ? path === "/" : path.startsWith(href.replace(/\/$/, "")))
  return (
    <nav aria-label="Documentation" className="flex flex-col gap-6 px-3 py-6">
      {NAV.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-2xs font-semibold tracking-wide text-ink-quiet uppercase">{group.label}</p>
          {group.items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={here(item.href) ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-2 text-xs text-ink-secondary transition-[background-color,color] duration-(--t-fast) ease-out",
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
