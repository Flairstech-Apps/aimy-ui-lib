export type Speaker = "user" | "aimy"

/**
 * Where an AiMY turn is in its life.
 * - thinking: asked, nothing written yet (the think-mark shows)
 * - streaming: words are arriving
 * - done: complete
 * - stopped: the person stopped it; whatever was written stays
 * - failed: it could not answer; say so and offer Retry
 */
export type TurnStatus = "thinking" | "streaming" | "done" | "stopped" | "failed"

export type Person = { name: string; src?: string }

export type Turn = {
  id: string
  speaker: Speaker
  /** Plain text. Rich blocks (cards, sources) go in a Message's children. */
  text: string
  status?: TurnStatus
  /** For a person's turn: who asked. */
  author?: Person
}

/** What the conversation is about, shown as "Based on" in the canvas. */
export type Basis = string[]

/** A file attached to the next prompt (Knowledge's paperclip). */
export type Attachment = { id: string; name: string; note?: string }

/** One line of "How this was answered": what AiMY did, and why. */
export type ReasoningStep = { what: string; why?: string }

/** A person's verdict on one answer. null means no verdict. */
export type Rating = "up" | "down" | null

/**
 * The trust condition of a source, as Knowledge computes it. Superseded
 * sources are excluded from answers; every other status still answers, and
 * an answer citing one says so.
 */
export type TrustStatus = "current" | "outdated" | "conflicting" | "draft" | "unowned" | "unused" | "superseded"

/** A document an answer stands on. */
export type Source = {
  id: string
  title: string
  status?: TrustStatus
  /** The status was set by a person, not computed. */
  setByHand?: boolean
  /** The cited passage, quoted in the preview. */
  passage?: string
  /** What kind of document: "Article", "Policy". */
  type?: string
  /** Where it came from: "Confluence", "Zendesk". */
  connector?: string
  collection?: string
}

/**
 * Where a surfaced item stands (doctrine §2.3). Every item declares one.
 * detected: AiMY noticed it · recommended: AiMY has an opinion · drafted:
 * AiMY wrote it · staged: your turn · completed: it ran · failed: it did not.
 */
export type WorkStateValue = "detected" | "recommended" | "drafted" | "staged" | "completed" | "failed"

/**
 * How an action behaves when pressed (doctrine §3). Classification is
 * mandatory: direct completes in place with Undo; investigate opens the
 * canvas and starts; prompt stages a question to send; review shows a
 * proposal to Accept, Edit or Reject, never applied silently.
 */
export type EntryMode = "direct" | "investigate" | "prompt" | "review"
