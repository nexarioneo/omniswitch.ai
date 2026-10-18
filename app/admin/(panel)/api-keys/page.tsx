"use client";

import { useState, useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { ApiKeyTable } from "@/components/dashboard/ApiKeyTable";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Card } from "@/components/ui/Card";

interface ApiKey {
  id: number;
  key: string;
  name: string;
  rate_limit_type: string;
  rate_limit_value: number | null;
  rate_limit_window: number;
  is_active: number;
  created_at: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [limitType, setLimitType] = useState<"token" | "unlimited">("token");
  const [limitValue, setLimitValue] = useState("100000");
  const [limitWindow, setLimitWindow] = useState("86400");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiKey | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin/api-keys")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then((d) => {
        if (cancelled) return;
        setKeys(d.data);
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

  const limitValueNumber = Number(limitValue);
  const limitValid =
    limitType === "unlimited" || (Number.isInteger(limitValueNumber) && limitValueNumber > 0);

  async function createKey() {
    setCreating(true);
    setCreateError(null);

    try {
      const res = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newKeyName,
          rate_limit_type: limitType,
          rate_limit_value: limitType === "token" ? limitValueNumber : null,
          rate_limit_window: Number(limitWindow),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create key");

      setKeys([data.data, ...keys]);
      setCreatedKey(data.key);
      setShowModal(false);
      setNewKeyName("");
    } catch {
      setCreateError("Could not create the key. Check the values and try again.");
    } finally {
      setCreating(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/api-keys?id=${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setKeys(keys.filter((k) => k.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setLoadError(true);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Shell title="API Keys">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-sm text-on-surface-variant">{keys.length} keys</p>
        <Button onClick={() => setShowModal(true)}>Create Key</Button>
      </div>

      {loading ? (
        <p className="text-sm text-on-surface-variant">Loading API keys...</p>
      ) : loadError ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-error" role="alert">
            Could not load API keys. The server may be unreachable.
          </p>
          <Button variant="outlined" size="sm" className="min-h-12 md:min-h-8" onClick={retryLoad}>
            Try again
          </Button>
        </div>
      ) : (
        <ApiKeyTable keys={keys} onDelete={(id) => setDeleteTarget(keys.find((k) => k.id === id) ?? null)} />
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} label="Create API Key">
        <h2 className="text-lg font-medium text-on-surface mb-4">Create API Key</h2>
        <div className="flex flex-col gap-4">
          <Input
            label="Name"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="My API Key"
          />
          <Select
            label="Rate Limit"
            value={limitType}
            onChange={(e) => setLimitType(e.target.value as "token" | "unlimited")}
          >
            <option value="token">Token limit</option>
            <option value="unlimited">Unlimited</option>
          </Select>
          {limitType === "token" && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Tokens"
                type="number"
                min={1}
                value={limitValue}
                onChange={(e) => setLimitValue(e.target.value)}
              />
              <Select
                label="Per"
                value={limitWindow}
                onChange={(e) => setLimitWindow(e.target.value)}
              >
                <option value="3600">Hour</option>
                <option value="86400">Day</option>
                <option value="604800">Week</option>
              </Select>
            </div>
          )}

          {createError && (
            <p className="text-sm text-error" role="alert">
              {createError}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="text" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={createKey} disabled={!newKeyName || !limitValid || creating}>
              {creating ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!createdKey} onClose={() => setCreatedKey(null)} label="API key created">
        <h2 className="text-lg font-medium text-on-surface mb-2">API Key Created</h2>
        <p className="text-sm text-on-surface-variant mb-4">
          Copy this key now. It will not be shown again.
        </p>
        <Card elevation={0} className="mb-4">
          <code className="font-mono text-sm break-all">{createdKey}</code>
        </Card>
        <div className="flex justify-end">
          <Button onClick={() => setCreatedKey(null)}>Done</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete API key"
        description={`Requests using "${deleteTarget?.name}" will be rejected immediately. Usage history is kept.`}
        busy={deleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Shell>
  );
}
