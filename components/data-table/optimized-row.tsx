"use client"

import { memo } from "react"
import { TableCell, TableRow } from "@/components/ui/table"
import { OptimizedCell } from "./optimized-cell"
import { SelectionCell } from "./selection-cell"
import { ActionsCell } from "./actions-cell"
import type { DataTableShape, DataTableAction, ColumnVisibility } from "@/types/data-table"
import type { JSX } from "react"

interface OptimizedRowProps<T> {
  row: T
  rowId: string
  isSelected: boolean
  shape: DataTableShape<T>
  columnOrder: string[]
  columnVisibility: ColumnVisibility
  actions: DataTableAction<T>[]
  editable: boolean
  onToggleSelect: () => void
  onSave?: (row: T) => void
  onEdit: () => void
}

export const OptimizedRow = memo(
  function OptimizedRow<T extends Record<string, any>>({
    row,
    rowId,
    isSelected,
    shape,
    columnOrder,
    columnVisibility,
    actions,
    editable,
    onToggleSelect,
    onSave,
    onEdit,
  }: OptimizedRowProps<T>) {
    // Filter visible columns based on columnVisibility and columnOrder
    const visibleColumns = columnOrder.filter((key) => {
      const config = shape[key as keyof T]
      if (!config) return false
      // Column is visible if not explicitly hidden
      return columnVisibility[key] !== false
    })

    return (
      <TableRow data-state={isSelected ? "selected" : undefined}>
        {/* Selection column - fixed width, always visible */}
        <TableCell className="p-2 w-12 min-w-12 max-w-12">
          <div className="flex items-center justify-center w-8 min-w-8 max-w-8 mx-auto">
            <SelectionCell isSelected={isSelected} onToggle={onToggleSelect} />
          </div>
        </TableCell>

        {/* Data columns - only render visible columns in correct order */}
        {visibleColumns.map((key) => {
          const config = shape[key as keyof T]
          if (!config) return null

          return (
            <TableCell key={key} className="p-2 min-w-0">
              <OptimizedCell
                value={row[key as keyof T]}
                type={config.type}
                options={config.options}
                placeholder={config.placeholder}
                editable={editable && config.editable !== false}
                render={config.render ? (val) => config.render!(val, row) : undefined}
                onSave={(newValue) => {
                  const updatedRow = { ...row, [key]: newValue }
                  onSave?.(updatedRow)
                }}
                isEditing={false}
              />
            </TableCell>
          )
        })}

        {/* Actions column - fixed width (52px content + 16px padding = 68px total) */}
        {(editable || actions.length > 0) && (
          <TableCell className="p-2 w-[68px] min-w-[68px] max-w-[68px]">
            <div className="flex items-center justify-center w-[52px] min-w-[52px] max-w-[52px] mx-auto">
              <ActionsCell row={row} actions={actions} editable={editable} onEdit={onEdit} />
            </div>
          </TableCell>
        )}
      </TableRow>
    )
  },
  (prevProps, nextProps) => {
    // Include columnVisibility and columnOrder in comparison
    return (
      prevProps.row === nextProps.row &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.rowId === nextProps.rowId &&
      JSON.stringify(prevProps.columnOrder) === JSON.stringify(nextProps.columnOrder) &&
      JSON.stringify(prevProps.columnVisibility) === JSON.stringify(nextProps.columnVisibility)
    )
  },
) as <T extends Record<string, any>>(props: OptimizedRowProps<T>) => JSX.Element
