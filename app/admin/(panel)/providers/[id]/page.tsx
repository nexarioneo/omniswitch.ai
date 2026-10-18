"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/Table";
import { maskKey, formatDate, formatNumber } from "@/lib/format";

interface ProviderKey {
  id: number;
  key: string;
  status: string;
  rotation_strategy: string;
  request_count: number;
  last_used_at: string | null;
  created_at: string;
}

interface Provider {
  id: number;
  name: string;
  base_url: string;
  auth_type: string;
  is_active: number;
  created_at: string;
  keys: ProviderKey[];
}

const ROTATION_LABELS: Record<string, string> = {
  round_robin: "Round robin",
  sequential: "Sequential",
  random: "Random",
};

export default function ProviderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const providerId = params.id;

  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const [removeTarget, setRemoveTarget] = useState<ProviderKey | null>(null);
  const [removing, setRemoving] = useState(false);

  const [confirmDeleteProvider, setConfirmDeleteProvider] = useState(false);
  const [deletingProvider, setDeletingProvider] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/admin/providers/${providerId}`)
      .then((res) => {
        if (res.status === 404 || res.status === 400) throw new Error("not-found");
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setProvider(data.data);
        setLoadError(false);
        setNotFound(false);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        if (err.message === "not-found") setNotFound(true);
        else setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [providerId, reloadToken]);

  function retryLoad() {
    setLoading(true);
    setLoadError(false);
    setNotFound(false);
    setReloadToken((token) => token + 1);
  }

  async function addKey() {
    if (!provider) return;
    setAdding(true);
    setAddError(null);

    try {
      const res = await fetch(`/api/admin/providers/${provider.id}/keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: newKeyValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to add key");

      setProvider({ ...provider, keys: [...provider.keys, data.data] });
      setShowKeyModal(false);
      setNewKeyValue("");
    } catch (err) {
      setAddError(
        err instanceof Error && err.message
          ? err.message
          : "Could not add the key. Check the value and try again."
      );
    } finally {
      setAdding(false);
    }
  }

  async function removeKey() {
    if (!provider || !removeTarget) return;
    setRemoving(true);

    try {
      const res = await fetch(
        `/api/admin/providers/${provider.id}/keys/${removeTarget.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to remove key");

      setProvider({
        ...provider,
        keys: provider.keys.filter((k) => k.id !== removeTarget.id),
      });
      setRemoveTarget(null);
    } catch {
      setLoadError(true);
    } finally {
      setRemoving(false);
    }
  }

  async function deleteProvider() {
    if (!provider) return;
    setDeletingProvider(true);

    try {
      const res = await fetch(`/api/admin/providers?id=${provider.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete provider");
      router.push("/admin/providers");
    } catch {
      setDeletingProvider(false);
      setConfirmDeleteProvider(false);
    }
  }

  const rotation = provider?.keys[0]?.rotation_strategy;

  return (
    <Shell title={provider?.name ?? "Provider"}>
      <Link
        href="/admin/providers"
        className="inline-flex items-center gap-2 text-sm font-medium text-primary mb-4 rounded-full"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M10 19l-7-7 7-7M3 12h18" />
        </svg>
        Providers
      </Link>

      {loading ? (
        <p className="text-sm text-on-surface-variant">Loading provider...</p>
      ) : notFound ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-error" role="alert">
            Provider not found. It may have been deleted.
          </p>
          <Link
            href="/admin/providers"
            className="text-sm font-medium text-primary underline underline-offset-4"
          >
            Back to Providers
          </Link>
        </div>
      ) : loadError || !provider ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-error" role="alert">
            Could not load this provider. The server may be unreachable.
          </p>
          <Button variant="outlined" size="sm" className="min-h-12 md:min-h-8" onClick={retryLoad}>
            Try again
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6 max-w-4xl">
          <Card elevation={1}>
            <div className="flex items-start gap-4">
              <span
                aria-hidden="true"
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-container text-base font-medium text-on-primary-container"
              >
                {provider.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-normal text-on-surface">{provider.name}</h2>
                  <Badge variant={provider.is_active ? "success" : "error"}>
                    {provider.is_active ? "active" : "inactive"}
                  </Badge>
                </div>
                <p className="text-sm text-on-surface-variant mt-1">
                  <span className="font-mono">{provider.keys.length}</span>{" "}
                  {provider.keys.length === 1 ? "key" : "keys"}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-1 gap-4 mt-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">
                  Base URL
                </dt>
                <dd className="text-sm text-on-surface font-mono break-all mt-1">
                  {provider.base_url}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">
                  Auth Type
                </dt>
                <dd className="text-sm text-on-surface font-mono mt-1">{provider.auth_type}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">
                  Rotation
                </dt>
                <dd className="text-sm text-on-surface mt-1">
                  {rotation ? ROTATION_LABELS[rotation] ?? rotation : "No keys yet"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">
                  Created
                </dt>
                <dd className="text-sm text-on-surface mt-1">{formatDate(provider.created_at)}</dd>
              </div>
            </dl>
          </Card>

          <section>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <h2 className="text-lg font-medium text-on-surface">API Keys</h2>
              <Button onClick={() => setShowKeyModal(true)}>Add Key</Button>
            </div>

            {provider.keys.length === 0 ? (
              <Card elevation={1} className="flex flex-col items-start gap-3">
                <p className="text-sm text-on-surface-variant">
                  This provider has no key yet. Add one so the gateway can send requests to it.
                </p>
                <Button
                  variant="outlined"
                  size="sm"
                  className="min-h-12 md:min-h-8"
                  onClick={() => setShowKeyModal(true)}
                >
                  Add Key
                </Button>
              </Card>
            ) : (
              <Table>
                <Thead>
                  <Tr>
                    <Th>Key</Th>
                    <Th>Status</Th>
                    <Th>Requests</Th>
                    <Th>Last Used</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {provider.keys.map((key) => (
                    <Tr key={key.id}>
                      <Td className="font-mono text-sm">{maskKey(key.key)}</Td>
                      <Td>
                        <Badge variant={key.status === "active" ? "success" : "error"}>
                          {key.status}
                        </Badge>
                      </Td>
                      <Td className="font-mono text-sm">{formatNumber(key.request_count)}</Td>
                      <Td className="text-on-surface-variant">
                        {key.last_used_at ? formatDate(key.last_used_at) : "-"}
                      </Td>
                      <Td>
                        <Button
                          variant="text"
                          size="sm"
                          className="min-h-12 md:min-h-8"
                          onClick={() => setRemoveTarget(key)}
                        >
                          Remove
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </section>

          <Card elevation={1}>
            <h2 className="text-lg font-medium text-on-surface mb-1">Delete Provider</h2>
            <p className="text-sm text-on-surface-variant mb-4">
              Removes this provider, its {provider.keys.length} keys, and its model entries.
              Usage history is kept.
            </p>
            <Button variant="danger" onClick={() => setConfirmDeleteProvider(true)}>
              Delete Provider
            </Button>
          </Card>
        </div>
      )}

      <Modal
        open={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        label={`Add key for ${provider?.name ?? "provider"}`}
      >
        <h2 className="text-lg font-medium text-on-surface mb-4">
          Add Key for {provider?.name}
        </h2>
        <div className="flex flex-col gap-4">
          <Input
            label="API Key"
            value={newKeyValue}
            onChange={(e) => setNewKeyValue(e.target.value)}
            placeholder="sk-..."
            autoComplete="off"
          />
          {addError && (
            <p className="text-sm text-error" role="alert">
              {addError}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="text" onClick={() => setShowKeyModal(false)}>
              Cancel
            </Button>
            <Button onClick={addKey} disabled={!newKeyValue || adding}>
              {adding ? "Adding..." : "Add"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!removeTarget}
        title="Remove provider key"
        description={`Requests will stop using this key of "${provider?.name}".`}
        confirmLabel="Remove"
        busyLabel="Removing..."
        busy={removing}
        onConfirm={removeKey}
        onClose={() => setRemoveTarget(null)}
      />

      <ConfirmDialog
        open={confirmDeleteProvider}
        title="Delete provider"
        description={`Deleting "${provider?.name}" also removes its ${provider?.keys.length ?? 0} keys and model entries. Usage history is kept.`}
        busy={deletingProvider}
        onConfirm={deleteProvider}
        onClose={() => setConfirmDeleteProvider(false)}
      />
    </Shell>
  );
}
