import type { ReactNode } from "react"

/** type of the field */
export type DataTableFieldType = "text" | "number" | "date" | "boolean" | "select" | "multi-select" | "image" | "link"

/** Supported timezone identifiers */
export type SupportedTimezone =
  | "America/New_York"       // Eastern Time (ET)
  | "America/Chicago"        // Central Time (CT) 
  | "America/Denver"         // Mountain Time (MT)
  | "America/Los_Angeles"    // Pacific Time (PT)
  | "America/Phoenix"        // Mountain Standard Time (MST)
  | "America/Anchorage"      // Alaska Standard Time (AKST)
  | "Pacific/Honolulu"       // Hawaii Standard Time (HST)
  | "Europe/London"          // Greenwich Mean Time (GMT)
  | "Europe/Paris"           // Central European Time (CET)
  | "Europe/Berlin"          // Central European Time (CET)
  | "Europe/Rome"            // Central European Time (CET)
  | "Europe/Amsterdam"       // Central European Time (CET)
  | "Europe/Madrid"          // Central European Time (CET)
  | "Europe/Stockholm"       // Central European Time (CET)
  | "Asia/Tokyo"             // Japan Standard Time (JST)
  | "Asia/Shanghai"          // China Standard Time (CST)
  | "Asia/Hong_Kong"         // Hong Kong Time (HKT)
  | "Asia/Singapore"         // Singapore Time (SGT)
  | "Asia/Seoul"             // Korea Standard Time (KST)
  | "Asia/Kolkata"           // India Standard Time (IST)
  | "Asia/Dubai"             // Gulf Standard Time (GST)
  | "Australia/Sydney"       // Australian Eastern Daylight Time (AEDT)
  | "Australia/Melbourne"    // Australian Eastern Daylight Time (AEDT)
  | "Australia/Perth"        // Australian Western Standard Time (AWST)
  | "America/Toronto"        // Eastern Time (ET)
  | "America/Vancouver"      // Pacific Time (PT)
  | "America/Sao_Paulo"      // Brasília Time (BRT)
  | "America/Mexico_City"    // Central Standard Time (CST)
  | "Africa/Cairo"           // Eastern European Time (EET)
  | "Africa/Johannesburg"    // South Africa Standard Time (SAST)
  | "UTC"                    // Coordinated Universal Time (UTC)

/** Timezone constants for easier usage */
export const TIMEZONES = {
  // North America
  EASTERN: "America/New_York" as const,
  CENTRAL: "America/Chicago" as const,
  MOUNTAIN: "America/Denver" as const,
  PACIFIC: "America/Los_Angeles" as const,
  MOUNTAIN_NO_DST: "America/Phoenix" as const,
  ALASKA: "America/Anchorage" as const,
  HAWAII: "Pacific/Honolulu" as const,
  TORONTO: "America/Toronto" as const,
  VANCOUVER: "America/Vancouver" as const,
  SAO_PAULO: "America/Sao_Paulo" as const,
  MEXICO_CITY: "America/Mexico_City" as const,

  // Europe
  LONDON: "Europe/London" as const,
  PARIS: "Europe/Paris" as const,
  BERLIN: "Europe/Berlin" as const,
  ROME: "Europe/Rome" as const,
  AMSTERDAM: "Europe/Amsterdam" as const,
  MADRID: "Europe/Madrid" as const,
  STOCKHOLM: "Europe/Stockholm" as const,

  // Asia
  TOKYO: "Asia/Tokyo" as const,
  SHANGHAI: "Asia/Shanghai" as const,
  HONG_KONG: "Asia/Hong_Kong" as const,
  SINGAPORE: "Asia/Singapore" as const,
  SEOUL: "Asia/Seoul" as const,
  KOLKATA: "Asia/Kolkata" as const,
  DUBAI: "Asia/Dubai" as const,

  // Australia
  SYDNEY: "Australia/Sydney" as const,
  MELBOURNE: "Australia/Melbourne" as const,
  PERTH: "Australia/Perth" as const,

  // Africa
  CAIRO: "Africa/Cairo" as const,
  JOHANNESBURG: "Africa/Johannesburg" as const,

  // UTC
  UTC: "UTC" as const,
} as const;

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
    /** enables/disables sorting, defaults to false */
    sortable?: boolean
    /** enables/disables filtering, defaults to false */
    filterable?: boolean
    /** enables/disables global search, defaults to false */
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
  /** unique identifier for each row, if you do not have any, modify the data to add a unique id field */
  rowId: keyof T
  /** shape of the table - defines the columns and their properties */
  shape: DataTableShape<T>
  /** unique identifier for localStorage keys */
  tableName: string
  /** is the data loading? */
  isLoading?: boolean
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
  /** enables/disables all filtering, defaults to false */
  filterable?: boolean
  /** enables/disables all sorting, defaults to false */
  sortable?: boolean
  /** enables/disables global search, defaults to false */
  searchable?: boolean
  /** enables/disables column hiding, defaults to false */
  hideable?: boolean
  /** enables/disables column reordering, defaults to false */
  reorderable?: boolean
  /** enables/disables inner borders for table, defaults to false */
  withBorders?: boolean
  /** enables/disables excel export functionality, defaults to false */
  exportable?: boolean
  /** timezone for all date fields in the table - if not provided, uses user's local timezone */
  timezone?: SupportedTimezone
}

/** visibility of the columns */
export type ColumnVisibility = Record<string, boolean>
