"use client"

import { memo } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit } from "lucide-react"
import type { DataTableAction } from "@/types/data-table"

interface ActionsCellProps<T> {
  row: T
  actions: DataTableAction<T>[]
  editable: boolean
  onEdit: () => void
}

// Separate memoized component for actions
export const ActionsCell = memo(
  function ActionsCell<T>({ row, actions, editable, onEdit }: ActionsCellProps<T>) {
    if (!editable && actions.length === 0) return null

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {editable && (
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          )}
          {actions.map((action, index) => (
            <DropdownMenuItem key={index} onClick={() => action.onClick(row)}>
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
  (prevProps, nextProps) => {
    // Only re-render if row data actually changed
    return (
      prevProps.row === nextProps.row &&
      prevProps.editable === nextProps.editable &&
      prevProps.actions.length === nextProps.actions.length
    )
  },
)
