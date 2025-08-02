"use client";

import type React from "react";
import { memo, useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Edit, Edit2, MoreHorizontal } from "lucide-react";
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
import type { DataTableAction, DataTableFieldType } from "@/types/data-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDateTime, hasValueChanged } from "./utils";

// -------------------------------------------------------------------
// UTILITY FUNCTIONS
// -------------------------------------------------------------------

// Helper function to check if a value is empty/null/undefined
const isEmpty = (value: any): boolean => {
  return value === null || value === undefined || value === "";
};

// Helper function to check if value should be considered empty for a specific field type
const isValueEmpty = (value: any, type: DataTableFieldType): boolean => {
  switch (type) {
    case "boolean":
      return false; // Boolean values are never considered "empty" - false is a valid value
    case "multi-select":
      return !Array.isArray(value) || value.length === 0;
    case "number":
      return value === null || value === undefined;
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
  customRender?: (value: any) => React.ReactNode
): React.ReactNode => {
  // Always check for empty values first, regardless of custom render
  if (isValueEmpty(value, type)) {
    return renderEmptyState(placeholder);
  }

  // If not empty and custom render provided, use custom render
  if (customRender) {
    return customRender(value);
  }

  // Otherwise use default rendering for non-empty values
  return renderCellValueDefault(value, type);
};

// Default rendering logic for non-empty values only
const renderCellValueDefault = (
  value: any,
  type: DataTableFieldType
): React.ReactNode => {
  switch (type) {
    case "boolean":
      return <Switch checked={value ?? false} disabled />;

    case "date":
      return formatDateTime(value);

    case "number":
      return <span>{value}</span>;

    case "select":
      return <span>{value}</span>;

    case "multi-select":
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item: string) => (
            <Badge key={item} variant="secondary">
              {item}
            </Badge>
          ))}
        </div>
      );

    case "text":
    default:
      return <span>{value}</span>;
  }
};

// -------------------------------------------------------------------
// SELECTION CELL COMPONENT
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
    <div className="flex items-center justify-center">
      <Checkbox
        checked={isSelected}
        onCheckedChange={onToggle}
        aria-label="Select row"
      />
    </div>
  );
});

// -------------------------------------------------------------------
// ACTIONS CELL COMPONENT
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
            <DropdownMenuItem key={index} onClick={() => action.onClick(row)}>
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
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
// CELL EDITOR COMPONENT
// -------------------------------------------------------------------

interface CellEditorProps<T> {
  value: any;
  type: DataTableFieldType;
  options?: string[];
  onSave: (value: any) => void;
  placeholder?: string;
}

export function CellEditor<T>({
  value,
  type,
  options,
  onSave,
  placeholder,
}: CellEditorProps<T>) {
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInteractingRef = useRef(false);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  // Auto-focus on mount for non-boolean and non-multi-select fields
  useEffect(() => {
    if (
      type !== "boolean" &&
      type !== "multi-select" &&
      type !== "date" &&
      inputRef.current
    ) {
      inputRef.current.focus();
    }
  }, [type]);

  const handleSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    onSave(editValue);
  }, [editValue, onSave]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(value);
      onSave(value); // Cancel by saving original value
    }
  };

  // Handle blur with a delay for complex components
  const handleBlur = useCallback(
    (e: React.FocusEvent) => {
      // For complex components, use a timeout to allow for internal focus changes
      if (type === "multi-select" || type === "date") {
        // Clear any existing timeout
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        // Set a timeout to check if focus is still within the component
        saveTimeoutRef.current = setTimeout(() => {
          // Check if the currently focused element is still within our container
          const activeElement = document.activeElement;
          const isStillFocused =
            containerRef.current &&
            (containerRef.current.contains(activeElement) ||
              // Also check for popover content that might be rendered outside
              activeElement?.closest('[role="dialog"]') ||
              activeElement?.closest("[data-radix-popper-content-wrapper]"));

          if (!isStillFocused && !isInteractingRef.current) {
            handleSave();
          }
          saveTimeoutRef.current = null;
        }, 150); // Small delay to allow for focus transitions
      } else {
        // For simple components, save immediately on blur
        if (
          containerRef.current &&
          !containerRef.current.contains(e.relatedTarget as Node)
        ) {
          handleSave();
        }
      }
    },
    [type, handleSave]
  );

  // Handle mouse interactions to prevent premature saves
  const handleMouseDown = useCallback(() => {
    isInteractingRef.current = true;
  }, []);

  const handleMouseUp = useCallback(() => {
    // Reset interaction flag after a short delay
    setTimeout(() => {
      isInteractingRef.current = false;
    }, 100);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  switch (type) {
    case "text":
      return (
        <Input
          ref={inputRef}
          value={editValue || ""}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="h-8"
          placeholder={placeholder}
        />
      );

    case "number":
      return (
        <Input
          ref={inputRef}
          type="number"
          value={editValue || ""}
          onChange={(e) => setEditValue(Number(e.target.value))}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="h-8"
          placeholder={placeholder}
        />
      );

    case "boolean":
      return (
        <Switch
          checked={editValue ?? false}
          onCheckedChange={(checked) => {
            setEditValue(checked);
            onSave(checked);
          }}
        />
      );

    case "select":
      return (
        <Select
          value={editValue || ""}
          onValueChange={(value) => {
            setEditValue(value);
            onSave(value);
          }}
        >
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
        <div
          ref={containerRef}
          onBlur={handleBlur}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <DateTimePicker
            value={editValue ? new Date(editValue) : undefined}
            onChange={(date) => {
              const timestamp = date ? date.getTime() : null;
              setEditValue(timestamp);
              // Don't auto-save on every change for date picker
            }}
            compact
            showLabels={false}
          />
        </div>
      );

    case "multi-select":
      return (
        <div
          ref={containerRef}
          onBlur={handleBlur}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          <MultiSelect
            options={options || []}
            selected={Array.isArray(editValue) ? editValue : []}
            onChange={(selected) => {
              setEditValue(selected);
              // Don't auto-save on every change for multi-select
            }}
            placeholder={placeholder || "Select options..."}
            withIndividualRemove={false}
          />
        </div>
      );

    default:
      return <div>{value}</div>;
  }
}

// -------------------------------------------------------------------
// HOVERABLE CELL COMPONENT
// -------------------------------------------------------------------

interface HoverableCellProps<T> {
  value: any;
  type: DataTableFieldType;
  options?: string[];
  onSave: (value: any) => void;
  placeholder?: string;
  editable?: boolean;
  render?: (value: any) => React.ReactNode;
}

function HoverableCell<T>({
  value,
  type,
  options,
  onSave,
  placeholder,
  editable = true,
  render,
}: HoverableCellProps<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const editTriggerRef = useRef<HTMLDivElement>(null);

  // Auto-focus when entering edit mode
  useEffect(() => {
    if (isEditing) {
      // Small delay to ensure the CellEditor has rendered
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

  if (isEditing) {
    return (
      <div className="min-w-0 w-full" ref={editTriggerRef}>
        <CellEditor
          value={value}
          type={type}
          options={options}
          placeholder={placeholder}
          onSave={(newValue) => {
            // Only save if the value actually changed
            if (hasValueChanged(value, newValue)) {
              onSave(newValue);
            }
            setIsEditing(false);
          }}
        />
      </div>
    );
  }

  // Always wrap in hover container, regardless of custom render
  return (
    <div
      className="relative min-w-0 w-full group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="min-w-0 pr-8">
        {/* Always check empty first, then use custom render or default */}
        {renderCellValueWithEmptyCheck(value, type, placeholder, render)}
      </div>
      {editable && isHovered && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

// -------------------------------------------------------------------
// DATA TABLE CELL COMPONENT (MAIN EXPORT)
// -------------------------------------------------------------------

interface DataTableCellProps<T> {
  value: any;
  type: DataTableFieldType;
  options?: string[];
  placeholder?: string;
  editable?: boolean;
  render?: (value: any) => React.ReactNode;
  onSave?: (value: any) => void;
  isEditing?: boolean;
}

// Memoized cell component
export const DataTableCell = memo(
  function DataTableCell<T>({
    value,
    type,
    options,
    placeholder,
    editable = true,
    render,
    onSave,
    isEditing = false,
  }: DataTableCellProps<T>) {
    // If row is being edited, don't render anything (handled by RowEditor)
    if (isEditing) {
      return null;
    }

    // For simple, non-editable values, render directly without components
    if (!editable) {
      // Always check empty first, then use custom render or default
      return (
        <>{renderCellValueWithEmptyCheck(value, type, placeholder, render)}</>
      );
    }

    // For editable cells, use the HoverableCell component
    return (
      <HoverableCell
        value={type === "boolean" ? value ?? false : value}
        type={type}
        options={options}
        placeholder={placeholder}
        editable={editable}
        render={render}
        onSave={onSave || (() => {})}
      />
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for better memoization
    return (
      prevProps.value === nextProps.value &&
      prevProps.type === nextProps.type &&
      prevProps.editable === nextProps.editable &&
      prevProps.isEditing === nextProps.isEditing &&
      JSON.stringify(prevProps.options) === JSON.stringify(nextProps.options)
    );
  }
);
