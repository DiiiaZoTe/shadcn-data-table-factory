"use client"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Settings2, GripVertical, ChevronUp, ChevronDown } from "lucide-react"
import type { ColumnVisibility } from "@/types/data-table"

interface ColumnVisibilityProps<T> {
  columns: Array<{ key: string; label: string }>
  columnVisibility: ColumnVisibility
  onColumnVisibilityChange: (visibility: ColumnVisibility) => void
  columnOrder: string[]
  onColumnOrderChange: (order: string[]) => void
}

export function ColumnVisibilityControl<T>({
  columns,
  columnVisibility,
  onColumnVisibilityChange,
  columnOrder,
  onColumnOrderChange,
}: ColumnVisibilityProps<T>) {
  const [isOpen, setIsOpen] = useState(false)

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(columnOrder)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    onColumnOrderChange(items)
  }

  const toggleColumn = (columnKey: string) => {
    // Fix: Check if column is currently visible (default to true if not set)
    const isCurrentlyVisible = columnVisibility[columnKey] !== false
    onColumnVisibilityChange({
      ...columnVisibility,
      [columnKey]: !isCurrentlyVisible,
    })
  }

  const moveColumn = (columnKey: string, direction: "up" | "down") => {
    const currentIndex = columnOrder.indexOf(columnKey)
    if (currentIndex === -1) return

    const newOrder = [...columnOrder]
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

    // Check bounds
    if (targetIndex < 0 || targetIndex >= newOrder.length) return // Swap positions
    ;[newOrder[currentIndex], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[currentIndex]]
    onColumnOrderChange(newOrder)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="h-4 w-4 mr-2" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2">
          <div className="text-sm font-medium mb-2">Reorder and toggle columns</div>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="columns">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {columnOrder.map((columnKey, index) => {
                    const column = columns.find((col) => col.key === columnKey)
                    if (!column) return null

                    const isVisible = columnVisibility[columnKey] !== false

                    return (
                      <Draggable key={columnKey} draggableId={columnKey} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center space-x-2 py-1 px-2 rounded hover:bg-muted transition-colors ${
                              snapshot.isDragging ? "bg-muted shadow-lg border border-border" : ""
                            }`}
                            style={{
                              ...provided.draggableProps.style,
                              // Ensure the dragged item maintains its appearance
                              ...(snapshot.isDragging && {
                                transform: provided.draggableProps.style?.transform,
                              }),
                            }}
                          >
                            <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <Checkbox checked={isVisible} onCheckedChange={() => toggleColumn(columnKey)} />
                            <span
                              className="text-sm flex-1 select-none"
                              style={{
                                // Force text to remain visible during drag
                                opacity: 1,
                                color: "inherit",
                              }}
                            >
                              {column.label}
                            </span>
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
                          </div>
                        )}
                      </Draggable>
                    )
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
