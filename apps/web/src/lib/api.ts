"use client";

const KEY = "vc_access";

export function getToken() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(KEY) || "";
}

export function setToken(token: string) {
  sessionStorage.setItem(KEY, token);
}

export function clearToken() {
  sessionStorage.removeItem(KEY);
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData)) headers.set("content-type", "application/json");
  const token = getToken();
  if (token) headers.set("authorization", `Bearer ${token}`);
  const res = await fetch(`${API}${path}`, { ...init, headers, credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      (data as { message?: string; error?: { message?: string } })?.message ||
      (data as { error?: { message?: string } })?.error?.message ||
      (typeof (data as { error?: unknown }).error === "string" ? (data as { error: string }).error : null) ||
      `Request failed (${res.status})`;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }
  return data as T;
}
