"use client";

import type React from "react";
import Link from "next/link";
import { memo, useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Edit, Edit2, MoreHorizontal, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import type {
  DataTableAction,
  DataTableFieldType,
  CustomCellConfig,
} from "@/components/data-table/types";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDateTime, hasValueChanged } from "./utils";
import { TableCell } from "@/components/ui/table";
import { Save, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// ===================================================================
// CELL COMPONENTS ARCHITECTURE OVERVIEW
// ===================================================================
//
// DataTableCell (Main data cell component)
// ├─> not editable: renders basic TableCell with content directly
// └─> editable: delegates to EditableCell
//     ├─> not editing: shows content with edit button on hover
//     └─> editing: uses CellInlineEditor for input
//
// EditorCell (Row editor mode cell component)
// └─> renders appropriate input field based on config.type in TableCell
//
// SelectionCell (Row selection checkbox)
// └─> renders Checkbox in TableCell
//
// ActionsCell (Action dropdown menu)
// └─> renders DropdownMenu with actions in TableCell
//
// EditorSelectionCell (Selection in row editor mode)
// └─> renders disabled Checkbox in TableCell
//
// EditorActionCell (Save/Cancel buttons in row editor mode)
// └─> renders Save/Cancel buttons in TableCell
//
// CellInlineEditor (Inline editing component)
// └─> renders appropriate input field based on type (no TableCell)
//
// ===================================================================

// -------------------------------------------------------------------
// UTILITY FUNCTIONS
// -------------------------------------------------------------------

// Helper function to check if a value is empty/null/undefined
const isEmpty = (value: any): boolean => {
  return value === null || value === undefined || value === "";
};

// Helper function to check if value should be considered empty for a specific field type
const isValueEmpty = (
  value: any,
  type: DataTableFieldType,
  customConfig?: CustomCellConfig<any, any>
): boolean => {
  switch (type) {
    case "boolean":
      return false; // Boolean values are never considered "empty" - false is a valid value
    case "multi-select":
      return !Array.isArray(value) || value.length === 0;
    case "number":
      return value === null || value === undefined;
    case "link":
      return isEmpty(value);
    case "custom":
      return customConfig?.isEmpty
        ? customConfig.isEmpty(value)
        : isEmpty(value);
    default:
      return isEmpty(value);
  }
};

// Helper function to render empty state with placeholder
const renderEmptyState = (placeholder?: string) => (
  <span className="text-muted-foreground">{placeholder || "No value"}</span>
);

// Enhanced renderer that handles empty values first, then custom/default rendering
const renderCellValueWithEmptyCheck = (
  value: any,
  type: DataTableFieldType,
  placeholder?: string,
  customRender?: (value: any, row?: any) => React.ReactNode,
  timezone?: string,
  customConfig?: CustomCellConfig<any, any>,
  row?: any
): React.ReactNode => {
  // Always check for empty values first, regardless of custom render
  if (isValueEmpty(value, type, customConfig)) {
    return renderEmptyState(placeholder);
  }

  // For custom type, use the custom render function
  if (type === "custom" && customConfig?.render) {
    return customConfig.render(value, row || {});
  }

  // If not empty and custom render provided, use custom render
  if (customRender) {
    return customRender(value, row);
  }

  // Otherwise use default rendering for non-empty values
  return renderCellValueDefault(value, type, timezone);
};

// Default rendering logic for non-empty values only
const renderCellValueDefault = (
  value: any,
  type: DataTableFieldType,
  timezone?: string
): React.ReactNode => {
  switch (type) {
    case "boolean":
      return <Switch checked={value ?? false} disabled />;

    case "date":
      return formatDateTime(value, timezone);

    case "number":
      return <span>{value}</span>;

    case "select":
      return <span>{value}</span>;

    case "multi-select":
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item: string) => (
            <Badge key={item} variant="outline">
              {item}
            </Badge>
          ))}
        </div>
      );

    case "image":
      return (
        <Avatar className="h-8 w-8">
          <AvatarImage src={value} alt="Image" />
          <AvatarFallback className="text-xs">IMG</AvatarFallback>
        </Avatar>
      );

    case "link":
      return (
        <Link
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline"
        >
          {value}
          <ExternalLink className="h-3 w-3" />
        </Link>
      );

    case "custom":
      // Custom types should be handled in renderCellValueWithEmptyCheck
      return <span>{String(value)}</span>;

    case "text":
    default:
      return <span>{value}</span>;
  }
};

// -------------------------------------------------------------------
// SELECTION CELL COMPONENT
// The checkbox on the left to select the row
// -------------------------------------------------------------------

interface SelectionCellProps {
  isSelected: boolean;
  onToggle: () => void;
}

// Separate memoized component for selection to prevent row re-renders
export const SelectionCell = memo(function SelectionCell({
  isSelected,
  onToggle,
}: SelectionCellProps) {
  return (
    <TableCell className="p-2 w-12 min-w-12 max-w-12">
      <div className="flex items-center justify-center w-8 min-w-8 max-w-8 mx-auto">
        <div className="flex items-center justify-center">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggle}
            aria-label="Select row"
          />
        </div>
      </div>
    </TableCell>
  );
});

// -------------------------------------------------------------------
// ROW EDITOR SELECTION CELL COMPONENT
// The checkbox on when in row editor mode
// -------------------------------------------------------------------

interface EditorSelectionCellProps {
  showSelection: boolean;
}

export function EditorSelectionCell({
  showSelection,
}: EditorSelectionCellProps) {
  if (!showSelection) return null;

  return (
    <TableCell className="p-2 w-12 min-w-12 max-w-12">
      <div className="flex items-center justify-center w-8 min-w-8 max-w-8 mx-auto">
        <Checkbox disabled className="opacity-50" />
      </div>
    </TableCell>
  );
}

// -------------------------------------------------------------------
// ACTIONS CELL COMPONENT
// The dropdown menu with the actions
// -------------------------------------------------------------------

interface ActionsCellProps<T> {
  row: T;
  actions: DataTableAction<T>[];
  editable: boolean;
  onEdit: () => void;
}

// Separate memoized component for actions
export const ActionsCell = memo(
  function ActionsCell<T>({
    row,
    actions,
    editable,
    onEdit,
  }: ActionsCellProps<T>) {
    if (!editable && actions.length === 0) return null;

    return (
      <TableCell className="p-2 w-[68px] min-w-[68px] max-w-[68px]">
        <div className="flex items-center justify-center w-[52px] min-w-[52px] max-w-[52px] mx-auto">
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
                <DropdownMenuItem
                  key={index}
                  onClick={() => action.onClick(row)}
                  className={action.className}
                >
                  {action.icon && <span className="mr-2">{action.icon}</span>}
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if relevant props actually changed
    return (
      prevProps.row === nextProps.row &&
      prevProps.editable === nextProps.editable &&
      prevProps.actions === nextProps.actions
    );
  }
) as <T>(props: ActionsCellProps<T>) => JSX.Element | null;

// -------------------------------------------------------------------
// ROW EDITOR ACTIONS CELL COMPONENT
// The dropdown menu with the actions when in row editor mode (save and cancel)
// -------------------------------------------------------------------

interface EditorActionCellProps {
  onSave: () => void;
  onCancel: () => void;
}

export function EditorActionCell({ onSave, onCancel }: EditorActionCellProps) {
  return (
    <TableCell className="p-2 w-[68px] min-w-[68px] max-w-[68px]">
      <div className="flex flex-col items-center justify-center gap-1 w-[52px] min-w-[52px] max-w-[52px] mx-auto">
        <Button
          size="icon"
          variant="ghost"
          onClick={onSave}
          className="h-8 w-8 p-0"
        >
          <Save className="w-4 h-4" />
          <span className="sr-only">Save</span>
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onCancel}
          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="w-4 h-4" />
          <span className="sr-only">Cancel</span>
        </Button>
      </div>
    </TableCell>
  );
}

// -------------------------------------------------------------------
// ROW EDITOR CELL COMPONENT
// The cell when in row editor mode (every cell except the selection and actions cells)
// -------------------------------------------------------------------

interface EditorCellProps<T> {
  columnKey: string;
  config: any;
  editedRow: T;
  onFieldChange: (key: string, value: any) => void;
  timezone?: string;
}

export function EditorCell<T extends Record<string, any>>({
  columnKey,
  config,
  editedRow,
  onFieldChange,
  timezone,
}: EditorCellProps<T>) {
  const value = editedRow[columnKey as keyof T];

  // For non-editable fields, show read-only display
  if (config.editable === false) {
    return (
      <TableCell className="p-2 min-w-0">
        {renderCellValueWithEmptyCheck(
          value,
          config.type,
          config.placeholder,
          config.render ? (val) => config.render!(val, editedRow) : undefined,
          timezone,
          config.custom,
          editedRow
        )}
      </TableCell>
    );
  }

  // For editable fields, use the shared FieldEditor
  return (
    <TableCell className="p-2 min-w-0">
      <FieldEditor
        value={value}
        type={config.type}
        options={config.options}
        placeholder={config.placeholder}
        customConfig={config.custom}
        onChange={(newValue) => onFieldChange(columnKey, newValue)}
      />
    </TableCell>
  );
}

// -------------------------------------------------------------------
// FIELD EDITOR COMPONENT
// The editor for the field (used by both inline and row editors)
// -------------------------------------------------------------------

// Shared field editor component that can be used by both inline and row editors
function FieldEditor<T>({
  value,
  type,
  options,
  placeholder,
  customConfig,
  onChange,
  onKeyDown,
}: {
  value: any;
  type: DataTableFieldType;
  options?: string[];
  placeholder?: string;
  customConfig?: CustomCellConfig<any, any>;
  onChange: (value: any) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount for text inputs
  useEffect(() => {
    if (
      type === "text" ||
      type === "number" ||
      type === "image" ||
      type === "link"
    ) {
      // Small delay to ensure component is fully rendered
      const timeoutId = setTimeout(() => {
        inputRef.current?.focus();
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, []); // Empty dependency array - only run once on mount

  switch (type) {
    case "text":
      return (
        <Input
          ref={inputRef}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          className="h-8"
          placeholder={placeholder}
        />
      );

    case "number":
      return (
        <Input
          ref={inputRef}
          type="number"
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value))}
          onKeyDown={onKeyDown}
          className="h-8"
          placeholder={placeholder}
        />
      );

    case "boolean":
      return <Switch checked={value ?? false} onCheckedChange={onChange} />;

    case "select":
      return (
        <Select value={value || ""} onValueChange={onChange}>
          <SelectTrigger className="h-8">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options?.map((option) => (
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
          onChange={(date) => onChange(date ? date.getTime() : null)}
          compact
          showLabels={false}
        />
      );

    case "multi-select":
      return (
        <MultiSelect
          options={options || []}
          selected={Array.isArray(value) ? value : []}
          onChange={onChange}
          placeholder={placeholder || "Select options..."}
          withIndividualRemove={false}
        />
      );

    case "image":
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={value || ""} alt="Image" />
            <AvatarFallback className="text-xs">IMG</AvatarFallback>
          </Avatar>
          <Input
            ref={inputRef}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            className="h-8 flex-1"
            placeholder={placeholder || "Enter image URL..."}
          />
        </div>
      );

    case "link":
      return (
        <div className="flex items-center gap-2">
          {value && (
            <Link
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline text-sm"
            >
              <ExternalLink className="h-3 w-3" />
            </Link>
          )}
          <Input
            ref={inputRef}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder || "Enter URL..."}
            className="h-8 flex-1"
          />
        </div>
      );

    case "custom":
      return customConfig?.renderEditor ? (
        customConfig.renderEditor(value, onChange)
      ) : (
        <Input
          ref={inputRef}
          value={String(value || "")}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder || "Enter value..."}
          className="h-8"
        />
      );

    default:
      return <div>{value}</div>;
  }
}

// -------------------------------------------------------------------
// CELL INLINE EDITOR COMPONENT
// The inline editor for the cell (after hovering over the cell and clicking the edit icon)
// -------------------------------------------------------------------

interface CellInlineEditorProps<T> {
  value: any;
  type: DataTableFieldType;
  options?: string[];
  onSave: (value: any) => void;
  onCancel: () => void;
  placeholder?: string;
  customConfig?: CustomCellConfig<any, any>;
}

export function CellInlineEditor<T>({
  value,
  type,
  options,
  onSave,
  onCancel,
  placeholder,
  customConfig,
}: CellInlineEditorProps<T>) {
  const [editValue, setEditValue] = useState(value);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    onSave(editValue);
    setIsPopoverOpen(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    onCancel();
    setIsPopoverOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <div
          className="relative flex items-center gap-2 h-full flex-1 p-2 cursor-pointer"
          onMouseEnter={() => setIsPopoverOpen(true)}
          onMouseLeave={(e) => {
            // Only close if not moving to the popover content
            const relatedTarget = e.relatedTarget as Element;
            if (!relatedTarget?.closest("[data-radix-popover-content]")) {
              setIsPopoverOpen(false);
            }
          }}
        >
          <div className="flex-1">
            <FieldEditor
              value={editValue}
              type={type}
              options={options}
              placeholder={placeholder}
              customConfig={customConfig}
              onChange={setEditValue}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="p-2 z-0"
        side="bottom"
        align="center"
        sideOffset={0}
        style={{ width: "var(--radix-popover-trigger-width)" }}
        onMouseEnter={() => setIsPopoverOpen(true)}
        onMouseLeave={() => setIsPopoverOpen(false)}
      >
        <div className="flex justify-center items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSave}
            className="h-6 w-6 p-0"
          >
            <Save className="h-4 w-4" />
            <span className="sr-only">Save</span>
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCancel}
            className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Cancel</span>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// -------------------------------------------------------------------
// EDITABLE CELL COMPONENT
// A cell that can be hovered to allow for inline editing
// -------------------------------------------------------------------

interface EditableCellProps {
  value: any;
  type: DataTableFieldType;
  options?: string[];
  onSave: (value: any) => void;
  placeholder?: string;
  render?: (value: any) => React.ReactNode;
  timezone?: string;
  customConfig?: CustomCellConfig<any, any>;
  row?: any;
}

// Editable cell component with integrated hover state and TableCell wrapper
const EditableCell = memo(function EditableCell({
  value,
  type,
  options,
  onSave,
  placeholder,
  render,
  timezone,
  customConfig,
  row,
}: EditableCellProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const editTriggerRef = useRef<HTMLDivElement>(null);

  // Auto-focus when entering edit mode
  useEffect(() => {
    if (isEditing) {
      // Small delay to ensure the CellInlineEditor has rendered
      setTimeout(() => {
        const input = editTriggerRef.current?.querySelector(
          "input, select, button"
        );
        if (input && "focus" in input) {
          (input as HTMLElement).focus();
        }
      }, 50);
    }
  }, [isEditing]);

  return (
    <TableCell
      className={cn("min-w-0", isEditing ? "p-0" : "p-2")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isEditing ? (
        <div className="flex min-w-0 w-full h-full" ref={editTriggerRef}>
          <CellInlineEditor
            value={value}
            type={type}
            options={options}
            placeholder={placeholder}
            customConfig={customConfig}
            onSave={(newValue) => {
              // Only save if the value actually changed
              if (hasValueChanged(value, newValue)) {
                onSave(newValue);
              }
              setIsEditing(false);
            }}
            onCancel={() => {
              setIsEditing(false);
            }}
          />
        </div>
      ) : (
        <div className="relative min-w-0 w-full group">
          <div className="min-w-0 pr-8">
            {/* Always check empty first, then use custom render or default */}
            {renderCellValueWithEmptyCheck(
              value,
              type,
              placeholder,
              render,
              timezone,
              customConfig,
              row
            )}
          </div>
          {isHovered && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6 p-0 opacity-100 transition-opacity z-10"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              <Edit2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
    </TableCell>
  );
});

// -------------------------------------------------------------------
// DATA TABLE CELL COMPONENT (MAIN DATA CELL WITH HOVER)
// A complete table cell that handles hover state, editing, and content display
// -------------------------------------------------------------------

interface DataTableCellProps<T> {
  row: T;
  columnKey: string;
  config: any;
  editable: boolean;
  onRowSave: (row: T) => void;
  timezone?: string;
}

// Main cell component with conditional rendering (memory optimized)
export const DataTableCell = memo(
  function DataTableCell<T extends Record<string, any>>({
    row,
    columnKey,
    config,
    editable,
    onRowSave,
    timezone,
  }: DataTableCellProps<T>) {
    const value = row[columnKey as keyof T];
    const isFieldEditable = editable && config.editable !== false;

    // For non-editable cells, render directly without any state
    if (!isFieldEditable) {
      return (
        <TableCell className="p-2 min-w-0">
          {renderCellValueWithEmptyCheck(
            value,
            config.type,
            config.placeholder,
            config.render ? (val) => config.render!(val, row) : undefined,
            timezone,
            config.custom,
            row
          )}
        </TableCell>
      );
    }

    // For editable cells, use EditableCell component
    return (
      <EditableCell
        value={config.type === "boolean" ? value ?? false : value}
        type={config.type}
        options={config.options}
        placeholder={config.placeholder}
        render={config.render ? (val) => config.render!(val, row) : undefined}
        customConfig={config.custom}
        row={row}
        onSave={(newValue) => {
          const updatedRow = { ...row, [columnKey]: newValue } as T;
          onRowSave(updatedRow);
        }}
        timezone={timezone}
      />
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for better memoization
    return (
      prevProps.row === nextProps.row &&
      prevProps.columnKey === nextProps.columnKey &&
      prevProps.editable === nextProps.editable &&
      prevProps.timezone === nextProps.timezone &&
      JSON.stringify(prevProps.config) === JSON.stringify(nextProps.config)
    );
  }
) as <T extends Record<string, any>>(
  props: DataTableCellProps<T>
) => JSX.Element;
