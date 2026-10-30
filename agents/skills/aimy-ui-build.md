---
name: aimy-ui-build
description: Build a screen, panel or flow in an AiMY product from a screenshot, a mock-up, a Figma frame or a description, using only AiMY UI components and following AiMY's rules. Use when asked to build, lay out or implement UI in an AiMY product.
---

# Build a screen from AiMY UI

Build from the library's parts. Nothing on the screen is a new design: when a part is missing, say so and stop rather than invent it.

## Steps

1. **Read the brief.** List the parts the screen needs: the shell, the page head, lists, forms, figures, AI answers, actions. Note the states it must handle: empty, loading, error, long content, narrow width.
2. **Map each part to a component.** Use the index below, or the docs at {{SITE}}. Prefer a whole part (`AppShell`, `PageHead`, `DataTable`, `DocPage`, `Canvas`) over assembling small ones. If an AiMY UI MCP server is connected, `search_components` and `get_component` give the same answers with the code.
3. **Stop at a gap.** If a part has no component, say which part, name the closest components, and stop. Do not build a lookalike.
4. **Install what is missing**, the way the project already does it: check `components.json` and `package.json` first.
   - Copy in: `npx shadcn@latest add @aimy/<name>`, or by address with no setup: `npx shadcn@latest add {{SITE}}/r/<name>.json`.
   - Or import from `@flairstech-aimy/ui`.
5. **Compose.** The shell first (`AppShell`, `Topnav`, `Rail`, `Page`), then the content. Any spacing between parts comes from the theme's tokens.
6. **Wire the doctrine.** Each action declares its entry mode and each item its work state. What AiMY proposes is shown for Accept, Edit or Reject; a direct action ends in a toast with Undo. AI is marked with `AimyMark`.
7. **Write the copy.** Plain English, a verb on every button, errors that say what to do next.
8. **Check it.** Both themes, 1536px and phone width, the keyboard alone. If the `aimy-ui-review` skill is present, run it on what you built.

## Which component

{{INDEX}}
