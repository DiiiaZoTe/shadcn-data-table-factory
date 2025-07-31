import type { ReactNode } from "react"

export type DataTableFieldType = "text" | "number" | "date" | "boolean" | "select" | "multi-select"

export type DataTableShape<T> = {
  [K in keyof T]?: {
    label: string
    type: DataTableFieldType
    options?: string[] // for select and multi-select
    editable?: boolean // true by default
    sortable?: boolean // true by default
    filterable?: boolean // true by default
    searchable?: boolean // true by default
    placeholder?: string // when no value is provided
    render?: (value: T[K], row: T) => ReactNode // custom render function
  }
}

export type DataTableAction<T> = {
  label: string
  onClick: (row: T) => void
  icon?: ReactNode
}

export type DataTableProps<T> = {
  data: T[]
  shape: DataTableShape<T>
  actions?: DataTableAction<T>[]
  editable?: boolean
  onSave?: (row: T) => void
  onSelectionChange?: (selectedRows: T[]) => void
  className?: string
}

export type ColumnVisibility = Record<string, boolean>
