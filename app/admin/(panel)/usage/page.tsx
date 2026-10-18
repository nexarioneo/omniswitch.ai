import { Shell } from "@/components/layout/Shell";
import { UsageTable } from "@/components/dashboard/UsageTable";
import { StatCard } from "@/components/dashboard/StatCard";
import { getUsageStats, listUsageLogs } from "@/features/data/usage";

export default function UsagePage() {
  const stats = getUsageStats();
  const logs = listUsageLogs(100);

  return (
    <Shell title="Usage">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Requests" value={stats.totalRequests.toLocaleString()} />
        <StatCard label="Total Tokens" value={stats.totalTokens.toLocaleString()} />
        <StatCard label="Avg Latency" value={`${stats.avgLatency}ms`} />
        <StatCard label="Success Rate" value={`${stats.successRate}%`} />
      </div>

      <h2 className="text-lg font-medium text-on-surface mb-4">Recent Requests</h2>
      <UsageTable logs={logs} />
    </Shell>
  );
}
