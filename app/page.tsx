"use client";

import { useState } from "react";
import { DataTableFactory } from "@/components/data-table/data-table-factory";
import type { DataTableShape, DataTableAction } from "@/types/data-table";
import { Eye, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

// Example data type
type User = {
  id: string;
  name: string;
  email: string;
  age: number | null;
  isActive: boolean;
  role: string | null;
  joinDate: string | null;
  skills: string[];
};

// Generate more example data for pagination testing
const generateUsers = (count: number): User[] => {
  const roles = ["admin", "user", "moderator"];
  const skills = [
    "React",
    "Vue",
    "Angular",
    "TypeScript",
    "JavaScript",
    "Python",
    "Node.js",
    "GraphQL",
  ];
  const names = [
    "John",
    "Jane",
    "Bob",
    "Alice",
    "Charlie",
    "Diana",
    "Eve",
    "Frank",
    "Grace",
    "Henry",
  ];
  const surnames = [
    "Doe",
    "Smith",
    "Johnson",
    "Brown",
    "Davis",
    "Miller",
    "Wilson",
    "Moore",
    "Taylor",
    "Anderson",
  ];

  return Array.from({ length: count }, (_, i) => {
    // Add some test cases with null/empty values for every 10th user
    const hasEmptyData = i % 10 === 0;

    return {
      id: (i + 1).toString(),
      name:
        hasEmptyData && i % 20 === 0
          ? ""
          : `${names[i % names.length]} ${surnames[i % surnames.length]}`,
      email: hasEmptyData && i % 30 === 0 ? "" : `user${i + 1}@example.com`,
      age: hasEmptyData && i % 40 === 0 ? null : 20 + (i % 50),
      isActive: Math.random() > 0.3,
      role: hasEmptyData && i % 50 === 0 ? null : roles[i % roles.length],
      joinDate:
        hasEmptyData && i % 60 === 0
          ? null
          : new Date(2020 + (i % 4), i % 12, (i % 28) + 1)
              .toISOString()
              .split("T")[0],
      skills: hasEmptyData && i % 70 === 0 ? [] : skills.slice(0, (i % 4) + 1),
    };
  });
};

export default function ExamplePage() {
  const [data, setData] = useState<User[]>(generateUsers(150)); // Generate 150 users for pagination testing
  const [selectedRows, setSelectedRows] = useState<User[]>([]);

  // Global feature toggles for demonstration
  const [globalSortable, setGlobalSortable] = useState(true);
  const [globalFilterable, setGlobalFilterable] = useState(true);
  const [globalSearchable, setGlobalSearchable] = useState(true);
  const [globalHideable, setGlobalHideable] = useState(true);
  const [globalReorderable, setGlobalReorderable] = useState(true);
  const [selectionEnabled, setSelectionEnabled] = useState(true);
  const [withBorders, setWithBorders] = useState(true);

  // Define the shape of the table
  const shape: DataTableShape<User> = {
    name: {
      label: "Full Name",
      type: "text",
      editable: true,
      sortable: true,
      filterable: true,
      searchable: true,
    },
    email: {
      label: "Email Address",
      type: "text",
      editable: false,
      sortable: true,
      filterable: true,
      searchable: true,
    },
    age: {
      label: "Age",
      type: "number",
      editable: true,
      sortable: true,
      filterable: true,
    },
    isActive: {
      label: "Active Status",
      type: "boolean",
      editable: true,
      sortable: true,
      filterable: true,
    },
    role: {
      label: "Role",
      type: "select",
      options: ["admin", "user", "moderator"],
      editable: true,
      sortable: true,
      filterable: false,
    },
    joinDate: {
      label: "Join Date",
      type: "date",
      editable: true,
      sortable: true,
      filterable: true,
    },
    skills: {
      label: "Skills",
      type: "multi-select",
      options: [
        "React",
        "Vue",
        "Angular",
        "TypeScript",
        "JavaScript",
        "Python",
        "Node.js",
        "GraphQL",
      ],
      editable: true,
      sortable: false,
      filterable: false,
      placeholder: "No skills",
    },
  };

  // Define actions
  const actions: DataTableAction<User>[] = [
    {
      label: "View",
      icon: <Eye className="h-4 w-4" />,
      onClick: (user) => {
        alert(`Viewing user: ${user.name}`);
      },
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (user) => {
        if (confirm(`Are you sure you want to delete ${user.name}?`)) {
          setData((prev) => prev.filter((u) => u.id !== user.id));
        }
      },
      className: "focus:text-destructive focus:bg-destructive/10",
    },
  ];

  const handleRowSave = (updatedUser: User) => {
    setData((prev) =>
      prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
    console.log("Row saved - user:", updatedUser);
    alert(`Row saved: ${updatedUser.name} (ID: ${updatedUser.id})`);
  };

  const handleSelectionChange = (selected: User[]) => {
    setSelectedRows(selected);
    console.log("Selected rows:", selected);
  };

  return (
    <div className="container mx-auto py-10 px-4 flex flex-col gap-4 flex-1">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Data Table Factory Example</h1>
        <p className="text-muted-foreground">
          A comprehensive example showing all features including pagination.
        </p>
      </div>

      {selectionEnabled && selectedRows.length > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium">
            {selectedRows.length} user(s) selected. You can perform bulk actions
            here.
          </p>
        </div>
      )}

      {/* Global Feature Controls */}
      <div className="p-4 bg-gray-50 rounded-lg border">
        <h3 className="font-semibold mb-3 text-gray-800">
          Global Feature Controls
        </h3>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="sortable"
              checked={globalSortable}
              onCheckedChange={setGlobalSortable}
            />
            <Label htmlFor="sortable">Sortable</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="filterable"
              checked={globalFilterable}
              onCheckedChange={setGlobalFilterable}
            />
            <Label htmlFor="filterable">Filterable</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="searchable"
              checked={globalSearchable}
              onCheckedChange={setGlobalSearchable}
            />
            <Label htmlFor="searchable">Searchable</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="hideable"
              checked={globalHideable}
              onCheckedChange={setGlobalHideable}
            />
            <Label htmlFor="hideable">Column Hiding</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="reorderable"
              checked={globalReorderable}
              onCheckedChange={setGlobalReorderable}
            />
            <Label htmlFor="reorderable">Column Reordering</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="selection"
              checked={selectionEnabled}
              onCheckedChange={setSelectionEnabled}
            />
            <Label htmlFor="selection">Row Selection</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="withBorders"
              checked={withBorders}
              onCheckedChange={setWithBorders}
            />
            <Label htmlFor="withBorders">With Borders</Label>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Toggle these switches to see how global controls override individual
          column settings. When "Row Selection" is disabled, selection
          checkboxes will be hidden. Table preferences (sorting, filters, column
          order/visibility) are automatically saved to localStorage.
        </p>
      </div>

      <DataTableFactory
        data={data}
        shape={shape}
        tableName="users-example-table"
        actions={actions}
        editable={true}
        onRowSave={handleRowSave}
        onSelectionChange={selectionEnabled ? handleSelectionChange : undefined}
        persistStorage={true}
        sortable={globalSortable}
        filterable={globalFilterable}
        searchable={globalSearchable}
        hideable={globalHideable}
        reorderable={globalReorderable}
        pagination={{
          enabled: true,
          defaultPageSize: 25,
          pageSizeOptions: [50, 100, 200],
        }}
        className="w-full flex-1"
        loadingFallback={<Skeleton className="h-full w-full flex-1" />}
        withBorders={withBorders}
      />
    </div>
  );
}
