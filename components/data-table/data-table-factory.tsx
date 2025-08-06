"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
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
import type { DataTableProps, DataTableAction } from "./types";
import { ColumnFilter } from "./column-filters";
import { ColumnControls } from "./column-controls";
import { DataTablePagination } from "./pagination";
import { DataTableRow, RowEditor } from "./row";
import { ExportButton, exportToExcel, getVisibleColumns } from "./export";
import { getTimezoneAbbreviation } from "./utils";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";

// Stable empty array to prevent infinite re-renders
const EMPTY_ACTIONS: DataTableAction<any>[] = [];

export function DataTableFactory<T extends Record<string, any>>({
  data,
  rowId,
  shape,
  tableName,
  isLoading = false,
  actions = EMPTY_ACTIONS,
  editable = false,
  onRowSave,
  onSelectionChange,
  pagination = {},
  className,
  persistStorage = false,
  loadingFallback,
  filterable = false,
  sortable = false,
  searchable = false,
  hideable = false,
  reorderable = false,
  withBorders = false,
  exportable = false,
  timezone,
}: DataTableProps<T>) {
  // Provide default onRowSave function if none is provided
  const handleRowSave =
    onRowSave ||
    ((row: T) => {
      console.log("Row saved:", row);
    });
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

  // Compute initial values and merge with stored column order
  const getCurrentColumnOrder = () =>
    Object.keys(shape).filter((key) => shape[key]);

  const mergeColumnOrder = (
    storedOrder: string[],
    currentColumns: string[]
  ): string[] => {
    // Filter out columns that no longer exist in the shape
    const validStoredColumns = storedOrder.filter((col) =>
      currentColumns.includes(col)
    );

    // Add new columns that aren't in the stored order (append at the end)
    const newColumns = currentColumns.filter(
      (col) => !storedOrder.includes(col)
    );

    return [...validStoredColumns, ...newColumns];
  };

  const initialColumnOrder = getCurrentColumnOrder();
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

  // Merge stored column order with current columns to handle shape changes
  const rawColumnOrder = persistStorage ? columnOrderStorage : columnOrderState;
  const mergedColumnOrder = useMemo(() => {
    const currentColumns = getCurrentColumnOrder();
    return mergeColumnOrder(rawColumnOrder, currentColumns);
  }, [rawColumnOrder, shape]);

  // Update storage if the merged order is different from stored order
  useEffect(() => {
    if (
      persistStorage &&
      JSON.stringify(mergedColumnOrder) !== JSON.stringify(columnOrderStorage)
    ) {
      setColumnOrderStorage(mergedColumnOrder);
    } else if (
      !persistStorage &&
      JSON.stringify(mergedColumnOrder) !== JSON.stringify(columnOrderState)
    ) {
      setColumnOrderState(mergedColumnOrder);
    }
  }, [
    mergedColumnOrder,
    persistStorage,
    columnOrderStorage,
    setColumnOrderStorage,
    columnOrderState,
    setColumnOrderState,
  ]);

  const setColumnOrder = persistStorage
    ? setColumnOrderStorage
    : setColumnOrderState;
  const columnOrder = mergedColumnOrder;

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
        case "custom":
          if (config.custom?.compareValue) {
            return config.custom.compareValue(cellValue, value);
          }
          // Fallback to default string comparison
          const customCellStr = String(cellValue).toLowerCase();
          const customValueStr = String(value).toLowerCase();
          return customCellStr.includes(customValueStr);
        case "text":
        case "number":
        case "image":
        case "link":
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

      // Handle custom types with custom search logic
      if (config?.type === "custom" && config.custom?.getSearchValue) {
        const searchStr = config.custom.getSearchValue(value).toLowerCase();
        const filterStr = String(filterValue).toLowerCase();
        return searchStr.includes(filterStr);
      }

      // Default search behavior
      const searchStr = String(value).toLowerCase();
      const filterStr = String(filterValue).toLowerCase();
      return searchStr.includes(filterStr);
    },
    [shape, searchable]
  );

  // Function to set the row selection given by the user
  const handleSelectionChange = useCallback(
    (newSelection: RowSelectionState) => {
      if (onSelectionChange) {
        const selectedRows = data.filter((row) => row[rowId] in newSelection);
        onSelectionChange(selectedRows);
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

          const Label = () => (
            <span className="mr-2">
              {config.label}
              {config.type === "date" && timezone && (
                <span className="ml-1">
                  ({getTimezoneAbbreviation(timezone)})
                </span>
              )}
            </span>
          );

          return (
            <div className="flex flex-col w-full">
              <div className="flex items-center gap-2 min-h-[20px] w-full">
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
                    className="h-auto p-0 font-medium text-foreground hover:bg-transparent w-full justify-between"
                  >
                    <Label />
                    <div className="flex items-center gap-1">
                      {sortDirection === null ? (
                        <ArrowUpDown className="h-4 w-4" />
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
                  <Label />
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
              <div className="flex items-center gap-2 min-h-[20px] font-medium text-foreground">
                Actions
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

  // init the main tanstack table hook instance
  const table = useReactTable({
    data,
    getRowId: (row) => row[rowId],
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
    onRowSelectionChange: setRowSelection,
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

  // Get the visible row ids when filter/sort/pagination updates
  // and set the row selection state to prune the rows that are not visible
  const visibleRowIds = useMemo(() => {
    const visibleRowIds = new Set(table.getRowModel().rows.map((r) => r.id));
    setRowSelection((prev) => {
      const next: Record<string, boolean> = {};
      let changed = false;

      for (const key in prev) {
        if (visibleRowIds.has(key)) {
          next[key] = true;
        } else {
          changed = true;
        }
      }
      return changed ? next : prev;
    });
    return visibleRowIds;
  }, [table.getRowModel().rows]);

  // Call the onSelectionChange handler when the row selection state changes
  useEffect(() => {
    handleSelectionChange(rowSelection);
  }, [rowSelection]);

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

  // Export function with correct data extraction
  const handleExport = () => {
    // Get visible columns for export (only compute when needed)
    const visibleColumns = getVisibleColumns(
      shape,
      columnOrder,
      columnVisibility
    );
    // IMPORTANT: Get the data in the correct order - filtered, then sorted
    // This gives us the exact data that the user sees in the table
    const filteredAndSortedRows = table.getSortedRowModel().rows;
    const processedData = filteredAndSortedRows.map((row) => row.original);

    // Get selected rows - these are the ACTUAL selected rows from the processed data
    let selectedRows: T[] | undefined;

    if (Object.keys(rowSelection).some((key) => rowSelection[key])) {
      // TanStack Table's selection indices refer to the filtered/sorted rows, not original data
      // So we need to map the selection indices to the actual filtered/sorted data
      selectedRows = [];

      // Get selected row model which contains the correct selected rows
      const selectedRowModel = table.getSelectedRowModel();
      selectedRows = selectedRowModel.rows.map((row) => row.original);
    }

    exportToExcel({
      data: processedData, // This is the filtered and sorted data
      shape,
      visibleColumns,
      columnOrder,
      tableName,
      selectedRows, // This contains the actual selected rows from processed data
      timezone,
    });
  };

  const clearSorting = () => {
    setSorting([]);
  };

  const removeSortColumn = (columnId: string) => {
    setSorting((prev) => prev.filter((sort) => sort.id !== columnId));
  };

  // Prevent hydration mismatch by not rendering until mounted (when using localStorage) or if data is loading
  if (isLoading || (persistStorage && !isMounted)) {
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        {/* Controls Skeleton */}
        <div className="flex items-center justify-between gap-2">
          {searchable && <Skeleton className="h-10 w-52" />}
          <div className="flex items-center gap-2">
            {exportable && <Skeleton className="h-10 w-10 md:w-28" />}
            {(hideable || reorderable) && (
              <Skeleton className="h-10 w-10 md:w-32" />
            )}
          </div>
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
        <div className="flex items-center gap-2">
          {exportable && <ExportButton onClick={handleExport} />}
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
                    {column?.label}{" "}
                    {sort.desc ? (
                      <ArrowUp className="h-4 w-4" />
                    ) : (
                      <ArrowDown className="h-4 w-4" />
                    )}
                    {sorting.length > 1 && <span>({index + 1})</span>}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 hover:bg-transparent hover:text-destructive"
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
        <Table withBorders={withBorders} style={{height: "1px"}}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "p-2 text-left min-w-24",
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
                  <RowEditor
                    key={row.id}
                    row={row.original}
                    shape={shape}
                    columnOrder={columnOrder}
                    columnVisibility={columnVisibility}
                    onSave={(updatedRow) => {
                      handleRowSave(updatedRow);
                      setEditingRowId(null);
                    }}
                    onCancel={() => setEditingRowId(null)}
                    showSelection={!!onSelectionChange}
                    timezone={timezone}
                  />
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
                    onRowSave={handleRowSave}
                    onEdit={createEditHandler(row.id)}
                    showSelection={!!onSelectionChange}
                    timezone={timezone}
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
