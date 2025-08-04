# Data Table Factory

A comprehensive, feature-rich data table component built with React, TypeScript, and shadcn/ui. This repository showcases a powerful data table factory that provides advanced functionality for displaying, editing, filtering, sorting, and exporting tabular data.

## 🚀 Features

### Core Functionality
- **Dynamic Column Configuration** - Define table structure with flexible column types
- **Advanced Sorting** - Multi-column sorting with visual indicators
- **Powerful Filtering** - Column-specific filters with global search
- **Inline Editing** - Edit cells directly with various input types
- **Row Selection** - Optional bulk selection with callback support
- **Pagination** - Configurable pagination with multiple page sizes
- **Column Management** - Hide, show, and reorder columns
- **Excel Export** - Export filtered/sorted data to Excel files
- **Persistent State** - Auto-save table preferences to localStorage

### Column Types Supported
- **Text** - Simple text input and display
- **Number** - Numeric input with validation
- **Boolean** - Toggle switches for true/false values
- **Select** - Dropdown selection from predefined options
- **Multi-Select** - Multiple value selection with tags
- **Date** - Date picker with time support

### UI/UX Enhancements
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Dark Mode Support** - Built-in theme switching
- **Loading States** - Skeleton loaders and loading indicators
- **Hover Effects** - Interactive hover states for better UX
- **Accessibility** - ARIA labels and keyboard navigation support

## 🛠️ Tech Stack

### Core Dependencies
- **Next.js 14** - React framework with App Router
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

### Data Processing & Export
- **xlsx** - Excel file generation and processing
- **file-saver** - Client-side file downloading
- **date-fns** - Date manipulation utilities

### Custom Modifications
- **Enhanced Table Component** - Modified shadcn Table with `withBorders` prop for conditional styling
- **Advanced Cell Components** - Custom cell editors for different data types
- **Optimized Row Rendering** - Memoized components for better performance

## 📁 Project Structure

```
components/data-table/
├── data-table-factory.tsx    # Main table component
├── cell.tsx                  # Cell rendering and editing
├── row.tsx                   # Row components and editors
├── column-controls.tsx       # Column visibility and ordering
├── column-filters.tsx        # Column-specific filtering
├── pagination.tsx            # Pagination controls
└── utils.tsx                 # Utility functions

types/
└── data-table.ts            # TypeScript type definitions
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

// Use the component
<DataTableFactory
  data={users}
  shape={shape}
  tableName="users-table"
  editable={true}
  onRowSave={(updatedUser) => console.log('User updated:', updatedUser)}
  onSelectionChange={(selectedUsers) => console.log('Selected:', selectedUsers)}
/>
```

## 🎨 Customization

### Global Feature Toggles
- `sortable` - Enable/disable sorting globally
- `filterable` - Enable/disable filtering globally
- `searchable` - Enable/disable global search
- `hideable` - Enable/disable column hiding
- `reorderable` - Enable/disable column reordering
- `withBorders` - Add borders to table cells

### Column-Level Configuration
Each column can be individually configured with:
- `editable` - Allow inline editing
- `sortable` - Enable sorting for this column
- `filterable` - Enable column-specific filtering
- `searchable` - Include in global search
- `placeholder` - Placeholder text for empty values
- `render` - Custom render function

## 📊 Excel Export

The table supports exporting data to Excel format:

```tsx
// Export functionality is built-in
// Users can export filtered/sorted data
// Includes all visible columns with proper formatting
```

## 🔧 Advanced Features

### Persistent Storage
Table state (sorting, filters, column order, visibility) is automatically saved to localStorage when `persistStorage={true}`.

### Selection Management
Row selection is optional - omit `onSelectionChange` to hide selection checkboxes and save space.

### Default Callbacks
If `onRowSave` is not provided, the component defaults to logging changes to the console for debugging.

## 🚀 Live Demo

Visit the live demo: **[https://vercel.com/alexs-projects-d36d16be/v0-data-table-factory](https://vercel.com/alexs-projects-d36d16be/v0-data-table-factory)**

## 🤝 Contributing

This project was started with [v0.dev](https://v0.dev) and continues to evolve. Feel free to submit issues and enhancement requests!

## 📝 License

This project is open source and available under the [MIT License](LICENSE).