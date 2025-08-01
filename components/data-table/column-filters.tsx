"use client"

import { useState, useEffect } from "react"
import type { Column } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import type { DataTableFieldType } from "@/types/data-table"

interface ColumnFilterProps<T> {
  column: Column<T, unknown>
  type: DataTableFieldType
  options?: string[]
  filterable?: boolean
}

export function ColumnFilter<T>({ column, type, options, filterable = true }: ColumnFilterProps<T>) {
  const filterValue = column.getFilterValue() as string | string[]
  const [localValue, setLocalValue] = useState<string | string[]>(filterValue || "")
  const debouncedValue = useDebouncedValue(localValue, 300)

  // Update local value when filter value changes externally
  useEffect(() => {
    setLocalValue(filterValue || "")
  }, [filterValue])

  // Apply debounced value to column filter
  useEffect(() => {
    if (filterable && (type === "text" || type === "number")) {
      column.setFilterValue(debouncedValue === "" ? undefined : debouncedValue)
    }
  }, [debouncedValue, column, type, filterable])

  switch (type) {
    case "text":
      return (
        <Input
          placeholder="Filter..."
          value={(localValue as string) ?? ""}
          onChange={(event) => filterable && setLocalValue(event.target.value)}
          disabled={!filterable}
          className="h-8 w-full"
        />
      )

    case "number":
      return (
        <Input
          type="number"
          placeholder="Filter..."
          value={(localValue as string) ?? ""}
          onChange={(event) => filterable && setLocalValue(event.target.value)}
          disabled={!filterable}
          className="h-8 w-full"
        />
      )

    case "select":
      return (
        <Select
          value={(filterValue as string) ?? "all"}
          onValueChange={(value) => filterable && column.setFilterValue(value === "all" ? "" : value)}
          disabled={!filterable}
        >
          <SelectTrigger className="h-8 w-full">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    case "multi-select":
      return (
        <MultiSelect
          options={options || []}
          selected={Array.isArray(filterValue) ? filterValue : []}
          onChange={(selected) => filterable && column.setFilterValue(selected.length > 0 ? selected : "")}
          placeholder="Filter options..."
          className="w-full"
        />
      )

    case "boolean":
      return (
        <Select
          value={(filterValue as string) ?? "all"}
          onValueChange={(value) => filterable && column.setFilterValue(value === "all" ? "" : value)}
          disabled={!filterable}
        >
          <SelectTrigger className="h-8 w-full">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">True</SelectItem>
            <SelectItem value="false">False</SelectItem>
          </SelectContent>
        </Select>
      )

    case "date":
      return (
        <Input
          type="date"
          value={(filterValue as string) ?? ""}
          onChange={(event) => filterable && column.setFilterValue(event.target.value)}
          disabled={!filterable}
          className="h-8 w-full"
        />
      )

    default:
      return <Input placeholder="Filter..." disabled className="h-8 w-full" />
  }
}
