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
  {
    label: "Components",
    items: [
      { href: "/components/button/", label: "Button" },
      { href: "/components/icon-button/", label: "Icon button" },
      { href: "/components/link/", label: "Link" },
      { href: "/components/tag/", label: "Tag" },
      { href: "/components/chip/", label: "Chip" },
      { href: "/components/count-badge/", label: "Count badge" },
      { href: "/components/status/", label: "Status" },
      { href: "/components/kbd/", label: "Kbd" },
      { href: "/components/divider/", label: "Divider" },
      { href: "/components/avatar/", label: "Avatar" },
    ],
  },
  {
    label: "Forms",
    items: [
      { href: "/components/field/", label: "Field and text inputs" },
      { href: "/components/search-field/", label: "Search field" },
      { href: "/components/select/", label: "Select" },
      { href: "/components/checkbox/", label: "Checkbox" },
      { href: "/components/switch/", label: "Switch" },
      { href: "/components/segmented/", label: "Segmented" },
      { href: "/components/copy-button/", label: "Copy button" },
      { href: "/components/date-picker/", label: "Date picker" },
    ],
  },
  {
    label: "Containers and navigation",
    items: [
      { href: "/components/card/", label: "Card" },
      { href: "/components/tabs/", label: "Tabs" },
      { href: "/components/menu/", label: "Menu" },
      { href: "/components/tooltip/", label: "Tooltip and popover" },
      { href: "/components/disclosure/", label: "Disclosure" },
      { href: "/components/pager/", label: "Pager" },
    ],
  },
  {
    label: "Feedback and overlays",
    items: [
      { href: "/components/toast/", label: "Toast" },
      { href: "/components/dialog/", label: "Dialog" },
      { href: "/components/sheet/", label: "Sheet" },
      { href: "/components/notice/", label: "Notice" },
      { href: "/components/empty-state/", label: "Empty and error states" },
      { href: "/components/skeleton/", label: "Skeleton" },
      { href: "/components/progress/", label: "Progress" },
    ],
  },
]
