import axe from "axe-core"

/**
 * Runs axe on a rendered container and returns the violations as readable
 * lines, so a failing test says what is wrong rather than "expected 0".
 * Colour contrast is skipped here because jsdom can't compute it; it is
 * covered by the visual tests in a real browser.
 */
export async function a11yViolations(container: Element): Promise<string[]> {
  const results = await axe.run(container, {
    rules: { "color-contrast": { enabled: false } },
  })
  return results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length} node(s))`)
}
