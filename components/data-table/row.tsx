"use client";

import { memo } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { DataTableCell, SelectionCell, ActionsCell } from "./cell";
import type {
  DataTableShape,
  DataTableAction,
  ColumnVisibility,
} from "@/types/data-table";
import { useState } from "react";
import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Save, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDateTime, hasValueChanged } from "./utils";

// -------------------------------------------------------------------
// ROW EDITOR COMPONENT
// -------------------------------------------------------------------

interface RowEditorProps<T> {
  row: T;
  shape: DataTableShape<T>;
  onSave: (row: T) => void;
  onCancel: () => void;
  columnOrder: string[];
  columnVisibility: ColumnVisibility;
  showSelection?: boolean;
}

export function RowEditor<T extends Record<string, any>>({
  row,
  shape,
  onSave,
  onCancel,
  columnOrder,
  columnVisibility,
  showSelection = true,
}: RowEditorProps<T>) {
  const [editedRow, setEditedRow] = useState<T>({ ...row });

  const handleFieldChange = (key: string, value: any) => {
    setEditedRow((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Check if any field has actually changed
    const hasChanges = Object.keys(editedRow).some((key) => {
      const oldValue = row[key as keyof T];
      const newValue = editedRow[key as keyof T];
      return hasValueChanged(oldValue, newValue);
    });

    // Only save if there are actual changes
    if (hasChanges) {
      onSave(editedRow);
    }
  };

  // Filter visible columns based on columnVisibility and columnOrder
  const visibleColumns = columnOrder.filter((key) => {
    const config = shape[key as keyof T];
    if (!config) return false;
    // Column is visible if not explicitly hidden
    return columnVisibility[key] !== false;
  });

  const renderField = (
    key: string,
    config: NonNullable<DataTableShape<T>[keyof T]>
  ) => {
    const value = editedRow[key as keyof T];

    if (config.editable === false) {
      switch (config.type) {
        case "boolean":
          return <Switch checked={value ?? false} disabled />;
        case "date":
          return value ? (
            formatDateTime(value)
          ) : (
            <span className="text-muted-foreground">
              {config.placeholder || ""}
            </span>
          );
        case "multi-select":
          return Array.isArray(value) ? (
            <div className="flex flex-wrap gap-1">
              {value.map((item: string) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">
              {config.placeholder || ""}
            </span>
          );
        default:
          return value || config.placeholder || "";
      }
    }

    switch (config.type) {
      case "text":
        return (
          <Input
            value={value || ""}
            onChange={(e) => handleFieldChange(key, e.target.value)}
            placeholder={config.placeholder}
            className="h-8"
          />
        );

      case "number":
        return (
          <Input
            type="number"
            value={value || ""}
            onChange={(e) => handleFieldChange(key, Number(e.target.value))}
            placeholder={config.placeholder}
            className="h-8"
          />
        );

      case "boolean":
        return (
          <Switch
            checked={value ?? false}
            onCheckedChange={(checked) => handleFieldChange(key, checked)}
          />
        );

      case "select":
        return (
          <Select
            value={value || ""}
            onValueChange={(newValue) => handleFieldChange(key, newValue)}
          >
            <SelectTrigger className="h-8">
              <SelectValue placeholder={config.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {config.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "date":
        return (
          <DateTimePicker
            value={value ? new Date(value) : undefined}
            onChange={(date) =>
              handleFieldChange(key, date ? date.getTime() : null)
            }
            compact
            showLabels={false}
          />
        );

      case "multi-select":
        return (
          <MultiSelect
            options={config.options || []}
            selected={Array.isArray(value) ? value : []}
            onChange={(selected) => handleFieldChange(key, selected)}
            placeholder={config.placeholder || "Select options..."}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Selection column - only render if showSelection is true */}
      {showSelection && (
        <TableCell className="p-2 w-12 min-w-12 max-w-12">
          <div className="flex items-center justify-center w-8 min-w-8 max-w-8 mx-auto">
            <Checkbox disabled className="opacity-50" />
          </div>
        </TableCell>
      )}

      {/* Data columns - only render visible columns in correct order */}
      {visibleColumns.map((key) => {
        const config = shape[key as keyof T];
        if (!config) return null;

        return (
          <TableCell key={key} className="p-2 min-w-0">
            <div className="min-w-0">{renderField(key, config)}</div>
          </TableCell>
        );
      })}

      {/* Actions column - fixed width (52px content + 16px padding = 68px total) */}
      <TableCell className="p-2 w-[68px] min-w-[68px] max-w-[68px]">
        <div className="flex flex-col items-center justify-center gap-1 w-[52px] min-w-[52px] max-w-[52px] mx-auto">
          <Button size="icon" onClick={handleSave} className="h-8 w-8 p-0">
            <Save className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            <X className="size-4" />
          </Button>
        </div>
      </TableCell>
    </>
  );
}

// -------------------------------------------------------------------
// DATA TABLE ROW COMPONENT
// -------------------------------------------------------------------

interface DataTableRowProps<T> {
  row: T;
  rowId: string;
  isSelected: boolean;
  shape: DataTableShape<T>;
  columnOrder: string[];
  columnVisibility: ColumnVisibility;
  actions: DataTableAction<T>[];
  editable: boolean;
  onToggleSelect: () => void;
  onRowSave?: (row: T) => void;
  onEdit: () => void;
  showSelection?: boolean;
}

export const DataTableRow = memo(
  function DataTableRow<T extends Record<string, any>>({
    row,
    rowId,
    isSelected,
    shape,
    columnOrder,
    columnVisibility,
    actions,
    editable,
    onToggleSelect,
    onRowSave,
    onEdit,
    showSelection = true,
  }: DataTableRowProps<T>) {
    // Filter visible columns based on columnVisibility and columnOrder
    const visibleColumns = columnOrder.filter((key) => {
      const config = shape[key as keyof T];
      if (!config) return false;
      // Column is visible if not explicitly hidden
      return columnVisibility[key] !== false;
    });

    return (
      <TableRow data-state={isSelected ? "selected" : undefined}>
        {/* Selection column - only render if showSelection is true */}
        {showSelection && (
          <TableCell className="p-2 w-12 min-w-12 max-w-12">
            <div className="flex items-center justify-center w-8 min-w-8 max-w-8 mx-auto">
              <SelectionCell
                isSelected={isSelected}
                onToggle={onToggleSelect}
              />
            </div>
          </TableCell>
        )}

        {/* Data columns - only render visible columns in correct order */}
        {visibleColumns.map((key) => {
          const config = shape[key as keyof T];
          if (!config) return null;

          return (
            <TableCell key={key} className="p-2 min-w-0">
              <DataTableCell
                value={row[key as keyof T]}
                type={config.type}
                options={config.options}
                placeholder={config.placeholder}
                editable={editable && config.editable !== false}
                render={
                  config.render ? (val) => config.render!(val, row) : undefined
                }
                onSave={(newValue) => {
                  const updatedRow = { ...row, [key]: newValue };
                  onRowSave?.(updatedRow);
                }}
                isEditing={false}
              />
            </TableCell>
          );
        })}

        {/* Actions column - fixed width (52px content + 16px padding = 68px total) */}
        {(editable || actions.length > 0) && (
          <TableCell className="p-2 w-[68px] min-w-[68px] max-w-[68px]">
            <div className="flex items-center justify-center w-[52px] min-w-[52px] max-w-[52px] mx-auto">
              <ActionsCell
                row={row}
                actions={actions}
                editable={editable}
                onEdit={onEdit}
              />
            </div>
          </TableCell>
        )}
      </TableRow>
    );
  },
  (prevProps, nextProps) => {
    // Include all relevant props in comparison to prevent unnecessary re-renders
    return (
      prevProps.row === nextProps.row &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.rowId === nextProps.rowId &&
      prevProps.editable === nextProps.editable &&
      prevProps.actions === nextProps.actions &&
      prevProps.showSelection === nextProps.showSelection &&
      JSON.stringify(prevProps.columnOrder) ===
        JSON.stringify(nextProps.columnOrder) &&
      JSON.stringify(prevProps.columnVisibility) ===
        JSON.stringify(nextProps.columnVisibility)
    );
  }
) as <T extends Record<string, any>>(
  props: DataTableRowProps<T>
) => JSX.Element;
