import { StatsCards } from "@/components/glossary/stats-cards";
import { getGlossaryData } from '@/lib/bigquery/glossary';
import { FeatureList } from "@/components/landing/feature-list";
import { GlossaryTable } from '@/components/glossary/table';

// Force dynamic rendering and disable caching
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function HomePage() {
  const glossaryData = await getGlossaryData();

  return (
    <div className="flex flex-col gap-[60px]">
      <div>
        <div className="text-3xl max-w-[540px] mb-[40px]">
          <span className="text-foreground">
            The Beratrack role tracker 
          </span>
          <span className="text-muted-foreground"> is your unofficial guide to Berachain Discord roles — see what's attainable, who's active, and how roles shift.
          </span>
          <FeatureList glossaryData={glossaryData} />

        </div>
      </div>

      <div className="w-full overflow-visible">
      <div className="flex text-2xl text-muted-foreground mb-4">
        Roles
      </div>
        <GlossaryTable data={glossaryData} />
      </div>
    </div>
  );
}
