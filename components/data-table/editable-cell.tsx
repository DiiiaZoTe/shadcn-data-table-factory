"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
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

  useEffect(() => {
    setEditValue(value)
  }, [value])

  // Auto-focus on mount for non-boolean and non-multi-select fields
  useEffect(() => {
    if (type !== "boolean" && type !== "multi-select" && inputRef.current) {
      inputRef.current.focus()
    }
  }, [type])

  const handleSave = () => {
    onSave(editValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      setEditValue(value)
      onSave(value) // Cancel by saving original value
    }
  }

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
        <Input
          ref={inputRef}
          type="date"
          value={editValue || ""}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="h-8"
        />
      )

    case "multi-select":
      return (
        <MultiSelect
          options={options || []}
          selected={Array.isArray(editValue) ? editValue : []}
          onChange={(selected) => {
            setEditValue(selected)
            onSave(selected)
          }}
          placeholder={placeholder || "Select options..."}
        />
      )

    default:
      return <div>{value}</div>
  }
}
