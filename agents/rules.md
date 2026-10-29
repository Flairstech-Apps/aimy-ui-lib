## What AiMY UI is

AiMY UI is the component library for AiMY products at FlairsTech. Every component documents what AiMY Sales and AiMY Knowledge already draw; nothing in it is a new design. Build screens from it. If a screen needs something the library does not have, say so and stop; do not invent a component.

Docs, with every component's preview, rules and source notes: https://aimy-ui-lib.aimy.flairstech.com (sign in with the library token). A plain index for agents is at `/llms.txt` on the same site.

## Installing

The library is internal. Every install needs the library token in the environment as `AIMY_REGISTRY_TOKEN`. Never write the token into a file that is committed.

- Copy a component into the project (the shadcn way): `npx shadcn@latest add @aimy/<name>`. The project's `components.json` must list the `@aimy` registry with the token header.
- Or import from the package: `import { Button } from "@flairstech-aimy/ui"` and `import "@flairstech-aimy/ui/styles.css"`.
- Tokens only (any HTML): `@flairstech-aimy/tokens`.

## The rules every screen follows

Doctrine, from the AiMY Knowledge-to-Action doctrine and the products:

- Dark by default, with the light theme one toggle away. Use the theme's tokens for every colour, size, radius, shadow and duration; never a raw hex value or an off-scale size.
- Classify every action into one of the four entry modes (prompt, investigate, reviewed action, direct action) with `EntryAction`, and declare the work state of every surfaced item with `WorkState`.
- AI never applies a change silently. A change AiMY proposes is shown for Accept, Edit or Reject (`ChangeReview`, `Suggestion`); a direct action happens at once and ends in a toast with Undo.
- Pair every insight with its next step. A number in a sentence opens the set it counts.
- Generated content, confirmation of a workflow and drill-through go to the AiMY Canvas, not to a new page.
- One-click inline controls with toast undo. No modal, picker, choice list or drag as the only way to do something. Ask before anything destructive with a typed confirmation, never a plain "Are you sure?".
- When space runs out, change a component's form (a drawer, a menu, its own line). Never hide it, and never shrink it past use.
- Mark AI with the AiMY mark (`AimyMark`), never with sparkles.

Accessibility (WCAG 2.2 AA in both themes):

- No muted text. A state is said in words and colour, never by lowering contrast or fading.
- Status is colour plus words or an icon, never colour alone.
- Full keyboard use, the theme's focus ring, correct roles and names. A control made of several parts reads as one sentence.
- Every animation honours `prefers-reduced-motion`. Motion comes from the theme's motion tokens (transitions.dev); never `transition: all`.

Writing:

- Plain English. Say "call", never "ring"; "contacts", never "board" or "book". No sales slang.
- A verb on every button that names the action; never "Open" or "Learn more" when the real action has a name.
- Errors say what happened and what to do next.

Never:

- Never use a native `<select>`, an inline `onclick` string, a coloured left-edge stripe, gradient text, or a pulsing decorative dot.
- Never build a dropdown, dialog or menu by hand; use the library's, which carry the keyboard model and ARIA.
- Never fix a bug you find in passing without saying so.
- Never expand scope. When matching a design from another page, copy its style, not its content.

Icons are Lucide only, on the 24 grid at stroke 2.
