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
- **Image** - Avatar display with URL input for editing
- **Link** - Clickable links with separate label and URL fields
- **Custom** - Fully customizable cells with user-defined render and edit logic

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
  avatar: string;
  website: string;
};

// Define table structure
const shape: DataTableShape<User> = {
  avatar: { label: 'Avatar', type: 'image', editable: true, placeholder: 'Enter image URL...' },
  name: { label: 'Full Name', type: 'text', editable: true },
  email: { label: 'Email', type: 'text', editable: false },
  website: { label: 'Website', type: 'link', editable: true, placeholder: 'Enter website URL...' },
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

#### Image Column Type
The `image` column type displays images using the shadcn Avatar component:

```tsx
// Image column configuration
const shape: DataTableShape<User> = {
  profilePicture: { 
    label: 'Profile Picture', 
    type: 'image', 
    editable: true,
    placeholder: 'Enter image URL...' 
  },
  // ... other columns
};
```

**Features:**
- **Display**: Shows images in a circular avatar (32x32px by default)
- **Fallback**: Shows "IMG" text when image fails to load
- **Editing**: Inline editor with live preview and URL input field
- **Row Editor**: Full-width input with avatar preview
- **Export**: Image URLs are exported to Excel as text

#### Link Column Type
The `link` column type displays clickable URLs with external link icons:

```tsx
// Link column configuration
const shape: DataTableShape<User> = {
  website: { 
    label: 'Website', 
    type: 'link', 
    editable: true,
    placeholder: 'Enter website URL...' 
  },
  // ... other columns
};

// Data structure
const users = [
  {
    id: '1',
    website: 'https://example.com'
  }
];
```

**Features:**
- **Display**: Clickable links with external link icon, opens in new tab
- **Data Structure**: Simple string containing the URL
- **Editing**: Single URL input field with live preview
- **Row Editor**: URL input with link preview
- **Safety**: All links include `rel="noopener noreferrer"` for security
- **Export**: URLs are exported to Excel as text

#### Custom Column Type
The `custom` column type allows you to create completely custom cell behaviors with full control over display, editing, and data processing:

```tsx
// Basic custom column configuration
const shape: DataTableShape<User> = {
  status: { 
    label: 'Status', 
    type: 'custom',
    editable: true,
    custom: {
      // Required: How to display the value
      render: (value: string, row: User) => {
        const statusColors = {
          active: 'bg-green-100 text-green-800',
          inactive: 'bg-red-100 text-red-800',
          pending: 'bg-yellow-100 text-yellow-800'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value] || 'bg-gray-100 text-gray-800'}`}>
            {value.toUpperCase()}
          </span>
        );
      },
      // Optional: Custom editor component (no save/cancel logic needed)
      renderEditor: (value: string, onChange: (newValue: string) => void) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      ),
      // Optional: Custom empty check
      isEmpty: (value: string) => !value || value === '',
      // Optional: Custom search value
      getSearchValue: (value: string) => value.toLowerCase(),
      // Optional: Custom export value
      getExportValue: (value: string) => value.toUpperCase(),
      // Optional: Custom filter comparison
      compareValue: (value: string, filterValue: string) => 
        value.toLowerCase().includes(filterValue.toLowerCase())
    }
  },
  // ... other columns
};
```

#### Advanced Custom Column Example: Team Management

Here's a comprehensive example of a custom column that handles complex array data with multiple properties:

```tsx
// Team member type definition
type TeamMember = {
  name: string;
  role: "user" | "admin";
};

// Custom team column configuration
const shape: DataTableShape<User> = {
  team: {
    label: 'Team Members',
    type: 'custom',
    editable: true,
    custom: {
      // Display as a list of "name: role" items
      render: (value: TeamMember[], row: User) => {
        if (!value || value.length === 0) {
          return <span className="text-muted-foreground">No team members</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {value.map((member, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {member.name}: {member.role}
              </Badge>
            ))}
          </div>
        );
      },
      
      // Complex editor with multi-select and role assignment
      renderEditor: (value: TeamMember[], onChange: (newValue: TeamMember[]) => void) => {
        const [currentTeam, setCurrentTeam] = useState<TeamMember[]>(value || []);
        const availableNames = ["Alice", "Bob", "Charlie", "Diana", "Eve"];

        const addMember = (name: string) => {
          const newMember: TeamMember = { name, role: "user" };
          const updated = [...currentTeam, newMember];
          setCurrentTeam(updated);
          onChange(updated);
        };

        const removeMember = (index: number) => {
          const updated = currentTeam.filter((_, i) => i !== index);
          setCurrentTeam(updated);
          onChange(updated);
        };

        const updateRole = (index: number, role: "user" | "admin") => {
          const updated = currentTeam.map((member, i) => 
            i === index ? { ...member, role } : member
          );
          setCurrentTeam(updated);
          onChange(updated);
        };

        return (
          <div className="space-y-2 p-2 min-w-[300px]">
            {/* Add new member */}
            <Select onValueChange={addMember}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Add team member..." />
              </SelectTrigger>
              <SelectContent>
                {availableNames
                  .filter(name => !currentTeam.some(member => member.name === name))
                  .map(name => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))
                }
              </SelectContent>
            </Select>

            {/* Current team members */}
            {currentTeam.map((member, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                <span className="flex-1 text-sm">{member.name}</span>
                <Select 
                  value={member.role} 
                  onValueChange={(role: "user" | "admin") => updateRole(index, role)}
                >
                  <SelectTrigger className="h-6 w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeMember(index)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        );
      },

      // Custom filter for team members
      renderFilter: (filterValue: string | string[], onChange: (value: string | string[] | undefined) => void) => {
        return (
          <Input
            placeholder="Filter by name or role..."
            value={(filterValue as string) ?? ""}
            onChange={(e) => onChange(e.target.value === "" ? undefined : e.target.value)}
            className="h-8 w-full"
          />
        );
      },

      // Custom functions for table operations
      isEmpty: (value: TeamMember[]) => !value || value.length === 0,
      getSearchValue: (value: TeamMember[]) => 
        value?.map(member => `${member.name} ${member.role}`).join(' ') || '',
      getExportValue: (value: TeamMember[]) => 
        value?.map(member => `${member.name}: ${member.role}`).join(', ') || '',
      compareValue: (value: TeamMember[], filterValue: string) =>
        value?.some(member => 
          member.name.toLowerCase().includes(filterValue.toLowerCase()) ||
          member.role.toLowerCase().includes(filterValue.toLowerCase())
        ) || false
    }
  },
  // ... other columns
};
```

**Custom Configuration Options:**
- **`render`** (required): Function to display the cell value `(value, row) => ReactNode`
- **`renderEditor`** (optional): Custom editor component `(value, onChange) => ReactNode`
  - **Note**: Editor only handles input rendering - save/cancel buttons are automatically provided
  - **Simplified API**: No need to manage save/cancel logic in your editor
- **`renderFilter`** (optional): Custom filter component `(filterValue, onChange) => ReactNode`
  - **Note**: Filter handles input rendering and calls onChange with new filter value
  - **Fallback**: Defaults to text input if not provided
- **`isEmpty`** (optional): Custom empty value check `(value) => boolean`
- **`getSearchValue`** (optional): Extract searchable text `(value) => string`
- **`getExportValue`** (optional): Format for Excel export `(value) => any`
- **`compareValue`** (optional): Custom filtering logic `(value, filterValue) => boolean`

**Enhanced Editing Experience:**
- **Popover Interface**: Edit controls appear in a clean popover on hover
- **Explicit Actions**: Save and cancel buttons with keyboard shortcuts (Enter to save, Esc to cancel)
- **Auto-focus**: Text inputs automatically focus when editing starts
- **Width Matching**: Popover matches the cell width for consistent alignment
- **Z-index Management**: Popover appears above dropdown menus and other overlays

**Use Cases:**
- **Team Management**: Arrays of objects with multiple properties (as shown above)
- **Status Badges**: Color-coded status indicators with custom styling
- **Rating Systems**: Star ratings, progress bars, or custom scoring displays
- **Complex Objects**: Display nested data with custom formatting
- **Rich Content**: Images, links, buttons, or interactive elements
- **Custom Inputs**: Specialized input components (color pickers, file uploads, etc.)
- **Multi-value Fields**: Tags, categories, or any array-based data

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

Visit the live demo: **[https://v0-data-table-factory.vercel.app](https://v0-data-table-factory.vercel.app)**

## 🤝 Contribution

This project was started with [v0.dev](https://v0.dev) and then finished using claude 4.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).