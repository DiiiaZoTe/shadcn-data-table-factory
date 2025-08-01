"use client"

import { memo } from "react"
import { Checkbox } from "@/components/ui/checkbox"

interface SelectionCellProps {
  isSelected: boolean
  onToggle: () => void
}

// Separate memoized component for selection to prevent row re-renders
export const SelectionCell = memo(function SelectionCell({ isSelected, onToggle }: SelectionCellProps) {
  return (
    <div className="flex items-center justify-center">
      <Checkbox checked={isSelected} onCheckedChange={onToggle} aria-label="Select row" />
    </div>
  )
})
