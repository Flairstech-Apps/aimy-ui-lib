export type NavItem = { href: string; label: string }
export type NavGroup = { label: string; items: NavItem[] }

export const NAV: NavGroup[] = [
  {
    label: "Start here",
    items: [{ href: "/", label: "Install and start" }],
  },
  {
    label: "Foundations",
    items: [
      { href: "/foundations/color/", label: "Colour" },
      { href: "/foundations/typography/", label: "Typography" },
      { href: "/foundations/spacing/", label: "Spacing" },
      { href: "/foundations/radius/", label: "Radius" },
      { href: "/foundations/elevation/", label: "Elevation" },
      { href: "/foundations/motion/", label: "Motion" },
      { href: "/foundations/layers/", label: "Layers" },
      { href: "/foundations/breakpoints/", label: "Breakpoints" },
      { href: "/foundations/icons/", label: "Icons" },
      { href: "/foundations/logo/", label: "Logo" },
      { href: "/foundations/focus/", label: "Focus" },
      { href: "/foundations/writing/", label: "Writing" },
    ],
  },
]
