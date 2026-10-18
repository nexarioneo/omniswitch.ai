import { Shell } from "@/components/layout/Shell";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProviderCard } from "@/components/dashboard/ProviderCard";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { getUsageStats } from "@/features/data/usage";
import { listApiKeys } from "@/features/data/api-keys";
import { listProviders, listProviderKeys } from "@/features/data/providers";
import { listModels } from "@/features/data/models";


export default function OverviewPage() {
  const stats = getUsageStats();
  const apiKeys = listApiKeys();
  const providers = listProviders();
  const allKeys = providers.flatMap((p) => listProviderKeys(p.id));
  const allModels = listModels();

  return (
    <Shell title="Overview">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Requests" value={stats.totalRequests.toLocaleString()} />
        <StatCard label="Active Keys" value={apiKeys.filter((k) => k.is_active).length.toLocaleString()} />
        <StatCard label="Providers" value={providers.filter((p) => p.is_active).length.toLocaleString()} />
        <StatCard label="Tokens Used" value={stats.totalTokens.toLocaleString()} />
      </div>

      <h2 className="text-lg font-medium text-on-surface mb-4">Providers</h2>
      {providers.length === 0 ? (
        <Card elevation={1} className="mb-6 flex flex-col items-start gap-3">
          <p className="text-sm text-on-surface-variant">
            No providers configured yet. Add one to route requests to an AI vendor.
          </p>
          <Link href="/admin/providers" className="text-sm font-medium text-primary underline underline-offset-4">
            Go to Providers
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          {providers.map((p) => (
            <ProviderCard
              key={p.id}
              name={p.name}
              status={p.is_active ? "active" : "inactive"}
              keyCount={allKeys.filter((k) => k.provider_id === p.id).length}
              modelCount={allModels.filter((m) => m.provider_id === p.id).length}
              baseUrl={p.base_url}
              href={`/admin/providers/${p.id}`}
            />
          ))}
        </div>
      )}

      <Card elevation={1}>
        <h2 className="text-lg font-medium text-on-surface mb-2">Usage Stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-on-surface-variant">Avg Latency</p>
            <p className="font-mono">{stats.avgLatency}ms</p>
          </div>
          <div>
            <p className="text-on-surface-variant">Success Rate</p>
            <p className="font-mono">{stats.successRate}%</p>
          </div>
          <div>
            <p className="text-on-surface-variant">Prompt Tokens</p>
            <p className="font-mono">{stats.totalPromptTokens.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-on-surface-variant">Completion Tokens</p>
            <p className="font-mono">{stats.totalCompletionTokens.toLocaleString()}</p>
          </div>
        </div>
      </Card>
    </Shell>
  );
}
