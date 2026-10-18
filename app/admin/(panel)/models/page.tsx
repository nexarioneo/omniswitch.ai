"use client";

import { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";

interface Model {
  id: number;
  provider_id: number;
  model_name: string;
  is_enabled: number;
  priority: number;
}

interface Provider {
  id: number;
  name: string;
}

export default function ModelsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch("/api/admin/models").then((r) => {
        if (!r.ok) throw new Error("Failed to load models");
        return r.json();
      }),
      fetch("/api/admin/providers").then((r) => {
        if (!r.ok) throw new Error("Failed to load providers");
        return r.json();
      }),
    ])
      .then(([modelsData, providersData]) => {
        if (cancelled) return;
        setModels(modelsData.data);
        setProviders(providersData.data);
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

  async function toggleModel(id: number, enabled: boolean) {
    const previous = models;
    setToggleError(null);
    setModels(models.map((m) => (m.id === id ? { ...m, is_enabled: enabled ? 1 : 0 } : m)));

    try {
      const res = await fetch(`/api/admin/models?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_enabled: enabled }),
      });
      if (!res.ok) throw new Error("Failed to update model");
    } catch {
      setModels(previous);
      setToggleError("Could not update the model. The change was rolled back.");
    }
  }

  function getProviderName(providerId: number) {
    return providers.find((p) => p.id === providerId)?.name || "unknown";
  }

  return (
    <Shell title="Models">
      {loading ? (
        <p className="text-sm text-on-surface-variant">Loading models...</p>
      ) : loadError ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-error" role="alert">
            Could not load models. The server may be unreachable.
          </p>
          <Button variant="outlined" size="sm" className="min-h-12 md:min-h-8" onClick={retryLoad}>
            Try again
          </Button>
        </div>
      ) : models.length === 0 ? (
        <p className="text-sm text-on-surface-variant">
          No models in the allowlist yet. Add a provider to register its models.
        </p>
      ) : (
        <>
          {toggleError && (
            <p className="text-sm text-error mb-3" role="alert">
              {toggleError}
            </p>
          )}
          <Table>
            <Thead>
              <Tr>
                <Th>Model</Th>
                <Th>Provider</Th>
                <Th>Status</Th>
                <Th>Enabled</Th>
              </Tr>
            </Thead>
            <Tbody>
              {models.map((model) => (
                <Tr key={model.id}>
                  <Td className="font-mono text-sm">{model.model_name}</Td>
                  <Td>{getProviderName(model.provider_id)}</Td>
                  <Td>
                    <Badge variant={model.is_enabled ? "success" : "error"}>
                      {model.is_enabled ? "enabled" : "disabled"}
                    </Badge>
                  </Td>
                  <Td>
                    <Switch
                      checked={!!model.is_enabled}
                      onChange={(e) => toggleModel(model.id, e.target.checked)}
                      aria-label={`Toggle ${model.model_name}`}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </>
      )}
    </Shell>
  );
}
