"use client"

import { FaceStack, type FacePerson } from "@/registry/aimy/ui/face-stack"
import { toast } from "@/registry/aimy/ui/toast"

// Made-up people on randomuser.me's placeholder portraits, the source Sales' faces use.
const pic = (p: string) => `https://randomuser.me/api/portraits/${p}.jpg`

export const TEAM: FacePerson[] = [
  { id: "1", name: "Lina Farouk", src: pic("women/44"), sub: "Account executive" },
  { id: "2", name: "Sherif Adel", src: pic("men/32"), sub: "Sales development" },
  { id: "3", name: "Rami Saleh", src: pic("men/75"), sub: "Sales development" },
  { id: "4", name: "Mona Kamal", src: pic("women/68"), sub: "Team lead" },
  { id: "5", name: "Omar Nabil", src: pic("men/11"), sub: "Sales development" },
  { id: "6", name: "Hana Mansour", src: pic("women/21"), sub: "Account executive" },
  { id: "7", name: "Karim Ashraf", src: pic("men/52"), sub: "Sales development" },
]

/** The people on a team card: faces only. */
export function TeamFaces() {
  return <FaceStack people={TEAM.slice(0, 4)} />
}

/** A team of seven: faces past four become the count. */
export function TeamFacesMore() {
  return <FaceStack people={TEAM} />
}

/** Sales' door: three named on the line, the other four in the stack, the menu naming all seven. */
export function TeamDoor() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {TEAM.slice(0, 3).map((p) => (
        <span key={p.id} className="text-xs font-semibold text-ink">
          {p.name}
        </span>
      ))}
      <FaceStack
        people={TEAM.slice(3)}
        menu={{ label: "4 more people", cap: "The team", people: TEAM, onOpen: (p) => toast(`Opens ${p.name}`) }}
      />
    </div>
  )
}

/** The same door with nothing behind a name: the roster is a list to read. */
export function TeamList() {
  return <FaceStack people={TEAM.slice(3)} menu={{ label: "4 more people", cap: "The team", people: TEAM }} />
}
