"use client";

import { memo } from "react";
import { TableRow } from "@/components/ui/table";
import {
  DataTableCell,
  SelectionCell,
  ActionsCell,
  EditorSelectionCell,
  EditorCell,
  EditorActionCell,
} from "./cell";
import type {
  DataTableShape,
  DataTableAction,
  ColumnVisibility,
} from "@/components/data-table/types";
import { useState } from "react";
import type { JSX } from "react";
import { hasValueChanged } from "./utils";

// -------------------------------------------------------------------
// ROW EDITOR COMPONENT
// The row when in row editor mode
// -------------------------------------------------------------------

interface RowEditorProps<T> {
  row: T;
  shape: DataTableShape<T>;
  onSave: (row: T) => void;
  onCancel: () => void;
  columnOrder: string[];
  columnVisibility: ColumnVisibility;
  showSelection?: boolean;
  timezone?: string;
}

export function RowEditor<T extends Record<string, any>>({
  row,
  shape,
  onSave,
  onCancel,
  columnOrder,
  columnVisibility,
  showSelection = true,
  timezone,
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

  return (
    <TableRow>
      {/* Selection column */}
      <EditorSelectionCell showSelection={showSelection} />

      {/* Data columns - only render visible columns in correct order */}
      {visibleColumns.map((key) => {
        const config = shape[key as keyof T];
        if (!config) return null;

        return (
          <EditorCell
            key={key}
            columnKey={key}
            config={config}
            editedRow={editedRow}
            onFieldChange={handleFieldChange}
            timezone={timezone}
          />
        );
      })}

      {/* Actions column */}
      <EditorActionCell onSave={handleSave} onCancel={onCancel} />
    </TableRow>
  );
}

// -------------------------------------------------------------------
// DATA TABLE ROW COMPONENT
// The row when in data mode (not in row editor mode)
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
  onRowSave: (row: T, oldRow: T) => void;
  onEdit: () => void;
  showSelection?: boolean;
  timezone?: string;
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
    timezone,
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
          <SelectionCell isSelected={isSelected} onToggle={onToggleSelect} />
        )}

        {/* Data columns - only render visible columns in correct order */}
        {visibleColumns.map((key) => {
          const config = shape[key as keyof T];
          if (!config) return null;

          return (
            <DataTableCell
              key={key}
              row={row}
              columnKey={key}
              config={config}
              editable={editable}
              onRowSave={onRowSave}
              timezone={timezone}
            />
          );
        })}

        {/* Actions column - fixed width (52px content + 16px padding = 68px total) */}
        {(editable || actions.length > 0) && (
          <ActionsCell
            row={row}
            actions={actions}
            editable={editable}
            onEdit={onEdit}
          />
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
      prevProps.timezone === nextProps.timezone &&
      JSON.stringify(prevProps.columnOrder) ===
        JSON.stringify(nextProps.columnOrder) &&
      JSON.stringify(prevProps.columnVisibility) ===
        JSON.stringify(nextProps.columnVisibility)
    );
  }
) as <T extends Record<string, any>>(
  props: DataTableRowProps<T>
) => JSX.Element;
