"use client"

// The floating panel every popup part sits in: a fixed wrapper placed beside
// its anchor (so the panel's own transform stays free for the open and close
// animation), the CSS variables the parts read (--available-height,
// --anchor-width, --transform-origin), data-side and data-align for the
// transitions, and the panel's z-index copied up to the wrapper.

import { type CSSProperties, type ReactNode, type Ref, useRef, useState } from "react"
import { type PositionOptions } from "./behaviors-layers"
import { Slot, composeRefs, useFloating, useIsoLayoutEffect } from "./behaviors-react"

export type PopperProps = PositionOptions & {
  anchor: Element | null
  open: boolean
  asChild?: boolean
  children?: ReactNode
  ref?: Ref<HTMLElement>
  style?: CSSProperties
  [key: string]: unknown
}

export function PopperContent({ anchor, open, side, align, sideOffset, alignOffset, collisionPadding, avoidCollisions, asChild, children, ref, style, ...props }: PopperProps) {
  const [wrapper, setWrapper] = useState<HTMLDivElement | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [content, setContent] = useState<HTMLElement | null>(null)
  const { placement, style: placed } = useFloating(anchor, wrapper, open, { side, align, sideOffset, alignOffset, collisionPadding, avoidCollisions })

  // The panel's classes set its layer (z-(--z-popover)); the wrapper is what
  // stacks, so it takes the same z-index.
  useIsoLayoutEffect(() => {
    const w = wrapperRef.current
    if (w && content) w.style.zIndex = getComputedStyle(content).zIndex
  }, [wrapper, content])

  const Comp = asChild ? Slot : "div"
  return (
    <div ref={composeRefs(wrapperRef, setWrapper)} data-aimy-popper="" style={placed}>
      <Comp
        {...props}
        ref={composeRefs(ref, setContent as Ref<HTMLElement>)}
        data-side={placement?.side ?? side ?? "bottom"}
        data-align={placement?.align ?? align ?? "center"}
        style={{ "--transform-origin": placement?.transformOrigin, ...style } as CSSProperties}
      >
        {children}
      </Comp>
    </div>
  )
}
