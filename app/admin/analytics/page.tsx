import { requireAdmin } from "@/lib/auth";
import { ComingSoon } from "@/components/admin/ComingSoon";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  await requireAdmin();
  return (
    <ComingSoon
      eyebrow="Insights"
      title="Analytics"
      description="Phase 4 will roll up DAU / MAU, top stories, top cities, completion rates, and a Google Maps heatmap of user activity from BigQuery exports of Firebase Analytics. Daily metrics will land in dailyMetrics/{yyyy-mm-dd} for fast read."
    />
  );
}
