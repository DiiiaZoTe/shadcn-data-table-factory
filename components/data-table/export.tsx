"use client";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { DataTableShape } from "@/components/data-table/types";
import { formatDateTimeString } from "./utils";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Download } from "lucide-react";

export interface ExportData<T> {
  data: T[];
  shape: DataTableShape<T>;
  visibleColumns: string[];
  columnOrder: string[];
  tableName: string;
  selectedRows?: T[];
  timezone?: string;
}

/**
 * Format cell value for Excel export based on column type
 */
function formatValueForExport<T>(
  value: any,
  columnKey: string,
  shape: DataTableShape<T>,
  timezone?: string
): any {
  const config = shape[columnKey as keyof T];
  if (!config) return value;

  // Handle null/undefined values
  if (value === null || value === undefined) {
    return "";
  }

  switch (config.type) {
    case "boolean":
      return value ? "Yes" : "No";

    case "date":
      if (value) {
        try {
          return formatDateTimeString(value, timezone);
        } catch {
          return value;
        }
      }
      return "";

    case "multi-select":
      if (Array.isArray(value)) {
        return value.join(", ");
      }
      return "";

    case "number":
      return typeof value === "number" ? value : "";

    case "image":
      return String(value || "");

    case "link":
      return String(value || "");

    case "custom":
      return config.custom?.getExportValue
        ? config.custom.getExportValue(value)
        : String(value || "");

    case "select":
    case "text":
    default:
      return String(value || "");
  }
}

/**
 * Export table data to Excel file
 */
export function exportToExcel<T extends Record<string, any>>({
  data,
  shape,
  visibleColumns,
  columnOrder,
  tableName,
  selectedRows,
  timezone,
}: ExportData<T>): void {
  try {
    // Determine which data to export
    const dataToExport =
      selectedRows && selectedRows.length > 0 ? selectedRows : data;

    console.log("Export Debug Info:", {
      totalData: data.length,
      selectedRows: selectedRows?.length || 0,
      dataToExport: dataToExport.length,
      visibleColumns: visibleColumns.length,
      columnOrder,
      // Show sample of data being exported
      sampleData: dataToExport.slice(0, 3).map((row) => {
        const sample: any = {};
        columnOrder.slice(0, 3).forEach((key) => {
          sample[key] = row[key as keyof T];
        });
        return sample;
      }),
    });

    if (dataToExport.length === 0) {
      alert("No data to export");
      return;
    }

    // Filter and order columns based on current view
    const exportColumns = columnOrder.filter((key) => {
      const config = shape[key as keyof T];
      return config && visibleColumns.includes(key);
    });

    if (exportColumns.length === 0) {
      alert("No visible columns to export");
      return;
    }

    // Create header row
    const headers = exportColumns.map((key) => {
      const config = shape[key as keyof T];
      return config?.label || key;
    });

    // Create data rows
    const rows = dataToExport.map((row) =>
      exportColumns.map((key) =>
        formatValueForExport(row[key as keyof T], key, shape, timezone)
      )
    );

    // Combine headers and data
    const worksheetData = [headers, ...rows];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Auto-size columns
    const columnWidths = exportColumns.map((key) => {
      const config = shape[key as keyof T];
      const headerLength = config?.label?.length || key.length;

      // Calculate max content length for this column
      const maxContentLength = Math.max(
        headerLength,
        ...dataToExport.map((row) => {
          const cellValue = formatValueForExport(
            row[key as keyof T],
            key,
            shape,
            timezone
          );
          return String(cellValue).length;
        })
      );

      // Set reasonable min/max widths
      return { wch: Math.min(Math.max(maxContentLength, 8), 50) };
    });

    worksheet["!cols"] = columnWidths;

    // Add worksheet to workbook
    const sheetName =
      selectedRows && selectedRows.length > 0
        ? `${tableName} (Selected)`
        : tableName;

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `${tableName}-${timestamp}.xlsx`;

    // Save file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(file, filename);

    // Success feedback
    const exportedCount = dataToExport.length;
    const selectionText =
      selectedRows && selectedRows.length > 0
        ? ` (${selectedRows.length} selected rows)`
        : "";

    console.log(
      `Successfully exported ${exportedCount} rows to ${filename}${selectionText}`
    );
  } catch (error) {
    console.error("Export failed:", error);
    alert("Failed to export data. Please try again.");
  }
}

/**
 * Get visible columns based on column visibility state
 */
export function getVisibleColumns<T>(
  shape: DataTableShape<T>,
  columnOrder: string[],
  columnVisibility: Record<string, boolean>
): string[] {
  return columnOrder.filter((key) => {
    const config = shape[key as keyof T];
    if (!config) return false;
    // Column is visible if not explicitly hidden
    return columnVisibility[key] !== false;
  });
}

export function ExportButton(props: ButtonProps) {
  return (
    <Button
      variant="outline"
      className="size-10 md:size-auto md:h-10 bg-transparent"
      {...props}
    >
      <Download className="h-4 w-4" />
      <span className="ml-2 hidden md:block">Export</span>
    </Button>
  );
}
