"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings2, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ColumnVisibility } from "@/types/data-table";

interface ColumnControlsProps<T> {
  columns: Array<{ key: string; label: string }>;
  columnVisibility: ColumnVisibility;
  onColumnVisibilityChange: (visibility: ColumnVisibility) => void;
  columnOrder: string[];
  onColumnOrderChange: (order: string[]) => void;
  hideable?: boolean;
  reorderable?: boolean;
}

export function ColumnControls<T>({
  columns,
  columnVisibility,
  onColumnVisibilityChange,
  columnOrder,
  onColumnOrderChange,
  hideable = true,
  reorderable = true,
}: ColumnControlsProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(columnOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    onColumnOrderChange(items);
  };

  const toggleColumn = (columnKey: string) => {
    // Check if column is currently visible (default to true if not set)
    const isCurrentlyVisible = columnVisibility[columnKey] !== false;

    // If trying to hide a column, check if it's the last visible one
    if (isCurrentlyVisible) {
      const visibleColumns = columns.filter(
        (col) => columnVisibility[col.key] !== false
      );
      if (visibleColumns.length <= 1) {
        // Don't allow hiding the last visible column
        return;
      }
    }

    onColumnVisibilityChange({
      ...columnVisibility,
      [columnKey]: !isCurrentlyVisible,
    });
  };

  const moveColumn = (columnKey: string, direction: "up" | "down") => {
    const currentIndex = columnOrder.indexOf(columnKey);
    if (currentIndex === -1) return;

    const newOrder = [...columnOrder];
    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    // Check bounds
    if (targetIndex < 0 || targetIndex >= newOrder.length) return; // Swap positions
    [newOrder[currentIndex], newOrder[targetIndex]] = [
      newOrder[targetIndex],
      newOrder[currentIndex],
    ];
    onColumnOrderChange(newOrder);
  };

  // Generate title based on enabled features
  const getTitle = () => {
    if (hideable && reorderable) return "Reorder and toggle columns";
    if (hideable) return "Toggle column visibility";
    if (reorderable) return "Reorder columns";
    return "Column settings";
  };

  const renderColumnItem = (columnKey: string, index: number) => {
    const column = columns.find((col) => col.key === columnKey);
    if (!column) return null;

    const isVisible = columnVisibility[columnKey] !== false;
    const visibleColumns = columns.filter(
      (col) => columnVisibility[col.key] !== false
    );
    const isLastVisible = hideable && isVisible && visibleColumns.length <= 1;

    const itemContent = (
      <div
        className={cn(
          "flex items-center gap-2 py-1 px-2 rounded-md hover:bg-accent transition-colors",
          reorderable && "group"
        )}
      >
        {reorderable && (
          <div className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-accent-foreground" />
          </div>
        )}
        {hideable && (
          <div className="relative flex items-center">
            <Checkbox
              checked={isVisible}
              onCheckedChange={() => toggleColumn(columnKey)}
              disabled={isLastVisible}
              className={cn(isLastVisible && "opacity-50")}
            />
            {isLastVisible && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-md border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                At least one column must be visible
              </div>
            )}
          </div>
        )}
        <span
          className={cn(
            "text-sm flex-1 select-none",
            hideable && isLastVisible && "text-muted-foreground"
          )}
          style={{
            // Force text to remain visible during drag
            opacity: 1,
            color: "inherit",
          }}
        >
          {column.label}
          {hideable && isLastVisible && " (required)"}
        </span>
        {reorderable && (
          <div className="flex flex-col gap-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0"
              onClick={() => moveColumn(columnKey, "up")}
              disabled={index === 0}
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0"
              onClick={() => moveColumn(columnKey, "down")}
              disabled={index === columnOrder.length - 1}
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    );

    if (reorderable) {
      return (
        <Draggable key={columnKey} draggableId={columnKey} index={index}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              className={cn(
                snapshot.isDragging && "bg-accent rounded-md"
              )}
              style={{
                ...provided.draggableProps.style,
                // Ensure the dragged item maintains its appearance
                ...(snapshot.isDragging && {
                  transform: provided.draggableProps.style?.transform,
                }),
                left: "auto !important",
                top: "auto !important",
              }}
            >
              {itemContent}
            </div>
          )}
        </Draggable>
      );
    }

    return <div key={columnKey}>{itemContent}</div>;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="size-10 md:size-auto md:h-10 bg-transparent"
        >
          <Settings2 className="h-4 w-4" />
          <span className="ml-2 hidden md:block">Columns</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2">
          <div className="text-sm font-medium mb-2">{getTitle()}</div>
          {reorderable ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="columns">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {columnOrder.map((columnKey, index) =>
                      renderColumnItem(columnKey, index)
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div>
              {columnOrder.map((columnKey, index) =>
                renderColumnItem(columnKey, index)
              )}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
