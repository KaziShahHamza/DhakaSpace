/// <reference types="vite/client" />

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

/**
 * Builds an API URL using VITE_API_BASE_URL in production (Vercel -> Render)
 * and falls back to relative paths in local development (Vite proxy).
 */
export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}
