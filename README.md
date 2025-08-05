# Data Table Factory

A comprehensive, feature-rich **client-side** data table component built with React, TypeScript, and shadcn/ui. This repository showcases a powerful data table factory that provides advanced functionality for displaying, editing, filtering, sorting, and exporting tabular data.

You can extract the needed table factory from `app/components/data-table`.

## 🚀 Features

### Core Functionality
- **Flexible Row Identification** - Specify any field as unique row identifier with `rowId` prop
- **Dynamic Column Configuration** - Define table structure with flexible column types
- **Advanced Sorting** - Multi-column sorting with visual indicators
- **Powerful Filtering** - Column-specific filters with global search
- **Inline Editing** - Edit cells directly with various input types
- **Row Selection** - Optional bulk selection with callback support
- **Pagination** - Configurable pagination with multiple page sizes
- **Column Management** - Hide, show, and reorder columns
- **Excel Export** - Export filtered/sorted data to Excel with timezone support
- **Timezone Support** - Display and export dates in specific timezones
- **Persistent State** - Auto-save table preferences to localStorage
- **Opt-in Architecture** - Features disabled by default for clean, performant tables

### Column Types Supported
- **Text** - Simple text input and display
- **Number** - Numeric input with validation
- **Boolean** - Toggle switches for true/false values
- **Select** - Dropdown selection from predefined options
- **Multi-Select** - Multiple value selection with tags
- **Date** - Date picker with time support and timezone display

### UI/UX Enhancements
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Dark Mode Support** - Built-in theme switching
- **Loading States** - Skeleton loaders and loading indicators
- **Hover Effects** - Interactive hover states for better UX
- **Accessibility** - ARIA labels and keyboard navigation support

## 🛠️ Tech Stack

### Core Dependencies
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **TanStack Table** - Powerful table state management
- **usehooks-ts** - Additional React hooks

### UI Components
- **shadcn/ui** - High-quality UI component library
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Beautiful icon library
- **Sonner** - Toast notifications
- **Custom** - Modified Shadcn/ui table component and new multi-select.tsx 

### Data Processing & Export
- **xlsx** - Excel file generation and processing
- **file-saver** - Client-side file downloading
- **date-fns** - Date manipulation utilities

### Custom Modifications
- **Enhanced Table Component** - Modified shadcn Table with `withBorders` prop for conditional inner borders
- **Advanced Cell Components** - Custom cell editors for different data types
- **Optimized Row Rendering** - Memoized components for better performance

#### Modified shadcn/ui Table Component

The base `Table` component from shadcn/ui has been enhanced with an optional `withBorders` prop:

```tsx
// components/ui/table.tsx
const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & { withBorders?: boolean }
>(({ className, withBorders = false, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn(
        "w-full caption-bottom text-sm",
        className,
        withBorders && 
          "[&_td]:border-r [&_td:last-child]:border-0 [&_th]:border-r [&_th:last-child]:border-0"
      )}
      {...props}
    />
  </div>
));
```

**Usage:**
- `withBorders={false}` (default): Clean table without inner column borders
- `withBorders={true}`: Adds vertical borders between columns for better visual separation

## 📁 Project Structure

```
components/data-table/
├── data-table-factory.tsx    # Main table component
├── cell.tsx                  # Cell rendering and editing
├── row.tsx                   # Row components and editors
├── column-controls.tsx       # Column visibility and ordering
├── column-filters.tsx        # Column-specific filtering
├── pagination.tsx            # Pagination controls
├── export.tsx                # Excel export functionality
└── utils.tsx                 # Utility functions and timezone helpers

types/
└── data-table.ts            # TypeScript type definitions and timezone constants
```

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install

# Or with yarn
yarn install

# Or with pnpm
pnpm install
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Basic Usage

```tsx
import { DataTableFactory } from '@/components/data-table/data-table-factory';
import type { DataTableShape } from '@/types/data-table';

// Define your data type
type User = {
  id: string;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
};

// Define table structure
const shape: DataTableShape<User> = {
  name: { label: 'Full Name', type: 'text', editable: true },
  email: { label: 'Email', type: 'text', editable: false },
  age: { label: 'Age', type: 'number', editable: true },
  isActive: { label: 'Active', type: 'boolean', editable: true },
};

// Use the component (minimal - features are opt-in)
<DataTableFactory
  data={users}
  rowId="id"  // Specify which field is the unique identifier
  shape={shape}
  tableName="users-table"
/>

// Or with full features enabled
<DataTableFactory
  data={users}
  rowId="id"  // Required: unique identifier field
  shape={shape}
  tableName="users-table"
  editable={true}
  sortable={true}
  filterable={true}
  searchable={true}
  exportable={true}
  hideable={true}
  reorderable={true}
  timezone={TIMEZONES.EASTERN}
  onRowSave={(updatedUser) => console.log('User updated:', updatedUser)}
  onSelectionChange={(selectedUsers) => console.log('Selected:', selectedUsers)}
/>
```

## 🎨 Customization

### Required Props

#### Row Identifier (`rowId`)
The `rowId` prop is **required** and specifies which field in your data should be used as the unique identifier for each row.
If you do not have one, generate one for each row, like a uuid for instance.

```tsx
// If your data looks like this:
const users = [
  { id: '1', name: 'John', email: 'john@example.com' },
  { userId: '2', name: 'Jane', email: 'jane@example.com' },
];

// Use the appropriate field name:
<DataTableFactory 
  data={users} 
  rowId="id"        // For the first dataset shape
  // or
  rowId="userId"    // For the second dataset shape
/>
```

**Why it's needed:**
- **Row Selection**: Enables proper tracking of selected rows across filtering/sorting
- **Edit Mode**: Identifies which specific row is being edited
- **Performance**: Helps React efficiently update only changed rows
- **State Management**: Maintains row state during table operations

### Global Feature Toggles (Opt-in Architecture)
All features are **disabled by default** for clean, performant tables:

- `sortable={true}` - Enable column sorting with visual indicators
- `filterable={true}` - Enable column-specific filtering
- `searchable={true}` - Enable global search functionality
- `exportable={true}` - Enable Excel export button
- `hideable={true}` - Enable column visibility controls
- `reorderable={true}` - Enable column drag-and-drop reordering
- `withBorders={true}` - Add borders to table cells
- `timezone="America/New_York"` - Set timezone for all date fields

### Smart Conditional Features
These features are automatically enabled/disabled based on prop presence:

- **Row Selection** - Only shown when `onSelectionChange` prop is provided
- **Actions Column** - Only shown when `actions` array is provided
- **Edit Mode** - Only available when `editable={true}` and `onRowSave` is provided

### Column-Level Configuration
Each column can be individually configured with:
- `editable` - Allow inline editing (defaults to true)
- `sortable` - Enable sorting for this column (requires global `sortable={true}`)
- `filterable` - Enable column-specific filtering (requires global `filterable={true}`)
- `searchable` - Include in global search (requires global `searchable={true}`)
- `placeholder` - Placeholder text for empty values
- `render` - Custom render function for complex display logic

## 📊 Excel Export

Comprehensive Excel export functionality with intelligent data handling:

### Features
- **Smart Export** - Only exports currently visible columns in their display order
- **Respects Filtering** - Exports only filtered/sorted data as displayed
- **Selection Support** - If rows are selected, exports only selected rows
- **Timezone Aware** - Date fields exported in specified timezone format
- **Type Formatting** - Booleans become "Yes/No", dates include full datetime
- **Auto-sizing** - Columns automatically sized based on content
- **Clean Headers** - Uses column labels, excludes selection/action columns

### Usage

```tsx
import { TIMEZONES } from '@/types/data-table';

<DataTableFactory
  data={users}
  rowId="id"  // Required: unique identifier field
  shape={shape}
  exportable={true}  // Enable export button
  timezone={TIMEZONES.EASTERN}  // Dates exported in ET
  tableName="users-export"  // Used in filename and persistent local storage
/>

// Users click export button to download:
// "users-export-2024-01-15-14-30-25.xlsx"
```

### Export Behavior
- **All Data**: Exports all filtered/sorted rows when none are selected
- **Selected Only**: Exports only selected rows when selection is active
- **Visible Columns**: Only exports columns that are currently visible
- **Column Order**: Maintains the current column display order
- **Date Format**: Full datetime without comma (e.g., "01/15/2024 2:30:25 PM")
- **Timezone Display**: Shows dates in specified timezone, not UTC

## 🔧 Advanced Features

### Timezone Support
Display and export dates in specific timezones:

```tsx
import { TIMEZONES } from '@/types/data-table';

<DataTableFactory 
  data={users}
  rowId="id"  // Required: unique identifier field
  shape={shape}
  timezone={TIMEZONES.EASTERN}  // or "America/New_York"
  // ...
/>
```

- **Column Headers**: Show timezone abbreviation (e.g., "Join Date (ET)")
- **Display**: All dates shown in specified timezone
- **Export**: Excel files include timezone-aware dates
- **Default**: Uses user's local timezone if not specified
- **IntelliSense**: Full TypeScript support for timezone selection

### Persistent Storage
Table state (sorting, filters, column order, visibility) is automatically saved to localStorage when `persistStorage={true}`.

### Smart Defaults
- **Opt-in Features**: All advanced features disabled by default for clean tables
- **Selection Management**: Row selection only shown when `onSelectionChange` is provided
- **Actions Column**: Only appears when `actions` array is provided
- **Default Callbacks**: `onRowSave` defaults to console logging if not provided
- **Performance**: Minimal features by default ensure fast rendering

### Responsive Design
- **Mobile Optimized**: Export button shows as icon-only on small screens
- **Column Controls**: Collapsible on mobile for better UX
- **Touch Support**: Drag-and-drop works on touch devices
- **Adaptive UI**: Components adjust based on screen size

## 🚀 Live Demo

Visit the live demo: **[https://vercel.com/alexs-projects-d36d16be/v0-data-table-factory](https://vercel.com/alexs-projects-d36d16be/v0-data-table-factory)**

## 🤝 Contribution

This project was started with [v0.dev](https://v0.dev) and then finished using claude 4.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).