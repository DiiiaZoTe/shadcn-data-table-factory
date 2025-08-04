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
  className?: string
}

export type DataTablePaginationConfig = {
  enabled?: boolean // true by default
  defaultPageSize?: number // 25 by default
  pageSizeOptions?: number[] // [50, 100] by default (defaultPageSize is always added)
}

export type DataTableProps<T> = {
  data: T[]
  shape: DataTableShape<T>
  tableName: string // Required - used as unique identifier for localStorage keys
  actions?: DataTableAction<T>[]
  editable?: boolean
  onRowSave?: (row: T) => void
  onSelectionChange?: (selectedRows: T[]) => void
  pagination?: DataTablePaginationConfig
  className?: string
  persistStorage?: boolean // false by default - enables localStorage persistence for table state
  loadingFallback?: ReactNode // optional custom loading UI for table content area when persistStorage is true and component hasn't mounted
  // Global feature toggles - override individual column settings
  filterable?: boolean // true by default - enables/disables all filtering
  sortable?: boolean // true by default - enables/disables all sorting
  searchable?: boolean // true by default - enables/disables global search
  hideable?: boolean // true by default - enables/disables column hiding
  reorderable?: boolean // true by default - enables/disables column reordering
}

export type ColumnVisibility = Record<string, boolean>
