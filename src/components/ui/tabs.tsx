import * as React from "react"
import { cn } from "@/lib/utils"

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  onValueChange: (value: string) => void
  tabs: { label: string; value: string }[]
  className?: string
}

export function Tabs({ value, onValueChange, tabs, className, ...props }: TabsProps) {
  return (
    <div className={cn("flex gap-2", className)} {...props}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={cn(
            "px-3 py-1 rounded border text-sm font-medium transition",
            value === tab.value
              ? "bg-yellow-400 text-yellow-900 border-yellow-400 shadow"
              : "bg-white text-yellow-700 border-yellow-400 hover:bg-yellow-50"
          )}
          onClick={() => onValueChange(tab.value)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
