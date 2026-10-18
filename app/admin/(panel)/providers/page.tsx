"use client";

import { useEffect, useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { ProviderCard } from "@/components/dashboard/ProviderCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

interface Provider {
  id: number;
  name: string;
  base_url: string;
  is_active: number;
  keys: { id: number }[];
}

interface Model {
  id: number;
  provider_id: number;
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const [showProviderModal, setShowProviderModal] = useState(false);
  const [newProvider, setNewProvider] = useState({ name: "", base_url: "" });
  const [providerError, setProviderError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch("/api/admin/providers").then((r) => {
        if (!r.ok) throw new Error("Failed to load providers");
        return r.json();
      }),
      fetch("/api/admin/models").then((r) => {
        if (!r.ok) throw new Error("Failed to load models");
        return r.json();
      }),
    ])
      .then(([providersData, modelsData]) => {
        if (cancelled) return;
        setProviders(providersData.data);
        setModels(modelsData.data);
        setLoadError(false);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  function retryLoad() {
    setLoading(true);
    setLoadError(false);
    setReloadToken((token) => token + 1);
  }

  async function createProvider() {
    setCreating(true);
    setProviderError(null);

    try {
      const res = await fetch("/api/admin/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProvider),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add provider");

      setProviders([{ ...data.data, keys: [] }, ...providers]);
      setShowProviderModal(false);
      setNewProvider({ name: "", base_url: "" });
    } catch (err) {
      setProviderError(
        err instanceof Error && err.message
          ? err.message
          : "Could not add the provider. Check the name and base URL, then try again."
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <Shell title="Providers">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-sm text-on-surface-variant">
          {!loading && !loadError && (
            <>
              <span className="font-mono">{providers.length}</span> providers
            </>
          )}
        </p>
        <Button onClick={() => setShowProviderModal(true)}>Add Provider</Button>
      </div>

      {loading ? (
        <p className="text-sm text-on-surface-variant">Loading providers...</p>
      ) : loadError ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-error" role="alert">
            Could not load providers. The server may be unreachable.
          </p>
          <Button variant="outlined" size="sm" className="min-h-12 md:min-h-8" onClick={retryLoad}>
            Try again
          </Button>
        </div>
      ) : providers.length === 0 ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-on-surface-variant">
            No providers configured yet. Add one to route requests to an AI vendor.
          </p>
          <Button variant="outlined" size="sm" className="min-h-12 md:min-h-8" onClick={() => setShowProviderModal(true)}>
            Add Provider
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {providers.map((provider) => (
            <ProviderCard
              key={provider.id}
              name={provider.name}
              status={provider.is_active ? "active" : "inactive"}
              keyCount={provider.keys.length}
              modelCount={models.filter((m) => m.provider_id === provider.id).length}
              baseUrl={provider.base_url}
              href={`/admin/providers/${provider.id}`}
            />
          ))}
        </div>
      )}

      <Modal
        open={showProviderModal}
        onClose={() => setShowProviderModal(false)}
        label="Add provider"
      >
        <h2 className="text-lg font-medium text-on-surface mb-4">Add Provider</h2>
        <div className="flex flex-col gap-4">
          <Input
            label="Name"
            value={newProvider.name}
            onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
            placeholder="openai"
          />
          <Input
            label="Base URL"
            value={newProvider.base_url}
            onChange={(e) => setNewProvider({ ...newProvider, base_url: e.target.value })}
            placeholder="https://api.openai.com/v1"
          />
          {providerError && (
            <p className="text-sm text-error" role="alert">
              {providerError}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="text" onClick={() => setShowProviderModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={createProvider}
              disabled={!newProvider.name || !newProvider.base_url || creating}
            >
              {creating ? "Adding..." : "Add"}
            </Button>
          </div>
        </div>
      </Modal>
    </Shell>
  );
}
