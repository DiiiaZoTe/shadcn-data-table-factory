"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Edit2 } from "lucide-react"
import { EditableCell } from "./editable-cell"
import type { DataTableFieldType } from "@/types/data-table"

interface HoverableCellProps<T> {
  value: any
  type: DataTableFieldType
  options?: string[]
  onSave: (value: any) => void
  placeholder?: string
  editable?: boolean
  render?: (value: any) => React.ReactNode
}

// Helper function to format date consistently
const formatDateTime = (value: any) => {
  if (!value) return ""
  const date = new Date(value)
  const dateStr = date.toLocaleDateString()
  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  return (
    <div className="text-sm">
      <div>{dateStr}</div>
      <div className="text-muted-foreground">{timeStr}</div>
    </div>
  )
}

export function HoverableCell<T>({
  value,
  type,
  options,
  onSave,
  placeholder,
  editable = true,
  render,
}: HoverableCellProps<T>) {
  const [isEditing, setIsEditing] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const editTriggerRef = useRef<HTMLDivElement>(null)

  // Auto-focus when entering edit mode
  useEffect(() => {
    if (isEditing) {
      // Small delay to ensure the EditableCell has rendered
      setTimeout(() => {
        const input = editTriggerRef.current?.querySelector("input, select, button")
        if (input && "focus" in input) {
          ;(input as HTMLElement).focus()
        }
      }, 50)
    }
  }, [isEditing])

  if (isEditing) {
    return (
      <div className="min-w-0 w-full" ref={editTriggerRef}>
        <EditableCell
          value={value}
          type={type}
          options={options}
          placeholder={placeholder}
          onSave={(newValue) => {
            onSave(newValue)
            setIsEditing(false)
          }}
        />
      </div>
    )
  }

  const renderDefaultValue = () => {
    // Default rendering based on type (when no custom render function)
    switch (type) {
      case "boolean":
        return <Switch checked={value ?? false} disabled />
      case "date":
        return value ? formatDateTime(value) : <span className="text-muted-foreground">{placeholder || ""}</span>
      case "multi-select":
        return Array.isArray(value) ? (
          <div className="flex flex-wrap gap-1">
            {value.map((item) => (
              <span
                key={item}
                className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
              >
                {item}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground">{placeholder || ""}</span>
        )
      default:
        return value || placeholder || ""
    }
  }

  // Always wrap in hover container, regardless of custom render
  return (
    <div
      className="relative min-w-0 w-full group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="min-w-0 pr-8">
        {/* Use custom render if provided, otherwise use default */}
        {render ? render(value) : renderDefaultValue()}
      </div>
      {editable && isHovered && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={(e) => {
            e.stopPropagation()
            setIsEditing(true)
          }}
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
