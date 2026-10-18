"use client";

import { useEffect, useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Settings {
  gateway_name: string;
  default_rate_limit: number;
  log_retention_days: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => setSettings(data.data))
      .catch(() => setError("Could not load settings."))
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    if (!settings) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setSettings(data.data);
      setSaved(true);
    } catch {
      setError("Could not save settings. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    setChangingPassword(true);
    setPasswordError(null);
    setPasswordSaved(false);

    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(res.status === 401 ? "Current password is incorrect." : data.error);
      }
      setPasswordSaved(true);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Could not change the password.");
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <Shell title="Settings">
      <Card elevation={1} className="max-w-lg">
        <h2 className="text-lg font-medium text-on-surface mb-4">Gateway Settings</h2>

        {loading ? (
          <p className="text-sm text-on-surface-variant">Loading...</p>
        ) : !settings ? (
          <p className="text-sm text-error" role="alert">
            {error ?? "Settings unavailable."}
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <Input
              label="Gateway Name"
              value={settings.gateway_name}
              onChange={(e) => {
                setSaved(false);
                setSettings({ ...settings, gateway_name: e.target.value });
              }}
            />
            <Input
              label="Default Rate Limit (tokens)"
              type="number"
              min={0}
              value={String(settings.default_rate_limit)}
              onChange={(e) => {
                setSaved(false);
                const value = e.target.valueAsNumber;
                setSettings({ ...settings, default_rate_limit: Number.isNaN(value) ? 0 : value });
              }}
            />
            <Input
              label="Log Retention (days)"
              type="number"
              min={1}
              value={String(settings.log_retention_days)}
              onChange={(e) => {
                setSaved(false);
                const value = e.target.valueAsNumber;
                setSettings({ ...settings, log_retention_days: Number.isNaN(value) ? 1 : value });
              }}
            />

            <div className="flex items-center justify-end gap-3">
              {error && (
                <p className="text-sm text-error" role="alert">
                  {error}
                </p>
              )}
              {saved && (
                <p className="text-sm text-on-surface-variant" role="status">
                  Saved.
                </p>
              )}
              <Button onClick={save} disabled={saving || !settings.gateway_name.trim()}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Card elevation={1} className="max-w-lg mt-6">
        <h2 className="text-lg font-medium text-on-surface mb-1">Admin Password</h2>
        <p className="text-sm text-on-surface-variant mb-4">
          Changing the password signs out every other session.
        </p>
        <div className="flex flex-col gap-4">
          <Input
            label="Current Password"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => {
              setPasswordSaved(false);
              setCurrentPassword(e.target.value);
            }}
          />
          <Input
            label="New Password"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => {
              setPasswordSaved(false);
              setNewPassword(e.target.value);
            }}
          />

          <div className="flex items-center justify-end gap-3">
            {passwordError && (
              <p className="text-sm text-error" role="alert">
                {passwordError}
              </p>
            )}
            {passwordSaved && (
              <p className="text-sm text-on-surface-variant" role="status">
                Password updated.
              </p>
            )}
            <Button
              onClick={changePassword}
              disabled={!currentPassword || newPassword.length < 8 || changingPassword}
            >
              {changingPassword ? "Updating..." : "Change Password"}
            </Button>
          </div>
          {newPassword.length > 0 && newPassword.length < 8 && (
            <p className="text-sm text-on-surface-variant">New password must be at least 8 characters.</p>
          )}
        </div>
      </Card>
    </Shell>
  );
}
