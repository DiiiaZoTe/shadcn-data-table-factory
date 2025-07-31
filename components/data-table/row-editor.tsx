"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import { Save, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import type { DataTableShape } from "@/types/data-table"
import { TableCell } from "@/components/ui/table"

interface RowEditorProps<T> {
  row: T
  shape: DataTableShape<T>
  onSave: (row: T) => void
  onCancel: () => void
  columnOrder: string[]
}

export function RowEditor<T extends Record<string, any>>({
  row,
  shape,
  onSave,
  onCancel,
  columnOrder,
}: RowEditorProps<T>) {
  const [editedRow, setEditedRow] = useState<T>({ ...row })

  const handleFieldChange = (key: string, value: any) => {
    setEditedRow((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    onSave(editedRow)
  }

  const renderField = (key: string, config: NonNullable<DataTableShape<T>[keyof T]>) => {
    const value = editedRow[key as keyof T]

    if (config.editable === false) {
      switch (config.type) {
        case "boolean":
          return <Switch checked={value ?? false} disabled />
        case "date":
          return value ? new Date(value).toLocaleDateString() : config.placeholder || ""
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
            config.placeholder || ""
          )
        default:
          return value || config.placeholder || ""
      }
    }

    switch (config.type) {
      case "text":
        return (
          <Input
            value={value || ""}
            onChange={(e) => handleFieldChange(key, e.target.value)}
            placeholder={config.placeholder}
            className="h-8"
          />
        )

      case "number":
        return (
          <Input
            type="number"
            value={value || ""}
            onChange={(e) => handleFieldChange(key, Number(e.target.value))}
            placeholder={config.placeholder}
            className="h-8"
          />
        )

      case "boolean":
        return <Switch checked={value ?? false} onCheckedChange={(checked) => handleFieldChange(key, checked)} />

      case "select":
        return (
          <Select value={value || ""} onValueChange={(newValue) => handleFieldChange(key, newValue)}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder={config.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {config.options?.map((option) => (
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
            type="date"
            value={value || ""}
            onChange={(e) => handleFieldChange(key, e.target.value)}
            className="h-8"
          />
        )

      case "multi-select":
        return (
          <MultiSelect
            options={config.options || []}
            selected={Array.isArray(value) ? value : []}
            onChange={(selected) => handleFieldChange(key, selected)}
            placeholder={config.placeholder || "Select options..."}
          />
        )

      default:
        return null
    }
  }

  return (
    <>
      {/* Selection column - match the width and padding of normal rows */}
      <TableCell className="p-2 w-12">
        <div className="flex items-center justify-center">
          <Checkbox disabled className="opacity-50" />
        </div>
      </TableCell>

      {/* Data columns */}
      {columnOrder.map((key) => {
        const config = shape[key as keyof T]
        if (!config) return null

        return (
          <TableCell key={key} className="p-2 min-w-0">
            <div className="min-w-0">{renderField(key, config)}</div>
          </TableCell>
        )
      })}

      {/* Actions column */}
      <TableCell className="p-2">
        <div className="flex flex-col justify-center gap-1">
          <Button size="icon" onClick={handleSave} className="h-8 w-8 p-0">
            <Save className="size-4" />
          </Button>
          <Button size="icon" variant="destructive" onClick={onCancel} className="h-8 w-8 p-0">
            <X className="size-4" />
          </Button>
        </div>
      </TableCell>
    </>
  )
}
