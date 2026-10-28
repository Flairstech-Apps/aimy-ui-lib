import { Search, X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

// Find-as-you-type. "line" is Knowledge's .k-search (the underline that won
// over its boxed form); "box" is Sales' .b-find. A clear button appears only
// when there is something to clear, and Escape clears too. The field names
// itself with `label` because a search box usually has no visible label.
type SearchFieldProps = Omit<React.ComponentProps<"input">, "value" | "defaultValue" | "onChange" | "type"> & {
  label: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  variant?: "box" | "line"
}

export function SearchField({
  label,
  value,
  defaultValue = "",
  onValueChange,
  variant = "box",
  placeholder,
  className,
  ...props
}: SearchFieldProps) {
  const [inner, setInner] = useState(defaultValue)
  const current = value ?? inner
  const set = (next: string) => {
    if (value === undefined) setInner(next)
    onValueChange?.(next)
  }
  return (
    <div
      data-slot="search-field"
      className={cn(
        "flex min-h-8 items-center gap-2 text-ink-quiet transition-[border-color] duration-(--t-fast) ease-out",
        variant === "box"
          ? "rounded-lg border border-edge bg-card px-2.5 focus-within:border-brand"
          : "border-b border-edge-hover hover:border-ink-quiet focus-within:border-brand",
        current && variant === "line" && "border-brand",
        className
      )}
    >
      <Search aria-hidden="true" strokeWidth={2} className="size-3.5 shrink-0" />
      <input
        type="search"
        aria-label={label}
        placeholder={placeholder ?? label}
        value={current}
        onChange={(e) => set(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape" && current) {
            e.preventDefault()
            set("")
          }
        }}
        className="min-w-0 flex-1 bg-transparent text-xs text-ink outline-none placeholder:text-ink-placeholder [&::-webkit-search-cancel-button]:hidden"
        {...props}
      />
      {current ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => set("")}
          className="grid size-5 shrink-0 place-items-center rounded-pill text-ink-secondary transition-[background-color,color] duration-(--t-fast) ease-out hover:bg-w07 hover:text-ink"
        >
          <X aria-hidden="true" strokeWidth={2} className="size-3" />
        </button>
      ) : null}
    </div>
  )
}
