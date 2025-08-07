"use client";

import { useState, useEffect } from "react";
import type { Column } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type {
  DataTableFieldType,
  CustomCellConfig,
} from "@/components/data-table/types";

interface ColumnFilterProps<T> {
  column: Column<T, unknown>;
  type: DataTableFieldType;
  options?: string[];
  filterable?: boolean;
  customConfig?: CustomCellConfig<T, any>;
}

export function ColumnFilter<T>({
  column,
  type,
  options,
  filterable = true,
  customConfig,
}: ColumnFilterProps<T>) {
  const filterValue = column.getFilterValue() as string | string[];
  const [localValue, setLocalValue] = useState<string | string[]>(
    filterValue || ""
  );
  const debouncedValue = useDebouncedValue(localValue, 300);

  // Update local value when filter value changes externally
  useEffect(() => {
    setLocalValue(filterValue || "");
  }, [filterValue]);

  // Apply debounced value to column filter
  useEffect(() => {
    if (
      filterable &&
      (type === "text" ||
        type === "number" ||
        type === "image" ||
        type === "link" ||
        (type === "custom" && !customConfig?.renderFilter)) // Add this condition
    ) {
      column.setFilterValue(debouncedValue === "" ? undefined : debouncedValue);
    }
  }, [debouncedValue, column, type, filterable]);

  switch (type) {
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
      );

    case "select":
      return (
        <Select
          value={(filterValue as string) ?? "all"}
          onValueChange={(value) =>
            filterable && column.setFilterValue(value === "all" ? "" : value)
          }
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
      );

    case "multi-select":
      return (
        <MultiSelect
          options={options || []}
          selected={Array.isArray(filterValue) ? filterValue : []}
          onChange={(selected) =>
            filterable &&
            column.setFilterValue(selected.length > 0 ? selected : "")
          }
          placeholder="Filter options..."
          className="w-full"
          disabled={!filterable}
        />
      );

    case "boolean":
      return (
        <Select
          value={(filterValue as string) ?? "all"}
          onValueChange={(value) =>
            filterable && column.setFilterValue(value === "all" ? "" : value)
          }
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
      );

    case "date":
      return (
        <Input
          type="date"
          value={(filterValue as string) ?? ""}
          onChange={(event) =>
            filterable && column.setFilterValue(event.target.value)
          }
          disabled={!filterable}
          className="h-8 w-full"
        />
      );

    case "image":
      return (
        <Input
          placeholder="Filter by URL..."
          value={(localValue as string) ?? ""}
          onChange={(event) => filterable && setLocalValue(event.target.value)}
          disabled={!filterable}
          className="h-8 w-full"
        />
      );

    case "link":
      return (
        <Input
          placeholder="Filter by URL..."
          value={(localValue as string) ?? ""}
          onChange={(event) => filterable && setLocalValue(event.target.value)}
          disabled={!filterable}
          className="h-8 w-full"
        />
      );

    case "custom":
      // If custom renderFilter is provided, use it
      if (customConfig?.renderFilter) {
        return customConfig.renderFilter(
          filterValue,
          (value) => filterable && column.setFilterValue(value)
        );
      }
      // Otherwise, default to text input
      return (
        <Input
          placeholder="Filter..."
          value={(localValue as string) ?? ""}
          onChange={(event) => filterable && setLocalValue(event.target.value)}
          disabled={!filterable}
          className="h-8 w-full"
        />
      );

    case "link":
    case "image":
    case "text":
    default:
      return (
        <Input
          placeholder="Filter..."
          value={(localValue as string) ?? ""}
          onChange={(event) => filterable && setLocalValue(event.target.value)}
          disabled={!filterable}
          className="h-8 w-full"
        />
      );
  }
}
