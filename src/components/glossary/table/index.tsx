"use client";

import { useState } from "react";
import { GlossaryRole } from "../types";
import { columns } from "./columns";
import { RoleDialog } from "../dialog";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchInput } from "@/components/ui/search-input";
import { RoleFilter } from "../role-filter";

interface GlossaryTableProps {
  data: GlossaryRole[];
}

export function GlossaryTable({ data }: GlossaryTableProps) {
  // Initialize with active_users sorted descending (high to low)
  const [sorting, setSorting] = useState<SortingState>([
    { id: "active_users", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility] = useState<VisibilityState>({
    badge: false,
  });
  const [selectedRole, setSelectedRole] = useState<GlossaryRole | null>(null);

  const table = useReactTable({
    data,
    columns: [
      {
        id: "badge",
        accessorKey: "badge",
        enableHiding: false,
        enableSorting: false,
        enableColumnFilter: true,
        filterFn: (row, id, value) => {
          return value === "" || row.getValue(id) === value;
        },
      },
      ...columns,
    ],
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: (updater) => {
      const newState = typeof updater === 'function' ? updater(sorting) : updater;
      if (newState && newState.length > 0) {
        const isNewColumn = newState[0].id !== sorting[0]?.id;
        if (isNewColumn) {
          // For role_name, start with ascending; for others, start with descending
          const shouldStartAscending = newState[0].id === 'role_name';
          setSorting([{ ...newState[0], desc: !shouldStartAscending }]);
        } else {
          setSorting(newState);
        }
      } else {
        // If trying to clear sort, maintain current column's sort
        const currentColumn = sorting[0]?.id;
        const isRoleName = currentColumn === 'role_name';
        setSorting([{ id: currentColumn, desc: !isRoleName }]);
      }
    },
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  // Helper function to handle badge filtering
  const handleFilterChange = (value: string) => {
    table.getColumn("badge")?.setFilterValue(value === "" ? undefined : value);
  };

  // Helper function to handle search
  const handleSearch = (value: string) => {
    table.getColumn("role_name")?.setFilterValue(value);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col desktop:flex-row desktop:justify-between desktop:items-center gap-4">
        <RoleFilter
          value={table.getColumn("badge")?.getFilterValue() as string ?? ""}
          onChange={handleFilterChange}
          className="w-full desktop:max-w-[600px]"
        />
        {/* Desktop collapsible search */}
        <div className="hidden desktop:flex justify-end">
          <SearchInput
            placeholder="Search roles..."
            onSearch={handleSearch}
            className="max-w-[220px]"
          />
        </div>
        {/* Mobile/tablet full-width search */}
        <div className="block desktop:hidden">
          <SearchInput
            placeholder="Search roles..."
            onSearch={handleSearch}
            variant="open"
            className="w-full max-w-[540px]"
          />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-7 py-1">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedRole(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-7 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <RoleDialog
        role={selectedRole}
        onOpenChange={(open) => !open && setSelectedRole(null)}
      />
    </div>
  );
} 