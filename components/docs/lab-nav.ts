import type { NavGroup } from "./nav"

// Explorations for choosing what goes into the library. On the dev server
// only (nav.ts); their pages are gitignored because they hold real data.
export const LAB_NAV: NavGroup[] = [
  {
    label: "Lab: chat widgets",
    items: [
      { href: "/lab/chat-widgets/", label: "Overview" },
      { href: "/lab/chat-widgets/frame/", label: "Widget frame" },
      { href: "/lab/chat-widgets/candidate-card/", label: "Candidate card" },
      { href: "/lab/chat-widgets/candidate-profile/", label: "Candidate profile" },
      { href: "/lab/chat-widgets/table/", label: "Table" },
      { href: "/lab/chat-widgets/ranked-list/", label: "Ranked list" },
      { href: "/lab/chat-widgets/upload-results/", label: "Upload results" },
    ],
  },
]
