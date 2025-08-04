import type { ReactNode } from "react"

/** type of the field */
export type DataTableFieldType = "text" | "number" | "date" | "boolean" | "select" | "multi-select"

/** shape of the table - defines the columns and their properties */
export type DataTableShape<T> = {
  [K in keyof T]?: {
    /** label to be displayed in the table */
    label: string
    /** type of the field */
    type: DataTableFieldType
    /** options for select and multi-select */
    options?: string[]
    /** enables/disables row editing, defaults to true */
    editable?: boolean
    /** enables/disables sorting, defaults to true */
    sortable?: boolean
    /** enables/disables filtering, defaults to true */
    filterable?: boolean
    /** enables/disables global search, defaults to true */
    searchable?: boolean
    /** placeholder to be displayed when no value is provided */
    placeholder?: string
    /** custom render function */
    render?: (value: T[K], row: T) => ReactNode
  }
}

/** action to be displayed in the table */
export type DataTableAction<T> = {
  /** label to be displayed in the action */
  label: string
  /** callback function to be called when the action is clicked */
  onClick: (row: T) => void
  /** icon to be displayed in the action */
  icon?: ReactNode
  /** class name for the action */
  className?: string
}

/** pagination configuration */
export type DataTablePaginationConfig = {
  /** enables/disables pagination, defaults to true */
  enabled?: boolean
  /** default page size, defaults to 25 */
  defaultPageSize?: number
  /** page size options, defaults to [50, 100] (defaultPageSize is always added) */
  pageSizeOptions?: number[]
}

/** props for the DataTable component */
export type DataTableProps<T> = {
  /** data to be displayed in the table */
  data: T[]
  /** shape of the table - defines the columns and their properties */
  shape: DataTableShape<T>
  /** unique identifier for localStorage keys */
  tableName: string
  /** actions to be displayed in the table */
  actions?: DataTableAction<T>[]
  /** enables/disables row editing */
  editable?: boolean
  /** callback function to be called when a row is saved */
  onRowSave?: (row: T) => void
  /** callback function to be called when a row is selected */
  onSelectionChange?: (selectedRows: T[]) => void
  /** pagination configuration */
  pagination?: DataTablePaginationConfig
  /** class name for the table */
  className?: string
  /** enables localStorage persistence for table state, defaults to false */
  persistStorage?: boolean
  /** optional custom loading UI for table content area when persistStorage is true and component hasn't mounted */
  loadingFallback?: ReactNode
  /** enables/disables all filtering, defaults to true */
  filterable?: boolean
  /** enables/disables all sorting, defaults to true */
  sortable?: boolean
  /** enables/disables global search, defaults to true */
  searchable?: boolean
  /** enables/disables column hiding, defaults to true */
  hideable?: boolean
  /** enables/disables column reordering, defaults to true */
  reorderable?: boolean
  /** enables/disables inner borders for table, defaults to false */
  withBorders?: boolean
}

/** visibility of the columns */
export type ColumnVisibility = Record<string, boolean>
