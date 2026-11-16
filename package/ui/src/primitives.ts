// The primitives AiMY's popup parts are built on: @flairstech-aimy/ui/primitives
// Each is a namespace (DialogPrimitive.Root) and also named (DialogRoot).
export * as DialogPrimitive from "../../../registry/aimy/lib/dialog-primitive"
export { Root as DialogRoot, Trigger as DialogTrigger, Portal as DialogPortal, Overlay as DialogOverlay, Content as DialogContent, Title as DialogTitle, Description as DialogDescription, Close as DialogClose } from "../../../registry/aimy/lib/dialog-primitive"
export * as PopoverPrimitive from "../../../registry/aimy/lib/popover-primitive"
export { Root as PopoverRoot, Anchor as PopoverAnchor, Trigger as PopoverTrigger, Portal as PopoverPortal, Content as PopoverContent, Close as PopoverClose } from "../../../registry/aimy/lib/popover-primitive"
export * as TooltipPrimitive from "../../../registry/aimy/lib/tooltip-primitive"
export { Provider as TooltipProvider, Root as TooltipRoot, Trigger as TooltipTrigger, Portal as TooltipPortal, Content as TooltipContent } from "../../../registry/aimy/lib/tooltip-primitive"
export * as MenuPrimitive from "../../../registry/aimy/lib/menu-primitive"
export { Root as MenuRoot, Trigger as MenuTrigger, Portal as MenuPortal, Content as MenuContent, Item as MenuItem, CheckboxItem as MenuCheckboxItem, RadioGroup as MenuRadioGroup, RadioItem as MenuRadioItem, ItemIndicator as MenuItemIndicator, Label as MenuLabel, Separator as MenuSeparator, Group as MenuGroup } from "../../../registry/aimy/lib/menu-primitive"
export * as SelectPrimitive from "../../../registry/aimy/lib/select-primitive"
export { Root as SelectRoot, Trigger as SelectTrigger, Value as SelectValue, Icon as SelectIcon, Portal as SelectPortal, Content as SelectContent, Viewport as SelectViewport, Item as SelectItem, ItemText as SelectItemText, ItemIndicator as SelectItemIndicator } from "../../../registry/aimy/lib/select-primitive"
export { PopperContent } from "../../../registry/aimy/lib/popper-primitive"
