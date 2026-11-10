// A small highlighter for the docs' code blocks: commands, JSON, CSS and TSX,
// coloured with the library's own --syn-* tokens. It only wraps spans around
// the text, so what is copied (and what Copy for AI reads) stays the same.

export type Lang = "shell" | "json" | "css" | "tsx" | "text"

const SHELL = /^(npx|npm|pnpm|yarn|git|node|curl|cd|claude|code)\b/

export function detect(code: string): Lang {
  const s = code.trim()
  if (SHELL.test(s)) return "shell"
  if (/^@[\w-]+:registry=/.test(s)) return "shell"
  if (/^[{[]/.test(s)) {
    try {
      JSON.parse(s)
      return "json"
    } catch {
      /* not JSON: fall through */
    }
  }
  if (/^(@import|@theme|@layer|:root|\[data-|\.[\w-]+\s*\{|--[\w-]+\s*:)/m.test(s)) return "css"
  if (/(^|\n)\s*(import|export|const|function|type|<[A-Za-z])/.test(s) || /=>|<\/?[A-Z]/.test(s)) return "tsx"
  return "text"
}

export const LANG_LABEL: Record<Lang, string> = {
  shell: "Terminal",
  json: "JSON",
  css: "CSS",
  tsx: "TSX",
  text: "Text",
}

type Kind = "comment" | "string" | "keyword" | "type" | "name" | "value" | "base"

const COLOUR: Record<Kind, string | undefined> = {
  comment: "var(--syn-comment)",
  string: "var(--syn-string)",
  keyword: "var(--syn-keyword)",
  type: "var(--syn-type)",
  name: "var(--syn-name)",
  value: "var(--syn-value)",
  base: undefined,
}

type Rule = [RegExp, Kind | ((m: RegExpExecArray) => Kind)]

const KEYWORDS =
  /^(?:import|from|export|default|const|let|var|function|return|if|else|type|interface|async|await|new|as|extends|typeof|null|undefined|true|false)\b/

const TSX: Rule[] = [
  [/^\{?\/\*[\s\S]*?\*\/\}?/, "comment"],
  [/^\/\/[^\n]*/, "comment"],
  [/^(["'`])(?:\\.|(?!\1)[^\\])*\1/, "string"],
  [/^<\/?[A-Z][\w.]*/, "type"],
  [/^<\/?[a-z][\w-]*/, "keyword"],
  [/^[A-Za-z_$][\w$-]*(?==[{"'])/, "name"],
  [KEYWORDS, "keyword"],
  [/^\d[\d_.]*(?:ms|px|rem|s|%)?\b/, "value"],
  [/^[A-Z][\w$]*/, "type"],
  [/^[A-Za-z_$][\w$]*/, "base"],
]

const CSS: Rule[] = [
  [/^\/\*[\s\S]*?\*\//, "comment"],
  [/^(["'])(?:\\.|(?!\1)[^\\])*\1/, "string"],
  [/^@[\w-]+/, "keyword"],
  [/^--[\w-]+/, "name"],
  [/^[a-z-]+(?=\s*:)/, "keyword"],
  [/^#[0-9a-fA-F]{3,8}\b/, "value"],
  [/^-?\d[\d.]*(?:ms|px|rem|em|s|%|fr|dvh|vh|vw)?/, "value"],
  [/^[\w-]+/, "base"],
]

const JSON_RULES: Rule[] = [
  [/^"(?:\\.|[^"\\])*"(?=\s*:)/, "name"],
  [/^"(?:\\.|[^"\\])*"/, "string"],
  [/^(?:true|false|null)\b/, "keyword"],
  [/^-?\d[\d.eE+-]*/, "value"],
]

// A command line: the program, then flags, packages and addresses.
const SHELL_RULES: Rule[] = [
  [/^#[^\n]*/, "comment"],
  [/^(["'])(?:\\.|(?!\1)[^\\])*\1/, "string"],
  [/^--?[\w-]+(?:=\S*)?/, "value"],
  [/^https?:\/\/\S+/, "string"],
  [/^@[\w./-]+(?:@[\w.^~-]+)?/, "name"],
  [/^\S+/, "base"],
]

const RULES: Record<Exclude<Lang, "text">, Rule[]> = { tsx: TSX, css: CSS, json: JSON_RULES, shell: SHELL_RULES }

function tokens(code: string, lang: Exclude<Lang, "text">) {
  const out: { text: string; kind: Kind }[] = []
  const rules = RULES[lang]
  let rest = code
  let lineStart = true
  const push = (text: string, kind: Kind) => {
    const last = out[out.length - 1]
    if (last && last.kind === kind) last.text += text
    else out.push({ text, kind })
  }
  while (rest.length) {
    // In a command, the first word on each line is the program.
    if (lang === "shell" && lineStart) {
      const prog = /^\s*[\w.-]+/.exec(rest)
      if (prog && !rest.startsWith("@") && !rest.trimStart().startsWith("#")) {
        push(prog[0], "keyword")
        rest = rest.slice(prog[0].length)
        lineStart = false
        continue
      }
    }
    let matched = false
    for (const [re, kind] of rules) {
      const m = re.exec(rest)
      if (m && m[0]) {
        push(m[0], typeof kind === "function" ? kind(m) : kind)
        rest = rest.slice(m[0].length)
        matched = true
        lineStart = false
        break
      }
    }
    if (!matched) {
      const ch = rest.charAt(0)
      push(ch, "base")
      rest = rest.slice(1)
      if (ch === "\n") lineStart = true
    }
  }
  return out
}

export function Highlight({ code, lang }: { code: string; lang: Lang }) {
  if (lang === "text") return <>{code}</>
  return (
    <>
      {tokens(code, lang).map((t, i) =>
        COLOUR[t.kind] ? (
          <span key={i} style={{ color: COLOUR[t.kind] }}>
            {t.text}
          </span>
        ) : (
          t.text
        )
      )}
    </>
  )
}
