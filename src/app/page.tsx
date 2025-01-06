import { GlossaryTable } from '@/components/glossary/table';
import { StatsCards } from '@/components/glossary/stats-cards';
import { getGlossaryData } from '@/lib/bigquery/glossary';

export const dynamic = 'force-dynamic';
export const revalidate = 7200; // Revalidate every 2 hours

export default async function HomePage() {
  const glossaryData = await getGlossaryData();

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discord Role Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive analytics for Discord roles, including engagement quality and activity metrics.
            Updated every 2 hours.
          </p>
        </div>
        
        <StatsCards glossaryData={glossaryData} />
        <GlossaryTable data={glossaryData} />
      </div>
    </div>
  );
}
