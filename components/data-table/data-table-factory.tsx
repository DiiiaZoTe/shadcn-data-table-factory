"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  type VisibilityState,
  type SortingState,
  type ColumnFiltersState,
  type RowSelectionState,
  type PaginationState,
} from "@tanstack/react-table";
import {
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Search,
  X,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { DataTableProps, DataTableAction } from "@/types/data-table";
import { ColumnFilter } from "./column-filters";
import { ColumnControls } from "./column-controls";
import { DataTablePagination } from "./pagination";
import { DataTableRow, RowEditor } from "./row";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";

// Stable empty array to prevent infinite re-renders
const EMPTY_ACTIONS: DataTableAction<any>[] = [];

export function DataTableFactory<T extends Record<string, any>>({
  data,
  shape,
  tableName,
  actions = EMPTY_ACTIONS,
  editable = false,
  onRowSave,
  onSelectionChange,
  pagination = {},
  className,
  persistStorage = false,
  loadingFallback,
  filterable = true,
  sortable = true,
  searchable = true,
  hideable = true,
  reorderable = true,
}: DataTableProps<T>) {
  // Pagination configuration with defaults
  const paginationConfig = {
    enabled: pagination.enabled ?? true,
    defaultPageSize: pagination.defaultPageSize ?? 25,
    pageSizeOptions: pagination.pageSizeOptions ?? [50, 100],
  };

  // Create complete page size options (always include default)
  const allPageSizeOptions = Array.from(
    new Set([
      paginationConfig.defaultPageSize,
      ...paginationConfig.pageSizeOptions,
    ])
  ).sort((a, b) => a - b);

  // Prevent hydration mismatches when using localStorage
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Compute initial values
  const initialColumnOrder = Object.keys(shape).filter((key) => shape[key]);
  const initialPaginationState: PaginationState = {
    pageIndex: 0,
    pageSize: paginationConfig.defaultPageSize,
  };

  // Always call all hooks (React hooks rule), then decide which values to use
  const [sortingStorage, setSortingStorage] = useLocalStorage<SortingState>(
    `${tableName}-sorting`,
    []
  );
  const [sortingState, setSortingState] = useState<SortingState>([]);
  const [sorting, setSorting] = persistStorage
    ? [sortingStorage, setSortingStorage]
    : [sortingState, setSortingState];

  const [columnFiltersStorage, setColumnFiltersStorage] =
    useLocalStorage<ColumnFiltersState>(`${tableName}-columnFilters`, []);
  const [columnFiltersState, setColumnFiltersState] =
    useState<ColumnFiltersState>([]);
  const [columnFilters, setColumnFilters] = persistStorage
    ? [columnFiltersStorage, setColumnFiltersStorage]
    : [columnFiltersState, setColumnFiltersState];

  const [columnVisibilityStorage, setColumnVisibilityStorage] =
    useLocalStorage<VisibilityState>(`${tableName}-columnVisibility`, {});
  const [columnVisibilityState, setColumnVisibilityState] =
    useState<VisibilityState>({});
  const [columnVisibility, setColumnVisibility] = persistStorage
    ? [columnVisibilityStorage, setColumnVisibilityStorage]
    : [columnVisibilityState, setColumnVisibilityState];

  const [globalFilterStorage, setGlobalFilterStorage] = useLocalStorage<string>(
    `${tableName}-globalFilter`,
    ""
  );
  const [globalFilterState, setGlobalFilterState] = useState<string>("");
  const [globalFilter, setGlobalFilter] = persistStorage
    ? [globalFilterStorage, setGlobalFilterStorage]
    : [globalFilterState, setGlobalFilterState];

  const [columnOrderStorage, setColumnOrderStorage] = useLocalStorage<string[]>(
    `${tableName}-columnOrder`,
    initialColumnOrder
  );
  const [columnOrderState, setColumnOrderState] =
    useState<string[]>(initialColumnOrder);
  const [columnOrder, setColumnOrder] = persistStorage
    ? [columnOrderStorage, setColumnOrderStorage]
    : [columnOrderState, setColumnOrderState];

  const [paginationStateStorage, setPaginationStateStorage] =
    useLocalStorage<PaginationState>(
      `${tableName}-paginationState`,
      initialPaginationState
    );
  const [paginationStateState, setPaginationStateState] =
    useState<PaginationState>(initialPaginationState);
  const [paginationState, setPaginationState] = persistStorage
    ? [paginationStateStorage, setPaginationStateStorage]
    : [paginationStateState, setPaginationStateState];

  // Non-persistent state (always use regular useState)
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  // Use ref to store the callback to avoid dependency issues
  const onSelectionChangeRef = useRef(onSelectionChange);
  onSelectionChangeRef.current = onSelectionChange;

  // Debounce global filter for better performance
  const debouncedGlobalFilter = useDebouncedValue(globalFilter, 300);

  // Custom column filter function with memoization
  const columnFilterFn = useCallback(
    (row: any, id: string, value: any) => {
      const config = shape[id as keyof T];
      if (!config) return true;

      // If global filtering is disabled, don't filter anything
      if (!filterable) return true;

      // If this specific column has filtering disabled, don't filter
      if (config.filterable === false) return true;

      const cellValue = row.getValue(id);
      if (!value || value === "all") return true;

      switch (config.type) {
        case "boolean":
          return String(cellValue) === value;
        case "select":
          return cellValue === value;
        case "multi-select":
          if (Array.isArray(value) && value.length > 0) {
            const cellArray = Array.isArray(cellValue) ? cellValue : [];
            return value.some((filterVal: string) =>
              cellArray.includes(filterVal)
            );
          }
          return true;
        case "text":
        case "number":
        default:
          const cellStr = String(cellValue).toLowerCase();
          const valueStr = String(value).toLowerCase();
          return cellStr.includes(valueStr);
      }
    },
    [shape, filterable]
  );

  // Custom global filter function
  const globalFilterFn = useCallback(
    (row: any, columnId: string, filterValue: string) => {
      // If global search is disabled, don't filter anything
      if (!searchable) return true;

      const config = shape[columnId as keyof T];
      if (config?.searchable === false) return true;

      const value = row.getValue(columnId);
      const searchStr = String(value).toLowerCase();
      const filterStr = String(filterValue).toLowerCase();
      return searchStr.includes(filterStr);
    },
    [shape, searchable]
  );

  // Function to calculate and call onSelectionChange
  const handleSelectionChange = useCallback(
    (newSelection: RowSelectionState, tableInstance: any) => {
      if (onSelectionChangeRef.current) {
        const selectedRowIndices = Object.keys(newSelection).filter(
          (key) => newSelection[key]
        );
        const selectedRows: T[] = [];

        // Get the current visible rows from the table
        const currentRows = tableInstance.getRowModel().rows;

        selectedRowIndices.forEach((index) => {
          const numIndex = Number.parseInt(index);
          if (paginationConfig.enabled) {
            // For paginated tables, use the current page rows
            const row = currentRows[numIndex];
            if (row?.original) {
              selectedRows.push(row.original);
            }
          } else {
            // For non-paginated tables, use the filtered rows
            const filteredRows = tableInstance.getFilteredRowModel().rows;
            const row = filteredRows[numIndex];
            if (row?.original) {
              selectedRows.push(row.original);
            }
          }
        });

        onSelectionChangeRef.current(selectedRows);
      }
    },
    [paginationConfig.enabled]
  );

  // Simplified columns - only for TanStack Table structure, not rendering
  const columns = useMemo<ColumnDef<T>[]>(() => {
    const cols: ColumnDef<T>[] = [];

    // Selection column - only add if onSelectionChange is provided
    if (onSelectionChange) {
      cols.push({
        id: "select",
        header: ({ table }) => (
          <div className="flex items-center justify-center w-8 min-w-8 max-w-8 mx-auto">
            <Checkbox
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
              aria-label="Select all"
            />
          </div>
        ),
        cell: () => null, // We handle this in OptimizedRow
        enableSorting: false,
        enableHiding: false,
        size: 48, // 48px = w-12
        minSize: 48,
        maxSize: 48,
      });
    }

    // Data columns - use columnOrder for proper ordering
    columnOrder.forEach((key) => {
      const config = shape[key as keyof T];
      if (!config) return;

      cols.push({
        id: key, // Use key as id for proper column identification
        accessorKey: key,
        header: ({ column }) => {
          const canSort = sortable && config.sortable !== false;
          const sortedIndex = sorting.findIndex((sort) => sort.id === key);
          const sortDirection =
            sortedIndex >= 0 ? sorting[sortedIndex].desc : null;

          const hasFilter = filterable && config.filterable !== false;
          const anyColumnHasFilter =
            filterable &&
            Object.values(shape).some((config) => config.filterable !== false);

          return (
            <div className="flex flex-col">
              <div className="flex items-center gap-2 min-h-[20px]">
                {canSort ? (
                  <Button
                    variant="ghost"
                    onClick={(e) => {
                      const isMultiSort = e.shiftKey || e.ctrlKey || e.metaKey;
                      if (isMultiSort) {
                        column.toggleSorting(
                          column.getIsSorted() === "asc",
                          true
                        );
                      } else {
                        column.toggleSorting(
                          column.getIsSorted() === "asc",
                          false
                        );
                      }
                    }}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    <span className="mr-2">{config.label}</span>
                    <div className="flex items-center gap-1">
                      {sortDirection === null ? (
                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                      ) : sortDirection ? (
                        <ArrowDown className="h-4 w-4" />
                      ) : (
                        <ArrowUp className="h-4 w-4" />
                      )}
                      {sortedIndex >= 0 && sorting.length > 1 && (
                        <Badge
                          variant="secondary"
                          className="h-5 w-5 p-0 text-xs flex items-center justify-center"
                        >
                          {sortedIndex + 1}
                        </Badge>
                      )}
                    </div>
                  </Button>
                ) : (
                  <span className="font-medium">{config.label}</span>
                )}
              </div>
              {/* Add spacing for alignment if any column has filters */}
              {anyColumnHasFilter && (
                <div className="mt-2">
                  {hasFilter ? (
                    <ColumnFilter
                      column={column}
                      type={config.type}
                      options={config.options}
                      filterable={true}
                    />
                  ) : (
                    <div className="h-8" />
                  )}
                </div>
              )}
            </div>
          );
        },
        cell: () => null, // We handle this in DataTableRow
        filterFn: columnFilterFn,
      });
    });

    // Actions column - fixed width (52px content + 16px padding = 68px total)
    if (editable || actions.length > 0) {
      cols.push({
        id: "actions",
        header: () => {
          const anyColumnHasFilter =
            filterable &&
            Object.values(shape).some((config) => config.filterable !== false);

          return (
            <div className="flex flex-col">
              <div className="flex items-center gap-2 min-h-[20px]">
                <span className="font-medium">Actions</span>
              </div>
              {/* Add spacing only if other columns have filters for alignment */}
              {anyColumnHasFilter && <div className="mt-2 h-8" />}
            </div>
          );
        },
        cell: () => null, // We handle this in DataTableRow
        enableSorting: false,
        enableHiding: false,
        size: 68, // 68px total (52px content + 16px padding)
        minSize: 68,
        maxSize: 68,
      });
    }

    return cols;
  }, [
    shape,
    actions,
    editable,
    columnOrder,
    sorting,
    columnFilterFn,
    sortable,
    filterable,
    onSelectionChange,
  ]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: paginationConfig.enabled
      ? getPaginationRowModel()
      : undefined,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updater) => {
      const newSelection =
        typeof updater === "function" ? updater(rowSelection) : updater;
      setRowSelection(newSelection);

      // Call the selection change handler immediately
      setTimeout(() => {
        handleSelectionChange(newSelection, table);
      }, 0);
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn,
    onPaginationChange: paginationConfig.enabled
      ? setPaginationState
      : undefined,
    enableMultiSort: true,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter: debouncedGlobalFilter,
      ...(paginationConfig.enabled && { pagination: paginationState }),
    },
  });

  // Create row toggle function that works with TanStack Table
  const createRowToggle = useCallback(
    (rowId: string) => {
      return () => {
        // Use TanStack Table's row toggle method to ensure callbacks are triggered
        const row = table.getRowModel().rows.find((r) => r.id === rowId);
        if (row) {
          row.toggleSelected();
        }
      };
    },
    [table]
  );

  // Create edit handler function
  const createEditHandler = useCallback((rowId: string) => {
    return () => setEditingRowId(rowId);
  }, []);

  const availableColumns = Object.entries(shape)
    .filter(([_, config]) => config)
    .map(([key, config]) => ({ key, label: config!.label }));

  const clearSorting = () => {
    setSorting([]);
  };

  const removeSortColumn = (columnId: string) => {
    setSorting((prev) => prev.filter((sort) => sort.id !== columnId));
  };

  // Prevent hydration mismatch by not rendering until mounted (when using localStorage)
  if (persistStorage && !isMounted) {
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        {/* Controls Skeleton */}
        <div className="flex items-center justify-between gap-2">
          {searchable && <Skeleton className="h-10 w-52" />}
          {(hideable || reorderable) && (
            <Skeleton className="h-10 w-10 md:w-32 ml-auto" />
          )}
        </div>

        {/* Sorting Status Skeleton */}
        {sortable && <Skeleton className="h-8 w-full" />}

        {/* Table Skeleton */}
        {loadingFallback ? (
          loadingFallback
        ) : (
          <Skeleton className="h-full w-full flex-1 rounded-md" />
        )}

        {/* Pagination Skeleton */}
        {paginationConfig.enabled && (
          <div className="flex flex-col gap-4 items-center md:flex-row md:items-center md:justify-between">
            <Skeleton className="h-8 w-[360px]" />
            <Skeleton className="h-8 w-56" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {searchable && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search all columns..."
                value={globalFilter ?? ""}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="pl-9 max-w-sm text-sm"
              />
            </div>
          )}
        </div>
        {(hideable || reorderable) && (
          <ColumnControls
            columns={availableColumns}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={setColumnVisibility}
            columnOrder={columnOrder}
            onColumnOrderChange={setColumnOrder}
            hideable={hideable}
            reorderable={reorderable}
          />
        )}
      </div>

      {/* Sorting Status */}
      {sortable &&
        (sorting.length > 0 ? (
          <div className="flex items-center gap-2">
            <div className="flex flex-wrap gap-1">
              {sorting.map((sort, index) => {
                const column = availableColumns.find(
                  (col) => col.key === sort.id
                );
                return (
                  <Badge
                    key={sort.id}
                    variant="outline"
                    className="text-xs flex items-center gap-1"
                  >
                    {column?.label} {sort.desc ? "↓" : "↑"}
                    {sorting.length > 1 && <span>({index + 1})</span>}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => removeSortColumn(sort.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSorting}
              className="h-8 px-2 text-xs"
            >
              Clear All
            </Button>
          </div>
        ) : (
          <div className="px-2 py-1.5 bg-muted/50 rounded-lg flex items-center text-sm text-muted-foreground">
            <Lightbulb className="w-4 h-4 inline-block mr-1" />
            <p>
              <strong>Sorting tip:</strong> Click column headers to sort. Hold{" "}
              <kbd className="px-1 py-0.5 bg-background rounded text-xs">
                Shift
              </kbd>
              or{" "}
              <kbd className="px-1 py-0.5 bg-background rounded text-xs">
                Ctrl
              </kbd>
              while clicking to sort by multiple columns.
            </p>
          </div>
        ))}

      {/* Table */}
      <div className="rounded-md border">
        <Table withBorders>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "p-2 text-left",
                      header.id === "select" && "w-12 min-w-12 max-w-12",
                      header.id === "actions" &&
                        "w-[68px] min-w-[68px] max-w-[68px]"
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => {
                const isEditing = editingRowId === row.id;

                return isEditing ? (
                  <TableRow key={row.id}>
                    <RowEditor
                      row={row.original}
                      shape={shape}
                      columnOrder={columnOrder}
                      columnVisibility={columnVisibility}
                      onSave={(updatedRow) => {
                        onRowSave?.(updatedRow);
                        setEditingRowId(null);
                      }}
                      onCancel={() => setEditingRowId(null)}
                      showSelection={!!onSelectionChange}
                    />
                  </TableRow>
                ) : (
                  <DataTableRow
                    key={row.id}
                    row={row.original}
                    rowId={row.id}
                    isSelected={row.getIsSelected()}
                    shape={shape}
                    columnOrder={columnOrder}
                    columnVisibility={columnVisibility}
                    actions={actions}
                    editable={editable}
                    onToggleSelect={createRowToggle(row.id)}
                    onRowSave={onRowSave}
                    onEdit={createEditHandler(row.id)}
                    showSelection={!!onSelectionChange}
                  />
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {paginationConfig.enabled && (
        <DataTablePagination
          table={table}
          pageSizeOptions={allPageSizeOptions}
        />
      )}

      {/* Selection info - only show if selection is enabled */}
      {onSelectionChange && Object.keys(rowSelection).length > 0 && (
        <div className="flex-1 text-sm text-muted-foreground py-2">
          {Object.keys(rowSelection).length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
      )}
    </div>
  );
}
