"use client";

import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import type { RoleStats } from "./columns";

interface RolesTableProps {
  initialData: RoleStats[];
}

export function RolesTable({ initialData }: RolesTableProps) {
  return <DataTable columns={columns} data={initialData} />;
} 