"use client"

import type { Column } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import type { DataTableFieldType } from "@/types/data-table"

interface ColumnFilterProps<T> {
  column: Column<T, unknown>
  type: DataTableFieldType
  options?: string[]
}

export function ColumnFilter<T>({ column, type, options }: ColumnFilterProps<T>) {
  const filterValue = column.getFilterValue() as string | string[]

  switch (type) {
    case "text":
      return (
        <Input
          placeholder="Filter..."
          value={(filterValue as string) ?? ""}
          onChange={(event) => column.setFilterValue(event.target.value)}
          className="h-8 w-full"
        />
      )

    case "number":
      return (
        <Input
          type="number"
          placeholder="Filter..."
          value={(filterValue as string) ?? ""}
          onChange={(event) => column.setFilterValue(event.target.value)}
          className="h-8 w-full"
        />
      )

    case "select":
      return (
        <Select
          value={(filterValue as string) ?? "all"}
          onValueChange={(value) => column.setFilterValue(value === "all" ? "" : value)}
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
          onChange={(selected) => column.setFilterValue(selected.length > 0 ? selected : "")}
          placeholder="Filter options..."
          className="w-full"
        />
      )

    case "boolean":
      return (
        <Select
          value={(filterValue as string) ?? "all"}
          onValueChange={(value) => column.setFilterValue(value === "all" ? "" : value)}
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
          onChange={(event) => column.setFilterValue(event.target.value)}
          className="h-8 w-full"
        />
      )

    default:
      return null
  }
}
