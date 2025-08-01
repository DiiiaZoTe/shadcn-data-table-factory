"use client"

import { useState } from "react"
import { DataTableFactory } from "@/components/data-table/data-table-factory"
import type { DataTableShape, DataTableAction } from "@/types/data-table"
import { Eye, Trash2 } from "lucide-react"

// Example data type
type User = {
  id: string
  name: string
  email: string
  age: number
  isActive: boolean
  role: string
  joinDate: string
  skills: string[]
}

// Generate more example data for pagination testing
const generateUsers = (count: number): User[] => {
  const roles = ["admin", "user", "moderator"]
  const skills = ["React", "Vue", "Angular", "TypeScript", "JavaScript", "Python", "Node.js", "GraphQL"]
  const names = ["John", "Jane", "Bob", "Alice", "Charlie", "Diana", "Eve", "Frank", "Grace", "Henry"]
  const surnames = ["Doe", "Smith", "Johnson", "Brown", "Davis", "Miller", "Wilson", "Moore", "Taylor", "Anderson"]

  return Array.from({ length: count }, (_, i) => ({
    id: (i + 1).toString(),
    name: `${names[i % names.length]} ${surnames[i % surnames.length]}`,
    email: `user${i + 1}@example.com`,
    age: 20 + (i % 50),
    isActive: Math.random() > 0.3,
    role: roles[i % roles.length],
    joinDate: new Date(2020 + (i % 4), i % 12, (i % 28) + 1).toISOString().split("T")[0],
    skills: skills.slice(0, (i % 4) + 1),
  }))
}

export default function ExamplePage() {
  const [data, setData] = useState<User[]>(generateUsers(150)) // Generate 150 users for pagination testing
  const [selectedRows, setSelectedRows] = useState<User[]>([])

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
      editable: true, // Changed to true to test hover edit with custom render
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
      options: ["React", "Vue", "Angular", "TypeScript", "JavaScript", "Python", "Node.js", "GraphQL"],
      editable: true,
      sortable: false,
      filterable: true,
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800 border border-green-200"
            >
              {skill}
            </span>
          ))}
        </div>
      ),
    },
  }

  // Define actions
  const actions: DataTableAction<User>[] = [
    {
      label: "View",
      icon: <Eye className="h-4 w-4" />,
      onClick: (user) => {
        alert(`Viewing user: ${user.name}`)
      },
    },
    {
      label: "Delete",
      icon: <Trash2 className="h-4 w-4" />,
      onClick: (user) => {
        if (confirm(`Are you sure you want to delete ${user.name}?`)) {
          setData((prev) => prev.filter((u) => u.id !== user.id))
        }
      },
    },
  ]

  const handleSave = (updatedUser: User) => {
    setData((prev) => prev.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
    console.log("Saved user:", updatedUser)
    alert(`Saved user: ${updatedUser.id}`)
  }

  const handleSelectionChange = (selected: User[]) => {
    setSelectedRows(selected)
    console.log("Selected rows:", selected)
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Data Table Factory Example</h1>
        <p className="text-muted-foreground">A comprehensive example showing all features including pagination.</p>
      </div>

      {selectedRows.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium">
            {selectedRows.length} user(s) selected. You can perform bulk actions here.
          </p>
        </div>
      )}

      <DataTableFactory
        data={data}
        shape={shape}
        actions={actions}
        editable={true}
        onSave={handleSave}
        onSelectionChange={handleSelectionChange}
        pagination={{
          enabled: true,
          defaultPageSize: 25,
          pageSizeOptions: [50, 100, 200],
        }}
        className="w-full"
      />

      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">Test Custom Render + Hover Edit:</h3>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            • <strong>Email:</strong> Has custom render (bold blue text) + editable=true
          </p>
          <p>
            • <strong>Skills:</strong> Has custom render (green badges) + editable=true
          </p>
          <p>
            • <strong>Name:</strong> No custom render + editable=true (control)
          </p>
          <p>
            • <strong>Test:</strong> Hover over each column to see if edit button appears
          </p>
        </div>
      </div>
    </div>
  )
}
