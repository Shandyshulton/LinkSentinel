import type { Check, Settings, Stats } from "../types";
import { getDeviceId } from "../lib/device";

const BASE = "/api";

/** Error khusus agar UI dapat membedakan URL tidak valid (422). */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      // Pemisah riwayat per perangkat. Tidak pernah di-log.
      "X-Device-Id": getDeviceId(),
      ...init?.headers,
    },
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const detail =
      (data && (data.detail as string)) || `Permintaan gagal (${res.status}).`;
    throw new ApiError(res.status, detail);
  }

  return data as T;
}

export const api = {
  checkUrl(url: string): Promise<Check> {
    return request<Check>("/checks", {
      method: "POST",
      body: JSON.stringify({ url }),
    });
  },

  listChecks(params?: {
    risk_level?: string;
    status?: string;
    q?: string;
  }): Promise<Check[]> {
    const query = new URLSearchParams();
    if (params?.risk_level) query.set("risk_level", params.risk_level);
    if (params?.status) query.set("status", params.status);
    if (params?.q) query.set("q", params.q);
    const qs = query.toString();
    return request<Check[]>(`/checks${qs ? `?${qs}` : ""}`);
  },

  getCheck(id: number): Promise<Check> {
    return request<Check>(`/checks/${id}`);
  },

  clearHistory(): Promise<void> {
    return request<void>("/checks", { method: "DELETE" });
  },

  getStats(): Promise<Stats> {
    return request<Stats>("/stats");
  },

  getSettings(): Promise<Settings> {
    return request<Settings>("/settings");
  },

  updateSettings(payload: Partial<Settings>): Promise<Settings> {
    return request<Settings>("/settings", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },
};
