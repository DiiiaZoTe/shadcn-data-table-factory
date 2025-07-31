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

  if (render) {
    return <div className="min-w-0 w-full">{render(value)}</div>
  }

  // Handle boolean fields specially - they can be directly interactive
  if (type === "boolean" && editable) {
    return (
      <div className="min-w-0 w-full">
        <Switch checked={value ?? false} onCheckedChange={(checked) => onSave(checked)} />
      </div>
    )
  }

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

  const renderValue = () => {
    switch (type) {
      case "boolean":
        return <Switch checked={value ?? false} disabled />
      case "date":
        return value ? new Date(value).toLocaleDateString() : placeholder || ""
      case "multi-select":
        return Array.isArray(value) ? value.join(", ") : placeholder || ""
      default:
        return value || placeholder || ""
    }
  }

  return (
    <div
      className="relative min-w-0 w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="min-w-0 pr-8">{renderValue()}</div>
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
      <style jsx>{`
        .relative:hover .absolute {
          opacity: 1;
        }
      `}</style>
    </div>
  )
}
