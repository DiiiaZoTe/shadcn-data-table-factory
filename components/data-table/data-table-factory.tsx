"use client"

import { useState, useMemo } from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type VisibilityState,
  type SortingState,
  type ColumnFiltersState,
  type RowSelectionState,
} from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Search, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { DataTableProps } from "@/types/data-table"
import { ColumnFilter } from "./column-filters"
import { ColumnVisibilityControl } from "./column-visibility"
import type { DataTableShape } from "@/types/data-table"
import { HoverableCell } from "./hoverable-cell"
import { RowEditor } from "./row-editor"

export function DataTableFactory<T extends Record<string, any>>({
  data,
  shape,
  actions = [],
  editable = false,
  onSave,
  onSelectionChange,
  className,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnOrder, setColumnOrder] = useState<string[]>(Object.keys(shape).filter((key) => shape[key]))
  const [editingRowId, setEditingRowId] = useState<string | null>(null)

  // Create columns based on shape
  const columns = useMemo<ColumnDef<T>[]>(() => {
    const cols: ColumnDef<T>[] = []

    // Selection column with consistent width
    cols.push({
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center p-2 w-12">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 48, // Fixed width for selection column
    })

    // Helper function to create column config based on field type
    const createColumnConfig = (key: string, config: NonNullable<DataTableShape<T>[keyof T]>): ColumnDef<T> => {
      const baseConfig: ColumnDef<T> = {
        accessorKey: key,
        header: ({ column }) => {
          const canSort = config.sortable !== false
          return (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                {canSort ? (
                  <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-auto p-0 font-medium"
                  >
                    {config.label}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <span className="font-medium">{config.label}</span>
                )}
              </div>
              {config.filterable !== false && (
                <ColumnFilter column={column} type={config.type} options={config.options} />
              )}
            </div>
          )
        },
        filterFn: (row, id, value) => {
          const cellValue = row.getValue(id)
          if (!value || value === "all") return true

          switch (config.type) {
            case "boolean":
              return String(cellValue) === value
            case "select":
              return cellValue === value
            case "multi-select":
              // Handle array filter values for multi-select
              if (Array.isArray(value) && value.length > 0) {
                const cellArray = Array.isArray(cellValue) ? cellValue : []
                return value.some((filterVal) => cellArray.includes(filterVal))
              }
              return true
            default:
              return String(cellValue).toLowerCase().includes(String(value).toLowerCase())
          }
        },
      }

      // Type-specific cell rendering
      baseConfig.cell = ({ row, getValue }) => {
        const value = getValue()
        const rowId = row.id

        // If this row is being edited, don't render the hoverable cell
        if (editingRowId === rowId) {
          return null // Will be handled by RowEditor
        }

        return (
          <HoverableCell
            value={config.type === "boolean" ? (value ?? false) : value}
            type={config.type}
            options={config.options}
            placeholder={config.placeholder}
            editable={editable && config.editable !== false}
            render={config.render ? (val) => config.render!(val, row.original) : undefined}
            onSave={(newValue) => {
              const updatedRow = { ...row.original, [key]: newValue }
              onSave?.(updatedRow)
            }}
          />
        )
      }

      return baseConfig
    }

    // Data columns based on column order
    columnOrder.forEach((key) => {
      const config = shape[key as keyof T]
      if (!config) return
      cols.push(createColumnConfig(key, config))
    })

    // Actions column - add edit action if editable, then user actions
    const actionsToShow = [
      ...(editable
        ? [
            {
              label: "Edit",
              icon: <Edit className="h-4 w-4" />,
              onClick: (row: T, tableRow: any) => setEditingRowId(tableRow.id),
            },
          ]
        : []),
      ...actions,
    ]

    if (actionsToShow.length > 0) {
      cols.push({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          if (editingRowId === row.id) {
            return null // Will be handled by RowEditor
          }

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon"className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actionsToShow.map((action, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => {
                      // Pass both the original row data and the table row for actions that need the table row ID
                      if (action.label === "Edit") {
                        ;(action as any).onClick(row.original, row)
                      } else {
                        action.onClick(row.original)
                      }
                    }}
                  >
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        enableSorting: false,
        enableHiding: false,
      })
    }

    return cols
  }, [shape, actions, editable, onSave, columnOrder, editingRowId])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater
      setRowSelection(newSelection)

      // Calculate selected rows and call callback
      const selectedRowIndices = Object.keys(newSelection).filter((key) => newSelection[key])
      const selectedRows = selectedRowIndices.map((index) => data[Number.parseInt(index)])
      onSelectionChange?.(selectedRows)
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const config = shape[columnId as keyof T]
      if (config?.searchable === false) return true

      const value = row.getValue(columnId)
      return String(value).toLowerCase().includes(String(filterValue).toLowerCase())
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  // Update selection callback
  const availableColumns = Object.entries(shape)
    .filter(([_, config]) => config)
    .map(([key, config]) => ({ key, label: config!.label }))

  return (
    <div className={className}>
      {/* Controls */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search all columns..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-8 max-w-sm"
            />
          </div>
        </div>
        <ColumnVisibilityControl
          columns={availableColumns}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
          columnOrder={columnOrder}
          onColumnOrderChange={setColumnOrder}
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="p-2">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const isEditing = editingRowId === row.id

                return (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {isEditing ? (
                      <RowEditor
                        row={row.original}
                        shape={shape}
                        columnOrder={columnOrder}
                        onSave={(updatedRow) => {
                          onSave?.(updatedRow)
                          setEditingRowId(null)
                        }}
                        onCancel={() => setEditingRowId(null)}
                      />
                    ) : (
                      row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="p-2 min-w-0">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))
                    )}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Selection info */}
      {Object.keys(rowSelection).length > 0 && (
        <div className="flex-1 text-sm text-muted-foreground py-2">
          {Object.keys(rowSelection).length} of {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
      )}
    </div>
  )
}
