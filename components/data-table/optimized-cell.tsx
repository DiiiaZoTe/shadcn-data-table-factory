"use client";

import type React from "react";
import { memo } from "react";
import { Switch } from "@/components/ui/switch";
import { HoverableCell } from "./hoverable-cell";
import type { DataTableFieldType } from "@/types/data-table";

interface OptimizedCellProps<T> {
  value: any;
  type: DataTableFieldType;
  options?: string[];
  placeholder?: string;
  editable?: boolean;
  render?: (value: any) => React.ReactNode;
  onSave?: (value: any) => void;
  isEditing?: boolean;
}

// Helper function to format date consistently
const formatDateTime = (value: any) => {
  if (!value) return "";
  const date = new Date(value);
  const dateStr = date.toLocaleDateString();
  const timeStr = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="text-sm">
      <div>{dateStr}</div>
      <div className="text-muted-foreground">{timeStr}</div>
    </div>
  );
};

// Aggressively memoized cell component
export const OptimizedCell = memo(
  function OptimizedCell<T>({
    value,
    type,
    options,
    placeholder,
    editable = true,
    render,
    onSave,
    isEditing = false,
  }: OptimizedCellProps<T>) {
    // If row is being edited, don't render anything (handled by RowEditor)
    if (isEditing) {
      return null;
    }

    // For simple, non-editable values, render directly without components
    if (!editable) {
      // If custom render function is provided for non-editable cells, use it
      if (render) {
        return <>{render(value)}</>;
      }
      switch (type) {
        case "boolean":
          return <Switch checked={value ?? false} disabled />;
        case "date":
          return value ? (
            formatDateTime(value)
          ) : (
            <span className="text-muted-foreground">{placeholder || ""}</span>
          );
        case "multi-select":
          return Array.isArray(value) ? (
            <div className="flex flex-wrap gap-1">
              {value.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder || ""}</span>
          );
        default:
          return <span>{value || placeholder || ""}</span>;
      }
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
