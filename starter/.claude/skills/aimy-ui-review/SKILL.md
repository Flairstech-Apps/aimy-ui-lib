---
name: aimy-ui-review
description: Review an AiMY product screen, component or diff against AiMY UI's rules (doctrine, accessibility, writing) and report each break with its fix. Use when asked to review, check or audit UI in an AiMY product, before opening a pull request with UI changes, or after building a screen.
---

<!-- Written by scripts/agent-files.mjs from agents/skills/aimy-ui-review.md. Edit that, not this. -->

# Review a screen against AiMY's rules

Find every place the work breaks an AiMY rule, say what a person would notice, and give the fix. Review; do not change code unless asked.

## How to review

1. Find what to review: the diff (`git diff` against the base branch), the files named, or the screen described. Read the code. If you can run the app, look at the screen in the dark and the light theme, at 1536px and at phone width, and use it with the keyboard.
2. Go through every check below. For each break, note the file and line, the rule, what a person would see or miss, and the fix.
3. Report the findings, the most serious first: anything that hides information or blocks someone (accessibility, silent AI changes, lost work) before looks and wording.
4. If nothing breaks a rule, say so in one line, and name anything you could not check, such as motion or focus in a real browser.

## The checks

### Built from the library

- Every control comes from AiMY UI: the project's copied components (`@/components/…`) or `@flairstech-aimy/ui`. Flag any dropdown, dialog, menu, tabs, tooltip, toast or select built by hand, and any lookalike of a library component.
- Every colour, size, radius, shadow and duration comes from the theme's tokens. Flag raw hex or `rgb()` values, arbitrary Tailwind values such as `text-[13px]` or `p-[7px]`, and spacing off the 4px scale.
- Icons are Lucide, on the 24 grid at stroke 2. AI is marked with `AimyMark`; flag any `Sparkles` icon.

### AI and actions

- AI never applies a change silently. A change AiMY proposes is shown for Accept, Edit or Reject (`Suggestion`, `ChangeReview`). Flag AI output written straight into a record.
- A direct action happens at once and ends in a toast with Undo. Flag a direct action with no Undo, and an Undo that does not restore what was there.
- Each action declares its entry mode (`EntryAction`) and each surfaced item its work state (`WorkState`).
- An insight comes with its next step, and a number in a sentence opens the set it counts.
- Generated content, confirmation of a workflow and drill-through open in the AiMY Canvas, not a new page.

### Controls and layout

- Nothing is reachable only through a modal, a picker, a choice list or drag. There is a one-click inline way, with Undo.
- Anything destructive asks for a typed confirmation. Flag a plain "Are you sure?".
- When space runs out, a part changes form (a drawer, a menu, its own line). Flag anything hidden at a breakpoint with no other way to reach it, and anything squeezed past use.
- No native `<select>`, inline `onclick` strings, coloured left-edge stripes, gradient text or pulsing decorative dots.

### Accessibility (WCAG 2.2 AA in both themes)

- No muted text: flag text faded with opacity, words in the faint or rule inks, and a state shown only by greying out. Say the state in words and colour.
- Status is colour plus words or an icon, never colour alone.
- Everything works from the keyboard, focus shows the theme's ring, and every control has a role and a name. Icon-only buttons have a label. A control made of several parts reads as one sentence.
- Motion uses the theme's motion tokens, honours `prefers-reduced-motion`, and never uses `transition: all`.

### Writing

- Plain English. "Call", never "ring"; "contacts", never "board" or "book"; no sales slang.
- Every button is a verb that names its action. Flag "Open", "Learn more", "Click here" and "Submit" where the real action has a name.
- Errors say what happened and what to do next.

## Report

Write the findings as a list, one finding per item:

- **The rule broken**, at `file:line`: what a person sees or misses. Fix: the change, naming the library component or token to use.

End with one line on what you could not check. Offer to make the fixes; make them only if asked.
