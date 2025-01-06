import { getRoleStats } from '@/lib/bigquery/roles';
import { RolesTable } from './roles-table';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export default async function RolesTablePage() {
  const roleStats = await getRoleStats();

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Discord Roles Overview</h1>
          <p className="text-muted-foreground">
            A comprehensive view of all Discord roles and their engagement metrics.
          </p>
        </div>
        <RolesTable initialData={roleStats} />
      </div>
    </div>
  );
}
