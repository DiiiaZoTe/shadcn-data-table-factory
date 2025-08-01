"use client"

import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DateTimePickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  className?: string
  compact?: boolean
  showLabels?: boolean
}

export function DateTimePicker({
  value,
  onChange,
  className,
  compact = false,
  showLabels = true,
}: DateTimePickerProps) {
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate && value) {
      // Preserve the existing time when changing date
      const newDateTime = new Date(selectedDate)
      newDateTime.setHours(value.getHours(), value.getMinutes(), value.getSeconds())
      onChange(newDateTime)
    } else if (selectedDate) {
      // Set default time to current time if no previous value
      const now = new Date()
      selectedDate.setHours(now.getHours(), now.getMinutes(), 0)
      onChange(selectedDate)
    } else {
      onChange(undefined)
    }
  }

  const handleTimeChange = (timeString: string) => {
    if (value && timeString) {
      const [hours, minutes] = timeString.split(":").map(Number)
      const newDateTime = new Date(value)
      newDateTime.setHours(hours, minutes, 0)
      onChange(newDateTime)
    } else if (timeString) {
      // If no date is set, set to today with the selected time
      const today = new Date()
      const [hours, minutes] = timeString.split(":").map(Number)
      today.setHours(hours, minutes, 0)
      onChange(today)
    }
  }

  const getTimeString = () => {
    if (!value) return ""
    return format(value, "HH:mm")
  }

  if (compact) {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        {/* Date Section - Compact */}
        <div className="flex flex-col gap-1">
          {showLabels && <Label className="text-xs font-medium">Date</Label>}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-7 text-sm",
                  !value && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-3 w-3 flex-shrink-0" />
                <span className="truncate">{value ? format(value, "MMM d, yyyy") : "Select date"}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={value} onSelect={handleDateSelect} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
        {/* Time Section - Compact */}
        <div className="flex flex-col gap-1">
          {showLabels && <Label className="text-xs font-medium">Time</Label>}
          <Input
            type="time"
            value={getTimeString()}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="w-full h-7 text-sm"
          />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 gap-4", className)}>
      {/* Date Section */}
      <div className="flex flex-col gap-2">
        {showLabels && <Label className="text-sm font-medium">Date</Label>}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-full justify-start text-left font-normal", !value && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">{value ? format(value, "PPP") : "Select date"}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={value} onSelect={handleDateSelect} initialFocus />
          </PopoverContent>
        </Popover>
      </div>
      {/* Time Section */}
      <div className="flex flex-col gap-2">
        {showLabels && <Label className="text-sm font-medium">Time</Label>}
        <div className="relative">
          <Input
            type="time"
            value={getTimeString()}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="w-full"
          />
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <span className="text-sm text-muted-foreground">{value && format(value, "aa")}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
