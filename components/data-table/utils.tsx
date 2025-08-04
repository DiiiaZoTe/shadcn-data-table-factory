/**
 * Get timezone abbreviation from timezone name
 */
export const getTimezoneAbbreviation = (timezone: string): string => {
  const abbreviations: Record<string, string> = {
    // North America
    "America/New_York": "ET",
    "America/Chicago": "CT",
    "America/Denver": "MT",
    "America/Los_Angeles": "PT",
    "America/Phoenix": "MST",
    "America/Anchorage": "AKST",
    "America/Toronto": "ET",
    "America/Vancouver": "PT",
    "America/Sao_Paulo": "BRT",
    "America/Mexico_City": "CST",
    "Pacific/Honolulu": "HST",

    // Europe
    "Europe/London": "GMT",
    "Europe/Paris": "CET",
    "Europe/Berlin": "CET",
    "Europe/Rome": "CET",
    "Europe/Amsterdam": "CET",
    "Europe/Madrid": "CET",
    "Europe/Stockholm": "CET",

    // Asia
    "Asia/Tokyo": "JST",
    "Asia/Shanghai": "CST",
    "Asia/Hong_Kong": "HKT",
    "Asia/Singapore": "SGT",
    "Asia/Seoul": "KST",
    "Asia/Kolkata": "IST",
    "Asia/Dubai": "GST",

    // Australia
    "Australia/Sydney": "AEDT",
    "Australia/Melbourne": "AEDT",
    "Australia/Perth": "AWST",

    // Africa
    "Africa/Cairo": "EET",
    "Africa/Johannesburg": "SAST",

    // UTC
    UTC: "UTC",
  };

  return (
    abbreviations[timezone] || timezone.split("/")[1]?.toUpperCase() || "UTC"
  );
};

/**
 * Format datetime string with optional timezone (for export)
 * If no timezone provided, uses user's local timezone
 */
export const formatDateTimeString = (value: any, timezone?: string): string => {
  if (!value) return "";

  try {
    const date = new Date(value);

    if (timezone) {
      // Format with specific timezone
      const options: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      };

      const formatter = new Intl.DateTimeFormat("en-US", options);
      return formatter.format(date).replace(",", " ");
    }

    // Use user's local timezone (not UTC)
    return date.toLocaleString().replace(",", " ");
  } catch {
    return String(value);
  }
};

/** Helper function to format date consistently for display */
export const formatDateTime = (value: any, timezone?: string) => {
  if (!value) return "";

  try {
    const date = new Date(value);

    let dateStr: string;
    let timeStr: string;

    if (timezone) {
      // Format with specific timezone
      const dateOptions: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      };

      const timeOptions: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
      };

      dateStr = new Intl.DateTimeFormat("en-US", dateOptions).format(date);
      timeStr = new Intl.DateTimeFormat("en-US", timeOptions).format(date);
    } else {
      // Use user's local timezone (not UTC) - this is the default behavior
      dateStr = date.toLocaleDateString();
      timeStr = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return (
      <div className="text-sm">
        <div>{dateStr}</div>
        <div className="text-muted-foreground">{timeStr}</div>
      </div>
    );
  } catch {
    return String(value);
  }
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
