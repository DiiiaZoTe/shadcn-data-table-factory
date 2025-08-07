"use client";

import { useState } from "react";
import { DataTableFactory } from "@/components/data-table/data-table-factory";
import type {
  DataTableShape,
  DataTableAction,
} from "@/components/data-table/types";
import { TIMEZONES } from "@/components/data-table/types";
import { Eye, Trash2, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Team member type for custom column example
type TeamMember = {
  name: string;
  role: "user" | "admin";
};

// Example data type
type User = {
  id: string;
  name: string;
  email: string;
  age: number | null;
  avatar: string | null;
  isActive: boolean;
  role: string | null;
  joinDate: string | null;
  skills: string[];
  team: TeamMember[];
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

  const teamNames = [
    "Alice Johnson",
    "Bob Smith",
    "Carol Davis",
    "David Wilson",
    "Emma Brown",
    "Frank Miller",
    "Grace Taylor",
    "Henry Anderson",
  ];

  return Array.from({ length: count }, (_, i) => {
    // Add some test cases with null/empty values for every 10th user
    const hasEmptyData = i % 10 === 0;

    // Generate team data
    const teamSize =
      hasEmptyData && i % 80 === 0 ? 0 : Math.floor(Math.random() * 4) + 1;
    const team: TeamMember[] = Array.from({ length: teamSize }, (_, j) => ({
      name: teamNames[(i + j) % teamNames.length],
      role: Math.random() > 0.7 ? "admin" : ("user" as "user" | "admin"),
    }));

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
      avatar: hasEmptyData && i % 60 === 0 ? null : `https://i.pravatar.cc/150?img=${i % 100}`,
      joinDate:
        hasEmptyData && i % 60 === 0
          ? null
          : new Date(2020 + (i % 4), i % 12, (i % 28) + 1)
              .toISOString()
              .split("T")[0],
      skills: hasEmptyData && i % 70 === 0 ? [] : skills.slice(0, (i % 4) + 1),
      team,
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
  const [exportable, setExportable] = useState(true);

  // Define the shape of the table
  const shape: DataTableShape<User> = {
    name: {
      label: "Full Name",
      type: "text",
      // editable: true,
      // sortable: true,
      // filterable: true,
      // searchable: true,
    },
    avatar: {
      label: "Avatar",
      type: "image",
      // editable: true,
      // sortable: true,
      // filterable: true,
      // searchable: true,
    },
    email: {
      label: "Email Address",
      type: "text",
      // editable: false,
      // sortable: true,
      // filterable: true,
      // searchable: true,
    },
    age: {
      label: "Age",
      type: "number",
      // editable: true,
      // sortable: true,
      // filterable: true,
    },
    isActive: {
      label: "Active Status",
      type: "boolean",
      // editable: true,
      // sortable: true,
      // filterable: true,
    },
    role: {
      label: "Role",
      type: "select",
      options: ["admin", "user", "moderator"],
      // editable: true,
      // sortable: true,
      // filterable: false,
    },
    joinDate: {
      label: "Join Date",
      type: "date",
      // editable: true,
      // sortable: true,
      // filterable: true,
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
      // editable: true,
      // sortable: false,
      // filterable: false,
      placeholder: "No skills",
    },
    team: {
      label: "Team Members",
      type: "custom",
      editable: true,
      sortable: true,
      filterable: true,
      searchable: true,
      placeholder: "No team members",
      custom: {
        // Display: List of "name: role" concatenated
        render: (value: TeamMember[]) => {
          if (!value || value.length === 0) {
            return (
              <span className="text-muted-foreground text-sm">No team</span>
            );
          }

          return (
            <div className="flex flex-wrap gap-1">
              {value.map((member, index) => (
                <span
                  key={`${member.name}-${index}`}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    member.role === "admin"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {member.name}: {member.role}
                </span>
              ))}
            </div>
          );
        },

        // Editor: Multi-select dropdown with role selection
        renderEditor: (
          value: TeamMember[],
          onChange: (newValue: TeamMember[]) => void
        ) => {
          const availableMembers = [
            "Alice Johnson",
            "Bob Smith",
            "Carol Davis",
            "David Wilson",
            "Emma Brown",
            "Frank Miller",
            "Grace Taylor",
            "Henry Anderson",
          ];

          const currentTeam = value || [];

          return (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1 min-h-[32px] p-2 border rounded-md">
                {currentTeam.length === 0 ? (
                  <span className="text-muted-foreground text-sm">
                    No team members selected
                  </span>
                ) : (
                  currentTeam.map((member, index) => (
                    <div
                      key={`${member.name}-${index}`}
                      className="flex items-center gap-1 bg-secondary rounded-md px-2 py-1"
                    >
                      <span className="text-sm">{member.name}</span>
                      <Select
                        value={member.role}
                        onValueChange={(value: "user" | "admin") => {
                          const newTeam = [...currentTeam];
                          newTeam[index] = {
                            ...member,
                            role: value,
                          };
                          onChange(newTeam);
                        }}
                      >
                        <SelectTrigger className="h-6 w-16 text-xs border-none bg-transparent p-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newTeam = currentTeam.filter(
                            (_, i) => i !== index
                          );
                          onChange(newTeam);
                        }}
                        className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                )}
              </div>

              <Select
                onValueChange={(value) => {
                  if (value && !currentTeam.some((m) => m.name === value)) {
                    onChange([...currentTeam, { name: value, role: "user" }]);
                  }
                }}
                value=""
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Add team member..." />
                </SelectTrigger>
                <SelectContent>
                  {availableMembers
                    .filter((name) => !currentTeam.some((m) => m.name === name))
                    .map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          );
        },

        // Empty check: Array is empty
        isEmpty: (value: TeamMember[]) => !value || value.length === 0,

        // Search: Look into both name and role fields
        getSearchValue: (value: TeamMember[]) => {
          if (!value || value.length === 0) return "";
          return value
            .map((member) => `${member.name} ${member.role}`)
            .join(" ");
        },

        // Export: Format as "name: role" list
        getExportValue: (value: TeamMember[]) => {
          if (!value || value.length === 0) return "";
          return value
            .map((member) => `${member.name}: ${member.role}`)
            .join(", ");
        },

        // Filter: Search in both name and role
        compareValue: (value: TeamMember[], filterValue: string) => {
          if (!value || value.length === 0) return false;
          const searchTerm = filterValue.toLowerCase();
          return value.some(
            (member) =>
              member.name.toLowerCase().includes(searchTerm) ||
              member.role.toLowerCase().includes(searchTerm)
          );
        },
      },
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
          <div className="flex items-center space-x-2">
            <Switch
              id="exportable"
              checked={exportable}
              onCheckedChange={setExportable}
            />
            <Label htmlFor="exportable">Export</Label>
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
        rowId="id"
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
        exportable={exportable}
        timezone={TIMEZONES.EASTERN}
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
