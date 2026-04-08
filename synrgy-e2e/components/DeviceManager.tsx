"use client";

import { useState, useEffect, useCallback } from "react";

type Device = {
  id: string;
  device_name: string;
  os: string;
  os_version: string | null;
  is_primary: boolean;
  created_at: string;
};

export default function DeviceManager() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [os, setOs] = useState("");
  const [osVersion, setOsVersion] = useState("");
  const [saving, setSaving] = useState(false);

  const loadDevices = useCallback(async () => {
    try {
      const res = await fetch("/api/devices");
      if (res.ok) {
        const data = await res.json();
        setDevices(data.devices ?? []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  async function handleAddDevice(e: React.FormEvent) {
    e.preventDefault();
    if (!deviceName.trim() || !os) return;

    setSaving(true);
    try {
      const res = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_name: deviceName.trim(),
          os,
          os_version: osVersion.trim() || null,
          is_primary: devices.length === 0,
        }),
      });
      if (res.ok) {
        await loadDevices();
        setDeviceName("");
        setOs("");
        setOsVersion("");
        setShowForm(false);
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  async function handleSetPrimary(deviceId: string) {
    await fetch("/api/devices", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device_id: deviceId, is_primary: true }),
    });
    await loadDevices();
  }

  async function handleDelete(deviceId: string) {
    if (!confirm("Remove this device?")) return;
    await fetch(`/api/devices?id=${deviceId}`, { method: "DELETE" });
    await loadDevices();
  }

  const primaryDevice = devices.find((d) => d.is_primary);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="text-xs text-gray-400">Loading devices…</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Test device</h3>
        {primaryDevice && (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
            {primaryDevice.device_name} · {primaryDevice.os}
            {primaryDevice.os_version ? ` ${primaryDevice.os_version}` : ""}
          </span>
        )}
      </div>

      {devices.length === 0 && !showForm && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="mb-2 text-xs text-amber-800">
            What device are you testing on? Add your device to tag results.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="rounded bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700"
          >
            Add device
          </button>
        </div>
      )}

      {devices.length > 0 && (
        <div className="space-y-1.5">
          {devices.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between rounded-lg border px-3 py-1.5"
              style={{
                borderColor: d.is_primary ? "#1A3A5C30" : "#f3f4f6",
                backgroundColor: d.is_primary ? "#1A3A5C08" : "white",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-700">{d.device_name}</span>
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                  {d.os}{d.os_version ? ` ${d.os_version}` : ""}
                </span>
                {d.is_primary && (
                  <span className="rounded-full bg-brand-navy/10 px-1.5 py-0.5 text-[10px] font-medium text-brand-navy">
                    Primary
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {!d.is_primary && (
                  <button
                    onClick={() => handleSetPrimary(d.id)}
                    className="text-[10px] text-gray-400 hover:text-brand-navy"
                  >
                    Set primary
                  </button>
                )}
                <button
                  onClick={() => handleDelete(d.id)}
                  className="text-[10px] text-gray-400 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-1 text-xs text-gray-400 hover:text-gray-600"
            >
              + Add another device
            </button>
          )}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleAddDevice} className="mt-2 space-y-2 rounded-lg border border-gray-200 p-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="Device name (e.g., iPhone 13 Pro)"
              required
              className="rounded border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
            />
            <select
              value={os}
              onChange={(e) => setOs(e.target.value)}
              required
              className="rounded border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
            >
              <option value="">OS…</option>
              <option value="iOS">iOS</option>
              <option value="Android">Android</option>
            </select>
            <input
              type="text"
              value={osVersion}
              onChange={(e) => setOsVersion(e.target.value)}
              placeholder="OS version (e.g., 17.4)"
              className="rounded border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-brand-navy focus:ring-1 focus:ring-brand-navy"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={saving || !deviceName.trim() || !os}
              className="rounded bg-brand-navy px-3 py-1 text-xs font-medium text-white hover:bg-brand-navy/90 disabled:opacity-50"
            >
              {saving ? "Adding…" : "Add device"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-xs text-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
