---
name: aimy-ui-visual-review
description: Audit an AiMY screen by looking at it rendered, not by reading its code — alignment of icons, text, pills and edges; spacing; overflow; contrast; both themes, desk and phone widths, right to left. Measures with AiMY UI's visual audit script and zoomed screenshots, and reports each problem with the pixels and a fix. Use when asked to check how a screen looks, to do a visual or design QA pass, before showing UI work to a person, or after building or restyling a screen.
---

# Visual review of an AiMY screen

Judge what a person sees. Boxes that line up in the code can still look off: a centred icon box with an off-centre glyph, two pills one pixel apart in height, a card edge that drifts. Measure the drawn shapes, look at them zoomed in, and report in pixels. Review; don't change code unless asked.

## 1. Get the screen in front of you

- Run the app and open the screen in a real browser you can drive (Playwright, Claude in Chrome, or the browser tool you have). Note the URL and any state you had to set up (signed in, a record open, a menu open).
- Look at it at **1536px wide** (the reference desk width) and at **390px** (a phone). For a phone, set the device metrics (Playwright `viewport`, CDP `Emulation.setDeviceMetricsOverride`); a desktop window can't go that narrow.
- Look at both themes: dark (the default) and light (`data-theme="light"` on `<html>`, or the theme toggle). If the product ships right to left, also `dir="rtl"` on `<html>`.
- Turn transitions off before you measure (`*{transition:none!important;animation:none!important}`), and wait for fonts (`await document.fonts.ready`). A half-finished transition or a fallback font gives wrong numbers.
- Take a full screenshot of each combination. Keep the files; the report points at them.

## 2. Measure with the visual audit

Load AiMY UI's audit into the page and run it on the screen's main region.

- In a browser tool: fetch `{{SITE}}/agents/visual-audit.js`, evaluate it in the page, then evaluate:

  ```js
  aimyVisualAudit.describeVisualProblems(aimyVisualAudit.visualProblems(document.querySelector("main") ?? document.body))
  ```

- In Playwright with the package installed: `import { visualProblems } from "@flairstech-aimy/ui/testing"` and run it through `page.evaluate`, or add the script with `page.addScriptTag({ url: "{{SITE}}/agents/visual-audit.js" })`.

It returns sentences with the element and the pixels: icons off the capitals' centre, pills or buttons of different heights or centres in one row, stacked items whose edges don't line up, text off a shared baseline, content spilling out of its box or cut with no ellipsis, the page scrolling sideways, text under 12px, targets under 24px, text under 4.5:1 contrast (3:1 when large). "Fix" breaks a rule; "Check" needs your eye, because it may be on purpose (a size demo, a deliberate overhang).

Run it in every combination from step 1: a phone width and the light theme find different problems.

## 3. Look closely at what it found, and at what it can't measure

- **Zoom in on the shapes.** For each finding, screenshot the area scaled up (CSS `transform: scale(4)` on the region, or a clipped screenshot at device scale factor 4). Judge the glyphs, not their boxes: for an icon's own bounds use the svg's `getBBox()`, not the svg element's box.
- **Under 2px, decide in a real browser.** Some embedded browser panes draw text a pixel or two off. If a finding is under 2px and you only saw it in such a pane, say so and leave the call to a person rather than nudging.
- **Then check by eye what no script measures:**
  - Icons and logos beside text: the top of a mark as tall as the capitals meets the top of the capitals; a chevron or a bigger icon sits centred on them. An icon beside wrapping text stays on the first line.
  - Text beside text: a shared baseline, or a shared left edge down a column.
  - Pills and buttons: centred on their row and the same height as their neighbours.
  - Columns, cards and tiles: edges and rows line up with each other; gaps come from one spacing step, not a mix.
  - One primary action per area; every number says what it means and has its action beside it; no muted text (a state is shown in words and colour, not by fading the text).
  - The screen's states: empty, loading, error, very long names and numbers, many items, one item.
  - Both themes look designed, not inverted: no edges that vanish in light, no glows that shout in dark.
  - Right to left mirrors layout, arrows and drawers, and leaves charts and media controls alone.

## 4. Report

For each problem, most visible first:

- **What a person sees**, in one sentence ("The bell sits 2px lower than the account pill beside it").
- **Where**: the screen, width, theme, the element (the audit's path), and the screenshot file.
- **Measured**: the pixels or the ratio.
- **Fix**: what to change, in the part or the screen's code. Start from plain centring and the theme's tokens; move things by a pixel only on real-browser evidence. Never shrink an element to make it line up, and never hide one to make room: change its form (its own line, a menu, a drawer).

End with what you checked and found right, and what you couldn't check (a state you couldn't reach, a width you didn't try). If the `aimy-ui-review` skill is present, run it too for the rules the code shows (doctrine, accessibility, writing).
