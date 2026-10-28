"use client"

import { ChevronDown, PanelLeft } from "lucide-react"
import { Avatar } from "@/components/avatar"
import { IconButton } from "@/components/icon-button"
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/menu"
import { useShell } from "@/components/app-shell"
import { cn } from "@/lib/utils"

// The bar across the top: Knowledge's markup with Sales' values where they
// differ. The mark on the left, the products in a pill strip in the centre
// (the current one in the accent's ink and a step bolder, so colour is never
// all that says it), and the controls on the right: whatever the product
// adds, the theme, the bell, the account. As the shell narrows it changes
// form, never hides: below 1120 the account drops its name; below 1040 a
// toggle for the rail appears; below 900 the strip leaves the bar for a
// chevron menu beside the mark. A product that isn't open to you yet is
// shown and says so, rather than going missing.
//
//   <Topnav logo={<AimyMark variant="lockup" title="AiMY" />} products={[
//     { label: "Knowledge", href: "/knowledge" }, { label: "Sales", href: "/sales", current: true },
//   ]} actions={<><ThemeToggle /><NotificationCenter … /><UserMenu … /></>} />

export type TopnavProduct = {
  label: string
  href?: string
  icon?: React.ReactNode
  current?: boolean
  /** Not open to this person yet: shown, not pressable, with this short word beside it ("soon"). */
  soon?: string
  onSelect?: () => void
}

type TopnavProps = {
  logo: React.ReactNode
  logoHref?: string
  products?: TopnavProduct[]
  /** The right-hand controls, in order. */
  actions?: React.ReactNode
  className?: string
}

export function Topnav({ logo, logoHref = "/", products = [], actions, className }: TopnavProps) {
  const { hasRail, railOpen, setRailOpen, railId } = useShell()
  return (
    <header className={cn("app-topnav", className)} data-slot="topnav">
      <div className="topnav-logo">
        {hasRail ? (
          <IconButton
            label={railOpen ? "Close the briefing" : "Open the briefing"}
            size="lg"
            className="rail-toggle"
            aria-expanded={railOpen}
            aria-controls={railId}
            onClick={() => setRailOpen(!railOpen)}
          >
            <PanelLeft />
          </IconButton>
        ) : null}
        <a className="topnav-logo-link" href={logoHref}>
          {logo}
        </a>
        {products.length ? (
          <Menu>
            <MenuTrigger className="prod-chev" aria-label="Products">
              <ChevronDown aria-hidden="true" />
            </MenuTrigger>
            <MenuContent align="start">
              {products.map((p) => (
                <MenuItem
                  key={p.label}
                  className="prod-menu-item"
                  aria-current={p.current ? "page" : undefined}
                  disabled={!!p.soon}
                  leading={p.icon}
                  description={p.soon}
                  onSelect={() => {
                    if (p.current) return
                    if (p.onSelect) p.onSelect()
                    else if (p.href) window.location.assign(p.href)
                  }}
                >
                  {p.label}
                </MenuItem>
              ))}
            </MenuContent>
          </Menu>
        ) : null}
      </div>
      {products.length ? (
        <nav className="topnav-tabs" aria-label="Products">
          <div className="topnav-tabs-inner">
            {products.map((p) => {
              const inner = (
                <>
                  {p.icon}
                  {p.label}
                  {p.soon ? <span className="topnav-tab-soon">{p.soon}</span> : null}
                </>
              )
              if (p.soon || p.current || (!p.href && !p.onSelect))
                return (
                  <span
                    key={p.label}
                    className="topnav-tab"
                    aria-current={p.current ? "page" : undefined}
                    aria-disabled={p.soon ? "true" : undefined}
                    title={p.soon}
                  >
                    {inner}
                  </span>
                )
              return p.href ? (
                <a key={p.label} className="topnav-tab" href={p.href} onClick={p.onSelect}>
                  {inner}
                </a>
              ) : (
                <button key={p.label} type="button" className="topnav-tab" onClick={p.onSelect}>
                  {inner}
                </button>
              )
            })}
          </div>
        </nav>
      ) : null}
      <div className="topnav-right">{actions}</div>
    </header>
  )
}

type UserMenuProps = {
  name: string
  /** Under the name: the role, or who you are viewing as. */
  role?: string
  /** The menu: MenuLabel, MenuItem, MenuRadioGroup, MenuSeparator. */
  children: React.ReactNode
}

/** Knowledge's account pill and its menu. Below 1120 it is the face alone. */
export function UserMenu({ name, role, children }: UserMenuProps) {
  return (
    <Menu>
      <MenuTrigger className="topnav-user" aria-label={`Account: ${name}`}>
        <Avatar name={name} size="sm" />
        <span className="topnav-user-info" aria-hidden="true">
          <span className="topnav-user-name">{name}</span>
          {role ? <span className="topnav-user-role">{role}</span> : null}
        </span>
        <ChevronDown aria-hidden="true" />
      </MenuTrigger>
      <MenuContent align="end">{children}</MenuContent>
    </Menu>
  )
}
