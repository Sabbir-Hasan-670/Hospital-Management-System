// src/lib/api.ts
export const API = import.meta.env.VITE_API_URL as string;

export async function jfetch(url: string, init: RequestInit = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    ...init,
  });
  let data: any = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error((data && (data.error || data.message)) || res.statusText);
  return data;
}
