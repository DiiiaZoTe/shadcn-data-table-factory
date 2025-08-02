

/** Helper function to format date consistently */
export const formatDateTime = (value: any) => {
    if (!value) return "";
    const date = new Date(value);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div className= "text-sm" >
      <div>{ dateStr } </div>
      < div className = "text-muted-foreground" > { timeStr } </div>
        </div>
  );
};



/** Helper function to check if values are different for change detection */
export const hasValueChanged = (oldValue: any, newValue: any): boolean => {
  // Handle null/undefined comparisons
  if (oldValue === null || oldValue === undefined) {
    return newValue !== null && newValue !== undefined && newValue !== "";
  }
  if (newValue === null || newValue === undefined || newValue === "") {
    return oldValue !== null && oldValue !== undefined && oldValue !== "";
  }

  // Handle array comparisons (for multi-select)
  if (Array.isArray(oldValue) && Array.isArray(newValue)) {
    if (oldValue.length !== newValue.length) return true;
    return oldValue.some((item, index) => item !== newValue[index]);
  }

  // Handle date comparisons
  if (oldValue instanceof Date && newValue instanceof Date) {
    return oldValue.getTime() !== newValue.getTime();
  }

  // Handle string dates (ISO format)
  if (typeof oldValue === "string" && typeof newValue === "string") {
    // If both look like dates, compare as dates
    const oldDate = new Date(oldValue);
    const newDate = new Date(newValue);
    if (!isNaN(oldDate.getTime()) && !isNaN(newDate.getTime())) {
      return oldDate.getTime() !== newDate.getTime();
    }
  }

  // Standard comparison for primitives
  return oldValue !== newValue;
};