"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import type { DataTableFieldType } from "@/types/data-table"

interface EditableCellProps<T> {
  value: any
  type: DataTableFieldType
  options?: string[]
  onSave: (value: any) => void
  placeholder?: string
}

export function EditableCell<T>({ value, type, options, onSave, placeholder }: EditableCellProps<T>) {
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInteractingRef = useRef(false)

  useEffect(() => {
    setEditValue(value)
  }, [value])

  // Auto-focus on mount for non-boolean and non-multi-select fields
  useEffect(() => {
    if (type !== "boolean" && type !== "multi-select" && type !== "date" && inputRef.current) {
      inputRef.current.focus()
    }
  }, [type])

  const handleSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }
    onSave(editValue)
  }, [editValue, onSave])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      setEditValue(value)
      onSave(value) // Cancel by saving original value
    }
  }

  // Handle blur with a delay for complex components
  const handleBlur = useCallback(
    (e: React.FocusEvent) => {
      // For complex components, use a timeout to allow for internal focus changes
      if (type === "multi-select" || type === "date") {
        // Clear any existing timeout
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current)
        }

        // Set a timeout to check if focus is still within the component
        saveTimeoutRef.current = setTimeout(() => {
          // Check if the currently focused element is still within our container
          const activeElement = document.activeElement
          const isStillFocused =
            containerRef.current &&
            (containerRef.current.contains(activeElement) ||
              // Also check for popover content that might be rendered outside
              activeElement?.closest('[role="dialog"]') ||
              activeElement?.closest("[data-radix-popper-content-wrapper]"))

          if (!isStillFocused && !isInteractingRef.current) {
            handleSave()
          }
          saveTimeoutRef.current = null
        }, 150) // Small delay to allow for focus transitions
      } else {
        // For simple components, save immediately on blur
        if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
          handleSave()
        }
      }
    },
    [type, handleSave],
  )

  // Handle mouse interactions to prevent premature saves
  const handleMouseDown = useCallback(() => {
    isInteractingRef.current = true
  }, [])

  const handleMouseUp = useCallback(() => {
    // Reset interaction flag after a short delay
    setTimeout(() => {
      isInteractingRef.current = false
    }, 100)
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  switch (type) {
    case "text":
      return (
        <Input
          ref={inputRef}
          value={editValue || ""}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="h-8"
          placeholder={placeholder}
        />
      )

    case "number":
      return (
        <Input
          ref={inputRef}
          type="number"
          value={editValue || ""}
          onChange={(e) => setEditValue(Number(e.target.value))}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="h-8"
          placeholder={placeholder}
        />
      )

    case "boolean":
      return (
        <Switch
          checked={editValue ?? false}
          onCheckedChange={(checked) => {
            setEditValue(checked)
            onSave(checked)
          }}
        />
      )

    case "select":
      return (
        <Select
          value={editValue || ""}
          onValueChange={(value) => {
            setEditValue(value)
            onSave(value)
          }}
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    case "date":
      return (
        <div ref={containerRef} onBlur={handleBlur} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
          <DateTimePicker
            value={editValue ? new Date(editValue) : undefined}
            onChange={(date) => {
              const timestamp = date ? date.getTime() : null
              setEditValue(timestamp)
              // Don't auto-save on every change for date picker
            }}
            compact
            showLabels={false}
          />
        </div>
      )

    case "multi-select":
      return (
        <div ref={containerRef} onBlur={handleBlur} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
          <MultiSelect
            options={options || []}
            selected={Array.isArray(editValue) ? editValue : []}
            onChange={(selected) => {
              setEditValue(selected)
              // Don't auto-save on every change for multi-select
            }}
            placeholder={placeholder || "Select options..."}
          />
        </div>
      )

    default:
      return <div>{value}</div>
  }
}
